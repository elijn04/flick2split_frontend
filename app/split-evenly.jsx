import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Share, SafeAreaView } from "react-native";
import { useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatCurrency, currencies } from './utils/currencies';
import { useCurrencyConverter, CurrencyConverterButton, CurrencyConverterModal } from "./CurrencyConverter";
import { LinearGradient } from 'expo-linear-gradient';

export default function SplitEvenly() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const billData = params.billData ? JSON.parse(params.billData) : null;
  
  const [numPeople, setNumPeople] = useState('2');
  const [selectedTip, setSelectedTip] = useState(null);
  const [customTipAmount, setCustomTipAmount] = useState('');
  const [isCustomTip, setIsCustomTip] = useState(false);
  
  // Use the passed bill data
  const subtotalValue = billData?.subtotal || 0;
  const taxValue = billData?.tax || 0;
  let tipValue = billData?.tip || 0;
  const currencySymbol = billData?.currency_symbol || '$';
  const currencyCode = billData?.currency_code || 'USD';
  
  const {
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
  } = useCurrencyConverter(currencyCode);
  
  const totalValue = subtotalValue + taxValue + tipValue;
  const perPersonAmount = totalValue / (parseInt(numPeople) || 1);
  
  // Helper function to get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '$';
  };
  
  // Custom function to format currency with the bill's currency symbol
  const formatBillCurrency = (amount) => {
    // If using the currency converter, use the utility function
    if (targetCurrency !== originalCurrency) {
      // Convert the amount using the exchange rate
      const convertedAmount = amount * exchangeRate;
      // Get the target currency symbol
      const symbol = getCurrencySymbol(targetCurrency);
      // Return formatted amount with the target currency symbol
      return `${symbol}${parseFloat(convertedAmount).toFixed(2)}`;
    }
    // Otherwise just return the number without currency symbol
    return parseFloat(amount).toFixed(2);
  };
  
  // Format message for sharing
  const formatDetailsForSharing = () => {
    return `💰 PAYMENT REQUEST 💰\n\n` +
           `You guys all owe me ${formatBillCurrency(perPersonAmount)} each for our meal.\n\n` +
           `Bill Details:\n` +
           `- Subtotal: ${formatBillCurrency(subtotalValue)}\n` +
           `- Tax: ${formatBillCurrency(taxValue)}\n` +
           `- Tip: ${formatBillCurrency(tipValue)}\n` +
           `- Total: ${formatBillCurrency(totalValue)}\n\n` +
           `Split between ${numPeople} people\n` +
           `Please Venmo or pay me in cash!\n\n` +
           `Sent via Flick2Split`;
  };
  
  // Handle share functionality
  const handleShare = async () => {
    try {
      const message = formatDetailsForSharing();
      
      if (Platform.OS === 'ios') {
        await Share.share({
          message: message
        });
      } else {
        await Share.share({
          message: message,
          title: `Payment Request: ${formatBillCurrency(perPersonAmount)} per person`
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share bill details');
    }
  };
  
  return (
    <>
      <LinearGradient
        colors={['#3442C6', '#5B42E8', '#7451FB', '#8360FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <StatusBar style="light" />
          
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
              
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="receipt-outline" size={24} color="white" style={styles.summaryIcon} />
                <Text style={styles.summaryTitle}>Bill Summary</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatBillCurrency(subtotalValue)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>{formatBillCurrency(taxValue)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tip</Text>
                <Text style={styles.summaryValue}>{formatBillCurrency(tipValue)}</Text>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatBillCurrency(totalValue)}</Text>
              </View>
            </View>
            
            {/* Per Person Result */}
            <View style={styles.perPersonCard}>
              <Text style={styles.perPersonTitle}>Each Person Pays</Text>
              <Text style={styles.perPersonAmount}>{formatBillCurrency(perPersonAmount)}</Text>
              <Text style={styles.perPersonSubtext}>{numPeople} people splitting equally</Text>
            </View>

            {/* Currency Converter Button */}
            <CurrencyConverterButton onPress={() => setShowCurrencyModal(true)} />
            
            {/* Share Button */}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={22} color="white" style={styles.shareIcon} />
              <Text style={styles.shareButtonText}>Share Split Details</Text>
            </TouchableOpacity>

            {/* Currency Modal */}
            <CurrencyConverterModal
              visible={showCurrencyModal}
              onClose={() => setShowCurrencyModal(false)}
              originalCurrency={originalCurrency}
              onOriginalCurrencySelect={setOriginalCurrency}
              targetCurrency={targetCurrency}
              onTargetCurrencySelect={setTargetCurrency}
              onConvert={convertCurrency}
              showOriginalDropdown={showOriginalDropdown}
              setShowOriginalDropdown={setShowOriginalDropdown}
              showTargetDropdown={showTargetDropdown}
              setShowTargetDropdown={setShowTargetDropdown}
              originalSearchQuery={originalSearchQuery}
              setOriginalSearchQuery={setOriginalSearchQuery}
              targetSearchQuery={targetSearchQuery}
              setTargetSearchQuery={setTargetSearchQuery}
            />
          </ScrollView>
        </KeyboardAvoidingView>
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
    backgroundColor: "transparent",
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "white",
    letterSpacing: 0.5,
    textAlign: 'center',
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: "#3442C6",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  currencyList: {
    maxHeight: '80%',
  },
  currencyItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  selectedCurrencyItem: {
    backgroundColor: "rgba(76, 222, 128, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(76, 222, 128, 0.5)",
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
});