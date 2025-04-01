import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const GuestNameInput = ({ guestName, setGuestName, onNext }) => {
  return (
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
        onPress={onNext}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

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
});

export default GuestNameInput; 