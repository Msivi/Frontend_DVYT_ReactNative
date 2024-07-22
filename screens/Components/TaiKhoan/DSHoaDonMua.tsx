import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const BASE_URL = 'http://10.0.2.2:5199';

const DanhSachHoaDonScreen = () => {
  const [orders, setOrders] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    getCurrentUserId();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchOrders(currentUserId);
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

  const fetchOrders = async (maKhachHang) => {
    try {
      const ordersResponse = await axios.get(`${BASE_URL}/api/HoaDon/get-all-hoa-don`);
      const filteredOrders = ordersResponse.data
        .filter(order => order.maKhachHang === maKhachHang && order.trangThai === 'True')
        .sort((a, b) => new Date(b.ngayMua) - new Date(a.ngayMua)); // Sort orders from newest to oldest

      const ordersWithProductImage = await Promise.all(filteredOrders.map(async (order) => {
        const productsResponse = await axios.get(`${BASE_URL}/api/HoaDon/get-all-sp-by-ma-hd?maHD=${order.id}`);
        const firstProduct = productsResponse.data[0]; // Assuming the first product is what you want
        if (firstProduct) {
          order.firstProductImage = `${BASE_URL}${firstProduct.hinhAnh}`;
        }
        return order;
      }));

      setOrders(ordersWithProductImage);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ChiTietHoaDonScreen', { maHoaDon: item.id })} style={styles.orderItem}>
      {item.firstProductImage && <Image source={{ uri: item.firstProductImage }} style={styles.productImage} />}
      <View style={styles.textContainer}>
        <Text style={styles.orderText}>Mã hóa đơn: {item.id}</Text>
        <Text style={styles.orderText}>Tổng tiền: {item.tongTien.toLocaleString('vi-VN')} đ</Text>
        <Text style={styles.orderText}>Ngày mua: {new Date(item.ngayMua).toLocaleString('vi-VN')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 10,
  },
  orderItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row', // Added to align image and text horizontally
  },
  textContainer: {
    marginLeft: 10, // Added margin to space out the image and text
  },
  orderText: {
    fontSize: 16,
    marginBottom: 5,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
});

export default DanhSachHoaDonScreen;
