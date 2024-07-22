import React, { useState, useEffect, useCallback } from "react";
import { View, Text } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTab from "./screens/navigation/BottomTab";
import LoginScreen from "./screens/Components/LoginScreen";
import RegisterUser from "./screens/Components/RegisterUser";
import TaiKhoan from "./screens/Components/TaiKhoan/TaiKhoan";
import DoiThongTin from "./screens/Components/TaiKhoan/DoiThongTin";
import AccountSettingsScreen from "./screens/Components/TaiKhoan/AccountSettingsScreen";
import DichVu from "./screens/Components/DichVu/DSDichVu";
import ChiTietDichVu from "./screens/Components/DichVu/ChiTietDichVu";
import TrangTimKiem from "./screens/Components/TimKiem/TrangTimKiem";
import BacSi from "./screens/Components/BacSi/BacSi";
import ChiTietBacSi from "./screens/Components/BacSi/ChiTietBacSi";
import ThanhToan from "./screens/Components/DichVu/ThanhToan";
import DanhSachLichHen from "./screens/Components/LichHen/DSLichHen";
import ChiTietLichHen from "./screens/Components/LichHen/ChiTietLichHen";
import KetQuaThanhToan from "./screens/Components/DichVu/KetQuaThanhToan";
import DanhSachDanhGia from "./screens/Components/TaiKhoan/DanhSachDanhGia";
import DanhGiaDichVu from "./screens/Components/TaiKhoan/DanhGiaDichVu";
import XemDanhGia from "./screens/Components/DichVu/XemDanhGia";
import DSThuocThietBi from "./screens/Components/ThuocThietBi/DSThuocThietBi";
import ChiTietThuocThietBi from "./screens/Components/ThuocThietBi/ChiTietThuocThietBi";
import GioHang from "./screens/Components/ThuocThietBi/GioHang";
import KetQuaThanhToanHoaDon from "./screens/Components/ThuocThietBi/KetQuaThanhToanHoaDon";
import DanhSachLoaiThuocThietBi from "./screens/Components/ThuocThietBi/DSThuocThietBiTheoLoai";
import AddressListScreen from "./screens/Components/TaiKhoan/DSDiaChi";
import AddNewAddressScreen from "./screens/Components/TaiKhoan/ThemDiaChi";
import EditAddressScreen from "./screens/Components/TaiKhoan/SuaDiaChi";
import ChonDiaChiScreen from "./screens/Components/DichVu/ChonDiaChi";
import CheckoutScreen from "./screens/Components/ThuocThietBi/ThanhToanThuocTB";
import ThemDiaChiMua from "./screens/Components/ThuocThietBi/ThemDiaChiMua";
import DanhSachHoaDonScreen from "./screens/Components/TaiKhoan/DSHoaDonMua";
import ChiTietHoaDonScreen from "./screens/Components/TaiKhoan/ChiTietDonMua";
import DanhSachKetQuaDichVu from "./screens/Components/TaiKhoan/DanhSachKetQuaLH";
import ChiTietKetQuaDichVuScreen from "./screens/Components/TaiKhoan/ChiTietKetQuaDV";
import DichVuChuyenKhoaScreen from "./screens/Components/DichVu/DichVuChuyenKhoa";
import DanhSachChuyenKhoa from "./screens/Components/DichVu/DanhSachChuyenKhoa";
const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = React.useRef(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      if (token) {
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Hết hạn đăng nhập');
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    await AsyncStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    resetToHome();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('data');
    setIsLoggedIn(false);
    resetToHome();
  };

  const resetToHome = () => {
    navigationRef.current?.reset({
      index: 0,
      routes: [{ name: 'bottom-navigation' }],
    });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={isLoggedIn ? "bottom-navigation" : "Login"}>
        <Stack.Screen
          name="bottom-navigation"
          component={BottomTab}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          children={() => <LoginScreen onLoginSuccess={handleLogin} />}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterUser}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Tài Khoản"
          component={TaiKhoan}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Đổi Thông Tin"
          component={DoiThongTin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DichVu"
          component={DichVu}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChiTietDichVu"
          component={ChiTietDichVu}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BacSi"
          component={BacSi}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChiTietBacSi"
          component={ChiTietBacSi}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ThanhToan"
          component={ThanhToan}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DanhSachLichHen"
          component={DanhSachLichHen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChiTietLichHen"
          component={ChiTietLichHen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="KetQuaThanhToan"
          component={KetQuaThanhToan}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DanhSachDanhGia"
          component={DanhSachDanhGia}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DanhGiaDichVu"
          component={DanhGiaDichVu}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="XemDanhGia"
          component={XemDanhGia}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DSThuocThietBi"
          component={DSThuocThietBi}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChiTietThuocThietBi"
          component={ChiTietThuocThietBi}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GioHang"
          component={GioHang}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="KetQuaThanhToanHoaDon"
          component={KetQuaThanhToanHoaDon}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DanhSachLoaiThuocThietBi"
          component={DanhSachLoaiThuocThietBi}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DiaChi"
          component={AddressListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ThemDiaChi"
          component={AddNewAddressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditAddress"
          component={EditAddressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddAddress"
          component={ChonDiaChiScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CheckoutScreen"
          component={CheckoutScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ThemDiaChiMua"
          component={ThemDiaChiMua}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DanhSachHoaDonScreen"
          component={DanhSachHoaDonScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChiTietHoaDonScreen"
          component={ChiTietHoaDonScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DanhSachKetQuaDichVu"
          component={DanhSachKetQuaDichVu}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChiTietKetQuaDichVu"
          component={ChiTietKetQuaDichVuScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DichVuChuyenKhoa"
          component={DichVuChuyenKhoaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DanhSachChuyenKhoa"
          component={DanhSachChuyenKhoa}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
