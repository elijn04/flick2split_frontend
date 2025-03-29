import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { currencies } from './utils/currencies';

/**
 * CurrencySelect component for selecting primary and conversion currencies
 */
export const CurrencySelect = ({
  selectedCurrency,
  setSelectedCurrency,
  searchQuery,
  setSearchQuery,
  isDropdownOpen,
  setIsDropdownOpen,
  showConversionOption,
  wantToConvert,
  setWantToConvert,
  conversionCurrency,
  setConversionCurrency,
  showConversionDropdown,
  setShowConversionDropdown,
  setShowCurrencySelect,
  filteredCurrencies,
  handleCurrencySelect,
  handleConversionCurrencySelect
}) => {
  
  // Modified currency selection handler to clear search
  const onCurrencySelect = (currencyCode) => {
    handleCurrencySelect(currencyCode);
    setSearchQuery(''); // Clear search query when selecting a currency
  };

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Select Currency</Text>
        <Text style={styles.currencyPrompt}>Please select the currency used for this bill:</Text>
        
        <TouchableOpacity 
          style={styles.currencyDropdownButton}
          onPress={() => setIsDropdownOpen(true)}
        >
          <Text style={styles.currencyDropdownButtonText}>
            {selectedCurrency 
              ? `${selectedCurrency} - ${currencies.find(c => c.code === selectedCurrency)?.name}` 
              : 'Select a currency'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Modal
          visible={isDropdownOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsDropdownOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Currency</Text>
                <TouchableOpacity onPress={() => setIsDropdownOpen(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search currencies..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                ) : null}
              </View>
              
              <FlatList
                data={filteredCurrencies}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.currencyItem}
                    onPress={() => onCurrencySelect(item.code)}
                  >
                    <Text style={styles.currencyCode}>{item.code}</Text>
                    <Text style={styles.currencyName}>{item.name} ({item.symbol})</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                style={styles.currencyList}
              />
            </View>
          </View>
        </Modal>
        
        {selectedCurrency && (
          <View style={styles.selectedCurrencyContainer}>
            <Text style={styles.selectedCurrencyLabel}>Selected Currency:</Text>
            <Text style={styles.selectedCurrencyValue}>
              {selectedCurrency} - {currencies.find(c => c.code === selectedCurrency)?.name}
            </Text>
          </View>
        )}
      </View>

      {showConversionOption && selectedCurrency && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Currency Conversion</Text>
          <Text style={styles.conversionOptionLabel}>
            Would you like to convert {selectedCurrency} to a different currency?
          </Text>
          <View style={styles.conversionOptionButtons}>
            <TouchableOpacity 
              style={[
                styles.conversionOptionButton,
                wantToConvert === true && styles.conversionOptionButtonSelected
              ]}
              onPress={() => setWantToConvert(true)}
            >
              <Text style={[
                styles.conversionOptionButtonText,
                wantToConvert === true && styles.conversionOptionButtonTextSelected
              ]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.conversionOptionButton,
                wantToConvert === false && styles.conversionOptionButtonSelected
              ]}
              onPress={() => {
                setWantToConvert(false);
              }}
            >
              <Text style={[
                styles.conversionOptionButtonText,
                wantToConvert === false && styles.conversionOptionButtonTextSelected
              ]}>No</Text>
            </TouchableOpacity>
          </View>
          
          {wantToConvert === false && selectedCurrency && (
            <TouchableOpacity
              style={styles.currencyConfirmButton}
              onPress={() => setShowCurrencySelect(false)}
            >
              <Text style={styles.currencyConfirmButtonText}>Confirm & View Receipt</Text>
            </TouchableOpacity>
          )}
          
          {wantToConvert && (
            <>
              <Text style={styles.conversionPrompt}>
                Select a currency to convert to:
              </Text>
              <TouchableOpacity 
                style={styles.currencyDropdownButton}
                onPress={() => setShowConversionDropdown(true)}
              >
                <Text style={styles.currencyDropdownButtonText}>
                  {conversionCurrency 
                    ? `${conversionCurrency} - ${currencies.find(c => c.code === conversionCurrency)?.name}` 
                    : 'Select a target currency'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              <Modal
                visible={showConversionDropdown}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowConversionDropdown(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Conversion Currency</Text>
                      <TouchableOpacity onPress={() => setShowConversionDropdown(false)}>
                        <Ionicons name="close" size={24} color="#333" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.searchContainer}>
                      <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search currencies..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                      />
                      {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                          <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    
                    <FlatList
                      data={filteredCurrencies.filter(c => c.code !== selectedCurrency)}
                      keyExtractor={(item) => item.code}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          style={styles.currencyItem}
                          onPress={() => handleConversionCurrencySelect(item.code)}
                        >
                          <Text style={styles.currencyCode}>{item.code}</Text>
                          <Text style={styles.currencyName}>{item.name} ({item.symbol})</Text>
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => <View style={styles.separator} />}
                      style={styles.currencyList}
                    />
                  </View>
                </View>
              </Modal>
              
              {conversionCurrency && (
                <>
                  <Text style={styles.conversionNotice}>
                    Note: This will be implemented in a future update. Currently, we will display amounts in {selectedCurrency}.
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.currencyConfirmButton}
                    onPress={() => setShowCurrencySelect(false)}
                  >
                    <Text style={styles.currencyConfirmButtonText}>Confirm & View Receipt</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      )}
    </>
  );
};

// Add default export
export default CurrencySelect;

const styles = StyleSheet.create({
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
  currencyPrompt: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
    fontSize: 16,
  },
  currencyDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  currencyDropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  currencyList: {
    maxHeight: 400,
  },
  currencyItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currencyName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    width: '100%',
  },
  selectedCurrencyContainer: {
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(52, 66, 198, 0.05)',
    padding: 15,
    borderRadius: 8,
  },
  selectedCurrencyLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  selectedCurrencyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  conversionOptionLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  conversionOptionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  conversionOptionButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 10,
  },
  conversionOptionButtonSelected: {
    backgroundColor: '#3442C6',
  },
  conversionOptionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  conversionOptionButtonTextSelected: {
    color: 'white',
  },
  conversionPrompt: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    marginTop: 10,
  },
  conversionNotice: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
  currencyConfirmButton: {
    backgroundColor: '#4CDE80',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currencyConfirmButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
}); 