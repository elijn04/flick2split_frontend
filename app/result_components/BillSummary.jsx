import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * BillSummary component for displaying bill totals and split button
 */
export const BillSummary = ({
  bill,
  formatCurrency,
  handleSplitBill,
  splitComplete,
  shareGuestList
}) => {
  return (
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
  );
};

// Add default export
export default BillSummary;

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