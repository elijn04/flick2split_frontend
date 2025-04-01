import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { currencies, searchCurrencies } from './utils/currencies';

// Define backend URL with better environment handling
// In development, it will use localhost
// In production, it should use your deployed backend URL
const DEV_API_URL = 'http://localhost:5000';
const PROD_API_URL = 'https://flick2split-api.herokuapp.com'; // Update with your actual production URL
const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const useCurrencyConverter = (initialCurrencyCode = null) => {
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [originalCurrency, setOriginalCurrency] = useState(null);
  const [targetCurrency, setTargetCurrency] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [showOriginalDropdown, setShowOriginalDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [originalSearchQuery, setOriginalSearchQuery] = useState('');
  const [targetSearchQuery, setTargetSearchQuery] = useState('');

  const fetchExchangeRate = async (fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) {
      setExchangeRate(1);
      return;
    }
    
    try {
      console.log(`Converting from ${fromCurrency} to ${toCurrency}`);
      
      // Call our backend endpoint instead of the API directly
      const response = await fetch(`${API_URL}/convert-currency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromCurrency: fromCurrency,
          toCurrency: toCurrency
        }),
      }).catch(error => {
        console.error('Network error:', error);
        throw new Error('Network connection error. Please check your internet connection.');
      });
      
      console.log(`API response status: ${response.status}`);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`);
        throw new Error(`Connection error (${response.status}). Please try again later.`);
      }
      
      // Safely parse JSON with error handling
      let data;
      try {
        const text = await response.text();
        console.log(`Raw response: ${text}`);
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        // Use a default exchange rate of 1 for graceful failure
        console.log('Using default exchange rate of 1');
        setExchangeRate(1);
        return;
      }
      
      console.log('Parsed response:', data);
      
      if (!data.success) {
        console.error('API returned error:', data.message);
        // Use a default exchange rate of 1 for graceful failure
        setExchangeRate(1);
        return;
      }
      
      setExchangeRate(data.rate);
    } catch (error) {
      console.error('Currency conversion error:', error);
      // More user-friendly error message
      Alert.alert(
        'Currency Conversion',
        'Unable to get the latest exchange rate. Using an approximate rate for now.'
      );
      setExchangeRate(1);
    }
  };

  const convertCurrency = () => {
    if (!originalCurrency || !targetCurrency) {
      Alert.alert('Error', 'Please select both currencies');
      return;
    }
    if (originalCurrency === targetCurrency) {
      Alert.alert('Error', 'Please select different currencies for conversion');
      return;
    }
    fetchExchangeRate(originalCurrency, targetCurrency);
    setShowCurrencyModal(false);
  };

  return {
    showCurrencyModal,
    setShowCurrencyModal,
    originalCurrency,
    setOriginalCurrency,
    targetCurrency,
    setTargetCurrency,
    exchangeRate,
    showOriginalDropdown,
    setShowOriginalDropdown,
    showTargetDropdown,
    setShowTargetDropdown,
    originalSearchQuery,
    setOriginalSearchQuery,
    targetSearchQuery,
    setTargetSearchQuery,
    convertCurrency
  };
};

export const CurrencyConverterButton = ({ onPress, style }) => (
  <TouchableOpacity
    style={[styles.currencyButton, style]}
    onPress={onPress}
  >
    <Ionicons name="swap-horizontal" size={22} color="white" style={styles.currencyIcon} />
    <Text style={styles.currencyButtonText}>Convert Currency</Text>
  </TouchableOpacity>
);

