import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';

const BASE_URL = 'http://10.0.2.2:5199';

const ChiTietLichHen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { maLichHen } = route.params;
  const [lichHen, setLichHen] = useState(null);
  const [ketQuaDichVu, setKetQuaDichVu] = useState(null);
  const [bacSi, setBacSi] = useState(null);
  const [dichVu, setDichVu] = useState(null);

  useEffect(() => {
    fetchLichHen();
  }, []);

  useEffect(() => {
    if (lichHen) {
      fetchKetQuaDichVu(lichHen.id);
      // if (lichHen.maBacSi) {
      //   fetchBacSi(lichHen.maBacSi);
      // }
      fetchDichVu(lichHen.maDichVu);
    }
  }, [lichHen]);

  const fetchLichHen = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/LichHen/get-all-lich-hen-khach-hang`);
      const foundLichHen = response.data.find((item) => item.id === maLichHen);
      setLichHen(foundLichHen);
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
    }
  };

  const fetchKetQuaDichVu = async (maLichHen) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/KetQuaDichVu/get-all-ket-qua-dich-vu`);
      const foundKetQua = response.data.find((item) => item.maLichHen === maLichHen);
      setKetQuaDichVu(foundKetQua);
    } catch (error) {
      console.error('Failed to fetch service result:', error);
    }
  };

  const fetchBacSi = async (maBacSi) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/BacSi/get-bac-si-by-id?id=${maBacSi}`);
      setBacSi(response.data);
    } catch (error) {
      console.error('Failed to fetch doctor info:', error);
    }
  };

  const fetchDichVu = async (maDichVu) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/DichVu/get-dich-vu-by-id?id=${maDichVu}`);
      setDichVu(response.data);
    } catch (error) {
      console.error('Failed to fetch service info:', error);
    }
  };

  const cancelAppointment = async () => {
    try {
      await axios.put(`${BASE_URL}/api/LichHen/update-huy-lich-hen?id=${maLichHen}`);
      Alert.alert('Thông báo', 'Hủy lịch hẹn thành công');
      navigation.navigate('DanhSachLichHen');
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      Alert.alert('Thông báo', 'Hủy lịch hẹn thất bại');
    }
  };

  const confirmCancel = () => {
    Alert.alert(
      'Xác nhận hủy lịch hẹn',
      'Bạn chắc chắn muốn hủy lịch hẹn này? Tiền thanh toán sẽ không được hoàn lại.',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Có', onPress: cancelAppointment },
      ],
      { cancelable: false }
    );
  };

  if (!lichHen) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chi tiết kết quả dịch vụ</Text>
      <View style={styles.detailContainer}>
        <Text style={styles.detailText}>Mã lịch hẹn: {lichHen.id}</Text>
        <Text style={styles.detailText}>Tên dịch vụ: {dichVu ? dichVu.tenDichVu : 'Loading...'}</Text>
        {/* <Text style={styles.detailText}>Tên bác sĩ: {bacSi ? bacSi.tenBacSi : 'Chưa phân công'}</Text> */}
      
        <Text style={styles.detailText}>Ngày khám: {new Date(lichHen.thoiGianDuKien).toLocaleString()}</Text>

        <Text style={styles.detailText}>Kết quả dịch vụ: {ketQuaDichVu ? ketQuaDichVu.moTa : 'Chưa có'}</Text>
      </View>
      {lichHen.trangThai === 'Chưa khám' && (
        <TouchableOpacity style={styles.cancelButton} onPress={confirmCancel}>
          <Text style={styles.cancelButtonText}>Hủy lịch hẹn</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChiTietLichHen;
