import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5199';

const ThemDiaChiMua = () => {
  const navigation = useNavigation();
  const [fullAddress, setFullAddress] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const textInputRef = useRef(null);

  useEffect(() => {
    axios.get('https://esgoo.net/api-tinhthanh/1/0.htm')
      .then(response => {
        setCities(response.data.data);
      })
      .catch(error => {
        console.error('Failed to fetch cities:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedCity) {
      axios.get(`https://esgoo.net/api-tinhthanh/2/${selectedCity}.htm`)
        .then(response => {
          setDistricts(response.data.data);
          setWards([]);
        })
        .catch(error => {
          console.error('Failed to fetch districts:', error);
        });
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedDistrict) {
      axios.get(`https://esgoo.net/api-tinhthanh/3/${selectedDistrict}.htm`)
        .then(response => {
          setWards(response.data.data);
        })
        .catch(error => {
          console.error('Failed to fetch wards:', error);
        });
    }
  }, [selectedDistrict]);

  const handleConfirmAddress = async () => {
    const city = cities.find(city => city.id === selectedCity)?.full_name || '';
    const district = districts.find(district => district.id === selectedDistrict)?.full_name || '';
    const ward = wards.find(ward => ward.id === selectedWard)?.full_name || '';
    const completeAddress = `${fullAddress}, ${ward}, ${district}, ${city}`;

    try {
      const token = await AsyncStorage.getItem('data');
      await axios.post(`${BASE_URL}/api/DiaChi/create-dia-chi`, {
        tenDiaChi: completeAddress,
      }, {
        headers: {
          Authorization: `${token}`,
        },
      });
      Alert.alert('Thành công', 'Thêm địa chỉ thành công');
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      console.error('Không thể thêm địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể thêm địa chỉ');
    }
  };

  const isFormValid = fullAddress.trim() !== '' && selectedCity && selectedDistrict && selectedWard;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='always'>
      <Text style={styles.sectionTitle}>Thêm Địa Chỉ Mới</Text>

      <View style={styles.mapContainer}>
        <Picker
          selectedValue={selectedCity}
          onValueChange={(itemValue) => setSelectedCity(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Chọn Tỉnh Thành" value="" />
          {cities.map(city => (
            <Picker.Item key={city.id} label={city.full_name} value={city.id} />
          ))}
        </Picker>

        <Picker
          selectedValue={selectedDistrict}
          onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
          style={styles.picker}
          enabled={!!selectedCity}
        >
          <Picker.Item label="Chọn Quận Huyện" value="" />
          {districts.map(district => (
            <Picker.Item key={district.id} label={district.full_name} value={district.id} />
          ))}
        </Picker>

        <Picker
          selectedValue={selectedWard}
          onValueChange={(itemValue) => setSelectedWard(itemValue)}
          style={styles.picker}
          enabled={!!selectedDistrict}
        >
          <Picker.Item label="Chọn Phường Xã" value="" />
          {wards.map(ward => (
            <Picker.Item key={ward.id} label={ward.full_name} value={ward.id} />
          ))}
        </Picker>

        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholder="Nhập số nhà và tên đường"
          value={fullAddress}
          onChangeText={(text) => setFullAddress(text)}
          onFocus={() => textInputRef.current.focus()}
        />

        <TouchableOpacity
          onPress={handleConfirmAddress}
          style={[styles.confirmButton, !isFormValid && styles.disabledButton]}
          disabled={!isFormValid}
        >
          <Text style={styles.confirmButtonText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
    flexGrow: 1
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  mapContainer: {
    marginBottom: 20
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10
  },
  textInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  },
  confirmButton: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  }
});

export default ThemDiaChiMua;
