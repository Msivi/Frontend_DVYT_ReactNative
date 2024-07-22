import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const BASE_URL = 'http://10.0.2.2:5199';

const ReviewList = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Chưa đánh giá');
  const navigation = useNavigation();

  useEffect(() => {
    fetchAppointments();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/LichHen/get-all-lich-hen-khach-hang`);
      const appointmentData = response.data;
      const resultResponse = await axios.get(`${BASE_URL}/api/KetQuaDichVu/get-all-ket-qua-dich-vu`);
      const pendingReviewResponse = await axios.get(`${BASE_URL}/api/DanhGia/get-all-danh-gia-chua-duyet`);
   
      const updatedAppointments = await Promise.all(appointmentData.map(async (appointment) => {
        const resultData = resultResponse.data.find(result => result.maLichHen === appointment.id);
        const reviewResponse = await axios.get(`${BASE_URL}/api/DanhGia/get-all-danh-gia-by-ma-dich-vu?maDichVu=${appointment.maDichVu}`);
        const isReviewed = reviewResponse.data.some(review => review.maKetQuaDichVu === resultData?.id);
        const isPendingReview = pendingReviewResponse.data.some(review => review.maKetQuaDichVu === resultData?.id);
        const serviceResponse = await axios.get(`${BASE_URL}/api/DichVu/get-dich-vu-by-id?id=${appointment.maDichVu}`);
        const serviceData = serviceResponse.data;

        return {
          ...appointment,
          result: resultData,
          isReviewed: !!isReviewed || !!isPendingReview,
          serviceName: serviceData.tenDichVu,
          serviceImage: `${BASE_URL}${serviceData.hinhAnh}`,
          review: reviewResponse.data.find(review => review.maKetQuaDichVu === resultData?.id) || pendingReviewResponse.data.find(review => review.maKetQuaDichVu === resultData?.id) || null,
        };
      }));

      setAppointments(updatedAppointments);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentItem}>
      <Image source={{ uri: item.serviceImage }} style={styles.serviceImage} />
      <View style={styles.infoContainer}>
        <Text style={styles.appointmentText}>Mã lịch hẹn: {item.id}</Text>
        <Text style={styles.appointmentText}>Tên dịch vụ: {item.serviceName}</Text>
  
        {selectedTab === 'Đã đánh giá' && item.review && (
          <>
            <Text style={styles.appointmentText}>Đánh giá: {item.review.noiDungDanhGia}</Text>
            <View style={styles.starContainer}>
              {Array.from({ length: item.review.soSaoDanhGia }).map((_, index) => (
                <Icon key={index} name="star" size={20} color="#FFD700" />
              ))}
            </View>
          </>
        )}
        {selectedTab === 'Chưa đánh giá' && item.result && !item.isReviewed && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => navigation.navigate('DanhGiaDichVu', { appointmentId: item.id })}
          >
            <Text style={styles.reviewButtonText}>Đánh giá</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const filterAppointments = (isReviewed) => {
    return appointments.filter(appointment => appointment.result && appointment.isReviewed === isReviewed);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Chưa đánh giá' && styles.selectedTabButton]}
          onPress={() => setSelectedTab('Chưa đánh giá')}
        >
          <Text style={styles.tabButtonText}>Chưa đánh giá</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Đã đánh giá' && styles.selectedTabButton]}
          onPress={() => setSelectedTab('Đã đánh giá')}
        >
          <Text style={styles.tabButtonText}>Đã đánh giá</Text>
        </TouchableOpacity>
      </View>
      {selectedTab === 'Chưa đánh giá' && filterAppointments(false).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có kết quả dịch vụ</Text>
        </View>
      ) : selectedTab === 'Đã đánh giá' && filterAppointments(true).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có đánh giá</Text>
        </View>
      ) : (
        <FlatList
          data={selectedTab === 'Chưa đánh giá' ? filterAppointments(false) : filterAppointments(true)}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 10,
  },
  appointmentItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  appointmentText: {
    fontSize: 16,
    marginBottom: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  selectedTabButton: {
    backgroundColor: '#FFA500',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  reviewButton: {
    marginTop: 10,
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  starContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});

export default ReviewList;
