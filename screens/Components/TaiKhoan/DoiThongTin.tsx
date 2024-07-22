import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Image, TouchableOpacity, Button, Platform } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, ImageLibraryOptions, ImagePickerResponse } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

const BASE_URL = 'http://10.0.2.2:5199';

const UpdateInfoScreen = () => {
  const navigation = useNavigation();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cmnd, setCmnd] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      console.log('Token:', token);
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${BASE_URL}/api/KhachHang/get-tt-khach-hang/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });
      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.status !== 200) {
        throw new Error('Failed to fetch user data');
      }

      const userData = response.data;
      setAvatar(userData.avatar ? `${BASE_URL}${userData.avatar}` : null);
      setName(userData.tenKhachHang);
      setPhone(userData.sdt);
      setCmnd(userData.cmnd);
      setEmail(userData.email);
      setPassword(userData.matKhau);
      setGender(userData.gioiTinh);
      setBirthDate(new Date(userData.ngaySinh));
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      Alert.alert('Error', 'Failed to fetch user data');
    }
  };

  const handleImagePicker = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setAvatar(response.assets[0].uri || null);
      }
    });
  };

  const handleUploadAvatar = async (avatarUri: string) => {
    const token = await AsyncStorage.getItem('data');
    const fileType = avatarUri.split('.').pop(); // Extract file type from URI
    const formData = new FormData();
    formData.append('avatarFile', {
      uri: avatarUri,
      type: `image/${fileType}`, // Set file type dynamically
      name: `avatar.${fileType}` // Set file name with extension
    });

    try {
      const response = await axios.post(`${BASE_URL}/api/KhachHang/UploadAvatar/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error('Failed to upload avatar');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar');
      throw error;
    }
  };

  const handleUpdate = async () => {
    try {
      if (avatar) {
        await handleUploadAvatar(avatar);
      }
      const token = await AsyncStorage.getItem('data');
      const response = await axios.put(`${BASE_URL}/api/KhachHang/update-khach-hang`, {
        tenKhachHang: name,
        email: email,
        sdt: phone,
        cmnd: cmnd,
        matKhau: password,
        gioiTinh: gender,
        ngaySinh: birthDate.toISOString()
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error('Failed to update information');
      }

      Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
      navigation.navigate("Tôi");
    } catch (error) {
      console.error('Failed to update information:', error);
      Alert.alert('Error', 'Failed to update information');
    }
  };

  const onChangeDate = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthDate(currentDate);
  };

  const genderOptions = [
    {label: 'Nam', value: 'Nam' },
    {label: 'Nữ', value: 'Nữ' }
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleImagePicker}>
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>Chọn ảnh</Text>
            </View>
          )}
          <View style={styles.iconContainer}>
            <Image
              source={require('../../../Image/Pencil.png')}
              style={styles.icon}
            />
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Số Căn cước/ CMND</Text>
        <TextInput
          style={styles.input}
          value={cmnd}
          onChangeText={setCmnd}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          editable={false}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Giới tính</Text>
        <RadioForm
          radio_props={genderOptions}
          initial={gender === 'Nam' ? 0 : 1}
          formHorizontal={true}
          labelHorizontal={true}
          buttonColor={'#2196f3'}
          animation={true}
          onPress={(value: string) => {setGender(value)}}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ngày sinh</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{birthDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
      </View>
      <Button
        title="Hoàn thành"
        onPress={handleUpdate}
        color="#4CAF50"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd'
  },
  avatarPlaceholderText: {
    color: '#aaa'
  },
  iconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#000'
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff'
  },
  dateText: {
    height: 40,
    lineHeight: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    color: '#000'
  }
});

export default UpdateInfoScreen;
