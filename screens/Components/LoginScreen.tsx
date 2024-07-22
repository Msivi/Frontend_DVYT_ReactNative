import React, { useState } from "react";
import { Alert, Image, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/AntDesign';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Define the prop types
interface LoginScreenProps {
    onLoginSuccess: () => void;  // Assuming onLoginSuccess is a function that takes no arguments and returns nothing
}

const LoginScreen : React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const navigation = useNavigation();
    const [isCheck, setIsCheck] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checkEmail, setCheckEmail] = useState(true);
    const [errorPassword, setErrorPassword] = useState('');

    const onSubmit = () => {
        const formData = {
            email,
            password
        };

        fetch('http://10.0.2.2:5199/api/Authentication/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                AsyncStorage.setItem('data', data.data)
                    .then(() => {
                        onLoginSuccess();
                        navigation.navigate('bottom-navigation');
                    })
                    .catch(error => console.error('AsyncStorage error: ', error));
            } else {
                Alert.alert("Đăng nhập thất bại", "Sai tài khoản hoặc mật khẩu ");
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            Alert.alert("Lỗi mạng", "Không thể kết nối đến máy chủ");
        });
    };

    const handleRegisterPress = () => {
        navigation.navigate('Register');
    };

    return (
        <SafeAreaView style={style.container}>
            <StatusBar backgroundColor={'#43BDB1'} barStyle={'dark-content'} />

            <View style={style.logoContainer}>
                <Image source={require('../../Image/LogoApp.png')} style={style.logo} />
                <Text style={style.appName}>LifeCare</Text>
                <Text style={style.subtitle}>Chăm sóc sức khỏe trực tuyến</Text>
            </View>

            <View style={style.formContainer}>
                <View>
                    <Icon name="mail" style={style.icon} />
                    <TextInput
                        placeholder="Địa chỉ Email"
                        style={style.input}
                        onChangeText={(value) => setEmail(value)}
                    />
                    <Text style={style.errorText}>{!checkEmail ? 'Sai định dạng' : ' '}</Text>
                </View>
                <View>
                    <Icon name="lock" style={style.icon} />
                    <TextInput
                        placeholder="Mật khẩu"
                        style={style.input}
                        secureTextEntry={true}
                        onChangeText={(value) => setPassword(value)}
                    />
                    <Text style={style.errorText}>{errorPassword}</Text>
                </View>
            </View>

            <View style={style.optionsContainer}>
                <View style={style.remember}>
                    <CheckBox
                        disabled={false}
                        value={isCheck}
                        onValueChange={setIsCheck}
                        tintColors={{ true: '#43BDB1' }}
                    />
                    <Text>Nhớ mật khẩu</Text>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Tùy chọn đặt lại mật khẩu')}>
                    <Text style={style.forgotPassword}>Quên mật khẩu?</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={style.loginButton} onPress={onSubmit}>
                <Text style={style.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>

            <View style={style.registerContainer}>
                <Text>Chưa có tài khoản?</Text>
                <TouchableOpacity onPress={handleRegisterPress}>
                    <Text style={style.registerText}> Đăng ký</Text>
                </TouchableOpacity>
            </View>

            <View style={style.socialLoginContainer}>
                <Image style={style.socialIcon} source={require('../../assets/fa.png')} />
                <Image style={style.socialIcon} source={require('../../assets/e.png')} />
                <Image style={style.socialIcon} source={require('../../assets/g.png')} />
            </View>
        </SafeAreaView>
    );
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 30,
        backgroundColor: '#fff',
        justifyContent: 'center'
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 10,
    },
    appName: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#43BDB1',
    },
    subtitle: {
        fontSize: 16,
        color: '#43BDB1',
    },
    formContainer: {
        marginBottom: 20,
    },
    icon: {
        fontSize: 28,
        position: 'absolute',
        top: 15,
        left: 10,
        zIndex: 1000,
        marginTop: -10,
        marginLeft: -10
    },
    input: {
        borderBottomWidth: 1,
        paddingLeft: 35,
        marginBottom: 20,
        height: 40,
        borderColor: '#ccc',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    remember: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    forgotPassword: {
        color: '#43BDB1',
    },
    loginButton: {
        backgroundColor: '#43BDB1',
        borderRadius: 30,
        alignItems: 'center',
        padding: 10,
        marginBottom: 20,
    },
    loginButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    registerText: {
        color: '#43BDB1',
        fontWeight: 'bold',
    },
    socialLoginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialIcon: {
        height: 30,
        width: 30,
        marginHorizontal: 10,
    }
});

export default LoginScreen;
