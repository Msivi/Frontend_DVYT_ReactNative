import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const KetQuaThanhToan = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { maLichHen, dichVu, address, paymentMethod, totalPrice, paymentTime, success, orderId, transactionId } = route.params;

  useEffect(() => {
    if (!success) {
      // Nếu thanh toán không thành công, xóa lịch hẹn
      axios.delete(`http://10.0.2.2:5199/api/LichHen/delete-lich-hen?keyId=${maLichHen}`)
        .then(response => {
          console.log('Appointment deleted successfully:', response.data);
        })
        .catch(error => {
          console.error('Failed to delete appointment:', error);
        });
    }
  }, [success, maLichHen]);

  return (
    <View style={styles.container}>
      {success ? (
        <>
          <Text style={styles.successText}>Đặt khám thành công!</Text>
          <Text style={styles.infoText}>Mã đặt khám: {maLichHen}</Text>
          <Text style={styles.infoText}>Tên dịch vụ: {dichVu.tenDichVu}</Text>
          <Text style={styles.infoText}>Phương thức thanh toán: {paymentMethod}</Text>
          <Text style={styles.infoText}>Tổng thanh toán: {totalPrice.toLocaleString('vi-VN')} đ</Text>
          <Text style={styles.infoText}>Thời gian thanh toán: {paymentTime}</Text>
          <Text style={styles.infoText}>Mã đơn hàng: {orderId}</Text>
          <Text style={styles.infoText}>Mã giao dịch: {transactionId}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Trang chủ')} style={styles.button}>
            <Text style={styles.buttonText}>Trang chủ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ChiTietLichHen', { maLichHen })} style={styles.button}>
            <Text style={styles.buttonText}>Xem lịch hẹn</Text>
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

export default KetQuaThanhToan;
