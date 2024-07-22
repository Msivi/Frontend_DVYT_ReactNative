import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

const BASE_URL = 'http://10.0.2.2:5199';

const ServiceReviews = ({ route }) => {
  const { dichVuId } = route.params;
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/DanhGia/get-all-danh-gia-by-ma-dich-vu?maDichVu=${dichVuId}`);
      const approvedReviews = response.data.filter(review => review.trangThai === "1");

      const reviewsWithUserInfo = await Promise.all(approvedReviews.map(async (review) => {
        const userResponse = await axios.get(`${BASE_URL}/api/KhachHang/get-khach-hang-by-id?id=${review.createBy}`);
        const user = userResponse.data;

        return {
          ...review,
          userName: user.tenKhachHang,
          userAvatar: user.avatar ? `${BASE_URL}${user.avatar}` : null,
        };
      }));

      setReviews(reviewsWithUserInfo);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starContainer}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Icon key={index} name="star" size={20} color={index < rating ? "#FFD700" : "#ccc"} />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {item.userAvatar ? (
            <Image source={{ uri: item.userAvatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
            </View>
          )}
        </View>
        <View>
          <Text style={styles.userName}>{item.userName}</Text>
          {renderStars(item.soSaoDanhGia)}
        </View>
      </View>
      <Text style={styles.reviewContent}>{item.noiDungDanhGia}</Text>
      {item.hinhAnh && (
        <Image source={{ uri: `${BASE_URL}${item.hinhAnh}` }} style={styles.reviewImage} />
      )}
      <Text style={styles.reviewDate}>{new Date(item.createTimes).toLocaleDateString('vi-VN')} {new Date(item.createTimes).toLocaleTimeString('vi-VN')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  reviewItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  starContainer: {
    flexDirection: 'row',
  },
  reviewContent: {
    fontSize: 14,
    marginBottom: 10,
  },
  reviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default ServiceReviews;
