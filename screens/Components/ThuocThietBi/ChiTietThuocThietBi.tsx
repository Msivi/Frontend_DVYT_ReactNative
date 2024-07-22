import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5199';
const { width: viewportWidth } = Dimensions.get('window');

const ChiTietThuocThietBiScreen = () => {
  const route = useRoute();
  const { itemId, type } = route.params; // itemId và loại sản phẩm 'thuoc' hoặc 'thietbi'
  const [itemDetail, setItemDetail] = useState(null);
  const [loai, setLoai] = useState('');
  const [quantity, setQuantity] = useState(1);
  const navigation = useNavigation();

  useEffect(() => {
    fetchItemDetail();
  }, [itemId, type]);

  const fetchItemDetail = async () => {
    try {
      const itemResponse = await axios.get(`${BASE_URL}/api/${type === 'thuoc' ? `Thuoc/get-thuoc-by-id?id=${itemId}` : `ThietBiYTe/get-thiet-bi-y-te-by-id?id=${itemId}`}`);
      setItemDetail(itemResponse.data);
      
    } catch (error) {
      console.error('Failed to fetch item details:', error);
    }
  };

  const getCurrentUserId = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/KhachHang/get-tt-khach-hang`);
      return response.data.maKhachHang;
    } catch (error) {
      console.error('Failed to fetch current user ID:', error);
      return null;
    }
  };

  const addToCart = async () => {
    try {
      const maKhachHang = await getCurrentUserId();
      if (!maKhachHang) {
        Alert.alert('Thông báo', 'Không thể lấy thông tin khách hàng');
        return;
      }

      const cartKey = `cart_${maKhachHang}`;
      const cart = await AsyncStorage.getItem(cartKey);
      const cartItems = cart ? JSON.parse(cart) : [];
      
      const existingItemIndex = cartItems.findIndex(item => item.id === itemDetail.id && item.type === type);
      if (existingItemIndex >= 0) {
        const existingItem = cartItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > itemDetail.soLuong) {
          Alert.alert('Thông báo', `Số lượng trong giỏ hàng vượt quá số lượng tồn kho (${itemDetail.soLuong})`);
          return;
        }
        cartItems[existingItemIndex].quantity = newQuantity;
      } else {
        const newItem = { ...itemDetail, quantity, type };
        cartItems.push(newItem);
      }

      await AsyncStorage.setItem(cartKey, JSON.stringify(cartItems));
      Alert.alert('Thông báo', 'Sản phẩm đã được thêm vào giỏ hàng');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const buyNow = async () => {
    try {
      const maKhachHang = await getCurrentUserId();
      if (!maKhachHang) {
        Alert.alert('Thông báo', 'Không thể lấy thông tin khách hàng');
        return;
      }

      const cartKey = `cart_${maKhachHang}`;
      const cart = await AsyncStorage.getItem(cartKey);
      const cartItems = cart ? JSON.parse(cart) : [];
      
      const existingItemIndex = cartItems.findIndex(item => item.id === itemDetail.id && item.type === type);
      if (existingItemIndex >= 0) {
        const existingItem = cartItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > itemDetail.soLuong) {
          Alert.alert('Thông báo', `Số lượng trong giỏ hàng vượt quá số lượng tồn kho (${itemDetail.soLuong})`);
          return;
        }
        cartItems[existingItemIndex].quantity = newQuantity;
      } else {
        const newItem = { ...itemDetail, quantity, type };
        cartItems.push(newItem);
      }

      await AsyncStorage.setItem(cartKey, JSON.stringify(cartItems));
      navigation.navigate('GioHang');
    } catch (error) {
      console.error('Failed to buy now:', error);
    }
  };

  if (!itemDetail) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: `${BASE_URL}${itemDetail.hinhAnh}` }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{type === 'thuoc' ? itemDetail.tenThuoc : itemDetail.tenThietBiYTe}</Text>
        <Text style={styles.price}>{itemDetail.donGia.toLocaleString('vi-VN')} đ</Text>
        <Text style={styles.description}>{itemDetail.moTa}</Text>
        <Text style={styles.detail}>Đơn vị tính: {itemDetail.donViTinh}</Text>
        <Text style={[styles.detail, itemDetail.soLuong > 0 ? styles.inStock : styles.outOfStock]}>{itemDetail.soLuong > 0 ? `Số lượng: ${itemDetail.soLuong}` : 'Hết hàng'}</Text>
        <Text style={styles.detail}>Ngày sản xuất: {new Date(itemDetail.ngaySanXuat).toLocaleDateString()}</Text>
        <Text style={styles.detail}>Ngày hết hạn: {new Date(itemDetail.ngayHetHan).toLocaleDateString()}</Text>
        <Text style={styles.detail}>Nhà sản xuất: {itemDetail.nhaSanXuat}</Text>
        <Text style={styles.detail}>Loại: {itemDetail.tenDanhMuc}</Text>
        {type === 'thuoc' && <Text style={styles.detail}>Thành phần: {itemDetail.thanhPhan}</Text>}

        {itemDetail.soLuong > 0 && (
          <>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(0, quantity - 1))} disabled={quantity === 0}>
                <Icon name="remove-circle-outline" size={30} color={quantity === 0 ? '#ccc' : '#000'} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(Math.min(itemDetail.soLuong, quantity + 1))} disabled={quantity >= itemDetail.soLuong}>
                <Icon name="add-circle-outline" size={30} color={quantity >= itemDetail.soLuong ? '#ccc' : '#000'} />
              </TouchableOpacity>
            </View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.button} onPress={addToCart}>
                <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buyNowButton]} onPress={buyNow}>
                <Text style={styles.buttonText}>Mua ngay</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: viewportWidth,
    height: viewportWidth * 0.75,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    color: 'orange',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
  },
  inStock: {
    color: 'black',
  },
  outOfStock: {
    color: 'red',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  quantityText: {
    fontSize: 20,
    marginHorizontal: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buyNowButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChiTietThuocThietBiScreen;
