import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TextInput, Dimensions, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const BASE_URL = 'http://10.0.2.2:5199';
const { width: viewportWidth } = Dimensions.get('window');

const DanhSachLoaiThuocThietBiScreen = () => {
  const route = useRoute();
  const { categoryId, type } = route.params; // categoryId và loại sản phẩm 'thuoc' hoặc 'thietbi'
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [noResults, setNoResults] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchItems();
  }, [categoryId, type]);

  const fetchItems = async () => {
    try {
      const url = type === 'thuoc' 
        ? `${BASE_URL}/api/Thuoc/get-thuoc-by-id-loai-thuoc?id=${categoryId}` 
        : `${BASE_URL}/api/ThietBiYTe/get-all-thiet-bi-by-ma-loai?maLoaiThietBi=${categoryId}`;
      const response = await axios.get(url);
      setItems(response.data);
      setNoResults(response.data.length === 0);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const url = type === 'thuoc' 
        ? `${BASE_URL}/api/Thuoc/search-thuoc?searchKey=${search}` 
        : `${BASE_URL}/api/ThietBiYTe/search-thiet-bi-y-te?searchKey=${search}`;
      const response = await axios.get(url);
      setItems(response.data);
      setNoResults(response.data.length === 0);
    } catch (error) {
      console.error('Failed to search items:', error);
    }
  };

  const clearSearch = () => {
    setSearch('');
    fetchItems();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChiTietThuocThietBi', { itemId: item.id, type })}>
      <Image source={{ uri: `${BASE_URL}${item.hinhAnh}` }} style={styles.image} />
      <Text style={styles.text} numberOfLines={2} ellipsizeMode="tail">{item.tenThuoc || item.tenThietBiYTe}</Text>
      <Text style={styles.price}>{item.donGia.toLocaleString('vi-VN')} đ</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{type === 'thuoc' ? 'Danh Sách Thuốc' : 'Danh Sách Thiết Bị Y Tế'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('GioHang')} style={styles.cartButton}>
          <View style={styles.cartIconContainer}>
            <Icon name="cart-outline" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Tìm kiếm ${type === 'thuoc' ? 'thuốc' : 'thiết bị'}...`}
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
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.itemsContainer}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cartButton: {
    marginRight: 10,
  },
  cartIconContainer: {
    backgroundColor: '#FF6347',
    borderRadius: 50,
    padding: 5,
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
  itemsContainer: {
    justifyContent: 'space-between',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  item: {
    backgroundColor: '#fff',
    flex: 1,
    margin: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 200,
  },
  image: {
    width: 150,
    height: 100,
    borderRadius: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  price: {
    fontSize: 16,
    color: 'orange',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
  },
});

export default DanhSachLoaiThuocThietBiScreen;
