import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';

/**
 * Results component for displaying and editing bill details
 * Handles item editing, tip calculation, and bill splitting
 */
export default function Results() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Initialize bill state from params
  const initialBill = params.bill ? JSON.parse(params.bill) : null;
  
  // Process initial bill data to ensure prices are numbers
  const processedInitialBill = initialBill ? {
    ...initialBill,
    items: initialBill.items.map(item => ({
      ...item,
      quantity: parseInt(item.quantity) || 1,
      price: parseFloat(item.price) || 0
    })),
    subtotal: parseFloat(initialBill.subtotal) || 0,
    tax: parseFloat(initialBill.tax) || 0,
    tip: parseFloat(initialBill.tip) || 0,
    total: parseFloat(initialBill.total) || 0
  } : null;
  
  // State management
  const [bill, setBill] = useState(processedInitialBill);
  const [editingItem, setEditingItem] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [editingName, setEditingName] = useState(null);
  const [selectedTipPercent, setSelectedTipPercent] = useState(null);
  const [editingTipAmount, setEditingTipAmount] = useState(false);
  const [hasTipInteraction, setHasTipInteraction] = useState(false);
  const [itemsConfirmed, setItemsConfirmed] = useState(false);
  const [backPressCount, setBackPressCount] = useState(0);
  const [splitComplete, setSplitComplete] = useState(false);

  // Handle missing bill data
  if (!bill) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.errorText}>No bill data available</Text>
        <TouchableOpacity 
          style={styles.tryAgainButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.tryAgainButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Format number as currency string
   */
  const formatCurrency = (amount) => `$${parseFloat(amount).toFixed(2)}`;

  /**
   * Item update handlers
   */
  const updateItemName = (index, newName) => {
    const updatedItems = [...bill.items];
    updatedItems[index] = { ...updatedItems[index], name: newName || "Item" };
    setBill(prev => ({ ...prev, items: updatedItems }));
    setEditingName(null);
  };

  const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);
  };

  const updateItemPrice = (index, newPrice) => {
    const updatedItems = [...bill.items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      price: parseFloat(newPrice) || 0 
    };
    
    // Only update subtotal if items are already confirmed
    if (itemsConfirmed) {
      const newSubtotal = calculateSubtotal(updatedItems);
      setBill(prev => ({ 
        ...prev, 
        items: updatedItems,
        subtotal: newSubtotal,
        total: newSubtotal + (prev.tax || 0) + (prev.tip || 0)
      }));
    } else {
      setBill(prev => ({ ...prev, items: updatedItems }));
    }
    setEditingItem(null);
  };

  const updateItemQuantity = (index, newQuantity) => {
    const updatedItems = [...bill.items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity === '' ? '' : (parseInt(newQuantity) || 1)
    };

    // Only update subtotal if items are already confirmed
    if (itemsConfirmed) {
      const newSubtotal = calculateSubtotal(updatedItems);
      setBill(prev => ({
        ...prev,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newSubtotal + (prev.tax || 0) + (prev.tip || 0)
      }));
    } else {
      setBill(prev => ({ ...prev, items: updatedItems }));
    }
    setEditingQuantity(null);
  };

  /**
   * Tip handling functions
   */
  const updateTip = (newTip) => {
    const tipAmount = parseFloat(newTip) || 0;
    setBill(prev => ({
      ...prev,
      tip: tipAmount,
      total: prev.subtotal + (prev.tax || 0) + tipAmount
    }));
  };

  const selectTipPercent = (percent) => {
    setSelectedTipPercent(percent);
    setEditingTipAmount(false);
    setHasTipInteraction(true);
    const tipAmount = (percent / 100) * bill.subtotal;
    updateTip(tipAmount);
  };

  const handleCustomTipChange = (value) => {
    const tipAmount = parseFloat(value) || 0;
    updateTip(tipAmount);
    const tipPercent = bill.subtotal > 0 ? ((tipAmount / bill.subtotal) * 100).toFixed(1) : 0;
    setSelectedTipPercent(parseFloat(tipPercent));
    setHasTipInteraction(true);
  };

  /**
   * Item management functions
   */
  const addNewItem = () => {
    const newItem = { 
      name: "New Item", 
      quantity: 1, 
      price: 0 
    };
    setBill(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setTimeout(() => setEditingName(bill.items.length), 100);
  };

  /**
   * Navigation and sharing handlers
   */
  const handleSplitBill = () => {
    const billData = {
      items: bill.items,
      subtotal: parseFloat(bill.subtotal),
      tax: parseFloat(bill.tax) || 0,
      tip: parseFloat(bill.tip) || 0,
      total: parseFloat(bill.total)
    };

    router.push({
      pathname: '/split',
      params: { billData: JSON.stringify(billData) }
    });
    
    setSplitComplete(true);
  };

  const handleBackPress = () => {
    if (backPressCount === 0) {
      setBackPressCount(1);
      setTimeout(() => setBackPressCount(0), 2000);
    } else {
      router.replace("/");
    }
  };

  const shareGuestList = async () => {
    try {
      // Check if previousGuests exists before using it
      if (!bill || !bill.items) {
        Alert.alert("Error", "No bill data available to share");
        return;
      }
      
      // Create a summary from the current bill instead of undefined previousGuests
      const billSummary = `Bill Summary\n\nSubtotal: ${formatCurrency(bill.subtotal || 0)}\nTax: ${formatCurrency(bill.tax || 0)}\nTip: ${formatCurrency(bill.tip || 0)}\nTotal: ${formatCurrency(bill.total || 0)}\n\nItems:\n${bill.items.map(item => `- ${item.name}: ${formatCurrency(item.price)}`).join('\n')}`;
      
      // Use proper sharing API for React Native
      await Sharing.shareAsync(
        Platform.OS === 'web' 
          ? URL.createObjectURL(new Blob([billSummary], { type: 'text/plain' }))
          : `data:text/plain;base64,${Buffer.from(billSummary).toString('base64')}`,
        { mimeType: 'text/plain', dialogTitle: 'Share Bill Summary' }
      );
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert("Error", "Failed to share bill summary");
    }
  };

  // Add this to handle confirm items
  const handleConfirmItems = () => {
    const newSubtotal = calculateSubtotal(bill.items);
    setBill(prev => ({
      ...prev,
      subtotal: newSubtotal,
      total: newSubtotal + (prev.tax || 0) + (prev.tip || 0)
    }));
    setItemsConfirmed(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Review & Edit Receipt</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.itemsContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemHeaderText}>Item</Text>
              <Text style={styles.itemHeaderText}>Qty</Text>
              <Text style={styles.itemHeaderText}>Price</Text>
            </View>
            
            {bill.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                {editingName === index ? (
                  <TextInput
                    style={styles.nameInput}
                    value={item.name}
                    autoFocus
                    onChangeText={(text) => {
                      const updatedItems = [...bill.items];
                      updatedItems[index] = {
                        ...updatedItems[index],
                        name: text
                      };
                      setBill(prev => ({...prev, items: updatedItems}));
                    }}
                    onBlur={() => updateItemName(index, bill.items[index].name)}
                    onSubmitEditing={() => updateItemName(index, bill.items[index].name)}
                  />
                ) : (
                  <View style={styles.nameContainer}>
                    <TouchableOpacity 
                      style={styles.editIcon}
                      onPress={() => setEditingName(index)}
                    >
                    </TouchableOpacity>
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                )}
                
                {editingQuantity === index ? (
                  <TextInput
                    style={styles.quantityInput}
                    value={item.quantity?.toString()}
                    keyboardType="numeric"
                    autoFocus
                    onChangeText={(text) => {
                      const updatedItems = [...bill.items];
                      updatedItems[index] = {
                        ...updatedItems[index],
                        quantity: text
                      };
                      setBill(prev => ({...prev, items: updatedItems}));
                    }}
                    onBlur={() => updateItemQuantity(index, bill.items[index].quantity)}
                    onSubmitEditing={() => updateItemQuantity(index, bill.items[index].quantity)}
                  />
                ) : (
                  <View style={styles.quantityContainer}>
                    <Text style={styles.itemQuantity}>{item.quantity || 1}</Text>
                    <TouchableOpacity 
                      style={styles.editIcon}
                      onPress={() => setEditingQuantity(index)}
                    >
                      <Ionicons name="pencil" size={12} color="#666" />
                    </TouchableOpacity>
                  </View>
                )}
                
                {editingItem === index ? (
                  <TextInput
                    style={styles.priceInput}
                    value={item.price?.toString() || "0"}
                    keyboardType="numeric"
                    autoFocus
                    onChangeText={(text) => {
                      const updatedItems = [...bill.items];
                      updatedItems[index] = {
                        ...updatedItems[index],
                        price: text
                      };
                      setBill(prev => ({...prev, items: updatedItems}));
                    }}
                    onBlur={() => updateItemPrice(index, bill.items[index].price)}
                    onSubmitEditing={() => updateItemPrice(index, bill.items[index].price)}
                  />
                ) : (
                  <View style={styles.priceContainer}>
                    <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                    <TouchableOpacity 
                      style={styles.editIcon}
                      onPress={() => setEditingItem(index)}
                    >
                      <Ionicons name="pencil" size={12} color="#666" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.addItemButton}
              onPress={addNewItem}
            >
              <Ionicons name="add-circle" size={20} color="#3442C6" />
              <Text style={styles.addItemText}>Add Item</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmItemsButton}
              onPress={handleConfirmItems}
            >
              <Text style={styles.confirmItemsText}>Confirm Items</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {itemsConfirmed ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Add Tip</Text>
            <View style={styles.tipButtonsContainer}>
              <TouchableOpacity 
                style={[
                  styles.tipButton, 
                  selectedTipPercent === 0 && styles.tipButtonSelected
                ]}
                onPress={() => {
                  selectTipPercent(0);
                  updateTip(0);
                }}
              >
                <Text style={[
                  styles.tipButtonText,
                  selectedTipPercent === 0 && styles.tipButtonTextSelected
                ]}>No Tip</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.tipButton, 
                  selectedTipPercent === 15 && styles.tipButtonSelected
                ]}
                onPress={() => selectTipPercent(15)}
              >
                <Text style={[
                  styles.tipButtonText,
                  selectedTipPercent === 15 && styles.tipButtonTextSelected
                ]}>15%</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.tipButton, 
                  selectedTipPercent === 20 && styles.tipButtonSelected
                ]}
                onPress={() => selectTipPercent(20)}
              >
                <Text style={[
                  styles.tipButtonText,
                  selectedTipPercent === 20 && styles.tipButtonTextSelected
                ]}>20%</Text>
              </TouchableOpacity>
              
              <View style={styles.customTipContainer}>
                {editingTipAmount ? (
                  <TextInput
                    style={styles.customTipInput}
                    value={bill.tip?.toString() || "0"}
                    keyboardType="numeric"
                    autoFocus
                    onChangeText={handleCustomTipChange}
                    onBlur={() => setEditingTipAmount(false)}
                    onSubmitEditing={() => setEditingTipAmount(false)}
                  />
                ) : (
                  <TouchableOpacity 
                    style={styles.customTipButton}
                    onPress={() => setEditingTipAmount(true)}
                  >
                    <Text style={styles.customTipText}>
                      {formatCurrency(bill.tip || 0)}
                    </Text>
                    <Ionicons name="pencil" size={12} color="#666" style={styles.tipEditIcon} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {(selectedTipPercent !== null || bill.tip > 0) && (
              <Text style={styles.tipCalculationText}>
                {selectedTipPercent !== null 
                  ? `${selectedTipPercent}% of ${formatCurrency(bill.subtotal)} = ${formatCurrency(bill.tip || 0)}`
                  : `${((bill.tip / bill.subtotal) * 100).toFixed(1)}% of ${formatCurrency(bill.subtotal)} = ${formatCurrency(bill.tip)}`
                }
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.confirmPrompt}>Please confirm your items to continue</Text>
        )}

        {hasTipInteraction && (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(bill.subtotal || 0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>{formatCurrency(bill.tax || 0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tip</Text>
                <Text style={styles.summaryValue}>{formatCurrency(bill.tip || 0)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(bill.total)}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.splitButton}
              onPress={handleSplitBill}
            >
              <Text style={styles.splitButtonText}>Split Bill</Text>
            </TouchableOpacity>

            {splitComplete && (
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={shareGuestList}
              >
                <Text style={styles.shareButtonText}>Share Bill Split</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3442C6',
    paddingTop: 60,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  circle1: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -200,
    left: -100,
  },
  circle2: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -150,
    right: -100,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3442C6',
    marginBottom: 15,
  },
  itemsContainer: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  itemHeaderText: {
    fontWeight: '600',
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  itemName: {
    flex: 1,
    color: '#333',
    marginLeft: 5,
  },
  nameInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#3442C6',
    borderRadius: 4,
    padding: 4,
    color: '#333',
    backgroundColor: 'rgba(52, 66, 198, 0.05)',
  },
  quantityContainer: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemQuantity: {
    textAlign: 'center',
    color: '#333',
  },
  quantityInput: {
    flex: 0.5,
    borderWidth: 1,
    borderColor: '#3442C6',
    borderRadius: 4,
    padding: 4,
    textAlign: 'center',
    color: '#333',
    backgroundColor: 'rgba(52, 66, 198, 0.05)',
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  itemPrice: {
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
  },
  editIcon: {
    padding: 2,
    marginRight: 5,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3442C6',
    borderRadius: 4,
    padding: 4,
    textAlign: 'right',
    color: '#333',
    backgroundColor: 'rgba(52, 66, 198, 0.05)',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    marginTop: 5,
    marginHorizontal: 40,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#3442C6',
    borderRadius: 8,
    backgroundColor: 'rgba(52, 66, 198, 0.05)',
  },
  addItemText: {
    marginLeft: 6,
    color: '#3442C6',
    fontWeight: '600',
    fontSize: 13,
  },
  // New Tip Section Styles
  tipButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  tipButton: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 2,
    marginBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipButtonSelected: {
    backgroundColor: '#3442C6',
  },
  tipButtonText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  tipButtonTextSelected: {
    color: 'white',
  },
  customTipContainer: {
    flex: 1,
    minWidth: 80,
    marginHorizontal: 2,
  },
  customTipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  customTipText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  tipEditIcon: {
    marginLeft: 5,
  },
  customTipInput: {
    borderWidth: 1,
    borderColor: '#3442C6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    backgroundColor: 'rgba(52, 66, 198, 0.05)',
  },
  tipCalculationText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#666',
  },
  summaryValue: {
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    color: '#3442C6',
    fontWeight: '700',
    fontSize: 18,
  },
  totalValue: {
    color: '#3442C6',
    fontWeight: '700',
    fontSize: 18,
  },
  splitButton: {
    backgroundColor: '#4CDE80',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  splitButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  tryAgainButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tryAgainButtonText: {
    color: '#3442C6',
    fontWeight: '700',
    fontSize: 18,
  },
  tipPrompt: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    marginBottom: 40,
    fontSize: 16,
    fontStyle: 'italic',
  },
  confirmItemsButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    marginHorizontal: 40,
  },
  confirmItemsText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmPrompt: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    marginBottom: 40,
    fontSize: 16,
    fontStyle: 'italic',
  },
  shareButton: {
    backgroundColor: '#3442C6',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 8,
  },
}); 