import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5199';

const DanhSachLichHenDaKham = () => {
  const [lichHens, setLichHens] = useState([]);
  const [dichVuData, setDichVuData] = useState({});
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchLichHens();
    }, [])
  );

  useEffect(() => {
    if (lichHens.length > 0) {
      lichHens.forEach(async (lichHen) => {
        if (!dichVuData[lichHen.maDichVu]) {
          const dichVuDetails = await fetchDichVuDetails(lichHen.maDichVu);
          setDichVuData((prev) => ({ ...prev, [lichHen.maDichVu]: dichVuDetails }));
        }
      });
    }
  }, [lichHens]);

  const fetchLichHens = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/LichHen/get-all-lich-hen-khach-hang`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      const filteredLichHens = response.data.filter(item => item.trangThai === 'Đã khám');
      setLichHens(filteredLichHens);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const fetchDichVuDetails = async (maDichVu) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/DichVu/get-dich-vu-by-id?id=${maDichVu}`);
      return { tenDichVu: response.data.tenDichVu, hinhAnh: response.data.hinhAnh };
    } catch (error) {
      console.error('Failed to fetch service details:', error);
      return { tenDichVu: '', hinhAnh: '' };
    }
  };

  const renderLichHen = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('ChiTietKetQuaDichVu', { maLichHen: item.id })}
    >
      {dichVuData[item.maDichVu] && (
        <Image source={{ uri: `${BASE_URL}${dichVuData[item.maDichVu].hinhAnh}` }} style={styles.itemImage} />
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemText}>Mã lịch hẹn: {item.id}</Text>
        <Text style={styles.itemText}>Tên dịch vụ: {dichVuData[item.maDichVu]?.tenDichVu || 'Loading...'}</Text>
        <Text style={styles.itemText}>Ngày thực hiện: {new Date(item.thoiGianDuKien).toLocaleDateString('vi-VN')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {lichHens.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có lịch khám</Text>
        </View>
      ) : (
        <FlatList
          data={lichHens}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLichHen}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  list: {
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemInfo: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});

export default DanhSachLichHenDaKham;
