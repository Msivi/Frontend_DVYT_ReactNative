import React from "react";
import HomeScreen from "../../screens/Components/TrangChu/TrangChu";
import Profile from "../Components/TaiKhoan/Profile";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { COLORS } from "../constants/theme";
import LinearGradient from 'react-native-linear-gradient';
import TrangTimKiem from "../Components/TimKiem/TrangTimKiem";
import ThuocThietBi from "../../screens/Components/ThuocThietBi/MuaThuocTB";

const Tab = createBottomTabNavigator();

const tabBarBackground = () => (
  <LinearGradient
    colors={['#43BDB1','#43BDB1']}
    style={{ flex: 1 }}
  />
);

const BottomTab = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Trang chủ"
        component={HomeScreen}
        options={{
          tabBarBackground,
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AntDesign
              name="home"
              color={focused ? '#FF5733' : COLORS.secondary1}
              size={26}
            />
          ),
        }}
      />

      <Tab.Screen
        name="TrangTimKiem"
        component={TrangTimKiem}
        options={{
          tabBarBackground,
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AntDesign
              name="search1"
              color={focused ? COLORS.secondary : COLORS.secondary1}
              size={26}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ThuocThietBi"
        component={ThuocThietBi}
        options={{
          tabBarBackground,
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AntDesign
              name="shoppingcart"
              color={focused ? COLORS.secondary : COLORS.secondary1}
              size={26}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Tôi"
        component={Profile}
        options={{
          tabBarBackground,
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AntDesign
              name="user"
              color={focused ? COLORS.secondary : COLORS.secondary1}
              size={26}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTab;
