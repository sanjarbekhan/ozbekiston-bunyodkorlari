import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Card, IconButton, ScreenHeader, SectionTitle } from '@/components/ui';
import { palette, radii, spacing } from '@/lib/theme';

const groups = [
  { icon: 'code-slash', title: 'IT va innovatsiyalar', members: '1 240 a’zo', color: '#E4F0FF', ink: '#316BA4' },
  { icon: 'book', title: 'Yosh ijodkorlar', members: '864 a’zo', color: '#F2E9FF', ink: '#7A55B7' },
  { icon: 'rocket', title: 'Startup asoschilari', members: '532 a’zo', color: '#E2F5EB', ink: '#16734E' },
];

export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="Birgalikda rivojlanamiz" title="Hamjamiyat" action={<IconButton name="chatbubbles-outline" badge />} />
        <View style={styles.networkCard}>
          <View style={styles.avatarStack}>
            {['R', 'D', 'M'].map((name, index) => <View key={name} style={{ marginLeft: index ? -11 : 0, zIndex: 4 - index }}><Avatar name={name} size={43} /></View>)}
          </View>
          <Text style={styles.networkTitle}>Professional aloqalaringizni kengaytiring</Text>
          <Text style={styles.networkBody}>Yo‘nalishingizdagi bunyodkorlar bilan tanishing, tajriba almashing va yangi jamoa tuzing.</Text>
        </View>

        <SectionTitle title="Sizga mos guruhlar" />
        <View style={styles.list}>
          {groups.map((group) => (
            <Card key={group.title}>
              <View style={styles.row}>
                <View style={[styles.groupIcon, { backgroundColor: group.color }]}><Ionicons name={group.icon as never} size={23} color={group.ink} /></View>
                <View style={{ flex: 1 }}><Text style={styles.groupTitle}>{group.title}</Text><Text style={styles.groupMeta}>{group.members}</Text></View>
                <View style={styles.join}><Text style={styles.joinText}>Qo‘shilish</Text></View>
              </View>
            </Card>
          ))}
        </View>

        <SectionTitle title="Yangi tanishuvlar" />
        <Card>
          <View style={styles.row}><Avatar name="Maftuna" size={50} /><View style={{ flex: 1 }}><Text style={styles.groupTitle}>Maftuna Raximjonova</Text><Text style={styles.groupMeta}>Ta’lim • Tashkilotchilik</Text></View><Ionicons name="person-add-outline" size={21} color={palette.brand} /></View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background }, content: { padding: spacing.lg, paddingBottom: 40 },
  networkCard: { marginTop: spacing.lg, borderRadius: radii.xl, backgroundColor: palette.ink, padding: 23 },
  avatarStack: { flexDirection: 'row', marginBottom: 20 },
  networkTitle: { color: '#fff', fontSize: 22, lineHeight: 27, fontWeight: '900', letterSpacing: -0.45 },
  networkBody: { color: 'rgba(255,255,255,0.68)', fontSize: 13, lineHeight: 19, marginTop: 8 },
  list: { gap: 10 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  groupIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  groupTitle: { color: palette.ink, fontSize: 14, fontWeight: '800' }, groupMeta: { color: palette.inkMuted, fontSize: 12, marginTop: 4 },
  join: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 11, backgroundColor: palette.brandSoft }, joinText: { color: palette.brandDeep, fontSize: 11, fontWeight: '800' },
});
