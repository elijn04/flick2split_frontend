import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ title, onBackPress, onHelpPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButtonSmall}
        onPress={onBackPress}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity 
        style={styles.helpButton}
        onPress={onHelpPress}
        activeOpacity={0.7}
      >
        <Ionicons name="help-circle" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  helpButton: {
    position: 'absolute',
    right: 20,
    padding: 5,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
});

export default Header; 