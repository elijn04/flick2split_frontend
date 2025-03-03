import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SplitBill() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the bill data from params
  const [billData, setBillData] = useState(params.billData ? JSON.parse(params.billData) : null);
  
  // State for the current guest
  const [guestName, setGuestName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [previousGuests, setPreviousGuests] = useState([]);
  const [expandedGuest, setExpandedGuest] = useState(null);
  
  // State for split modal
  const [splitModalVisible, setSplitModalVisible] = useState(false);
  const [itemToSplit, setItemToSplit] = useState(null);
  const [splitCount, setSplitCount] = useState('2');
  
  // Initialize available items from bill data and recalculate subtotal
  useEffect(() => {
    if (billData) {
      // Create expanded items array based on quantities
      let expandedItems = [];
      let recalculatedSubtotal = 0;
      
      billData.items.forEach((item, index) => {
        const quantity = parseInt(item.quantity) || 1;
        const pricePerItem = item.price / quantity;
        recalculatedSubtotal += item.price;
        
        for (let i = 0; i < quantity; i++) {
          expandedItems.push({
            ...item,
            id: `item-${index}-${i}`,
            originalId: `item-${index}`,
            isSplit: false,
            splitPart: null,
            splitTotal: null,
            quantity: 1,
            price: pricePerItem
          });
        }
      });
      
      // Update available items without triggering a re-render of billData
      setAvailableItems(expandedItems);
      
      // Only update billData if subtotal has changed
      if (billData.subtotal !== recalculatedSubtotal) {
        setBillData(prev => ({
          ...prev,
          subtotal: recalculatedSubtotal
        }));
      }
    }
  }, [billData?.items]); // Only depend on billData.items
  
  const handleNextAfterName = () => {
    if (!guestName.trim()) {
      Alert.alert("Name Required", "Please enter a guest name to continue.");
      return;
    }
    
    // Check if the name already exists in previousGuests
    if (previousGuests.some(guest => guest.name.toLowerCase() === guestName.trim().toLowerCase())) {
      Alert.alert("Duplicate Name", "A guest with this name already exists. Please use a different name.");
      return;
    }
    
    setShowNameInput(false);
  };
  
  const toggleItemSelection = (itemId) => {
    const item = availableItems.find(item => item.id === itemId);
    
    if (selectedItems.some(i => i.id === itemId)) {
      // Remove from selected
      setSelectedItems(selectedItems.filter(i => i.id !== itemId));
    } else {
      // Add to selected
      setSelectedItems([...selectedItems, item]);
    }
  };
  
  const openSplitModal = (item) => {
    setItemToSplit(item);
    setSplitModalVisible(true);
  };
  
  const handleSplitItem = () => {
    const count = parseInt(splitCount);
    if (isNaN(count) || count < 2) {
      Alert.alert("Invalid Input", "Please enter a number greater than 1.");
      return;
    }
    
    // Remove the original item from available and selected items
    const updatedAvailable = availableItems.filter(item => item.id !== itemToSplit.id);
    const updatedSelected = selectedItems.filter(item => item.id !== itemToSplit.id);
    
    // Create split items
    const splitItems = [];
    const splitPrice = itemToSplit.price / count;
    
    for (let i = 1; i <= count; i++) {
      splitItems.push({
        ...itemToSplit,
        id: `${itemToSplit.id}-split-${i}`,
        originalId: itemToSplit.originalId,
        name: `${i}/${count} ${itemToSplit.name}`,
        price: splitPrice,
        isSplit: true,
        splitPart: i,
        splitTotal: count
      });
    }
    
    // Add split items to available items
    const insertIndex = updatedAvailable.findIndex(item => 
      item.originalId === itemToSplit.originalId && item.isSplit
    );
    
    if (insertIndex !== -1) {
      // Insert after the last split item from the same original
      let lastSplitIndex = insertIndex;
      while (
        lastSplitIndex + 1 < updatedAvailable.length && 
        updatedAvailable[lastSplitIndex + 1].originalId === itemToSplit.originalId &&
        updatedAvailable[lastSplitIndex + 1].isSplit
      ) {
        lastSplitIndex++;
      }
      updatedAvailable.splice(lastSplitIndex + 1, 0, ...splitItems);
    } else {
      // Insert at the position of the original item
      const originalIndex = availableItems.findIndex(item => item.id === itemToSplit.id);
      updatedAvailable.splice(originalIndex, 0, ...splitItems);
    }
    
    setAvailableItems(updatedAvailable);
    setSelectedItems(updatedSelected);
    setSplitModalVisible(false);
  };
  
  const confirmGuestItems = () => {
    if (selectedItems.length === 0) {
      Alert.alert("No Items Selected", "Please select at least one item for this guest.");
      return;
    }
    
    // Calculate guest's items subtotal
    const guestSubtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
    
    // Calculate what proportion of the total bill this guest's items represent
    const proportion = guestSubtotal / billData.subtotal;
    
    // Calculate proportional tip and tax
    const proportionalTip = billData.tip * proportion;
    const proportionalTax = billData.tax * proportion;
    
    // Calculate total with tip and tax
    const guestTotal = guestSubtotal + proportionalTip + proportionalTax;
    
    // Add guest to previous guests
    const newGuest = {
      name: guestName,
      items: selectedItems,
      subtotal: guestSubtotal,
      tip: proportionalTip,
      tax: proportionalTax,
      total: guestTotal
    };
    
    setPreviousGuests([...previousGuests, newGuest]);
    
    // Remove selected items from available items
    const remainingItems = availableItems.filter(
      item => !selectedItems.some(selected => selected.id === item.id)
    );
    
    console.log('Selected items:', selectedItems.map(i => i.id));
    console.log('Available before:', availableItems.map(i => i.id));
    console.log('Available after:', remainingItems.map(i => i.id));
    
    setAvailableItems(remainingItems);
    setSelectedItems([]);
    setShowNameInput(true);
    setGuestName('');
  };
  
  const toggleGuestDetails = (index) => {
    if (expandedGuest === index) {
      setExpandedGuest(null);
    } else {
      setExpandedGuest(index);
    }
  };
  
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };
  
  if (!billData) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.errorText}>No bill data available</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonSmall}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Split Bill</Text>
      </View>

      <ScrollView style={styles.content}>
        {availableItems.length > 0 ? (
          // Show guest name input or item selection only if there are items left
          showNameInput ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Enter Guest Name</Text>
              <TextInput
                style={styles.nameInput}
                value={guestName}
                onChangeText={setGuestName}
                placeholder="Guest Name"
                placeholderTextColor="#999"
                autoFocus
              />
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={handleNextAfterName}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Select Items for {guestName}</Text>
              
              {availableItems.length === 0 ? (
                <Text style={styles.noItemsText}>No items available</Text>
              ) : (
                <FlatList
                  data={availableItems}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[
                        styles.itemRow,
                        selectedItems.some(i => i.id === item.id) && styles.selectedItem
                      ]}
                      onPress={() => toggleItemSelection(item.id)}
                    >
                      <View style={styles.itemNameContainer}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {selectedItems.some(i => i.id === item.id) && (
                          <Ionicons name="checkmark-circle" size={18} color="#4CDE80" style={styles.checkmark} />
                        )}
                      </View>
                      <View style={styles.itemPriceContainer}>
                        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                        {!item.isSplit && (
                          <TouchableOpacity 
                            style={styles.splitButton}
                            onPress={() => openSplitModal(item)}
                          >
                            <Ionicons name="git-branch-outline" size={18} color="#3442C6" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                  style={styles.itemsList}
                />
              )}
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={confirmGuestItems}
                >
                  <Text style={styles.confirmButtonText}>Confirm Items</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        ) : (
          // Show completion message when all items are assigned
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Bill Split Complete</Text>
            <Text style={styles.completionText}>
              All items have been assigned to guests. Review the guest totals below.
            </Text>
          </View>
        )}
        
        {/* Previous Guests Summary - always show this section */}
        {previousGuests.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Guest Totals</Text>
            {[...previousGuests].reverse().map((guest, index) => (
              <View key={index} style={styles.guestSummary}>
                <TouchableOpacity 
                  style={styles.guestSummaryHeader}
                  onPress={() => toggleGuestDetails(index)}
                >
                  <Text style={styles.guestName}>{guest.name}</Text>
                  <View style={styles.guestTotalContainer}>
                    <Text style={styles.guestTotal}>
                      Total: {formatCurrency(guest.total)}
                    </Text>
                    <Ionicons 
                      name={expandedGuest === index ? "chevron-up" : "chevron-down"} 
                      size={18} 
                      color="#666"
                    />
                  </View>
                </TouchableOpacity>
                
                {expandedGuest === index && (
                  <View style={styles.guestDetails}>
                    {guest.items.map((item, itemIndex) => (
                      <View key={itemIndex} style={styles.guestItemRow}>
                        <Text style={styles.guestItemName}>{item.name}</Text>
                        <Text style={styles.guestItemPrice}>{formatCurrency(item.price)}</Text>
                      </View>
                    ))}
                    
                    <View style={styles.guestItemDivider} />
                    
                    <View style={styles.guestItemRow}>
                      <Text style={styles.guestItemSubtotal}>Subtotal</Text>
                      <Text style={styles.guestItemSubtotalPrice}>{formatCurrency(guest.subtotal)}</Text>
                    </View>
                    
                    <View style={styles.guestItemRow}>
                      <Text style={styles.guestItemName}>Tax</Text>
                      <Text style={styles.guestItemPrice}>{formatCurrency(guest.tax)}</Text>
                    </View>
                    
                    <View style={styles.guestItemRow}>
                      <Text style={styles.guestItemName}>Tip</Text>
                      <Text style={styles.guestItemPrice}>{formatCurrency(guest.tip)}</Text>
                    </View>
                    
                    <View style={styles.guestItemDivider} />
                    
                    <View style={styles.guestItemRow}>
                      <Text style={styles.guestItemTotal}>Total</Text>
                      <Text style={styles.guestItemTotalPrice}>{formatCurrency(guest.total)}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Split Modal */}
      <Modal
        visible={splitModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSplitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Split how many ways?</Text>
            <TextInput
              style={styles.splitInput}
              value={splitCount}
              onChangeText={setSplitCount}
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setSplitModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={handleSplitItem}
              >
                <Text style={styles.modalConfirmText}>Split</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backButtonSmall: {
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
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#3442C6',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  itemsList: {
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: 'rgba(76, 222, 128, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CDE80',
  },
  itemNameContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    color: '#333',
    flex: 1,
  },
  checkmark: {
    marginLeft: 8,
  },
  itemPriceContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  itemPrice: {
    color: '#333',
    fontWeight: '500',
  },
  splitButton: {
    padding: 8,
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#4CDE80',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  noItemsText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  guestSummary: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  guestSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  guestName: {
    fontWeight: '600',
    color: '#333',
  },
  guestTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestTotal: {
    color: '#3442C6',
    fontWeight: '600',
    marginRight: 5,
  },
  guestDetails: {
    padding: 15,
    backgroundColor: 'white',
  },
  guestItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  guestItemName: {
    color: '#666',
  },
  guestItemPrice: {
    color: '#666',
  },
  guestItemTotal: {
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
  },
  guestItemTotalPrice: {
    fontWeight: '600',
    color: '#3442C6',
    marginTop: 5,
  },
  guestItemDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  guestItemSubtotal: {
    fontWeight: '600',
    color: '#333',
  },
  guestItemSubtotalPrice: {
    fontWeight: '600',
    color: '#3442C6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3442C6',
    marginBottom: 20,
  },
  splitInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    width: '50%',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
  },
  modalConfirmButton: {
    backgroundColor: '#3442C6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: 'white',
    fontWeight: '600',
  },
  backButton: {
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
  backButtonText: {
    color: '#3442C6',
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
  completionText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
    fontStyle: 'italic',
  },
}); 