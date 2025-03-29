import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Share } from "react-native";
import { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SplitEvenly() {
  const [subtotal, setSubtotal] = useState('');
  const [tax, setTax] = useState('');
  const [selectedTip, setSelectedTip] = useState(null); // Changed to null as initial state
  const [numPeople, setNumPeople] = useState('2');
  const [customTipAmount, setCustomTipAmount] = useState('');
  const [isCustomTip, setIsCustomTip] = useState(false);
  const router = useRouter();
  
  // Calculate totals immediately
  const subtotalValue = parseFloat(subtotal) || 0;
  const taxValue = parseFloat(tax) || 0;
  let tipValue = 0;
  
  // Calculate tip based on percentage or custom amount
  if (isCustomTip) {
    tipValue = parseFloat(customTipAmount) || 0;
  } else {
    tipValue = subtotalValue * (selectedTip / 100);
  }
  
  const totalValue = subtotalValue + taxValue + tipValue;
  const perPersonAmount = totalValue / (parseInt(numPeople) || 1);
  
  // Check if summary should be shown (only after tip is selected)
  const showSummary = selectedTip !== null || isCustomTip;
  
  // Auto-calculate on input changes
  useEffect(() => {
    // No need for additional action as we calculate values immediately
  }, [subtotal, tax, selectedTip, numPeople]);
  
  // Format message for sharing
  const formatDetailsForSharing = () => {
    const tipDescription = isCustomTip 
      ? `Tip: $${tipValue.toFixed(2)}`
      : `Tip (${selectedTip}%): $${tipValue.toFixed(2)}`;
      
    return `💰 PAYMENT REQUEST 💰\n\n` +
           `You guys all owe me $${perPersonAmount.toFixed(2)} each for our meal.\n\n` +
           `Bill Details:\n` +
           `- Subtotal: $${subtotalValue.toFixed(2)}\n` +
           `- Tax: $${taxValue.toFixed(2)}\n` +
           `- ${tipDescription}\n` +
           `- Total: $${totalValue.toFixed(2)}\n\n` +
           `Split between ${numPeople} people\n` +
           `Please Venmo or pay me in cash!\n\n` +
           `Sent via Flick2Split`;
  };
  
  // Handle share functionality
  const handleShare = async () => {
    if (subtotalValue === 0) {
      Alert.alert('Missing Information', 'Please enter at least the subtotal amount.');
      return;
    }
    
    try {
      const message = formatDetailsForSharing();
      
      if (Platform.OS === 'ios') {
        await Share.share({
          message: message
        });
      } else {
        await Share.share({
          message: message,
          title: `Payment Request: $${perPersonAmount.toFixed(2)} per person`
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share bill details');
    }
  };
  
  // Handle tip selection
  const handleTipSelect = (tipPercent) => {
    if (!subtotal || parseFloat(subtotal) === 0) {
      Alert.alert(
        "Missing Information",
        "Please enter a subtotal amount before selecting a tip.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setSelectedTip(tipPercent);
    setIsCustomTip(false);
  };
  
  // Handle custom tip selection
  const handleCustomTipSelect = () => {
    if (!subtotal || parseFloat(subtotal) === 0) {
      Alert.alert(
        "Missing Information",
        "Please enter a subtotal amount before adding a custom tip.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setSelectedTip(null);
    setIsCustomTip(true);
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Background elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Split Evenly</Text>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Bill Info Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          
          {/* Subtotal and Tax on the same row */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Subtotal</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  value={subtotal}
                  onChangeText={setSubtotal}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
            </View>
            
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Tax</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  value={tax}
                  onChangeText={setTax}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
            </View>
          </View>
        </View>
        
        {/* Number of People Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Number of People</Text>
          
          <View style={styles.peopleContainer}>
            <TouchableOpacity 
              style={styles.peopleButton}
              onPress={() => setNumPeople(Math.max(1, parseInt(numPeople || 1) - 1).toString())}
              disabled={parseInt(numPeople || 1) <= 1}
            >
              <Ionicons name="remove" size={20} color="white" />
            </TouchableOpacity>
            
            <View style={styles.peopleInputContainer}>
              <TextInput
                style={styles.peopleInput}
                value={numPeople}
                onChangeText={setNumPeople}
                keyboardType="number-pad"
                textAlign="center"
              />
              <Text style={styles.peopleLabel}>people</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.peopleButton}
              onPress={() => setNumPeople((parseInt(numPeople || 1) + 1).toString())}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
          
        {/* Tip Selection Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Tip</Text>
          
          <View style={styles.tipContainer}>
            {[0, 15, 20].map((tip) => (
              <TouchableOpacity
                key={tip}
                style={[
                  styles.tipButton,
                  selectedTip === tip && !isCustomTip && styles.selectedTipButton
                ]}
                onPress={() => handleTipSelect(tip)}
              >
                <Text style={[
                  styles.tipButtonText,
                  selectedTip === tip && !isCustomTip && styles.selectedTipText
                ]}>
                  {tip}%
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[
                styles.tipButton,
                isCustomTip && styles.selectedTipButton
              ]}
              onPress={handleCustomTipSelect}
            >
              <Text style={[
                styles.tipButtonText,
                isCustomTip && styles.selectedTipText
              ]}>
                Custom
              </Text>
            </TouchableOpacity>
          </View>
          
          {isCustomTip && (
            <View style={styles.customTipContainer}>
              <Text style={styles.inputLabel}>Custom Tip Amount</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  value={customTipAmount}
                  onChangeText={setCustomTipAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  autoFocus
                />
              </View>
            </View>
          )}
        </View>
        
        {/* Summary Card - Only show if tip is selected */}
        {showSummary && (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="receipt-outline" size={24} color="white" style={styles.summaryIcon} />
                <Text style={styles.summaryTitle}>Bill Summary</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotalValue.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>${taxValue.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {isCustomTip ? 'Tip' : `Tip (${selectedTip}%)`}
                </Text>
                <Text style={styles.summaryValue}>${tipValue.toFixed(2)}</Text>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${totalValue.toFixed(2)}</Text>
              </View>
            </View>
            
            {/* Per Person Result */}
            <View style={styles.perPersonCard}>
              <Text style={styles.perPersonTitle}>Each Person Pays</Text>
              <Text style={styles.perPersonAmount}>${perPersonAmount.toFixed(2)}</Text>
              <Text style={styles.perPersonSubtext}>{numPeople} people splitting equally</Text>
            </View>
            
            {/* Share Button */}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={22} color="white" style={styles.shareIcon} />
              <Text style={styles.shareButtonText}>Share Split Details</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3442C6",
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
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(80, 130, 255, 0.3)',
    top: -350,
    left: -100,
  },
  circle2: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(110, 80, 255, 0.2)',
    bottom: -200,
    right: -150,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 15,
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "white",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: 'hidden',
  },
  currencySymbol: {
    color: "white",
    fontSize: 18,
    paddingLeft: 15,
    paddingRight: 5,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 18,
    color: "white",
    fontWeight: "500",
  },
  peopleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  peopleInputContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  peopleInput: {
    fontSize: 36,
    fontWeight: "700",
    color: "white",
    textAlign: 'center',
    width: '100%',
  },
  peopleLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 5,
  },
  peopleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  tipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tipButton: {
    width: '48%',
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedTipButton: {
    backgroundColor: "rgba(76, 222, 128, 0.4)",
    borderColor: "rgba(76, 222, 128, 0.8)",
  },
  tipButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  selectedTipText: {
    fontWeight: "800",
  },
  customTipContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryIcon: {
    marginRight: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    paddingTop: 12,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 18,
    color: "white",
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 18,
    color: "white",
    fontWeight: "800",
  },
  perPersonCard: {
    backgroundColor: "rgba(76, 222, 128, 0.2)",
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "rgba(76, 222, 128, 0.5)",
  },
  perPersonTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
    marginBottom: 15,
  },
  perPersonAmount: {
    fontSize: 38,
    color: "white",
    fontWeight: "900",
    marginBottom: 5,
  },
  perPersonSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  shareButton: {
    backgroundColor: "#4CDE80",
    borderRadius: 30,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    marginRight: 10,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfWidth: {
    width: '48%',
  },
});