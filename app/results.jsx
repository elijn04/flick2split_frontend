import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { currencies, formatCurrency as formatCurrencyUtil, searchCurrencies } from './result_components/utils/currencies';

// Import modularized components
import { CurrencySelect } from './result_components/CurrencySelect';
import { ItemsList } from './result_components/ItemsList';
import { TipSection } from './result_components/TipSection';
import { BillSummary } from './result_components/BillSummary';

/**
 * Results component for displaying and editing bill details
 * Handles item editing, tip calculation, and bill splitting
 */
export default function Results() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  
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
    total: parseFloat(initialBill.total) || 0,
    uses_usd: initialBill.uses_usd !== undefined ? initialBill.uses_usd : true
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
  const [selectedCurrency, setSelectedCurrency] = useState(bill?.uses_usd ? 'USD' : null);
  const [showCurrencySelect, setShowCurrencySelect] = useState(!bill?.uses_usd);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConversionOption, setShowConversionOption] = useState(false);
  const [wantToConvert, setWantToConvert] = useState(null);
  const [conversionCurrency, setConversionCurrency] = useState(null);
  const [showConversionDropdown, setShowConversionDropdown] = useState(false);

  // Filter currencies based on search
  const filteredCurrencies = searchCurrencies(searchQuery);

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
  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount, selectedCurrency);
  };

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
    // Allow decimal input even if parseFloat would return 0
    // This handles cases like "0." or "0.0" during typing
    if (value === '' || value === '.' || value === '0.') {
      setBill(prev => ({
        ...prev,
        tip: 0
      }));
      setSelectedTipPercent(0);
      setHasTipInteraction(true);
      return;
    }
    
    // Replace any commas with periods for international input
    const sanitizedValue = value.replace(',', '.');
    
    // Only update if it's a valid number format
    if (!isNaN(sanitizedValue) && sanitizedValue !== '') {
      const tipAmount = parseFloat(sanitizedValue) || 0;
      updateTip(tipAmount);
      const tipPercent = bill.subtotal > 0 ? ((tipAmount / bill.subtotal) * 100).toFixed(1) : 0;
      setSelectedTipPercent(parseFloat(tipPercent));
      setHasTipInteraction(true);
    }
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
  
  // Scroll handler to show tip section when items are confirmed
  const scrollToTipSection = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  /**
   * Handle currency selection
   */
  const handleCurrencySelect = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    setIsDropdownOpen(false);
    setShowConversionOption(true);
    setSearchQuery('');
    setBill(prev => ({
      ...prev,
      uses_usd: currencyCode === 'USD'
    }));
  };
  
  /**
   * Handle conversion currency selection
   */
  const handleConversionCurrencySelect = (currencyCode) => {
    setConversionCurrency(currencyCode);
    setShowConversionDropdown(false);
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

      <ScrollView 
        style={styles.content}
        ref={scrollViewRef}
      >
        {showCurrencySelect && (
          <CurrencySelect
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            showConversionOption={showConversionOption}
            wantToConvert={wantToConvert}
            setWantToConvert={setWantToConvert}
            conversionCurrency={conversionCurrency}
            setConversionCurrency={setConversionCurrency}
            showConversionDropdown={showConversionDropdown}
            setShowConversionDropdown={setShowConversionDropdown}
            setShowCurrencySelect={setShowCurrencySelect}
            filteredCurrencies={filteredCurrencies}
            handleCurrencySelect={handleCurrencySelect}
            handleConversionCurrencySelect={handleConversionCurrencySelect}
          />
        )}

        {!showCurrencySelect && (
          <>
            <ItemsList
              bill={bill}
              setBill={setBill}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              editingQuantity={editingQuantity}
              setEditingQuantity={setEditingQuantity}
              editingName={editingName}
              setEditingName={setEditingName}
              itemsConfirmed={itemsConfirmed}
              handleConfirmItems={handleConfirmItems}
              formatCurrency={formatCurrency}
              updateItemName={updateItemName}
              updateItemPrice={updateItemPrice}
              updateItemQuantity={updateItemQuantity}
              addNewItem={addNewItem}
              onConfirmScroll={scrollToTipSection}
            />
            
            {itemsConfirmed ? (
              <TipSection
                bill={bill}
                selectedTipPercent={selectedTipPercent}
                editingTipAmount={editingTipAmount}
                setEditingTipAmount={setEditingTipAmount}
                formatCurrency={formatCurrency}
                selectTipPercent={selectTipPercent}
                handleCustomTipChange={handleCustomTipChange}
                onTipSelect={() => {
                  // Short delay to ensure UI updates before scrolling
                  setTimeout(() => {
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollToEnd({ animated: true });
                    }
                  }, 100);
                }}
              />
            ) : (
              <Text style={styles.confirmPrompt}>Please confirm your items to continue</Text>
            )}

            {hasTipInteraction && (
              <BillSummary
                bill={bill}
                formatCurrency={formatCurrency}
                handleSplitBill={handleSplitBill}
                splitComplete={splitComplete}
                shareGuestList={shareGuestList}
              />
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
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
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
  confirmPrompt: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    marginBottom: 40,
    fontSize: 16,
    fontStyle: 'italic',
  },
}); 