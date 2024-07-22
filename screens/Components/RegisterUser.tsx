import React, { useState } from "react";
import { Alert, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import RadioForm from 'react-native-simple-radio-button';
import { useNavigation } from '@react-navigation/native';

const RegisterUser = () => {
    const navigation = useNavigation();
    const [tenKhachHang, setTenKhachHang] = useState('');
    const [email, setEmail] = useState('');
    const [matKhau, setMatKhau] = useState('');
    const [sdt, setSdt] = useState('');
    const [cmnd, setCmnd] = useState('');
    const [ngaySinh, setNgaySinh] = useState(new Date());
    const [gioiTinh, setGioiTinh] = useState('Nam');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!tenKhachHang.trim()) {
            newErrors.tenKhachHang = 'Vui lòng nhập tên khách hàng.';
        }
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'Vui lòng nhập email hợp lệ.';
        }
        if (!matKhau.trim() || matKhau.length < 6) {
            newErrors.matKhau = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }
        if (!sdt.trim() || !/^(?:\+84|0)[1-9][0-9]{8}$/.test(sdt)) {
            newErrors.sdt = 'Số điện thoại của bạn nhập không đúng định dạng.';
        }
        if (!cmnd.trim() || !(cmnd.length === 9 || cmnd.length === 12)) {
            newErrors.cmnd = 'CMND phải có 9 hoặc 12 số.';
        }
        if (ngaySinh >= new Date() || ngaySinh.getFullYear() < 1920) {
            newErrors.ngaySinh = 'Ngày sinh không hợp lệ.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async () => {
        if (!validateForm()) return;

        const formData = {
            tenKhachHang,
            email,
            matKhau,
            sdt,
            cmnd,
            ngaySinh: ngaySinh.toISOString(),
            gioiTinh
        };

        try {
            const response = await fetch('http://10.0.2.2:5199/api/Authentication/create-khach-hang', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Đăng ký thất bại.');
            }

            Alert.alert("Thành công", "Đăng ký thành công!");
            navigation.navigate("Login");
        } catch (error) {
            console.error('Error:', error);
            Alert.alert("Lỗi", error.message);
        }
    };

    const onChangeDate = (event: any, selectedDate: Date | undefined) => {
        const currentDate = selectedDate || ngaySinh;
        setShowDatePicker(false);
        setNgaySinh(currentDate);
    };

    const genderOptions = [
        { label: 'Nam', value: 'Nam' },
        { label: 'Nữ', value: 'Nữ' }
    ];

    return (
        <SafeAreaView style={style.container}>
            <StatusBar backgroundColor={'#43BDB1'} barStyle={'dark-content'} />
            <View style={style.title}>
                <Text style={{ fontWeight: 'bold', fontSize: 35, color: '#43BDB1', margin: 20 }}>Đăng ký</Text>
                <Text>Bằng cách đăng ký, bạn đồng ý với</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Text>Điều khoản và </Text>
                    <TouchableOpacity onPress={() => Alert.alert('Redirect to terms and conditions')}>
                        <Text style={{ color: '#43BDB1' }}>Chính sách bảo mật</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View>
                <TextInput placeholder="Tên khách hàng" style={style.input} onChangeText={setTenKhachHang} />
                {errors.tenKhachHang && <Text style={style.error}>{errors.tenKhachHang}</Text>}
                
                <TextInput placeholder="Email" style={style.input} onChangeText={setEmail} />
                {errors.email && <Text style={style.error}>{errors.email}</Text>}
                
                <TextInput placeholder="Mật khẩu" style={style.input} secureTextEntry={true} onChangeText={setMatKhau} />
                {errors.matKhau && <Text style={style.error}>{errors.matKhau}</Text>}
                
                <TextInput placeholder="Số điện thoại" style={style.input} onChangeText={setSdt} />
                {errors.sdt && <Text style={style.error}>{errors.sdt}</Text>}
                
                <TextInput placeholder="CMND" style={style.input} onChangeText={setCmnd} />
                {errors.cmnd && <Text style={style.error}>{errors.cmnd}</Text>}
                
                <View style={style.inputContainer}>
                    <Text style={style.label}>Giới tính</Text>
                    <RadioForm
                        radio_props={genderOptions}
                        initial={0}
                        formHorizontal={true}
                        labelHorizontal={true}
                        buttonColor={'#43BDB1'}
                        animation={true}
                        onPress={(value: string) => { setGioiTinh(value) }}
                    />
                </View>
                
                <View style={style.inputContainer}>
                    <Text style={style.label}>Ngày sinh</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <Text style={style.dateText}>{ngaySinh.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    {errors.ngaySinh && <Text style={style.error}>{errors.ngaySinh}</Text>}
                    {showDatePicker && (
                        <DateTimePicker
                            value={ngaySinh}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}
                </View>
            </View>

            <TouchableOpacity style={style.btnSubmit} onPress={onSubmit}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 25 }}>Đăng ký</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const style = StyleSheet.create({
    container: {
        paddingHorizontal: 30,
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center'
    },
    title: {
        alignItems: 'center',
        marginBottom: 30,
    },
    input: {
        borderBottomWidth: 1,
        marginBottom: 5,
        padding: 10,
        fontSize: 18,
        borderColor: '#ccc',
    },
    error: {
        color: 'red',
        marginBottom: 10,
        marginLeft: 10,
    },
    btnSubmit: {
        backgroundColor: '#43BDB1',
        borderRadius: 30,
        alignItems: 'center',
        padding: 10,
        marginTop: 20
    },
    inputContainer: {
        marginBottom: 20
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
        fontWeight: 'bold'
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

export default RegisterUser;
