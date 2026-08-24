import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { palette, radii, spacing } from '@/lib/theme';

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 8 || (mode === 'signup' && fullName.trim().length < 3)) {
      Alert.alert('Ma’lumotni tekshiring', 'To‘liq ism, email va kamida 8 belgili parol kiriting.'); return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.back();
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim() } } });
        if (error) throw error;
        if (data.session) router.back(); else Alert.alert('Emailingizni tekshiring', 'Tasdiqlash havolasi yuborildi. Emailni tasdiqlagach tizimga kiring.');
      }
    } catch (error) {
      Alert.alert('Kirish amalga oshmadi', error instanceof Error ? error.message : 'Keyinroq qayta urinib ko‘ring.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={23} color={palette.ink} /></Pressable>
          <View style={styles.mark}><Text style={styles.markText}>B</Text></View>
          <Text style={styles.title}>{mode === 'signin' ? 'Xush kelibsiz' : 'Raqamli tarixingizni boshlang'}</Text>
          <Text style={styles.body}>{mode === 'signin' ? 'Bunyodkor profilingiz va yutuqlaringizga kiring.' : 'Yutuqlaringiz, ijodingiz va hayot yo‘lingizni bir joyda saqlang.'}</Text>
          <View style={styles.segment}>
            <Pressable onPress={() => setMode('signin')} style={[styles.segmentItem, mode === 'signin' && styles.segmentActive]}><Text style={[styles.segmentText, mode === 'signin' && styles.segmentTextActive]}>Kirish</Text></Pressable>
            <Pressable onPress={() => setMode('signup')} style={[styles.segmentItem, mode === 'signup' && styles.segmentActive]}><Text style={[styles.segmentText, mode === 'signup' && styles.segmentTextActive]}>Ro‘yxatdan o‘tish</Text></Pressable>
          </View>
          <View style={styles.form}>
            {mode === 'signup' ? <Field icon="person-outline" placeholder="To‘liq ism" value={fullName} onChangeText={setFullName} /> : null}
            <Field icon="mail-outline" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Field icon="lock-closed-outline" placeholder="Parol" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
            <PrimaryButton label={mode === 'signin' ? 'Kirish' : 'Profil yaratish'} onPress={() => void submit()} loading={loading} />
          </View>
          <View style={styles.security}><Ionicons name="shield-checkmark-outline" size={18} color={palette.brand} /><Text style={styles.securityText}>Sessiya tokenlari telefonning himoyalangan xotirasida saqlanadi.</Text></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ icon, ...props }: { icon: keyof typeof Ionicons.glyphMap } & React.ComponentProps<typeof TextInput>) {
  return <View style={styles.field}><Ionicons name={icon} size={20} color={palette.inkMuted} /><TextInput placeholderTextColor="#8C9791" selectionColor={palette.brand} style={styles.input} {...props} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background }, content: { padding: spacing.lg, paddingBottom: 40 },
  close: { alignSelf: 'flex-end', width: 42, height: 42, borderRadius: 21, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.line },
  mark: { width: 68, height: 68, borderRadius: 22, backgroundColor: palette.brand, alignItems: 'center', justifyContent: 'center', marginTop: 22 }, markText: { color: '#fff', fontSize: 34, fontWeight: '900' },
  title: { color: palette.ink, fontSize: 31, lineHeight: 37, fontWeight: '900', letterSpacing: -1, marginTop: 22 }, body: { color: palette.inkMuted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  segment: { height: 48, flexDirection: 'row', backgroundColor: '#E9EEEB', borderRadius: 16, padding: 4, marginTop: 25 }, segmentItem: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, segmentActive: { backgroundColor: '#fff' }, segmentText: { color: palette.inkMuted, fontSize: 13, fontWeight: '700' }, segmentTextActive: { color: palette.ink, fontWeight: '800' },
  form: { gap: 12, marginTop: 18 }, field: { height: 56, borderRadius: 17, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10 }, input: { flex: 1, height: '100%', color: palette.ink, fontSize: 15 },
  security: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 18 }, securityText: { color: palette.inkMuted, fontSize: 11, lineHeight: 16, flexShrink: 1 },
});
