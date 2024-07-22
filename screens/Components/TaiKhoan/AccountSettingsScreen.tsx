import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AccountSettingsScreen = () => {
  const navigation = useNavigation();
  const [isIVIRSEConnected, setIsIVIRSEConnected] = React.useState(false);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('data');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const handleToggleIVIRSE = () => {
    setIsIVIRSEConnected(previousState => !previousState);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Tài khoản</Text>
      </View>
      <TouchableOpacity style={styles.item} >
        <Icon name="account-multiple" size={24} color="#43BDB1" />
        <Text style={styles.itemText}>Liên kết tài khoản</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Tài Khoản')}>
        <Icon name="lock-reset" size={24} color="#43BDB1" />
        <Text style={styles.itemText}>Đổi mật khẩu</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('DiaChi')}>
        <Icon name="map-marker" size={24} color="#43BDB1" />
        <Text style={styles.itemText}>Địa Chỉ</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} >
        <Icon name="account-remove" size={24} color="#43BDB1" />
        <Text style={styles.itemText}>Xóa tài khoản</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={handleLogout}>
        <Icon name="logout" size={24} color="#43BDB1" />
        <Text style={styles.itemText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#43BDB1',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  itemText: {
    fontSize: 18,
    marginLeft: 10,
    flex: 1,
    color: '#333',
  },
});

export default AccountSettingsScreen;
