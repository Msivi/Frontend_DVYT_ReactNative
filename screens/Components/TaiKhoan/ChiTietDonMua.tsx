import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

const BASE_URL = 'http://10.0.2.2:5199';

const ChiTietHoaDonScreen = () => {
  const route = useRoute();
  const { maHoaDon } = route.params;
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [addressId, setAddressId] = useState(0);
  const [addressName, setAddressName] = useState('');
  
  const [note, setNote] = useState('');
  useEffect(() => {
    fetchOrderDetails();
    fetchInvoiceDetails();
  }, []);
  
  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchInvoiceDetails = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/HoaDon/get-hoa-don-by-id?maHoaDon=${maHoaDon}`);
    
    if (response.status === 200 && response.data.diaChi) {
      const invoiceDetails = response.data;
      setNote(invoiceDetails.ghiChu);
      setAddressId(invoiceDetails.diaChi);
  
      fetchAddress(invoiceDetails.diaChi);
    } else {
      console.error('Invoice details fetch error:', response.status, response.data);
    }
  } catch (error) {
    console.error('Failed to fetch invoice details:', error);
  }
};

  
  const fetchAddress = async (addressId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/DiaChi/get-dia-chi-by-id?id=${addressId}`);
      if (response.status === 200) {
        setAddressName(response.data.tenDiaChi);
      } else {
        console.error('Address fetch error:', response.status, response.data);
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
    }
  };
  
  
  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/HoaDon/get-all-sp-by-ma-hd?maHD=${maHoaDon}`);
      const items = response.data;

      const thuocResponse = await axios.get(`${BASE_URL}/api/Thuoc/get-all-thuoc`);
      const thietBiResponse = await axios.get(`${BASE_URL}/api/ThietBiYTe/get-all-thiet-bi-y-te`);

      const thuocMap = thuocResponse.data.reduce((acc, thuoc) => {
        acc[thuoc.id] = thuoc.hinhAnh;
        return acc;
      }, {});

      const thietBiMap = thietBiResponse.data.reduce((acc, thietBi) => {
        acc[thietBi.id] = thietBi.hinhAnh;
        return acc;
      }, {});

      const updatedItems = items.map(item => {
        if (thuocMap[item.maSanPham]) {
          item.hinhAnh = thuocMap[item.maSanPham];
        } else if (thietBiMap[item.maSanPham]) {
          item.hinhAnh = thietBiMap[item.maSanPham];
        }
        return item;
      });

      setOrderDetails(updatedItems);

      // Calculate total price
      const total = updatedItems.reduce((sum, item) => sum + item.thanhTien, 0);
      setTotalPrice(total);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {item.hinhAnh && <Image source={{ uri: `${BASE_URL}${item.hinhAnh}` }} style={styles.itemImage} />}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.tenSanPham}</Text>
        <Text style={styles.itemPrice}>{item.donGia.toLocaleString('vi-VN')} đ</Text>
        <Text style={styles.itemQuantity}>Số lượng: {item.soLuong}</Text>
        <Text style={styles.itemTotal}>Thành tiền: {item.thanhTien.toLocaleString('vi-VN')} đ</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orderDetails}
        renderItem={renderItem}
        keyExtractor={item => item.maSanPham.toString()}
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.footer}>
  <Text style={styles.invoiceText}>Mã hóa đơn: {maHoaDon}</Text>
  <Text style={styles.addressText}>Địa chỉ giao: {addressName}</Text>
  {note && <Text style={styles.noteText}>Ghi chú: {note}</Text>}
  <Text style={styles.totalPriceText}>Tổng tiền: {totalPrice.toLocaleString('vi-VN')} đ</Text>
</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemInfo: {
    marginLeft: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: 'orange',
    marginBottom: 5,
  },
  itemQuantity: {
    fontSize: 14,
    marginBottom: 5,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
   
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    alignItems: 'flex-end',
    textAlign:"right",
    color:'red'
  },
  invoiceText: {
    fontSize: 16,
    marginBottom: 5,
    alignItems: 'flex-start',
  },
  addressText: {
    fontSize: 16,
    marginBottom: 5,
  },
  noteText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default ChiTietHoaDonScreen;
