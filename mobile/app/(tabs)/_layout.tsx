import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { palette } from '@/lib/theme';

const icon = (active: keyof typeof Ionicons.glyphMap, inactive: keyof typeof Ionicons.glyphMap) =>
  ({ color, focused, size }: { color: string; focused: boolean; size: number }) => (
    <Ionicons name={focused ? active : inactive} color={color} size={size} />
  );

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.brand,
        tabBarInactiveTintColor: '#7B8781',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          borderTopColor: palette.line,
          backgroundColor: 'rgba(255,255,255,0.98)',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Asosiy', tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="discover" options={{ title: 'Kashf etish', tabBarIcon: icon('compass', 'compass-outline') }} />
      <Tabs.Screen name="create" options={{ title: 'Qo‘shish', tabBarIcon: icon('add-circle', 'add-circle-outline') }} />
      <Tabs.Screen name="community" options={{ title: 'Hamjamiyat', tabBarIcon: icon('people', 'people-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: icon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
