import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';

const BASE_URL = 'http://10.0.2.2:5199';

const WriteReview = () => {
  const [starRating, setStarRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { appointmentId } = route.params;

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        setSelectedImage(source);
      }
    });
  };

  const handleStarRating = (rating) => {
    setStarRating(rating);
  };

  const submitReview = async () => {
    if (starRating === 0) {
      Alert.alert('Error', 'Please select a star rating.');
      return;
    }

    try {
      const resultResponse = await axios.get(`${BASE_URL}/api/KetQuaDichVu/get-all-ket-qua-dich-vu`);
      const resultData = resultResponse.data.find(result => result.maLichHen === appointmentId);

      if (!resultData) {
        Alert.alert('Error', 'No result data found for this appointment.');
        return;
      }

      const formData = new FormData();
      formData.append('noiDungDanhGia', reviewContent);
      formData.append('soSaoDanhGia', starRating);
      formData.append('maKetQuaDichVu', resultData.id);
      if (selectedImage) {
        const localUri = selectedImage.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('imageFile', { uri: localUri, name: filename, type });
      }

      await axios.post(`${BASE_URL}/api/DanhGia/create-danh-gia`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Alert.alert('Thành công', 'Gửi đánh giá thành công.');
      navigation.navigate('DanhSachDanhGia'); // Điều hướng quay lại danh sách đánh giá
    } catch (error) {
      console.error('Failed to submit review:', error);
      Alert.alert('Error', 'Failed to submit review.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đánh giá dịch vụ</Text>
      <View style={styles.starContainer}>
        {Array.from({ length: 5 }).map((_, index) => (
          <TouchableOpacity key={index} onPress={() => handleStarRating(index + 1)}>
            <Icon
              name="star"
              size={40}
              color={index < starRating ? "#FFD700" : "#ccc"}
            />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.textInput}
        placeholder="Viết đánh giá..."
        multiline
        numberOfLines={4}
        value={reviewContent}
        onChangeText={setReviewContent}
      />
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>Chọn ảnh (tùy chọn)</Text>
        {selectedImage && <Image source={{ uri: selectedImage.uri }} style={styles.image} />}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.submitButton, starRating === 0 && styles.disabledButton]}
        onPress={submitReview}
        disabled={starRating === 0}
      >
        <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#007BFF',
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: '#FFA500',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default WriteReview;
