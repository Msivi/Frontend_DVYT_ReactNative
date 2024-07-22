import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const KetQuaThanhToanHoaDon = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { maHoaDon, success } = route.params;

  useEffect(() => {
    if (!success) {
      // Nếu thanh toán không thành công, xóa hóa đơn
      axios.delete(`http://10.0.2.2:5199/api/HoaDon/delete-hoa-don?keyId=${maHoaDon}`)
        .then(response => {
          console.log('Invoice deleted successfully:', response.data);
        })
        .catch(error => {
          console.error('Failed to delete invoice:', error);
        });
    }
  }, [success, maHoaDon]);

  return (
    <View style={styles.container}>
      {success ? (
        <>
          <Text style={styles.successText}>Thanh toán thành công!</Text>
          <Text style={styles.infoText}>Mã hóa đơn: {maHoaDon}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Trang chủ')} style={styles.button}>
            <Text style={styles.buttonText}>Trang chủ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ChiTietHoaDonScreen', { maHoaDon })} style={styles.button}>
            <Text style={styles.buttonText}>Xem hóa đơn</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.failureText}>Chưa hoàn tất thanh toán!</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Trang chủ')} style={styles.button}>
            <Text style={styles.buttonText}>Quay lại</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 20
  },
  failureText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 20
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 16,
    color: '#fff'
  }
});

export default KetQuaThanhToanHoaDon;
