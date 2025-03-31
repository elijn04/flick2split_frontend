import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Modal,
  ScrollView,
  Alert,
  Share,
  Animated,
  Easing,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [helpVisible, setHelpVisible] = useState(false);
  
  // Add animation values
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const confettiY = useRef(new Animated.Value(-100)).current;
  const confettiX = useRef(Array(20).fill().map(() => new Animated.Value(0))).current;
  
  // Help modal toggle
  const toggleHelp = () => {
    setHelpVisible(!helpVisible);
  };
  
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
  
  // Calculate total cost of all items
  const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  // Handle confirming items for current guest
  const confirmGuestItems = () => {
    if (selectedItems.length === 0) {
      Alert.alert("No Items Selected", "Please select at least one item for this guest.");
      return;
    }
    
    // Get guest's portion of the bill
    const guestSubtotal = calculateSubtotal(selectedItems);
    const proportion = guestSubtotal / billData.subtotal;
    
    // Calculate guest's share of tax and tip
    const proportionalTip = billData.tip * proportion;
    const proportionalTax = billData.tax * proportion;
    const guestTotal = guestSubtotal + proportionalTip + proportionalTax;
    
    // Create guest entry with their items and costs
    const newGuest = {
      name: guestName,
      items: selectedItems,
      subtotal: guestSubtotal,
      tip: proportionalTip,
      tax: proportionalTax,
      total: guestTotal
    };
    
    // Add guest to list and update available items
    setPreviousGuests([...previousGuests, newGuest]);
    const remainingItems = availableItems.filter(
      item => !selectedItems.some(selected => selected.id === item.id)
    );
    
    // Reset for next guest
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
    return parseFloat(amount).toFixed(2);
  };
  
  // Format guest details for sharing
  const formatGuestDetailsForSharing = () => {
    if (!previousGuests || previousGuests.length === 0) {
      return "No guests have been added yet.";
    }
    
    let message = "💸💸💸 BILL SPLIT SUMMARY 💸💸💸\n\n";
    
    // Calculate total bill amount
    const totalBillAmount = previousGuests.reduce((sum, guest) => sum + guest.total, 0);
    
    // Add quick summary of all guests first
    message += "👥 PAYMENT REQUESTS 👥\n";
    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    previousGuests.forEach(guest => {
      message += `${guest.name} owes $${formatCurrency(guest.total)} 💰\n`;
    });
    
    // Add total bill information
    message += "\n📋 BILL DETAILS 📋\n";
    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    message += `🧾 Subtotal: $${formatCurrency(billData.subtotal)}\n`;
    message += `🏛️ Tax: $${formatCurrency(billData.tax)}\n`;
    message += `💁 Tip: $${formatCurrency(billData.tip)}\n`;
    message += `💯 Total: $${formatCurrency(totalBillAmount)}\n`;
    message += `👥 Split between ${previousGuests.length} people\n\n`;
    
    // Add detailed breakdown
    message += "📊 DETAILED BREAKDOWN 📊\n";
    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    previousGuests.forEach(guest => {
      message += `👤 ${guest.name}'s TOTAL: $${formatCurrency(guest.total)}\n`;
      message += "   ITEMS:\n";
      guest.items.forEach(item => {
        message += `   • ${item.name}: $${formatCurrency(item.price)}\n`;
      });
      message += `   📝 Subtotal: $${formatCurrency(guest.subtotal)}\n`;
      message += `   🏛️ Tax: $${formatCurrency(guest.tax)}\n`;
      message += `   💁 Tip: $${formatCurrency(guest.tip)}\n`;
      message += `   💰 Total: $${formatCurrency(guest.total)}\n\n`;
    });
    
    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    message += "💳 Please Venmo or pay in cash!\n";
    message += "🚀 Sent via Flick2Split\n";
    message += "✨ Hassle-free bill splitting ✨";

    return message;
  };

  // Handle share button press
  const handleShare = async () => {
    try {
      if (!previousGuests || previousGuests.length === 0) {
        Alert.alert('No Data', 'There are no guests to share information about.');
        return;
      }
      
      const message = formatGuestDetailsForSharing();
      await Share.share({
        message: message,
        title: 'Bill Split Details'
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share bill details');
    }
  };
  
  // Add animation function
  const playCelebrationAnimation = () => {
    // Reset animation values
    celebrationScale.setValue(0);
    celebrationOpacity.setValue(0);
    confettiY.setValue(-100);
    confettiX.forEach(x => x.setValue(Math.random() * 300 - 150));
    
    // Play animations
    Animated.parallel([
      Animated.timing(celebrationScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.elastic(1.2),
      }),
      Animated.timing(celebrationOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(confettiY, {
        toValue: 400,
        duration: 2000,
        useNativeDriver: true,
      }),
      ...confettiX.map(x => 
        Animated.sequence([
          Animated.delay(Math.random() * 500),
          Animated.timing(x, {
            toValue: Math.random() * 100 - 50,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        ])
      )
    ]).start();
  };
  
  // Trigger animation when all items are assigned
  useEffect(() => {
    if (availableItems.length === 0 && previousGuests.length > 0) {
      playCelebrationAnimation();
    }
  }, [availableItems.length, previousGuests.length]);
  
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
    <>
      <LinearGradient
        colors={['#3442C6', '#5B42E8', '#7451FB', '#8360FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StatusBar style="light" />
          
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButtonSmall}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Split Bill</Text>
          </View>

          <TouchableOpacity 
            style={styles.helpButton}
            onPress={toggleHelp}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Help Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={helpVisible}
            onRequestClose={toggleHelp}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>How to Split Your Bill</Text>
                
                <View style={styles.helpSection}>
                  <Text style={styles.helpSectionTitle}>1. Enter Names</Text>
                  <Text style={styles.helpText}>Start by entering each person's name who shared the bill.</Text>
                </View>

                <View style={styles.helpSection}>
                  <Text style={styles.helpSectionTitle}>2. Select Items</Text>
                  <Text style={styles.helpText}>Select the items each person ordered from the available items list.</Text>
                </View>

                <View style={styles.helpSection}>
                  <Text style={styles.helpSectionTitle}>3. Split Shared Items</Text>
                  <Text style={styles.helpText}>Use the split button (branch icon) if an item was shared between multiple people.</Text>
                </View>

                <View style={styles.helpSection}>
                  <Text style={styles.helpSectionTitle}>4. Repeat for Everyone</Text>
                  <Text style={styles.helpText}>Confirm each person's items and repeat until all items are assigned.</Text>
                </View>

                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={toggleHelp}
                >
                  <Text style={styles.closeButtonText}>Got it!</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

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
              // Animated celebration card
              <View style={styles.card}>
                <View style={styles.celebrationContainer}>
                  {/* Confetti particles */}
                  {confettiX.map((x, index) => (
                    <Animated.View 
                      key={index}
                      style={[
                        styles.confetti,
                        {
                          backgroundColor: ['#FF9500', '#4CDE80', '#3442C6', '#FFD54F', '#FF4F66'][index % 5],
                          transform: [
                            { translateY: confettiY },
                            { translateX: x },
                            { rotate: `${index * 30}deg` }
                          ],
                          opacity: celebrationOpacity
                        }
                      ]}
                    />
                  ))}
                  
                  {/* Success checkmark */}
                  <Animated.View style={{
                    transform: [{ scale: celebrationScale }],
                    opacity: celebrationOpacity
                  }}>
                    <View style={styles.successCircle}>
                      <Ionicons name="checkmark" size={40} color="white" />
                    </View>
                  </Animated.View>
                </View>
                
                <Animated.Text 
                  style={[
                    styles.sectionTitle, 
                    { 
                      opacity: celebrationOpacity,
                      transform: [{ scale: Animated.add(0.8, Animated.multiply(celebrationScale, 0.2)) }]
                    }
                  ]}
                >
                  Bill Split Complete!
                </Animated.Text>
                
                <Animated.Text 
                  style={[
                    styles.completionText,
                    { opacity: celebrationOpacity }
                  ]}
                >
                  All items have been assigned to guests. Review the guest totals below.
                </Animated.Text>
                
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={handleShare}
                >
                  <Text style={styles.shareButtonText}>Share Split Details</Text>
                </TouchableOpacity>
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
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 30,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 0,
    height: 40,
  },
  backButtonSmall: {
    position: 'absolute',
    left: 20,
    padding: 5,
    zIndex: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#3442C6',
    textAlign: 'center',
  },
  helpSection: {
    marginBottom: 22,
    width: '100%',
  },
  helpSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3442C6',
  },
  helpText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
  },
  closeButton: {
    backgroundColor: '#3442C6',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
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
  shareButton: {
    backgroundColor: '#4CDE80',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 15,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  helpButton: {
    position: 'absolute',
    top: 20,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  celebrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 200,
    marginBottom: 20,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 3,
    top: 0,
    left: '50%',
    zIndex: 1,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CDE80',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 4,
    borderColor: 'white',
    marginBottom: 20,
  },
}); 

