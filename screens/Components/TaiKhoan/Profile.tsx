import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5199';

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState('');
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
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (response.status !== 200) throw new Error('Failed to fetch user data');

      const userData = response.data;
      setAvatar(userData.avatar ? `${BASE_URL}${userData.avatar}` : null);
      setName(userData.tenKhachHang);
    } catch (error) {
      Alert.alert('Thông báo', 'Hết hạn đăng nhập, vui lòng đăng nhập lại');
      handleLogout();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [refresh])
  );
  useEffect(() => {
    fetchUserData();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{name.charAt(0)}</Text>
            )}
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.points}>0 điểm Life</Text>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode='tail'>{name}</Text>
            <TouchableOpacity style={styles.updateButton} onPress={() => navigation.navigate("Đổi Thông Tin")}>
              <Text style={styles.updateButtonText}>Cập nhật</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.membership}>
          <Text>Đăng ký thẻ thành viên ngay</Text>
          <Text>Để tích điểm và nhận nhiều ưu đãi hấp dẫn từ LifeCare!</Text>
        </View>
      </View>

      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>Dịch vụ của bạn</Text>
        <View style={styles.servicesContainer}>
          <TouchableOpacity style={styles.serviceItem} onPress={() => navigation.navigate('DanhSachLichHen')}>
            <Image source={require('../../../Image/LichHen.png')} style={styles.serviceIcon} />
            <Text style={styles.serviceText}>Lịch khám</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceItem } onPress={() => navigation.navigate('DanhSachHoaDonScreen')}>
            <Image source={require('../../../Image/DonHang.png')} style={styles.serviceIcon} />
            <Text style={styles.serviceText}>Đơn hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceItem} onPress={() => navigation.navigate('DanhSachKetQuaDichVu')}>
            <Image source={require('../../../Image/HoSoSK.jpg')} style={styles.serviceIcon} />
            <Text style={styles.serviceText}>Hồ sơ sức khỏe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceItem} onPress={() => navigation.navigate('DanhSachDanhGia')}>
            <Image source={require('../../../Image/DanhGia.png')} style={styles.serviceIcon} />
            <Text style={styles.serviceText}>Đánh giá</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Thiết lập ứng dụng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate("AccountSettings")}>
          <Text style={styles.settingText}>Tài khoản</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Chính sách và hỗ trợ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  profileSection: {
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
  },
  profileDetails: {
    marginLeft: 16,
    flex: 1,
  },
  points: {
    color: '#FFA500',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    maxWidth: '100%',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  updateButtonText: {
    color: '#fff',
  },
  membership: {
    backgroundColor: '#e0f7fa',
    padding: 16,
    borderRadius: 4,
    marginTop: 16,
  },
  servicesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  serviceText: {
    textAlign: 'center',
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    fontSize: 16,
  },
});

export default UserProfileScreen;
