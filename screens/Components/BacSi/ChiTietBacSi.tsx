import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const BASE_URL = 'http://10.0.2.2:5199';
const { width: viewportWidth } = Dimensions.get('window');

const ChiTietBacSi = () => {
  const route = useRoute();
  const { bacSiId } = route.params;
  const [bacSi, setBacSi] = useState<any>(null);
  const [chuyenKhoa, setChuyenKhoa] = useState<any[]>([]);
  const [dichVu, setDichVu] = useState<any[]>([]);
  const [loaiDichVu, setLoaiDichVu] = useState<any[]>([]);
  const [servicesByType, setServicesByType] = useState<any>({});

  useEffect(() => {
    fetchBacSiById();
    fetchLoaiDichVu();
  }, []);

  useEffect(() => {
    if (loaiDichVu.length > 0 && chuyenKhoa.length > 0) {
      fetchDichVu();
    }
  }, [loaiDichVu, chuyenKhoa]);

  const fetchBacSiById = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/BacSi/get-bac-si-by-id?id=${bacSiId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBacSi(response.data);
      fetchChuyenKhoa(response.data.id);
    } catch (error) {
      console.error('Failed to fetch doctor details:', error);
    }
  };

  const fetchChuyenKhoa = async (maBacSi) => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/CTBacSi/get-all-ct-bac-si`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const chuyenKhoaIds = response.data
        .filter(ct => ct.maBacSi === maBacSi)
        .map(ct => ct.maChuyenKhoa);

      const chuyenKhoaPromises = chuyenKhoaIds.map(id =>
        axios.get(`${BASE_URL}/api/ChuyenKhoa/get-chuyen-khoa-by-id?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );

      const chuyenKhoaResponses = await Promise.all(chuyenKhoaPromises);
      const chuyenKhoaData = chuyenKhoaResponses.map(res => res.data);
      setChuyenKhoa(chuyenKhoaData);
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
    }
  };

  const fetchLoaiDichVu = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const response = await axios.get(`${BASE_URL}/api/LoaiDichVu/get-all-loai-dich-vu`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLoaiDichVu(response.data);
    } catch (error) {
      console.error('Failed to fetch service types:', error);
    }
  };

  const fetchDichVu = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      const dichVuPromises = [];

      loaiDichVu.forEach(loai => {
        chuyenKhoa.forEach(khoa => {
          const url = `${BASE_URL}/api/DichVu/get-all-dich-vu-theo-loai-theo-chuyen-khoa?loaiDichVuId=${loai.id}&chuyenKhoaId=${khoa.id}`;
          dichVuPromises.push(
            axios.get(url, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }).then(res => {
             
              return { loaiDichVu: loai.id, services: res.data };
            })
          );
        });
      });

      const dichVuResponses = await Promise.all(dichVuPromises);
      const organizedServices = organizeServices(dichVuResponses);
      
      setServicesByType(organizedServices);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const organizeServices = (dichVuResponses) => {
    const organized = {};
    dichVuResponses.forEach(({ loaiDichVu, services }) => {
      if (!organized[loaiDichVu]) {
        organized[loaiDichVu] = [];
      }
      organized[loaiDichVu].push(...services);
    });
    return organized;
  };

  if (!bacSi) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: `${BASE_URL}${bacSi.hinhAnh}` }} style={styles.image} />
        <Text style={styles.name}>{bacSi.tenBacSi}</Text>
        <Text style={styles.degree}>{bacSi.bangCap}</Text>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Chuyên khoa:</Text>
        <View style={styles.specialtiesContainer}>
          {chuyenKhoa.length > 0 ? (
            chuyenKhoa.map((ck, index) => (
              <View key={index} style={styles.specialty}>
                <Text style={styles.specialtyText}>{ck.tenChuyenKhoa}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.infoValue}>No specialties found</Text>
          )}
        </View>
      </View>
      <Text style={styles.serviceLabel2}>Các dịch vụ của bác sĩ {bacSi.tenBacSi}</Text>
      {loaiDichVu.length > 0 && loaiDichVu.map((loai, index) => (

        <View key={index} style={styles.serviceSection}>
         
          <Text style={styles.serviceLabel}>{loai.tenLoai}</Text>
          {servicesByType[loai.id] && servicesByType[loai.id].map((dv, dvIndex) => (
            <View key={dvIndex} style={styles.serviceItem}>
              <Text style={styles.serviceName}>{dv.tenDichVu}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  degree: {
    fontSize: 18,
    color: '#777',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  specialty: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  specialtyText: {
    fontSize: 14,
    color: '#333',
  },
  serviceSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: -10,
  },
  serviceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  serviceLabel2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign:'center',
    marginTop:20
  },
  serviceItem: {
    paddingBottom: 10,
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChiTietBacSi;
