import { Alert } from 'react-native';
import { currencies } from '../utils/currencies';

// Format currency with appropriate symbol
export const formatCurrencyAmount = (amount, targetCurrency, originalCurrency, billData) => {
  if (targetCurrency && targetCurrency !== originalCurrency) {
    const currencySymbol = getCurrencySymbol(targetCurrency);
    return `${currencySymbol}${parseFloat(amount).toFixed(2)}`;
  }
  return `${billData?.currency_symbol || '$'}${parseFloat(amount).toFixed(2)}`;
};

// Get currency symbol from currencies list
export const getCurrencySymbol = (currencyCode) => {
  const currency = currencies && currencies.find(c => c.code === currencyCode);
  return currency ? currency.symbol : '$';
};

// Format currency value (just the number with 2 decimal places)
export const formatCurrency = (amount) => {
  return parseFloat(amount).toFixed(2);
};

// Calculate subtotal from items
export const calculateSubtotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// Format guest details for sharing
export const formatGuestDetailsForSharing = (previousGuests, billData, targetCurrency, originalCurrency, exchangeRate) => {
  if (!previousGuests || previousGuests.length === 0) {
    return "No guests have been added yet.";
  }
  
  let message = "💸💸💸 BILL SPLIT SUMMARY 💸💸💸\n\n";
  
  // Calculate total bill amount
  const totalBillAmount = previousGuests.reduce((sum, guest) => sum + guest.total, 0);
  
  // Check if currency conversion is active
  const isConverted = targetCurrency && targetCurrency !== originalCurrency;
  
  // Add quick summary of all guests first
  message += "👥 PAYMENT REQUESTS 👥\n";
  message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
  
  previousGuests.forEach(guest => {
    const guestTotal = isConverted ? guest.total * exchangeRate : guest.total;
    message += `${guest.name} owes ${formatCurrencyAmountForSharing(guestTotal, targetCurrency, originalCurrency, billData)} 💰\n`;
  });
  
  // Add total bill information
  message += "\n📋 BILL DETAILS 📋\n";
  message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
  message += `🧾 Subtotal: ${formatCurrencyAmountForSharing(billData.subtotal, targetCurrency, originalCurrency, billData)}\n`;
  message += `🏛️ Tax: ${formatCurrencyAmountForSharing(billData.tax, targetCurrency, originalCurrency, billData)}\n`;
  message += `💁 Tip: ${formatCurrencyAmountForSharing(billData.tip, targetCurrency, originalCurrency, billData)}\n`;
  message += `💯 Total: ${formatCurrencyAmountForSharing(totalBillAmount, targetCurrency, originalCurrency, billData)}\n`;
  message += `👥 Split between ${previousGuests.length} people\n\n`;
  
  // Add conversion info if applicable
  if (isConverted) {
    message += `🌍 Converted from ${originalCurrency} to ${targetCurrency}\n`;
    message += `📈 Exchange rate: 1 ${originalCurrency} = ${exchangeRate.toFixed(4)} ${targetCurrency}\n`;
    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
  }
  
  // Add detailed breakdown
  message += "📊 DETAILED BREAKDOWN 📊\n";
  message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
  
  previousGuests.forEach(guest => {
    const guestSubtotal = isConverted ? guest.subtotal * exchangeRate : guest.subtotal;
    const guestTax = isConverted ? guest.tax * exchangeRate : guest.tax;
    const guestTip = isConverted ? guest.tip * exchangeRate : guest.tip;
    const guestTotal = isConverted ? guest.total * exchangeRate : guest.total;
    
    message += `👤 ${guest.name}'s TOTAL: ${formatCurrencyAmountForSharing(guestTotal, targetCurrency, originalCurrency, billData)}\n`;
    message += "   ITEMS:\n";
    guest.items.forEach(item => {
      const itemPrice = isConverted ? item.price * exchangeRate : item.price;
      message += `   • ${item.name}: ${formatCurrencyAmountForSharing(itemPrice, targetCurrency, originalCurrency, billData)}\n`;
    });
    message += `   📝 Subtotal: ${formatCurrencyAmountForSharing(guestSubtotal, targetCurrency, originalCurrency, billData)}\n`;
    message += `   🏛️ Tax: ${formatCurrencyAmountForSharing(guestTax, targetCurrency, originalCurrency, billData)}\n`;
    message += `   💁 Tip: ${formatCurrencyAmountForSharing(guestTip, targetCurrency, originalCurrency, billData)}\n`;
    message += `   💰 Total: ${formatCurrencyAmountForSharing(guestTotal, targetCurrency, originalCurrency, billData)}\n\n`;
  });
  
  message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
  message += "💳 Please Venmo or pay in cash!\n";
  message += "🚀 Sent via Flick2Split\n";
  message += "✨ Hassle-free bill splitting ✨";

  return message;
};

// Helper function for formatting currency in sharing text
const formatCurrencyAmountForSharing = (amount, targetCurrency, originalCurrency, billData) => {
  if (targetCurrency && targetCurrency !== originalCurrency) {
    const currencySymbol = getCurrencySymbol(targetCurrency);
    return `${currencySymbol}${parseFloat(amount).toFixed(2)}`;
  }
  return `${billData?.currency_symbol || '$'}${parseFloat(amount).toFixed(2)}`;
};

// Handle share button press
export const handleShare = async (previousGuests, billData, targetCurrency, originalCurrency, exchangeRate, Share) => {
  try {
    if (!previousGuests || previousGuests.length === 0) {
      Alert.alert('No Data', 'There are no guests to share information about.');
      return;
    }
    
    const message = formatGuestDetailsForSharing(previousGuests, billData, targetCurrency, originalCurrency, exchangeRate);
    await Share.share({
      message: message,
      title: 'Bill Split Details'
    });
  } catch (error) {
    console.error('Share error:', error);
    Alert.alert('Error', 'Failed to share bill details');
  }
};

export default {
  formatCurrencyAmount,
  getCurrencySymbol,
  formatCurrency,
  calculateSubtotal,
  formatGuestDetailsForSharing,
  handleShare
}; 