import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Card, IconButton, PrimaryButton, ScreenHeader, SectionTitle } from '@/components/ui';
import { palette, radii, spacing } from '@/lib/theme';
import { useSession } from '@/providers/session-provider';

const menu = [
  ['person-outline', 'Profil ma’lumotlari'], ['trophy-outline', 'Yutuqlarim'], ['folder-open-outline', 'Ijodiy ishlarim'],
  ['time-outline', 'Hayot yo‘lim'], ['star-outline', 'Ballar va reyting'], ['shield-checkmark-outline', 'Xavfsizlik'],
] as const;

export default function ProfileScreen() {
  const { session, signOut } = useSession();
  if (!session) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.guest}>
          <View style={styles.guestMark}><Ionicons name="person-outline" size={38} color={palette.brand} /></View>
          <Text style={styles.guestTitle}>Raqamli profilingizni yarating</Text>
          <Text style={styles.guestBody}>Yutuqlaringiz, ijodingiz va hayot yo‘lingizni xavfsiz saqlash uchun tizimga kiring.</Text>
          <View style={styles.button}><PrimaryButton label="Kirish yoki ro‘yxatdan o‘tish" icon="arrow-forward" onPress={() => router.push('/auth')} /></View>
        </View>
      </SafeAreaView>
    );
  }

  const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Bunyodkor';
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Profil" action={<IconButton name="settings-outline" />} />
        <View style={styles.identity}>
          <Avatar name={name} uri={session.user.user_metadata?.avatar_url} size={86} />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{session.user.email}</Text>
          <View style={styles.status}><Ionicons name="shield-checkmark" size={14} color={palette.brand} /><Text style={styles.statusText}>Tekshiruvga tayyorlanmoqda</Text></View>
        </View>
        <Card>
          <View style={styles.progressHeader}><Text style={styles.progressTitle}>Profil to‘liqligi</Text><Text style={styles.progressValue}>35%</Text></View>
          <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
          <Text style={styles.progressBody}>Profilingizni to‘ldiring va tasdiqlangan bunyodkor belgisini oling.</Text>
        </Card>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Yutuq</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Asar</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Ball</Text></View>
        </View>
        <SectionTitle title="Mening raqamli tarixim" />
        <View style={styles.menu}>
          {menu.map(([icon, label]) => <Pressable key={label} style={styles.menuRow}><View style={styles.menuIcon}><Ionicons name={icon} size={20} color={palette.brand} /></View><Text style={styles.menuText}>{label}</Text><Ionicons name="chevron-forward" size={18} color="#A1AAA5" /></Pressable>)}
        </View>
        <Pressable onPress={() => void signOut()} style={styles.logout}><Ionicons name="log-out-outline" size={20} color={palette.danger} /><Text style={styles.logoutText}>Hisobdan chiqish</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background }, content: { padding: spacing.lg, paddingBottom: 42 },
  guest: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' }, guestMark: { width: 82, height: 82, borderRadius: 28, backgroundColor: palette.brandSoft, alignItems: 'center', justifyContent: 'center' },
  guestTitle: { color: palette.ink, fontSize: 25, fontWeight: '900', letterSpacing: -0.6, textAlign: 'center', marginTop: 22 }, guestBody: { color: palette.inkMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10 }, button: { width: '100%', marginTop: 25 },
  identity: { alignItems: 'center', paddingVertical: 24 }, name: { color: palette.ink, fontSize: 23, fontWeight: '900', marginTop: 13 }, email: { color: palette.inkMuted, fontSize: 13, marginTop: 4 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: palette.brandSoft, paddingHorizontal: 11, paddingVertical: 7, borderRadius: radii.pill, marginTop: 12 }, statusText: { color: palette.brandDeep, fontSize: 11, fontWeight: '800' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' }, progressTitle: { color: palette.ink, fontSize: 14, fontWeight: '800' }, progressValue: { color: palette.brand, fontSize: 14, fontWeight: '900' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#EAF0EC', marginTop: 12, overflow: 'hidden' }, progressFill: { width: '35%', height: '100%', backgroundColor: palette.brand, borderRadius: 4 }, progressBody: { color: palette.inkMuted, fontSize: 12, lineHeight: 17, marginTop: 10 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 12 }, stat: { flex: 1, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 17, paddingVertical: 14, alignItems: 'center' }, statValue: { color: palette.ink, fontSize: 20, fontWeight: '900' }, statLabel: { color: palette.inkMuted, fontSize: 11, marginTop: 3 },
  menu: { backgroundColor: palette.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.line, overflow: 'hidden' }, menuRow: { minHeight: 59, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line }, menuIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: palette.brandSoft, alignItems: 'center', justifyContent: 'center' }, menuText: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: '700' },
  logout: { height: 52, marginTop: 16, borderRadius: 16, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, logoutText: { color: palette.danger, fontWeight: '800' },
});
