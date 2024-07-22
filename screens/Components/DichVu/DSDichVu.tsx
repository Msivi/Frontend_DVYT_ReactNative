import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TextInput, Dimensions, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const BASE_URL = 'http://10.0.2.2:5199';
const { width: viewportWidth } = Dimensions.get('window');

type DichVuType = {
  id: number;
  tenDichVu: string;
  hinhAnh: string;
  gia: number;
  maLoaiDichVu: number;
};

const DichVu = () => {
  const route = useRoute();
  const { serviceType } = route.params;
  const [dichVu, setDichVu] = useState<DichVuType[]>([]);
  const [search, setSearch] = useState('');
  const [noResults, setNoResults] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchDichVu();
  }, []);

  const fetchDichVu = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/DichVu/get-all-dich-vu`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const filteredServices = response.data.filter(service => service.maLoaiDichVu === serviceType);
      setDichVu(filteredServices);
      setNoResults(filteredServices.length === 0);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/DichVu/search-dich-vu?searchKey=${search}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const filteredServices = response.data.filter(service => service.maLoaiDichVu === serviceType);
      setDichVu(filteredServices);
      setNoResults(filteredServices.length === 0);
    } catch (error) {
      console.error('Failed to search services:', error);
    }
  };

  const clearSearch = () => {
    setSearch('');
    fetchDichVu();
  };

  const renderService = ({ item }: { item: DichVuType }) => (
    <TouchableOpacity 
      style={styles.serviceItem} 
      onPress={() => navigation.navigate('ChiTietDichVu', { dichVuId: item.id, loaiDichVu: item.maLoaiDichVu })}
    >
      <Image source={{ uri: `${BASE_URL}${item.hinhAnh}` }} style={styles.serviceImage} />
      <Text style={styles.serviceText} numberOfLines={2} ellipsizeMode="tail">{item.tenDichVu}</Text>
      <Text style={styles.servicePrice}>{item.gia.toLocaleString('vi-VN')} đ</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm dịch vụ..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Icon name="close-circle" size={24} color="#000" />
          </TouchableOpacity>
        )}
      </View>
      {noResults ? (
        <Text style={styles.noResultsText}>Không tìm thấy kết quả nào</Text>
      ) : (
        <FlatList
          data={dichVu}
          renderItem={renderService}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.servicesContainer}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  clearButton: {
    marginLeft: 10,
  },
  servicesContainer: {
    justifyContent: 'space-between',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  serviceItem: {
    backgroundColor: '#fff',
    flex: 1,
    margin: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 200,
  },
  serviceImage: {
    width: 150,
    height: 100,
    borderRadius: 10,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  servicePrice: {
    fontSize: 16,
    color: 'orange',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
  },
});

export default DichVu;
