import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-virtualized-view';
import Icon from 'react-native-vector-icons/Ionicons';

const BASE_URL = 'http://10.0.2.2:5199';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const ThuocThietBiScreen = () => {
  const [thuocCategories, setThuocCategories] = useState([]);
  const [thietBiCategories, setThietBiCategories] = useState([]);
  const [randomThuoc, setRandomThuoc] = useState([]);
  const [randomThietBi, setRandomThietBi] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
    fetchRandomItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const [thuocResponse, thietBiResponse] = await Promise.all([
        axios.get(`${BASE_URL}/api/LoaiThuoc/get-all-loai-thuoc`),
        axios.get(`${BASE_URL}/api/LoaiThietBi/get-all-loai-thiet-bi`)
      ]);

      const thuocCategories = thuocResponse.data.map((item, index) => ({
        ...item,
        icon: thuocIcons[index % thuocIcons.length],
        type: 'thuoc',
      }));

      const thietBiCategories = thietBiResponse.data.map((item, index) => ({
        ...item,
        icon: thietBiIcons[index % thietBiIcons.length],
        type: 'thietbi',
      }));

      setThuocCategories(thuocCategories);
      setThietBiCategories(thietBiCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchRandomItems = async () => {
    try {
      const [thuocResponse, thietBiResponse] = await Promise.all([
        axios.get(`${BASE_URL}/api/Thuoc/get-all-thuoc`),
        axios.get(`${BASE_URL}/api/ThietBiYTe/get-all-thiet-bi-y-te`)
      ]);

      const randomThuoc = thuocResponse.data.map(item => ({ ...item, type: 'thuoc' })).sort(() => 0.5 - Math.random()).slice(0, 4);
      const randomThietBi = thietBiResponse.data.map(item => ({ ...item, type: 'thietbi' })).sort(() => 0.5 - Math.random()).slice(0, 4);

      setRandomThuoc(randomThuoc);
      setRandomThietBi(randomThietBi);
    } catch (error) {
      console.error('Failed to fetch random items:', error);
    }
  };

  const thuocIcons = [
    require('../../../Image/LoaiGiamDau.webp'),
    require('../../../Image/LoaiKhangSinh.webp'),
    require('../../../Image/LoaiKhangViem.webp'),
    require('../../../Image/LoaiTieuDuong.webp'),
    require('../../../Image/LoaiHuyetAp.webp'),
    require('../../../Image/LoaiDaLieu.webp'),
    require('../../../Image/LoaiMat.webp'),
    require('../../../Image/LoaiVitamin.webp'),
    require('../../../Image/LoaiAnThan.webp'),
    require('../../../Image/LoaiDiUng.webp'),
  ];

  const thietBiIcons = [
    require('../../../Image/ThietBiHuyetAp.webp'),
    require('../../../Image/ThietBiDuongHuyet.webp'),
    require('../../../Image/ThietBiNhietDo.webp'),
    require('../../../Image/ThietBiOxy.webp'),
    require('../../../Image/ThietBiNhipTim.webp'),
    require('../../../Image/ThietBiSieuAm.webp'),
    require('../../../Image/ThietBiNoiSoi.webp'),
    require('../../../Image/ThietBiECG.webp'),
    require('../../../Image/ThietBiKhiDung.webp'),
    require('../../../Image/ThietBiOxyTrongMau.webp'),
  ];

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('DanhSachLoaiThuocThietBi', { categoryId: item.id, type: item.type })}>
      <Image source={item.icon} style={styles.categoryIcon} />
      <Text style={styles.categoryText}>{item.tenLoaiThuoc || item.tenLoaiThietBi}</Text>
    </TouchableOpacity>
  );

  const renderRandomItem = ({ item }) => (
    <TouchableOpacity style={styles.randomItem} onPress={() => navigation.navigate('ChiTietThuocThietBi', { itemId: item.id, type: item.type })}>
      <Image source={{ uri: `${BASE_URL}${item.hinhAnh}` }} style={styles.randomItemImage} />
      <Text style={styles.randomItemText} numberOfLines={2} ellipsizeMode='tail'>{item.tenThuoc || item.tenThietBiYTe}</Text>
      <Text style={styles.randomItemPrice}>{item.donGia.toLocaleString('vi-VN')} đ</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#43BDB1', '#43BDB1']} style={styles.header}>
        <Text style={styles.title}>Thuốc và Thiết Bị</Text>
        <TouchableOpacity onPress={() => navigation.navigate('GioHang')} style={styles.cartButton}>
          <View style={styles.cartIconContainer}>
            <Icon name="cart-outline" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thuốc</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DSThuocThietBi', { type: 'thuoc' })}>
              <Text style={styles.viewMore}>Xem thêm</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={randomThuoc}
            renderItem={renderRandomItem}
            keyExtractor={(item) => `${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thiết Bị Y Tế</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DSThuocThietBi', { type: 'thietbi' })}>
              <Text style={styles.viewMore}>Xem thêm</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={randomThietBi}
            renderItem={renderRandomItem}
            keyExtractor={(item) => `${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>   Loại Thuốc</Text>
          <FlatList
            data={thuocCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => `${item.id}`}
            numColumns={2}
            columnWrapperStyle={styles.categoriesContainer}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>   Thiết Bị Y Tế</Text>
          <FlatList
            data={thietBiCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => `${item.id}`}
            numColumns={2}
            columnWrapperStyle={styles.categoriesContainer}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cartButton: {
    marginRight: 10,
  },
  cartIconContainer: {
    backgroundColor: '#FF6347',
    borderRadius: 50,
    padding: 5,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewMore: {
    color: '#007bff',
  },
  categoriesContainer: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  categoryItem: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 16,
    textAlign: 'center',
  },
  randomItem: {
    marginRight: 10,
    alignItems: 'center',
    width: 120,
  },
  randomItemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  randomItemText: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 14,
  },
  randomItemPrice: {
    color: 'orange',
    marginTop: 5,
  },
});

export default ThuocThietBiScreen;
