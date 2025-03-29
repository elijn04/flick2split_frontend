import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * ItemsList component for displaying and editing bill items
 */
export const ItemsList = ({
  bill,
  setBill,
  editingItem,
  setEditingItem,
  editingQuantity,
  setEditingQuantity,
  editingName,
  setEditingName,
  itemsConfirmed,
  handleConfirmItems,
  formatCurrency,
  updateItemName,
  updateItemPrice,
  updateItemQuantity,
  addNewItem,
  onConfirmScroll
}) => {
  
  // Handler that both confirms items and triggers scroll
  const handleConfirmAndScroll = () => {
    handleConfirmItems();
    
    // Allow UI to update before scrolling
    setTimeout(() => {
      if (onConfirmScroll) onConfirmScroll();
    }, 100);
  };
  
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Items</Text>
      <View style={styles.itemsContainer}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemHeaderText}>Item</Text>
          <Text style={styles.itemHeaderText}>Qty</Text>
          <Text style={styles.itemHeaderText}>Price</Text>
        </View>
        
        {bill.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            {editingName === index ? (
              <TextInput
                style={styles.nameInput}
                value={item.name}
                autoFocus
                onChangeText={(text) => {
                  const updatedItems = [...bill.items];
                  updatedItems[index] = {
                    ...updatedItems[index],
                    name: text
                  };
                  setBill(prev => ({...prev, items: updatedItems}));
                }}
                onBlur={() => updateItemName(index, bill.items[index].name)}
                onSubmitEditing={() => updateItemName(index, bill.items[index].name)}
              />
            ) : (
              <View style={styles.nameContainer}>
                <TouchableOpacity 
                  style={styles.editIcon}
                  onPress={() => setEditingName(index)}
                >
                </TouchableOpacity>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
            )}
            
            {editingQuantity === index ? (
              <TextInput
                style={styles.quantityInput}
                value={item.quantity?.toString()}
                keyboardType="numeric"
                autoFocus
                onChangeText={(text) => {
                  const updatedItems = [...bill.items];
                  updatedItems[index] = {
                    ...updatedItems[index],
                    quantity: text
                  };
                  setBill(prev => ({...prev, items: updatedItems}));
                }}
                onBlur={() => updateItemQuantity(index, bill.items[index].quantity)}
                onSubmitEditing={() => updateItemQuantity(index, bill.items[index].quantity)}
              />
            ) : (
              <View style={styles.quantityContainer}>
                <Text style={styles.itemQuantity}>{item.quantity || 1}</Text>
                <TouchableOpacity 
                  style={styles.editIcon}
                  onPress={() => setEditingQuantity(index)}
                >
                  <Ionicons name="pencil" size={12} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            
            {editingItem === index ? (
              <TextInput
                style={styles.priceInput}
                value={item.price?.toString() || "0"}
                keyboardType="numeric"
                autoFocus
                onChangeText={(text) => {
                  const updatedItems = [...bill.items];
                  updatedItems[index] = {
                    ...updatedItems[index],
                    price: text
                  };
                  setBill(prev => ({...prev, items: updatedItems}));
                }}
                onBlur={() => updateItemPrice(index, bill.items[index].price)}
                onSubmitEditing={() => updateItemPrice(index, bill.items[index].price)}
              />
            ) : (
              <View style={styles.priceContainer}>
                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                <TouchableOpacity 
                  style={styles.editIcon}
                  onPress={() => setEditingItem(index)}
                >
                  <Ionicons name="pencil" size={12} color="#666" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        
        <TouchableOpacity 
          style={styles.addItemButton}
          onPress={addNewItem}
        >
          <Ionicons name="add-circle" size={20} color="#3442C6" />
          <Text style={styles.addItemText}>Add Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmItemsButton}
          onPress={handleConfirmAndScroll}
        >
          <Text style={styles.confirmItemsText}>Confirm Items</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Add default export
export default ItemsList;

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
  itemsContainer: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  itemHeaderText: {
    fontWeight: '600',
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  itemName: {
    flex: 1,
    color: '#333',
    marginLeft: 5,
  },
  nameInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#3442C6',
    borderRadius: 4,
    padding: 4,
    color: '#333',
    backgroundColor: 'rgba(52, 66, 198, 0.05)',
  },
  quantityContainer: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemQuantity: {
    textAlign: 'center',
    color: '#333',
  },
  quantityInput: {
    flex: 0.5,
    borderWidth: 1,
    borderColor: '#3442C6',
    borderRadius: 4,
    padding: 4,
    textAlign: 'center',
    color: '#333',
    backgroundColor: 'rgba(52, 66, 198, 0.05)',
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  itemPrice: {
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
  },
  editIcon: {
    padding: 2,
    marginRight: 5,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3442C6',
    borderRadius: 4,
    padding: 4,
    textAlign: 'right',
    color: '#333',
    backgroundColor: 'rgba(52, 66, 198, 0.05)',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    marginTop: 5,
    marginHorizontal: 40,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#3442C6',
    borderRadius: 8,
    backgroundColor: 'rgba(52, 66, 198, 0.05)',
  },
  addItemText: {
    marginLeft: 6,
    color: '#3442C6',
    fontWeight: '600',
    fontSize: 13,
  },
  confirmItemsButton: {
    backgroundColor: '#4CDE80',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmItemsText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
}); 