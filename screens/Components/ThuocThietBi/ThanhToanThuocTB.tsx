import React, { useState, useEffect, useRef, } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute,useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5199';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems, totalPrice } = route.params;
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedAddressName, setSelectedAddressName] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [note, setNote] = useState('');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      
        fetchAddresses();
      
    }, [])
  );
  const fetchAddresses = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/DiaChi/get-all-dia-chi`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAddresses(response.data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      Alert.alert('Error', 'Failed to fetch addresses');
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
    setSelectedAddressName(address.tenDiaChi);
    setShowMap(false);
  };

  const handleConfirmCheckout = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const createHoaDonResponse = await axios.post(`${BASE_URL}/api/HoaDon/create-hoa-don`, {
        diaChi: selectedAddressId,
        ghiChu: note,
        tongTien: totalPrice,
      });
      const maHoaDon = parseInt(createHoaDonResponse.data.data, 10);

      await createChiTietMua(maHoaDon);

      await initiatePayment(maHoaDon);
    } catch (error) {
      console.error('Failed to create invoice or checkout:', error);
    }
  };

  const createChiTietMua = async (maHoaDon) => {
    try {
      for (const item of cartItems) {
        const data = {
          maHoaDon,
          soLuong: item.quantity,
        };

        if (item.type === 'thuoc') {
          data.maThuoc = item.id;
          console.log('Sending data for Thuoc:', data);
          await axios.post(`${BASE_URL}/api/CTMuaThuoc/create-ct-mua-thuoc`, data);
        } else if (item.type === 'thietbi') {
          data.maThietBiYTe = item.id;
          console.log('Sending data for ThietBi:', data);
          await axios.post(`${BASE_URL}/api/CTMuaThietBiYTe/create-ct-mua-thiet-bi-y-te`, data);
        }
      }
    } catch (error) {
      console.error('Failed to create purchase details:', error);
    }
  };

  const initiatePayment = async (maHoaDon) => {
    try {
      const paymentResponse = await axios.post(`${BASE_URL}/api/ThanhToanThuocThietBi/thanh-toan-by-id-hoa-don-mobile`, [maHoaDon], {
        params: {
          maDiaChi: selectedAddressId,
          ghiChu: note,
        },
      });
      const paymentUrl = paymentResponse.data.url.result;

      if (paymentUrl) {
        Linking.openURL(paymentUrl);

        const checkPaymentStatus = setInterval(async () => {
          try {
            const statusResponse = await axios.get(`${BASE_URL}/api/HoaDon/get-all-hoa-don-khach-hang`);
            const paymentStatus = statusResponse.data.find(hd => hd.id === maHoaDon)?.trangThai;

            if (paymentStatus === "True") {
              clearInterval(checkPaymentStatus);
              await clearCartItems();
              navigation.navigate('KetQuaThanhToanHoaDon', { maHoaDon, success: true });
            } else {
              clearInterval(checkPaymentStatus);
              navigation.navigate('KetQuaThanhToanHoaDon', { maHoaDon, success: false });
            }
          } catch (error) {
            console.error('Failed to check payment status:', error);
          }
        }, 5000);
      } else {
        console.error('No payment URL received');
      }
    } catch (error) {
      console.error('Failed to initiate payment:', error);
    }
  };

  const clearCartItems = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/KhachHang/get-tt-khach-hang`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const currentUserId = response.data.maKhachHang;
      const cartKey = `cart_${currentUserId}`;
      await AsyncStorage.removeItem(cartKey);
    } catch (error) {
      console.error('Failed to clear cart items:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='always'>
      <Text style={styles.sectionTitle}>Thanh toán</Text>
      <TouchableOpacity onPress={() => setShowMap(true)} style={styles.addressButton}>
        <Text style={styles.addressButtonText}>{selectedAddressName || 'Chọn địa chỉ'}</Text>
      </TouchableOpacity>
      {showMap && (
        <View style={styles.mapContainer}>
          {addresses.map(address => (
            <TouchableOpacity key={address.id} onPress={() => handleSelectAddress(address)} style={styles.addressItem}>
              <Text style={styles.addressText}>{address.tenDiaChi}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => navigation.navigate('ThemDiaChiMua')} style={styles.addAddressButton}>
            <Text style={styles.addAddressButtonText}>+ Thêm địa chỉ mới</Text>
          </TouchableOpacity>
        </View>
      )}
      <TextInput
        style={styles.noteInput}
        placeholder="Ghi chú (tùy chọn)"
        value={note}
        onChangeText={(text) => setNote(text)}
      />
      <View style={styles.totalSection}>
        <Text style={styles.totalText}>Tổng thanh toán: {totalPrice ? totalPrice.toLocaleString('vi-VN') : '0'} đ</Text>
      </View>
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmCheckout}>
        <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
    flexGrow: 1
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  addressButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20
  },
  addressButtonText: {
    fontSize: 16
  },
  mapContainer: {
    marginBottom: 20
  },
  addressItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  addressText: {
    fontSize: 16
  },
  noteInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  },
  totalSection: {
    marginBottom: 20,
    alignItems: 'center'
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center'
  },
  confirmButtonText: {
    fontSize: 18,
    color: '#fff'
  },
  addAddressButton: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  addAddressButtonText: {
    fontSize: 16,
    color: '#fff'
  },
});

export default CheckoutScreen;
