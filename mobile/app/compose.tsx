import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { palette, radii, spacing } from '@/lib/theme';
import { useSession } from '@/providers/session-provider';

export default function ComposeScreen() {
  const { kind = 'Hayotiy voqea' } = useLocalSearchParams<{ kind?: string }>();
  const { session } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!session) { router.replace('/auth'); return; }
    if (title.trim().length < 3 || description.trim().length < 10) { Alert.alert('Ma’lumot yetarli emas', 'Sarlavha va batafsil tavsif kiriting.'); return; }
    setSaving(true);
    const { error } = await supabase.from('app_submissions').insert({ owner_id: session.user.id, content_type: kind, title: title.trim(), description: description.trim(), status: 'draft' });
    setSaving(false);
    if (error) { Alert.alert('Saqlanmadi', 'Baza migratsiyasi qo‘llanmaguncha qoralama yuborish yopiq.'); return; }
    Alert.alert('Qoralama saqlandi', 'Uni keyin to‘ldirib, tekshiruvga yuborishingiz mumkin.', [{ text: 'Tayyor', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.top}><Pressable onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={23} color={palette.ink} /></Pressable><Text style={styles.topTitle}>Yangi {String(kind).toLocaleLowerCase('uz')}</Text><View style={{ width: 42 }} /></View>
          <Text style={styles.label}>Sarlavha</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Masalan: Respublika tanlovida 1-o‘rin" placeholderTextColor="#909A95" style={styles.field} />
          <Text style={styles.label}>Batafsil ma’lumot</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="Voqea, natija va ahamiyati haqida yozing…" placeholderTextColor="#909A95" multiline textAlignVertical="top" style={[styles.field, styles.textarea]} />
          <Pressable style={styles.upload}><View style={styles.uploadIcon}><Ionicons name="cloud-upload-outline" size={25} color={palette.brand} /></View><View style={{ flex: 1 }}><Text style={styles.uploadTitle}>Tasdiqlovchi fayl</Text><Text style={styles.uploadBody}>Rasm, PDF yoki sertifikat qo‘shing</Text></View><Ionicons name="add-circle-outline" size={23} color={palette.brand} /></Pressable>
          <View style={styles.info}><Ionicons name="information-circle-outline" size={20} color={palette.brand} /><Text style={styles.infoText}>Hozir qoralama sifatida saqlanadi. Siz yubormaguningizcha moderator ko‘rmaydi.</Text></View>
          <PrimaryButton label="Qoralamani saqlash" icon="checkmark" loading={saving} onPress={() => void save()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background }, content: { padding: spacing.lg, paddingBottom: 40 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }, close: { width: 42, height: 42, borderRadius: 21, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' }, topTitle: { color: palette.ink, fontSize: 16, fontWeight: '800' },
  label: { color: palette.ink, fontSize: 13, fontWeight: '800', marginBottom: 8, marginTop: 12 }, field: { minHeight: 56, borderRadius: 17, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, paddingHorizontal: 15, color: palette.ink, fontSize: 15 }, textarea: { minHeight: 170, paddingTop: 15, lineHeight: 21 },
  upload: { minHeight: 78, borderRadius: radii.lg, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, padding: 14, marginVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, uploadIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: palette.brandSoft, alignItems: 'center', justifyContent: 'center' }, uploadTitle: { color: palette.ink, fontSize: 14, fontWeight: '800' }, uploadBody: { color: palette.inkMuted, fontSize: 11, marginTop: 4 },
  info: { flexDirection: 'row', gap: 9, backgroundColor: palette.brandSoft, borderRadius: 16, padding: 13, marginBottom: 18 }, infoText: { flex: 1, color: '#35614F', fontSize: 12, lineHeight: 17 },
});
