import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const BASE_URL = 'http://10.0.2.2:5199';

const GioHangScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    getCurrentUserId();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadCartItems(currentUserId);
    }
  }, [currentUserId]);

  const getCurrentUserId = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/KhachHang/get-tt-khach-hang`);
      const maKhachHang = response.data.maKhachHang;
      setCurrentUserId(maKhachHang);
    } catch (error) {
      console.error('Failed to fetch current user ID:', error);
    }
  };

  const loadCartItems = async (maKhachHang) => {
    try {
      const cartKey = `cart_${maKhachHang}`;
      const cart = await AsyncStorage.getItem(cartKey);
      if (cart) {
        setCartItems(JSON.parse(cart));
      }
    } catch (error) {
      console.error('Failed to load cart items:', error);
    }
  };

  const updateQuantity = (id, type, newQuantity) => {
    const updatedCartItems = cartItems.map((item) => {
      if (item.id === id && item.type === type) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedCartItems);
    saveCartItems(updatedCartItems);
  };

  const removeItem = (id, type) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== id || item.type !== type);
    setCartItems(updatedCartItems);
    saveCartItems(updatedCartItems);
  };

  const saveCartItems = async (items) => {
    try {
      if (currentUserId) {
        const cartKey = `cart_${currentUserId}`;
        await AsyncStorage.setItem(cartKey, JSON.stringify(items));
      }
    } catch (error) {
      console.error('Failed to save cart items:', error);
    }
  };

  const clearCartItems = async () => {
    try {
      if (currentUserId) {
        const cartKey = `cart_${currentUserId}`;
        await AsyncStorage.removeItem(cartKey);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Failed to clear cart items:', error);
    }
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.donGia * item.quantity, 0);
  };

  const handleCheckout = () => {
    navigation.navigate('CheckoutScreen', { cartItems, totalPrice: calculateTotalPrice() });
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: `${BASE_URL}${item.hinhAnh}` }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemTitle}>{item.tenThuoc || item.tenThietBiYTe}</Text>
        <Text style={styles.cartItemPrice}>{item.donGia.toLocaleString('vi-VN')} đ</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => updateQuantity(item.id, item.type, Math.max(1, item.quantity - 1))}>
            <Icon name="remove-circle-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TextInput
            style={styles.quantityInput}
            value={item.quantity.toString()}
            keyboardType="numeric"
            onChangeText={(text) => updateQuantity(item.id, item.type, Math.max(1, Number(text)))}
          />
          <TouchableOpacity onPress={() => updateQuantity(item.id, item.type, Math.min(item.soLuong, item.quantity + 1))}>
            <Icon name="add-circle-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeItem(item.id, item.type)} style={styles.removeButton}>
        <Icon name="trash-outline" size={24} color="#ff0000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Chưa có sản phẩm trong giỏ hàng</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.id}-${item.type}`}
            contentContainerStyle={styles.cartList}
          />
          <View style={styles.footer}>
            <Text style={styles.totalPriceText}>Tổng tiền: {calculateTotalPrice().toLocaleString('vi-VN')} đ</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  cartList: {
    padding: 10,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 16,
    color: 'orange',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    width: 40,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  removeButton: {
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
});

export default GioHangScreen;
