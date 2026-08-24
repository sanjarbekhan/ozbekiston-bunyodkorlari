import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pmicosnbsqmptbgwsckx.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_TKP5GpPg1uxO8rYjzmnYlA_om3OBiVd';

const secureStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') return typeof window === 'undefined' ? Promise.resolve(null) : AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') return typeof window === 'undefined' ? Promise.resolve() : AsyncStorage.setItem(key, value);
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') return typeof window === 'undefined' ? Promise.resolve() : AsyncStorage.removeItem(key);
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: { 'X-Client-Info': 'bunyodkor-mobile/0.1.0' },
  },
});
