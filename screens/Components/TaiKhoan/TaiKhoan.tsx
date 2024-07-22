import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ChangePasswordScreen = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false);

    const navigation = useNavigation();

    const handleSubmit = () => {
        if (newPassword !== confirmNewPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới không trùng nhau.');
            return;
        }

        fetch('http://10.0.2.2:5199/api/Authentication/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmNewPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message == null) {
                Alert.alert('Kết quả', 'Đổi mật khẩu thành công.');
                AsyncStorage.removeItem('data')
                    .then(() => {
                        navigation.navigate('Login');
                    })
                    .catch(error => {
                        console.error('AsyncStorage error: ', error);
                        Alert.alert('Error', 'Failed to clear session.');
                    });
            } else {
                Alert.alert('Không thành công', "Sai mật khẩu hiện tại!");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Alert.alert('Error', 'An error occurred while changing the password.');
        });
    };

    const handleLogout = () => {
        AsyncStorage.removeItem('data')
        .then(() => {
            navigation.navigate('Login');
        })
        .catch(error => {
            console.error('AsyncStorage error: ', error);
            Alert.alert('Error', 'Failed to clear session.');
        });
    };

    const isSubmitDisabled = !currentPassword || !newPassword || !confirmNewPassword;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.header}>Đổi mật khẩu</Text>
            </View>
            <View style={styles.textBox}>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu hiện tại"
                        secureTextEntry={!isCurrentPasswordVisible}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />
                    <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
                    >
                        <Icon name={isCurrentPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
                    </TouchableOpacity>
                </View>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu mới"
                        secureTextEntry={!isNewPasswordVisible}
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                    >
                        <Icon name={isNewPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
                    </TouchableOpacity>
                </View>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập lại mật khẩu mới"
                        secureTextEntry={!isConfirmNewPasswordVisible}
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                    />
                    <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={() => setIsConfirmNewPasswordVisible(!isConfirmNewPasswordVisible)}
                    >
                        <Icon name={isConfirmNewPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity 
                style={[styles.button, isSubmitDisabled && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
            >
                <Text style={styles.buttonText}>Xác nhận</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#43BDB1',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 16,
    },
    textBox: {
        marginTop: 20,
        alignItems: 'center',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#fff',
        width: 390,
        paddingRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
    },
    iconContainer: {
        padding: 10,
    },
    button: {
        backgroundColor: '#43BDB1',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 30,
        width: 390,
        marginLeft: 10,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ChangePasswordScreen;
