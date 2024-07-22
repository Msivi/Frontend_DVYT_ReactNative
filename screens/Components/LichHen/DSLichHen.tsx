import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const BASE_URL = 'http://10.0.2.2:5199';

const DanhSachLichHen = () => {
  const [lichHens, setLichHens] = useState([]);
  const [dichVuNames, setDichVuNames] = useState({});
  const [selectedTab, setSelectedTab] = useState('Chưa khám');
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchLichHens();
    }, [])
  );

  useEffect(() => {
    if (lichHens.length > 0) {
      lichHens.forEach(async (lichHen) => {
        if (!dichVuNames[lichHen.maDichVu]) {
          const dichVuName = await fetchDichVuName(lichHen.maDichVu);
          setDichVuNames((prev) => ({ ...prev, [lichHen.maDichVu]: dichVuName }));
        }
      });
    }
  }, [lichHens]);

  const fetchLichHens = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/LichHen/get-all-lich-hen-khach-hang`);
      const sortedData = response.data.sort((a, b) => new Date(b.thoiGianDuKien) - new Date(a.thoiGianDuKien)); // Sort appointments from newest to oldest
      setLichHens(sortedData);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const fetchDichVuName = async (maDichVu) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/DichVu/get-dich-vu-by-id?id=${maDichVu}`);
      return response.data.tenDichVu;
    } catch (error) {
      console.error('Failed to fetch service name:', error);
      return '';
    }
  };

  const filterLichHens = (trangThai) => {
    return lichHens.filter(lichHen => lichHen.trangThai === trangThai);
  };

  const renderLichHen = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('ChiTietLichHen', { maLichHen: item.id })}
    >
      <Text style={styles.itemText}>Mã lịch hẹn: {item.id}</Text>
      <Text style={styles.itemText}>Tên dịch vụ: {dichVuNames[item.maDichVu] || 'Loading...'}</Text>
      <Text style={styles.itemText}>
        Trạng thái: <Text style={item.trangThai === 'Đã khám' ? styles.completed : item.trangThai === 'Chưa khám' ? styles.pending : styles.canceled}>{item.trangThai}</Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Chưa khám' && styles.selectedTabButton]}
          onPress={() => setSelectedTab('Chưa khám')}
        >
          <Text style={styles.tabButtonText}>Chưa khám</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Đã khám' && styles.selectedTabButton]}
          onPress={() => setSelectedTab('Đã khám')}
        >
          <Text style={styles.tabButtonText}>Đã khám</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Đã hủy' && styles.selectedTabButton]}
          onPress={() => setSelectedTab('Đã hủy')}
        >
          <Text style={styles.tabButtonText}>Đã hủy</Text>
        </TouchableOpacity>
      </View>
      {filterLichHens(selectedTab).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có lịch khám</Text>
        </View>
      ) : (
        <FlatList
          data={filterLichHens(selectedTab)}
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  selectedTabButton: {
    backgroundColor: '#FFA500',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    flexGrow: 1,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
  },
  completed: {
    color: 'green',
  },
  pending: {
    color: '#3366CC',
  },
  canceled: {
    color: 'red',
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

export default DanhSachLichHen;
