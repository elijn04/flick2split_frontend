export const getExchangeRate = async (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  try {
    // Replace 'http://your-backend-url' with the actual URL or IP address of your Flask backend
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/exchange_rate?from_currency=${fromCurrency}&to_currency=${toCurrency}`);
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error);
    }
    const rate = json.data?.[toCurrency.toUpperCase()]?.value;
    if (!rate) throw new Error('Exchange rate not found');
    return rate;
  } catch (error) {
    throw error;
  }
};

export default {
  getExchangeRate
};
