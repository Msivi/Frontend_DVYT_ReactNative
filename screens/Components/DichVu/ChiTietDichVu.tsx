import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const BASE_URL = 'http://10.0.2.2:5199';
const { width: viewportWidth } = Dimensions.get('window');

const ChiTietDichVu = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { dichVuId, loaiDichVu } = route.params;
  const [dichVu, setDichVu] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [times, setTimes] = useState({ morning: [], afternoon: [] });
  const [bacSiList, setBacSiList] = useState([]);
  const [selectedBacSi, setSelectedBacSi] = useState(null);
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  useEffect(() => {
    fetchDichVuById();
    fetchServiceRating();
    fetchDoctors();
  }, []);

  const fetchDichVuById = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/DichVu/get-dich-vu-by-id?id=${dichVuId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDichVu(response.data);
    } catch (error) {
      console.error('Failed to fetch service details:', error);
    }
  };

  const fetchServiceRating = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/DanhGia/get-sao-danh-gia?maDichVu=${dichVuId}`);
      const data = response.data;
      if (data && data.length > 0) {
        setAverageRating(data[0].soSaoTBDanhGia);
        setReviewCount(data[0].soDanhGia);
      }
    } catch (error) {
      console.error('Failed to fetch service rating:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const dichVuResponse = await axios.get(`${BASE_URL}/api/DichVu/get-dich-vu-by-id?id=${dichVuId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const maChuyenKhoa = dichVuResponse.data.maChuyenKhoa;

      const ctBacSiResponse = await axios.get(`${BASE_URL}/api/CTBacSi/get-all-ct-bac-si`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const availableBacSiIds = ctBacSiResponse.data
        .filter(item => item.maChuyenKhoa === maChuyenKhoa)
        .map(item => item.maBacSi);

      const bacSiResponse = await axios.get(`${BASE_URL}/api/BacSi/get-all-bac-si`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const lichLamViecResponse = await axios.get(`${BASE_URL}/api/LichLamViec/get-all-lich-lam-viec`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const filteredBacSi = bacSiResponse.data.filter(bacSi => {
        const doctorHasSchedule = lichLamViecResponse.data.some(schedule => {
          return schedule.maBacSi === bacSi.id && new Date(schedule.ngay) >= new Date();
        });
        return availableBacSiIds.includes(bacSi.id) && doctorHasSchedule;
      });

      setFilteredDoctors(filteredBacSi);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAvailableDates = async (doctorId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/LichLamViec/get-all-lich-lam-viec`);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      const dates = response.data
        .filter(item => item.maBacSi === doctorId && new Date(item.ngay) >= today && new Date(item.ngay) <= nextWeek)
        .map(item => new Date(item.ngay));
      dates.sort((a, b) => a - b);
      setAvailableDates(dates);
    } catch (error) {
      console.error("Error fetching available dates:", error);
    }
  };

  const getDayName = (date) => {
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  };

  const handleDoctorSelect = async (doctorId) => {
    setSelectedBacSi(doctorId);
    setSelectedTime('');
    setSelectedDate(null);
    setUnavailableTimes([]);
    await fetchAvailableDates(doctorId);
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    await checkUnavailableTimes(localDate, selectedBacSi);
  };

  const checkUnavailableTimes = async (date, selectedBacSi) => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/LichHen/get-all-lich-hen`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const filteredAppointments = response.data.filter(appointment => {
        const appointmentDate = new Date(appointment.thoiGianDuKien);
        const formattedAppointmentDate = appointmentDate.toISOString().split('T')[0];
        return formattedAppointmentDate === date && appointment.maBacSi === selectedBacSi;
      });

      const times = filteredAppointments.map(item => {
        const appointmentDate = new Date(item.thoiGianDuKien);
        return `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`;
      });

      console.log("Unavailable times:", times);

      const allTimes = [
        '08:00', '09:00', '10:00', '11:00',
        '13:30', '14:30', '15:30', '16:30'
      ];

      const availableTimes = allTimes.filter(time => !times.includes(time));
      console.log("Available times:", availableTimes);

      setTimes({
        morning: availableTimes.filter(time => parseInt(time.split(':')[0]) < 12),
        afternoon: availableTimes.filter(time => parseInt(time.split(':')[0]) >= 12)
      });
      setUnavailableTimes(times);
    } catch (error) {
      console.error('Failed to fetch unavailable times:', error);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleContinuePress = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const formattedDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      formattedDateTime.setHours(hours, minutes, 0, 0);
  
      // Format the date time for sending to the server
      const dateTimeForServer = formattedDateTime.toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }); // Using 'sv-SE' for ISO-like format yyyy-mm-dd hh:mm
  
      console.log("Booking date and time:", dateTimeForServer);
  
      navigation.navigate('ThanhToan', { 
        dichVu, 
        bacSi: filteredDoctors.find(bacSi => bacSi.id === selectedBacSi), 
        price: dichVu.gia, 
        selectedDate: dateTimeForServer, // Send formatted local date and time
        selectedTime, 
        loaiDichVu 
      });
    } catch (error) {
      console.error('Failed to book appointment:', error);
      Alert.alert("Lỗi", "Đặt lịch thất bại. Vui lòng thử lại.");
    }
  };
  
  
  
  

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <View style={styles.starContainer}>
        {Array.from({ length: fullStars }, (_, index) => (
          <Icon key={`full-${index}`} name="star" size={20} color="#FFD700" />
        ))}
        {halfStar && <Icon key="half" name="star-half" size={20} color="#FFD700" />}
        {Array.from({ length: emptyStars }, (_, index) => (
          <Icon key={`empty-${index}`} name="star-outline" size={20} color="#FFD700" />
        ))}
      </View>
    );
  };
  

  if (!dichVu) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isContinueButtonEnabled = selectedDate && selectedBacSi && selectedTime;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: `${BASE_URL}${dichVu.hinhAnh}` }} style={styles.image} />
      <Text style={styles.title}>{dichVu.tenDichVu}</Text>
      <View style={styles.ratingContainer}>
      {renderStars(averageRating)}
      <Text style={styles.reviewCount}> {averageRating.toFixed(1)} ({reviewCount} Đánh giá)</Text>
      <TouchableOpacity onPress={() => navigation.navigate('XemDanhGia', { dichVuId })}>
        <Text style={styles.viewReviews}>Xem đánh giá</Text>
      </TouchableOpacity>
    </View>
      <Text style={styles.description}>{dichVu.moTa}</Text>
      <Text style={styles.price}>{dichVu.gia.toLocaleString('vi-VN')} đ</Text>

      <Text style={styles.sectionTitle}>Chọn bác sĩ</Text>
      <View style={styles.doctorList}>
        {filteredDoctors.map(bacSi => (
          <TouchableOpacity
            key={bacSi.id}
            style={[
              styles.doctorItem,
              selectedBacSi === bacSi.id && styles.selectedDoctorItem
            ]}
            onPress={() => handleDoctorSelect(bacSi.id)}
          >
            <Image source={{ uri: `${BASE_URL}${bacSi.hinhAnh}` }} style={styles.doctorImage} />
            <Text style={styles.doctorName}>{bacSi.tenBacSi}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedBacSi && (
        <>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          <View style={styles.dateContainer}>
            {availableDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateButton,
                  selectedDate && selectedDate.toDateString() === date.toDateString() && styles.selectedDateButton
                ]}
                onPress={() => handleDateSelect(date)}
              >
                <Text style={styles.dateText}>{getDayName(date)} - {date.getDate()}/{date.getMonth() + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedDate && (
            <>
              <Text style={styles.sectionTitle}>Chọn giờ</Text>
              <View style={styles.timeSlotsContainer}>
                <Text style={styles.timeSlotHeader}>Buổi sáng</Text>
                <View style={styles.timeSlotGroup}>
                  {times.morning.map((time, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlot,
                        selectedTime === time && styles.selectedTimeSlot,
                        unavailableTimes.includes(time) && styles.unavailableTimeSlot
                      ]}
                      onPress={() => handleTimeSelect(time)}
                    >
                      <Text style={styles.timeSlotText}>{time} - {(parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0') + ':' + time.split(':')[1]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.timeSlotHeader}>Buổi chiều</Text>
                <View style={styles.timeSlotGroup}>
                  {times.afternoon.map((time, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlot,
                        selectedTime === time && styles.selectedTimeSlot,
                        unavailableTimes.includes(time) && styles.unavailableTimeSlot
                      ]}
                      onPress={() => handleTimeSelect(time)}
                    >
                      <Text style={styles.timeSlotText}>{time} - {(parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0') + ':' + time.split(':')[1]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </>
      )}

      <TouchableOpacity
        style={[
          styles.continueButton,
          !isContinueButtonEnabled && styles.disabledButton
        ]}
        disabled={!isContinueButtonEnabled}
        onPress={handleContinuePress}
      >
        <Text style={styles.continueButtonText}>Tiếp tục</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: viewportWidth - 20,
    height: viewportWidth * 0.5,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewCount: {
    marginLeft: 5,
    fontSize: 16,
  },
  viewReviews: {
    marginLeft: 10,
    fontSize: 16,
    color: '#007BFF',
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    color: 'green',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  doctorList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  doctorItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    margin: 5,
    width: (viewportWidth - 60) / 4,
    alignItems: 'center',
  },
  selectedDoctorItem: {
    backgroundColor: '#4CAF50',
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  doctorName: {
    fontSize: 14,
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  dateButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ddd',
    margin: 5,
    flexBasis: '30%',
    alignItems: 'center',
  },
  selectedDateButton: {
    backgroundColor: '#4CAF50',
  },
  dateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  timeSlotsContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  timeSlotHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeSlotGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    margin: 5,
    width: (viewportWidth - 40) / 2 - 20,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#4CAF50',
  },
  unavailableTimeSlot: {
    backgroundColor: '#ccc',
  },
  timeSlotText: {
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  starContainer: {
    flexDirection: 'row',
  },
});

export default ChiTietDichVu;
