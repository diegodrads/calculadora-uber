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
            backgroundColor: '#fff',
            borderTopWidth: 0,
            elevation: 8,
            paddingBottom: 4,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#6C63FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700',
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
