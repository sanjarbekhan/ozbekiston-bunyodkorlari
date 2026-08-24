import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui';
import { palette, radii, shadow, spacing } from '@/lib/theme';
import { useSession } from '@/providers/session-provider';

const types = [
  { icon: 'trophy-outline', color: '#D99022', bg: '#FFF3DD', title: 'Yutuq', body: 'Diplom, mukofot yoki tanlov natijasi' },
  { icon: 'sparkles-outline', color: '#7B55C7', bg: '#F0EAFE', title: 'Ijodiy ish', body: 'She’r, hikoya, kitob, dizayn yoki video' },
  { icon: 'bulb-outline', color: '#0B6B48', bg: '#DDF2E8', title: 'Loyiha', body: 'Startup, tashabbus yoki ixtiro' },
  { icon: 'book-outline', color: '#3977B7', bg: '#E5F1FC', title: 'Maqola', body: 'Ilmiy, tahliliy yoki ijodiy maqola' },
  { icon: 'time-outline', color: '#C55D76', bg: '#FBE8ED', title: 'Hayotiy voqea', body: 'Hayot yo‘lingizdagi muhim bosqich' },
  { icon: 'ribbon-outline', color: '#616B75', bg: '#EDF0F2', title: 'Sertifikat', body: 'Kurs, trening yoki malaka hujjati' },
] as const;

export default function CreateScreen() {
  const { session } = useSession();
  const open = (kind: string) => {
    void Haptics.selectionAsync();
    if (!session) router.push('/auth'); else router.push({ pathname: '/compose', params: { kind } });
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="Raqamli hayot kitobi" title="Nima qo‘shamiz?" />
        <Text style={styles.intro}>Yangi ma’lumot avval qoralama sifatida saqlanadi. Tayyor bo‘lgach, tekshiruvga yuborasiz.</Text>
        <View style={styles.grid}>
          {types.map((item) => (
            <Pressable key={item.title} onPress={() => open(item.title)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <View style={[styles.icon, { backgroundColor: item.bg }]}><Ionicons name={item.icon} size={27} color={item.color} /></View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <View style={styles.arrow}><Ionicons name="arrow-forward" size={17} color={palette.brand} /></View>
            </Pressable>
          ))}
        </View>
        <View style={styles.note}>
          <Ionicons name="shield-checkmark-outline" size={23} color={palette.brand} />
          <View style={{ flex: 1 }}><Text style={styles.noteTitle}>Ishonchli va tekshirilgan</Text><Text style={styles.noteBody}>Tasdiqlovchi hujjatlar maxfiy saqlanadi. Ommaga faqat siz ruxsat bergan ma’lumotlar chiqariladi.</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { padding: spacing.lg, paddingBottom: 38 },
  intro: { color: palette.inkMuted, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', minHeight: 190, padding: 16, borderRadius: radii.lg, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, ...shadow },
  icon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { color: palette.ink, fontSize: 17, fontWeight: '800', marginTop: 15 },
  body: { color: palette.inkMuted, fontSize: 12, lineHeight: 17, marginTop: 5 },
  arrow: { position: 'absolute', right: 14, bottom: 14, width: 31, height: 31, borderRadius: 11, backgroundColor: palette.brandSoft, alignItems: 'center', justifyContent: 'center' },
  note: { marginTop: spacing.lg, padding: 17, borderRadius: radii.lg, backgroundColor: palette.brandSoft, flexDirection: 'row', gap: 12 },
  noteTitle: { color: palette.brandDeep, fontSize: 14, fontWeight: '800' },
  noteBody: { color: '#376553', fontSize: 12, lineHeight: 18, marginTop: 4 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
