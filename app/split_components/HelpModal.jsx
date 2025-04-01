import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

const HelpModal = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
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
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});

export default HelpModal; 