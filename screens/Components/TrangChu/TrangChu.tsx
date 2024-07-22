import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation , useFocusEffect} from '@react-navigation/native';

const BASE_URL = 'http://10.0.2.2:5199';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const HomeScreen = () => {
  const [refresh, setRefresh] = useState(false);


  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('data');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${BASE_URL}/api/KhachHang/get-tt-khach-hang/`, {
        
      });

      if (response.status !== 200) throw new Error('Failed to fetch user data');

      const userData = response.data;
      
    } catch (error) {
      Alert.alert('Thông báo', 'Hết hạn đăng nhập, vui lòng đăng nhập lại');
      handleLogout();
    }
  };


  const [images, setImages] = useState([
    require('../../../Image/HinhSilde1.webp'),
    require('../../../Image/HinhSilde2.webp'),
    require('../../../Image/HinhSilde3.webp'),
    require('../../../Image/HinhSilde4.webp'),
  ]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [chuyenKhoas, setChuyenKhoas] = useState([]);

  const services = [
    { id: 1, tenLoai: 'Khám tại nhà', icon: require('../../../Image/IconKhamTaiNha.webp') },
    { id: 2, tenLoai: 'Khám online', icon: require('../../../Image/IconKhamOnl.webp') },
  ];

  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [refresh])
  );
  useEffect(() => {
    fetchFeaturedDoctors();
    fetchChuyenKhoas();
  }, []);

  const fetchFeaturedDoctors = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/BacSi/get-all-bac-si`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Lấy ngẫu nhiên 3 bác sĩ
      const randomDoctors = response.data.sort(() => 0.5 - Math.random()).slice(0, 3);
      setFeaturedDoctors(randomDoctors);
    } catch (error) {
      console.error('Failed to fetch featured doctors:', error);
    }
  };

  const fetchChuyenKhoas = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/ChuyenKhoa/get-all-chuyen-khoa`);
      // Lấy 3 chuyên khoa đầu tiên thay vì sắp xếp ngẫu nhiên
      const firstThreeChuyenKhoas = response.data.slice(0, 3);
      setChuyenKhoas(firstThreeChuyenKhoas);
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
    }
  };
  

  const renderService = ({ item }) => (
    <TouchableOpacity style={styles.serviceItem} onPress={() => navigation.navigate('DichVu', { serviceType: item.id })}>
      <Image source={item.icon} style={styles.serviceIcon} />
      <Text style={styles.serviceText}>{item.tenLoai}</Text>
    </TouchableOpacity>
  );

  const renderDoctor = ({ item }) => (
    <TouchableOpacity style={styles.doctorItem} onPress={() => navigation.navigate('ChiTietBacSi', { bacSiId: item.id })}>
      <Image source={{ uri: `${BASE_URL}${item.hinhAnh}` }} style={styles.doctorImage} />
      <Text style={styles.doctorName}>{item.tenBacSi}</Text>
    </TouchableOpacity>
  );

  const renderChuyenKhoa = ({ item, index }) => {
    const images = [
      require('../../../Image/KhoaKhamBenh.webp'),
      require('../../../Image/KhoaNoiTiet.webp'),
      require('../../../Image/KhoaNhi.webp')
    ];

    return (
      <TouchableOpacity style={styles.chuyenKhoaItem} onPress={() => navigation.navigate('DichVuChuyenKhoa', { chuyenKhoaId: item.id })}>
        <Image source={images[index]} style={styles.chuyenKhoaImage} />
        <Text style={styles.chuyenKhoaName}>{item.tenChuyenKhoa}</Text>
      </TouchableOpacity>
    );
  };

  const renderSwiperImages = () => (
    images.map((image, index) => (
      <Image key={index} source={image} style={styles.carouselImage} />
    ))
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#43BDB1', '#43BDB1']} style={styles.header}>
        <Image source={require('../../../Image/LogoApp.png')} style={styles.logo} />
        <Text style={styles.title}>
          <Text style={styles.titleLife}>LIFE</Text>
          <Text style={styles.titleCare}>CARE</Text>
        </Text>
      </LinearGradient>
      <Swiper
        height={viewportHeight * 0.15} // Adjust the height as needed
        autoplay
        loop
        showsPagination={true}
        dotStyle={styles.dotStyle}
        activeDotStyle={styles.activeDotStyle}
        paginationStyle={styles.paginationStyle} // Add this line
      >
        {renderSwiperImages()}
      </Swiper>
      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>Loại Dịch Vụ</Text>
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.servicesContainer}
        />
      </View>
      <View style={styles.chuyenKhoaSection}>
        <View style={styles.chuyenKhoaHeader}>
          <Text style={styles.sectionTitle}>Chuyên khoa</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DanhSachChuyenKhoa')}>
            <Text style={styles.viewMore}>Xem thêm</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={chuyenKhoas}
          renderItem={renderChuyenKhoa}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={styles.featuredDoctorsSection} >
        <View style={styles.featuredDoctorsHeader}>
          <Text style={styles.sectionTitle}>Bác sĩ nổi bật</Text>
          <TouchableOpacity onPress={() => navigation.navigate('BacSi')}>
            <Text style={styles.viewMore}>Xem thêm</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={featuredDoctors}
          renderItem={renderDoctor}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  titleLife: {
    color: '#0B3D91',
  },
  titleCare: {
    color: '#D2691E',
  },
  carouselImage: {
    width: viewportWidth,
    height: viewportHeight * 0.25, // Adjust the height as needed
  },
  dotStyle: {
    backgroundColor: '#FFFFFF',
  },
  activeDotStyle: {
    backgroundColor: '#000000',
  },
  paginationStyle: {
    position: 'absolute',
    bottom: 10, // Adjust the value to move the dots up or down
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
   
  },
  servicesSection: {
    flex: 1,
    marginLeft: 20,
    marginTop: 10,
    height:0
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  servicesContainer: {
    justifyContent: 'space-between',
  },
  serviceItem: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  serviceText: {
    fontSize: 16,
  },
  chuyenKhoaSection: {
    marginTop: 0,
    paddingHorizontal: 10,
  },
  chuyenKhoaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chuyenKhoaItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  chuyenKhoaImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  chuyenKhoaName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  featuredDoctorsSection: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  featuredDoctorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewMore: {
    color: '#007bff',
  },
  doctorItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  doctorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;
