import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Alert, Linking } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const ThanhToan = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { dichVu, bacSi, price, selectedDate, selectedTime, loaiDichVu } = route.params;
  const [address, setAddress] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [note, setNote] = useState('');
  const textInputRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      if (loaiDichVu === 1) {
        fetchAddresses();
      }
    }, [loaiDichVu])
  );

  const fetchAddresses = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get('http://10.0.2.2:5199/api/DiaChi/get-all-dia-chi', {
        headers: {
          Authorization: `${token}`,
        },
      });
      // Filter addresses to only show those in Ho Chi Minh City
      const filteredAddresses = response.data.filter(address => address.tenDiaChi.includes('Thành phố Hồ Chí Minh'));
      setAddresses(filteredAddresses);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      Alert.alert('Error', 'Failed to fetch addresses');
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address.tenDiaChi);
    setShowMap(false);
  };

  const goToPayment = async () => {
    const parsedDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    parsedDate.setHours(hours, minutes, 0, 0);
  
    // Định dạng ngày giờ theo yêu cầu: yyyy-mm-ddThh:mm:ss.000
    const year = parsedDate.getFullYear();
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const hour = parsedDate.getHours().toString().padStart(2, '0');
    const minute = parsedDate.getMinutes().toString().padStart(2, '0');
    const second = parsedDate.getSeconds().toString().padStart(2, '0');
  
    const dateTimeForServer = `${year}-${month}-${day}T${hour}:${minute}:${second}.000`;
  
    try {
      const createResponse = await axios.post('http://10.0.2.2:5199/api/LichHen/create-lich-hen', {
        diaDiem: loaiDichVu === 1 ? selectedAddress : '',
        thoiGianDuKien: dateTimeForServer,
        maBacSi: bacSi ? bacSi.id : 0,
        maDichVu: dichVu.id,
        ghiChu: note,
      });
  
      const getAllResponse = await axios.get('http://10.0.2.2:5199/api/LichHen/get-all-lich-hen');
  
      if (getAllResponse.data && getAllResponse.data.length > 0) {
        const maLichHen = getAllResponse.data[getAllResponse.data.length - 1].id;
        initiatePayment(maLichHen);
      } else {
        console.error('Failed to get maLichHen from get-all-lich-hen response');
      }
    } catch (error) {
      console.error('Failed to create appointment or get all appointments:', error);
    }
  };
  
  

  const initiatePayment = async (maLichHen) => {
    try {
      const paymentResponse = await axios.post(`http://10.0.2.2:5199/api/ThanhToanDV/thanh-toan-mobile-by-id?maLichHen=${maLichHen}`, {});
      const paymentUrl = paymentResponse.data.url;

      if (paymentUrl) {
        Linking.openURL(paymentUrl);

        const checkPaymentStatus = setInterval(async () => {
          try {
            const statusResponse = await axios.get(`http://10.0.2.2:5199/api/ThanhToanDV/get-thanh-toan-by-id-lich-hen?maLichHen=${maLichHen}`);
            const paymentStatus = statusResponse.data;

            if (paymentStatus) {
              clearInterval(checkPaymentStatus);
              navigation.navigate('KetQuaThanhToan', {
                maLichHen,
                dichVu,
                address: selectedAddress,
                paymentMethod: paymentStatus.paymentMethod,
                totalPrice: price,
                paymentTime: new Date().toLocaleString(),
                success: true,
                orderId: paymentStatus.orderId,
                transactionId: paymentStatus.id
              });
            } else {
              clearInterval(checkPaymentStatus);
              navigation.navigate('KetQuaThanhToan', {
                maLichHen,
                success: false
              });
            }
          } catch (error) {
            clearInterval(checkPaymentStatus);
            navigation.navigate('KetQuaThanhToan', {
              maLichHen,
              success: false
            });
          }
        }, 5000);
      } else {
        console.error('No payment URL received');
      }
    } catch (error) {
      console.error('Failed to initiate payment:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='always'>
      <Text style={styles.sectionTitle}>Thanh toán</Text>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>Tên dịch vụ: {dichVu.tenDichVu}</Text>
        <Text style={styles.infoText}>Mã dịch vụ: {dichVu.id}</Text>
        <Text style={styles.infoText}>Giá: {price.toLocaleString('vi-VN')} đ</Text>
        {bacSi && <Text style={styles.infoText}>Bác sĩ: {bacSi.tenBacSi}</Text>}
        {bacSi && <Text style={styles.infoText}>Mã Bác sĩ: {bacSi.id}</Text>}
        <Text style={styles.infoText}>Ngày đã chọn: {new Date(selectedDate).toLocaleDateString()}</Text>
        <Text style={styles.infoText}>Giờ đã chọn: {selectedTime}</Text>
      </View>

      {loaiDichVu === 1 && (
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Địa chỉ khám</Text>
          <TouchableOpacity onPress={() => setShowMap(true)} style={styles.addressButton}>
            <Text style={styles.addressButtonText}>{selectedAddress || 'Chọn địa chỉ'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {showMap && loaiDichVu === 1 && (
        <View style={styles.mapContainer}>
          {addresses.map(address => (
            <TouchableOpacity key={address.id} onPress={() => handleSelectAddress(address)} style={styles.addressItem}>
              <Text style={styles.addressText}>{address.tenDiaChi}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => navigation.navigate('AddAddress')} style={styles.addAddressButton}>
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
        <Text style={styles.totalText}>Tổng thanh toán: {price.toLocaleString('vi-VN')} đ</Text>
        <TouchableOpacity onPress={goToPayment} style={[styles.paymentButton, loaiDichVu === 1 && !selectedAddress && styles.disabledButton]} disabled={loaiDichVu === 1 && !selectedAddress}>
          <Text style={styles.paymentButtonText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
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
  infoSection: {
    marginBottom: 20
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5
  },
  discountButton: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20
  },
  discountButtonText: {
    fontSize: 16,
    color: '#fff'
  },
  addressSection: {
    marginBottom: 20
  },
  addressButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center'
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
  paymentButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  paymentButtonText: {
    fontSize: 18,
    color: '#fff'
  }
});

export default ThanhToan;
