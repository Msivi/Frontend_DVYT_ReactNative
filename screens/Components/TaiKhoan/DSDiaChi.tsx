import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the vector icons

const BASE_URL = 'http://10.0.2.2:5199';

const AddressListScreen = () => {
  const [addresses, setAddresses] = useState([]);
  const navigation = useNavigation();

  const fetchAddresses = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/DiaChi/get-all-dia-chi`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setAddresses(response.data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      Alert.alert('Error', 'Failed to fetch addresses');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const renderAddressItem = ({ item }) => {
    const isHCM = item.tenDiaChi.includes('Thành phố Hồ Chí Minh');
    
    return (
      <TouchableOpacity onPress={() => navigation.navigate('EditAddress', { address: item })}>
        <View style={styles.addressItem}>
          <Text style={styles.addressName}>{item.tenDiaChi}</Text>
          <View style={styles.addressButtons}>
            {item.macDinh && <Text style={styles.defaultButton}>Mặc định</Text>}
            <Text style={styles.deliveryButton}>Địa chỉ lấy hàng</Text>
            {isHCM && <Text style={styles.examAddressButton}>Địa chỉ khám</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const showInfoAlert = () => {
    Alert.alert('Thông tin', 'Địa chỉ khám chỉ khả dụng khi ở Thành phố Hồ Chí Minh');
  };

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Địa chỉ của Tôi</Text>
        <TouchableOpacity onPress={showInfoAlert}>
          <View style={styles.infoIconContainer}>
            <Icon name="info-circle" size={24} color="#43BDB1" />
          </View>
        </TouchableOpacity>
      </View>
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAddressItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có địa chỉ</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ThemDiaChi')}>
        <Text style={styles.addButtonText}>+ Thêm Địa Chỉ Mới</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#43BDB1',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  headerText: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  infoIconContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 3,
  },
  addressItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginVertical: 5,
  },
  addressName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addressButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  defaultButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#FF5733',
    color: '#fff',
    marginRight: 10,
  },
  deliveryButton: {
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#333',
    marginRight: 10,
  },
  examAddressButton: {
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#43BDB1',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});

export default AddressListScreen;
