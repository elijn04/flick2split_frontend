import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * TipSection component for handling tip calculations and selection
 */
export const TipSection = ({
  bill,
  selectedTipPercent,
  editingTipAmount,
  setEditingTipAmount,
  formatCurrency,
  selectTipPercent,
  handleCustomTipChange,
  onTipSelect
}) => {
  // Local state to track the text input value before converting to number
  const [localTipText, setLocalTipText] = useState(bill.tip?.toString() || "0");
  
  // Handle text changes in the custom tip input
  const handleTipTextChange = (text) => {
    // Store the current text input (including partially typed decimals)
    setLocalTipText(text);
    
    // Pass the text value to the parent handler
    handleCustomTipChange(text);
    
    // Check if we should scroll
    const numValue = parseFloat(text);
    if (!isNaN(numValue) && numValue > 0 && onTipSelect) {
      setTimeout(() => onTipSelect(), 300);
    }
  };
  
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Add Tip</Text>
      
      <View style={styles.tipOptionsContainer}>
        <Text style={styles.tipPrompt}>Select a tip percentage or enter a custom amount:</Text>
        
        <View style={styles.tipButtonsContainer}>
          <TouchableOpacity 
            style={[
              styles.tipButton, 
              selectedTipPercent === 0 && styles.tipButtonSelected
            ]}
            onPress={() => {
              selectTipPercent(0);
              if (onTipSelect) onTipSelect();
            }}
            activeOpacity={0.7}
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
            onPress={() => {
              selectTipPercent(15);
              if (onTipSelect) onTipSelect();
            }}
            activeOpacity={0.7}
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
            onPress={() => {
              selectTipPercent(20);
              if (onTipSelect) onTipSelect();
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tipButtonText,
              selectedTipPercent === 20 && styles.tipButtonTextSelected
            ]}>20%</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.customTipSection}>
          <Text style={styles.customTipLabel}>Custom Tip:</Text>
          
          <View style={styles.customTipInputContainer}>
            {editingTipAmount ? (
              <TextInput
                style={styles.customTipInput}
                value={localTipText}
                keyboardType="decimal-pad"
                autoFocus
                onChangeText={handleTipTextChange}
                onBlur={() => {
                  // When input loses focus, make sure the value is updated
                  handleCustomTipChange(localTipText);
                  setEditingTipAmount(false);
                }}
                onSubmitEditing={() => {
                  handleCustomTipChange(localTipText);
                  setEditingTipAmount(false);
                }}
              />
            ) : (
              <TouchableOpacity 
                style={styles.customTipButton}
                onPress={() => {
                  // Initialize local text state with current tip value when editing begins
                  setLocalTipText(bill.tip?.toString() || "0");
                  setEditingTipAmount(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.customTipText}>
                  {formatCurrency(bill.tip || 0)}
                </Text>
                <Ionicons name="pencil" size={14} color="#3442C6" style={styles.tipEditIcon} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      
      {(selectedTipPercent !== null || bill.tip > 0) && (
        <View style={styles.tipSummary}>
          <Text style={styles.tipCalculationText}>
            {selectedTipPercent !== null 
              ? `${selectedTipPercent}% of ${formatCurrency(bill.subtotal)}`
              : `${((bill.tip / bill.subtotal) * 100).toFixed(1)}% of ${formatCurrency(bill.subtotal)}`
            }
          </Text>
          <Text style={styles.tipAmountText}>= {formatCurrency(bill.tip || 0)}</Text>
        </View>
      )}
    </View>
  );
};

// Add default export
export default TipSection;

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
    fontSize: 20,
    fontWeight: '700',
    color: '#3442C6',
    marginBottom: 18,
  },
  tipOptionsContainer: {
    marginBottom: 15,
  },
  tipPrompt: {
    fontSize: 15,
    color: '#555',
    marginBottom: 12,
  },
  tipButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  tipButton: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  tipButtonSelected: {
    backgroundColor: '#3442C6',
    borderColor: '#3442C6',
  },
  tipButtonText: {
    fontWeight: '600',
    fontSize: 15,
    color: '#444',
  },
  tipButtonTextSelected: {
    color: 'white',
  },
  customTipSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  customTipLabel: {
    fontWeight: '600',
    fontSize: 15,
    color: '#444',
    marginRight: 12,
    width: 100,
  },
  customTipInputContainer: {
    flex: 1,
  },
  customTipInput: {
    borderWidth: 1,
    borderColor: '#3442C6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    backgroundColor: 'rgba(52, 66, 198, 0.05)',
  },
  customTipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  customTipText: {
    fontWeight: '600',
    fontSize: 15,
    color: '#444',
  },
  tipEditIcon: {
    marginLeft: 6,
  },
  tipSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
  },
  tipCalculationText: {
    color: '#555',
    fontSize: 15,
  },
  tipAmountText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#3442C6',
  },
}); 