export const CurrencyConverterModal = ({ 
  visible, 
  onClose,
  originalCurrency,
  onOriginalCurrencySelect,
  targetCurrency,
  onTargetCurrencySelect,
  onConvert,
  showOriginalDropdown,
  setShowOriginalDropdown,
  showTargetDropdown,
  setShowTargetDropdown,
  originalSearchQuery,
  setOriginalSearchQuery,
  targetSearchQuery,
  setTargetSearchQuery
}) => {
  // Filter currencies based on search queries
  const filteredOriginalCurrencies = originalSearchQuery 
    ? searchCurrencies(originalSearchQuery)
    : currencies;
    
  const filteredTargetCurrencies = targetSearchQuery
    ? searchCurrencies(targetSearchQuery)
    : currencies;
    
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {originalCurrency && targetCurrency 
                ? `${getCurrencyLabel(originalCurrency)} → ${getCurrencyLabel(targetCurrency)}`
                : "Currency Converter"}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.converterContainer}>
            {/* Original Currency Dropdown */}
            <View style={styles.dropdownsRow}>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => {
                    setShowOriginalDropdown(!showOriginalDropdown);
                    setShowTargetDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownButtonText}>
                    {showOriginalDropdown ? "Choose Original Currency" : (originalCurrency ? getCurrencyLabel(originalCurrency) : "Choose Original Currency")}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="white" />
                </TouchableOpacity>
                
                {showOriginalDropdown && (
                  <View style={styles.dropdownMenu}>
                    <View style={styles.searchContainer}>
                      <Ionicons name="search" size={16} color="rgba(255, 255, 255, 0.7)" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search currencies..."
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={originalSearchQuery}
                        onChangeText={setOriginalSearchQuery}
                        autoCapitalize="none"
                      />
                      {originalSearchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setOriginalSearchQuery('')}>
                          <Ionicons name="close-circle" size={16} color="rgba(255, 255, 255, 0.7)" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <ScrollView style={styles.currencyList} nestedScrollEnabled={true}>
                      {filteredOriginalCurrencies.map((currency) => (
                        <TouchableOpacity
                          key={currency.code}
                          style={[
                            styles.currencyItem,
                            originalCurrency === currency.code && styles.selectedCurrencyItem
                          ]}
                          onPress={() => {
                            onOriginalCurrencySelect(currency.code);
                            setShowOriginalDropdown(false);
                            setOriginalSearchQuery('');
                          }}
                        >
                          <Text style={styles.currencyCode}>{currency.code}</Text>
                          <Text style={styles.currencyName}>
                            {currency.name} ({currency.symbol})
                          </Text>
                        </TouchableOpacity>
                      ))}
                      {filteredOriginalCurrencies.length === 0 && (
                        <View style={styles.noResultsContainer}>
                          <Text style={styles.noResultsText}>No currencies found</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
              
              {/* Target Currency Dropdown */}
              <View style={styles.dropdownContainer}>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => {
                    setShowTargetDropdown(!showTargetDropdown);
                    setShowOriginalDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownButtonText}>
                    {showTargetDropdown ? "Choose Converted Currency" : (targetCurrency ? getCurrencyLabel(targetCurrency) : "Choose Converted Currency")}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="white" />
                </TouchableOpacity>
                
                {showTargetDropdown && (
                  <View style={styles.dropdownMenu}>
                    <View style={styles.searchContainer}>
                      <Ionicons name="search" size={16} color="rgba(255, 255, 255, 0.7)" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search currencies..."
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={targetSearchQuery}
                        onChangeText={setTargetSearchQuery}
                        autoCapitalize="none"
                      />
                      {targetSearchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setTargetSearchQuery('')}>
                          <Ionicons name="close-circle" size={16} color="rgba(255, 255, 255, 0.7)" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <ScrollView style={styles.currencyList} nestedScrollEnabled={true}>
                      {filteredTargetCurrencies.map((currency) => (
                        <TouchableOpacity
                          key={currency.code}
                          style={[
                            styles.currencyItem,
                            targetCurrency === currency.code && styles.selectedCurrencyItem
                          ]}
                          onPress={() => {
                            onTargetCurrencySelect(currency.code);
                            setShowTargetDropdown(false);
                            setTargetSearchQuery('');
                          }}
                        >
                          <Text style={styles.currencyCode}>{currency.code}</Text>
                          <Text style={styles.currencyName}>
                            {currency.name} ({currency.symbol})
                          </Text>
                        </TouchableOpacity>
                      ))}
                      {filteredTargetCurrencies.length === 0 && (
                        <View style={styles.noResultsContainer}>
                          <Text style={styles.noResultsText}>No currencies found</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.convertButton}
                onPress={onConvert}
              >
                <Text style={styles.convertButtonText}>Convert</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Helper function to get currency display label
const getCurrencyLabel = (code) => {
  const currency = currencies.find(c => c.code === code);
  return currency ? `${currency.code} (${currency.symbol})` : code;
};

const styles = StyleSheet.create({
  currencyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 30,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  currencyIcon: {
    marginRight: 10,
  },
  currencyButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
  },
  modalContent: {
    backgroundColor: "#3442C6",
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  modalCloseButton: {
    padding: 5,
  },
  converterContainer: {
    width: '100%',
  },
  dropdownsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownContainer: {
    width: '48%',
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "white",
    textAlign: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: "#3442C6",
    borderRadius: 12,
    marginTop: 5,
    maxHeight: 250,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 10,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  searchInput: {
    flex: 1,
    color: "white",
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 4,
  },
  currencyList: {
    maxHeight: 200,
  },
  currencyItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  selectedCurrencyItem: {
    backgroundColor: "rgba(76, 222, 128, 0.2)",
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  currencyName: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  buttonContainer: {
    marginTop: 15,
  },
  convertButton: {
    backgroundColor: "#4CDE80",
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  convertButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  noResultsContainer: {
    padding: 15,
    alignItems: 'center',
  },
  noResultsText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    fontStyle: 'italic',
  },
}); 