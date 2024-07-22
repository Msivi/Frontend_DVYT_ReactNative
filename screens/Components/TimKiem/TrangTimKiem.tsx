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
};

type ChuyenKhoaType = {
  id: number;
  tenChuyenKhoa: string;
};

type BacSiType = {
  id: number;
  tenBacSi: string;
  hinhAnh: string;
};

const TimKiem = () => {
  const [dichVu, setDichVu] = useState<DichVuType[]>([]);
  const [bacSi, setBacSi] = useState<BacSiType[]>([]);
  const [search, setSearch] = useState('');
  const [chuyenKhoaList, setChuyenKhoaList] = useState<ChuyenKhoaType[]>([]);
  const [selectedLoaiDichVu, setSelectedLoaiDichVu] = useState<number | null>(null);
  const [selectedChuyenKhoa, setSelectedChuyenKhoa] = useState<number | null>(null);
  const [filteredDichVu, setFilteredDichVu] = useState<DichVuType[]>([]);
  const [filteredBacSi, setFilteredBacSi] = useState<BacSiType[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterType, setFilterType] = useState('dichVu');
  const navigation = useNavigation();

  useEffect(() => {
    fetchDichVu();
    fetchChuyenKhoa();
    fetchBacSi();
  }, []);

  const fetchDichVu = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/DichVu/get-all-dich-vu`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDichVu(response.data);
      setFilteredDichVu(response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchChuyenKhoa = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/ChuyenKhoa/get-all-chuyen-khoa`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setChuyenKhoaList(response.data);
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
    }
  };

  const fetchBacSi = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/BacSi/get-all-bac-si`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBacSi(response.data);
      setFilteredBacSi(response.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const searchLower = search.toLowerCase(); // Chuyển đổi giá trị tìm kiếm thành chữ thường
      if (filterType === 'dichVu') {
        let filteredServices = [...dichVu];
        if (selectedLoaiDichVu !== null && selectedChuyenKhoa !== null) {
          const url = `${BASE_URL}/api/DichVu/get-all-dich-vu-theo-loai-theo-chuyen-khoa?loaiDichVuId=${selectedLoaiDichVu}&chuyenKhoaId=${selectedChuyenKhoa}`;
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          filteredServices = response.data;
        } else if (selectedLoaiDichVu !== null) {
          filteredServices = dichVu.filter(service => service.maLoaiDichVu === selectedLoaiDichVu);
        }
        filteredServices = filteredServices.filter(service => service.tenDichVu.toLowerCase().includes(searchLower)); // So sánh không phân biệt chữ hoa và chữ thường
        setFilteredDichVu(filteredServices);
        setNoResults(filteredServices.length === 0);
      } else if (filterType === 'bacSi') {
        let filteredDoctors = [...bacSi];
        if (selectedChuyenKhoa !== null) {
          const url = `${BASE_URL}/api/BacSi/get-all-bac-si-by-chuyen-khoa?chuyenKhoa=${chuyenKhoaList.find(khoa => khoa.id === selectedChuyenKhoa)?.tenChuyenKhoa}`;
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          filteredDoctors = response.data;
        } else {
          const url = `${BASE_URL}/api/BacSi/search-bac-si?searchKey=${searchLower}`;
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          filteredDoctors = response.data;
        }
        filteredDoctors = filteredDoctors.filter(doctor => doctor.tenBacSi.toLowerCase().includes(searchLower)); // So sánh không phân biệt chữ hoa và chữ thường
        setFilteredBacSi(filteredDoctors);
        setNoResults(filteredDoctors.length === 0);
      }
    } catch (error) {
      console.error('Failed to search:', error);
    }
  };
  

  const clearSearch = () => {
    setSearch('');
    if (filterType === 'dichVu') {
      setFilteredDichVu(dichVu);
    } else if (filterType === 'bacSi') {
      setFilteredBacSi(bacSi);
    }
    setNoResults(false);
  };

  const toggleLoaiDichVu = (id: number) => {
    setSelectedLoaiDichVu(selectedLoaiDichVu === id ? null : id);
  };

  const toggleChuyenKhoa = (id: number) => {
    setSelectedChuyenKhoa(selectedChuyenKhoa === id ? null : id);
  };

  const renderService = ({ item }: { item: DichVuType }) => (
    <TouchableOpacity style={styles.serviceItem} onPress={() => navigation.navigate('ChiTietDichVu', { dichVuId: item.id })}>
      <Image source={{ uri: `${BASE_URL}${item.hinhAnh}` }} style={styles.serviceImage} />
      <Text style={styles.serviceText} numberOfLines={2} ellipsizeMode="tail">{item.tenDichVu}</Text>
      <Text style={styles.servicePrice}>{item.gia.toLocaleString('vi-VN')} đ</Text>
    </TouchableOpacity>
  );

  const renderDoctor = ({ item }: { item: BacSiType }) => (
    <TouchableOpacity style={styles.serviceItem}>
      <Image source={{ uri: `${BASE_URL}${item.hinhAnh}` }} style={styles.serviceImage} />
      <Text style={styles.serviceText} numberOfLines={2} ellipsizeMode="tail">{item.tenBacSi}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Icon name="close-circle" size={24} color="#000" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setIsFilterVisible(!isFilterVisible)} style={styles.filterButton}>
          <Icon name="filter" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      {isFilterVisible && (
        <View style={styles.filterContainer}>
          <View style={styles.filterTypeContainer}>
            <TouchableOpacity style={[styles.filterTypeButton, filterType === 'dichVu' && styles.selectedFilterTypeButton]} onPress={() => setFilterType('dichVu')}>
              <Text style={styles.filterTypeText}>Dịch vụ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterTypeButton, filterType === 'bacSi' && styles.selectedFilterTypeButton]} onPress={() => setFilterType('bacSi')}>
              <Text style={styles.filterTypeText}>Bác sĩ</Text>
            </TouchableOpacity>
            
          </View>
          {filterType === 'dichVu' && (
            <View style={styles.dichVuFilterContainer}>
              <Text style={styles.filterLabel}>Loại dịch vụ</Text>
              <View style={styles.filterOptionsContainer}>
                <TouchableOpacity style={[styles.filterOptionButton, selectedLoaiDichVu === 1 && styles.selectedFilterOptionButton]} onPress={() => toggleLoaiDichVu(1)}>
                  <Text style={styles.filterOptionText}>Khám tại nhà</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterOptionButton, selectedLoaiDichVu === 2 && styles.selectedFilterOptionButton]} onPress={() => toggleLoaiDichVu(2)}>
                  <Text style={styles.filterOptionText}>Khám online</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.filterLabel}>Chuyên khoa</Text>
              <View style={styles.filterOptionsContainer}>
                {chuyenKhoaList.map(khoa => (
                  <TouchableOpacity key={khoa.id} style={[styles.filterOptionButton, selectedChuyenKhoa === khoa.id && styles.selectedFilterOptionButton]} onPress={() => toggleChuyenKhoa(khoa.id)}>
                    <Text style={styles.filterOptionText}>{khoa.tenChuyenKhoa}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {filterType === 'bacSi' && (
            <View style={styles.dichVuFilterContainer}>
              <Text style={styles.filterLabel}>Chuyên khoa</Text>
              <View style={styles.filterOptionsContainer}>
                {chuyenKhoaList.map(khoa => (
                  <TouchableOpacity key={khoa.id} style={[styles.filterOptionButton, selectedChuyenKhoa === khoa.id && styles.selectedFilterOptionButton]} onPress={() => toggleChuyenKhoa(khoa.id)}>
                    <Text style={styles.filterOptionText}>{khoa.tenChuyenKhoa}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {noResults ? (
        <Text style={styles.noResultsText}>Không tìm thấy kết quả nào</Text>
      ) : (
        <FlatList
          data={filterType === 'dichVu' ? filteredDichVu : filteredBacSi}
          renderItem={filterType === 'dichVu' ? renderService : renderDoctor}
          keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
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
  filterButton: {
    marginLeft: 10,
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  filterTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterTypeButton: {
    backgroundColor: '#ccc',
    flex: 1,
    padding: 7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 5,
  },
  selectedFilterTypeButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterTypeText: {
    color: '#fff',
  },
  dichVuFilterContainer: {
    marginBottom: 10,
  },
  filterLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOptionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  selectedFilterOptionButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterOptionText: {
    color: '#000',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#777',
    marginVertical: 20,
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
    resizeMode: "contain",
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
});

export default TimKiem;
