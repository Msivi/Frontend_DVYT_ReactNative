import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:5199';

const ListChuyenKhoaScreen = ({ navigation }) => {
  const [chuyenKhoas, setChuyenKhoas] = useState([]);

  useEffect(() => {
    fetchChuyenKhoas();
  }, []);

  const fetchChuyenKhoas = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/ChuyenKhoa/get-all-chuyen-khoa`);
      setChuyenKhoas(response.data);
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
    }
  };

  const chuyenKhoaImages = [
    require('../../../Image/KhoaKhamBenh.webp'),  // Placeholder images for each specialty
    require('../../../Image/KhoaNoiTiet.webp'),
    require('../../../Image/KhoaNhi.webp'),
    require('../../../Image/KhoaDaLieu.webp'),
    require('../../../Image/KhoaSan.webp'),
    require('../../../Image/KhoaMat.webp'),
    require('../../../Image/KhoaTaiMuiHong.webp'),
    require('../../../Image/KhoaDinhDuong.webp'),
    require('../../../Image/KhoaThanKinh.webp'),
  ];

  const renderChuyenKhoa = ({ item, index }) => (
    <TouchableOpacity style={styles.chuyenKhoaItem} onPress={() => navigation.navigate('DichVuChuyenKhoa', { chuyenKhoaId: item.id })}>
      <Image source={chuyenKhoaImages[index]} style={styles.chuyenKhoaImage} />
      <Text style={styles.chuyenKhoaName}>{item.tenChuyenKhoa}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách chuyên khoa</Text>
      <FlatList
        data={chuyenKhoas}
        renderItem={renderChuyenKhoa}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}  // Display two columns
        columnWrapperStyle={styles.chuyenKhoaRow}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  chuyenKhoaItem: {
    flex: 1,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  chuyenKhoaImage: {
    width: 150,
    height: 150,
  },
  chuyenKhoaName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  chuyenKhoaRow: {
    justifyContent: 'space-between',
  }
});

export default ListChuyenKhoaScreen;
