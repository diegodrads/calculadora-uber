import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import DashboardScreen from './src/screens/DashboardScreen';
import RegistroScreen from './src/screens/RegistroScreen';
import MetasDividasScreen from './src/screens/MetasDividasScreen';
import AluguelConfigScreen from './src/screens/AluguelConfigScreen';
import RelatoriosScreen from './src/screens/RelatoriosScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const icons = {
    Dashboard: '📊',
    Registrar: '➕',
    'Metas/Dívidas': '🎯',
    Relatórios: '📈',
    Config: '⚙️',
  };
  return (
    <Text style={{ fontSize: focused ? 24 : 20 }}>
      {icons[label] || '📋'}
    </Text>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F1F5F9',
            elevation: 12,
            shadowColor: '#1E1B4B',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            paddingBottom: 4,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.1,
          },
          headerStyle: {
            backgroundColor: '#6C63FF',
            shadowColor: '#4C46C7',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 6,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 17,
            letterSpacing: -0.2,
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Registrar" component={RegistroScreen} />
        <Tab.Screen name="Metas/Dívidas" component={MetasDividasScreen} />
        <Tab.Screen name="Relatórios" component={RelatoriosScreen} />
        <Tab.Screen name="Config" component={AluguelConfigScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
