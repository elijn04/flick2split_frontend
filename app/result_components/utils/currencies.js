/**
 * List of available currencies with their codes, symbols, and names
 */
export const currencies = [
   // Major Global Currencies
   { code: 'USD', symbol: '$', name: 'US Dollar' },
   { code: 'EUR', symbol: '€', name: 'Euro' },
   { code: 'GBP', symbol: '£', name: 'British Pound' },
   { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
   { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
   { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
   { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
   { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
   { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
   { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
   { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
   { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
   { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
   { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
   { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
   { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
   { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
   { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
   { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
   { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
   { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
   { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel' },
   { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
   { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
   { code: 'THB', symbol: '฿', name: 'Thai Baht' },
   { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
   { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
   { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
   { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
   { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
   { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
   { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
   { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
 
   // South American Currencies
   { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
   { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
   { code: 'COP', symbol: '$', name: 'Colombian Peso' },
   { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
   { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano' },
   { code: 'UYU', symbol: '$', name: 'Uruguayan Peso' },
   { code: 'PYG', symbol: '₲', name: 'Paraguayan Guarani' },
   { code: 'VES', symbol: 'Bs.', name: 'Venezuelan Bolívar' },
   { code: 'GYD', symbol: 'G$', name: 'Guyanese Dollar' },
   { code: 'SRD', symbol: '$', name: 'Surinamese Dollar' },
 
   // Additional Major Currencies (if needed)
     // Additional Major Currencies (Expanded)
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'RSD', symbol: 'дин', name: 'Serbian Dinar' },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek' },
  { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari' },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' },
  { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble' },
  { code: 'MDL', symbol: 'L', name: 'Moldovan Leu' },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
  { code: 'UZS', symbol: 'soʻm', name: 'Uzbekistani Som' },
  { code: 'TJS', symbol: 'ЅМ', name: 'Tajikistani Somoni' },
  { code: 'KGS', symbol: 'с', name: 'Kyrgyzstani Som' },
  { code: 'TMT', symbol: 'T', name: 'Turkmenistani Manat' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee' },
  { code: 'MNT', symbol: '₮', name: 'Mongolian Tugrik' },
  { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'LAK', symbol: '₭', name: 'Laotian Kip' },
  { code: 'BND', symbol: 'B$', name: 'Brunei Dollar' },
  { code: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar' },
  { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina' },
  { code: 'SBD', symbol: 'SI$', name: 'Solomon Islands Dollar' },
  { code: 'TOP', symbol: 'T$', name: 'Tongan Paʻanga' },
  { code: 'VUV', symbol: 'Vt', name: 'Vanuatu Vatu' },
  { code: 'WST', symbol: 'T', name: 'Samoan Tala' },
  { code: 'XPF', symbol: '₣', name: 'CFP Franc' },
  { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee' },
  { code: 'SCR', symbol: '₨', name: 'Seychellois Rupee' },
  { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa' },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
  { code: 'IRR', symbol: '﷼', name: 'Iranian Rial' },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar' },
  { code: 'SYP', symbol: '£', name: 'Syrian Pound' },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
  { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar' },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'DZD', symbol: 'دج', name: 'Algerian Dinar' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' },
  { code: 'ZWL', symbol: 'Z$', name: 'Zimbabwean Dollar' },
  { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar' },
  { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza' },
  { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical' },
  { code: 'BWP', symbol: 'P', name: 'Botswanan Pula' },
  { code: 'LRD', symbol: 'L$', name: 'Liberian Dollar' },
  { code: 'SLL', symbol: 'Le', name: 'Sierra Leonean Leone' },
  { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi' },
  { code: 'GNF', symbol: 'FG', name: 'Guinean Franc' },
  { code: 'MGA', symbol: 'Ar', name: 'Malagasy Ariary' },
  { code: 'CDF', symbol: 'FC', name: 'Congolese Franc' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
  { code: 'BIF', symbol: 'FBu', name: 'Burundian Franc' },
  { code: 'DJF', symbol: 'Fdj', name: 'Djiboutian Franc' },
  { code: 'SOS', symbol: 'Sh', name: 'Somali Shilling' },
  { code: 'SDG', symbol: '£', name: 'Sudanese Pound' },
  { code: 'SSP', symbol: '£', name: 'South Sudanese Pound' },
  { code: 'ERN', symbol: 'Nfk', name: 'Eritrean Nakfa' },
  { code: 'STN', symbol: 'Db', name: 'São Tomé and Príncipe Dobra' }
];

/**
 * Format a number as a currency string using the specified currency code
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code to use
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode) => {
  const currency = currencies.find(c => c.code === currencyCode);
  if (currency) {
    return `${currency.symbol}${parseFloat(amount).toFixed(2)}`;
  } else {
    return `${parseFloat(amount).toFixed(2)}`;
  }
};

/**
 * Get a currency object by its code
 * @param {string} code - Currency code to look up
 * @returns {object|null} Currency object or null if not found
 */
export const getCurrencyByCode = (code) => {
  return currencies.find(c => c.code === code) || null;
};

/**
 * Search currencies by code or name
 * @param {string} query - Search query
 * @returns {array} Filtered list of currencies
 */
export const searchCurrencies = (query) => {
  if (!query) return currencies;
  
  const searchText = query.toLowerCase().trim();
  return currencies.filter(c => 
    c.code.toLowerCase().includes(searchText) || 
    c.name.toLowerCase().includes(searchText)
  );
};

// Add default export with all currency utilities
export default {
  currencies,
  formatCurrency,
  getCurrencyByCode,
  searchCurrencies
}; 