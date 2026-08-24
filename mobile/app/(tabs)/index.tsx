import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArticleCard } from '@/components/article-card';
import { EmptyState, IconButton, ScreenHeader, SectionTitle } from '@/components/ui';
import { getPublishedArticleCount, getPublishedArticles } from '@/lib/articles';
import { palette, radii, shadow, spacing } from '@/lib/theme';
import type { Article } from '@/lib/types';

export default function HomeScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidateCount, setCandidateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [nextArticles, nextCount] = await Promise.all([getPublishedArticles(12), getPublishedArticleCount()]);
      setArticles(nextArticles);
      setCandidateCount(nextCount);
    }
    catch { setError('Ma’lumotlarni yuklab bo‘lmadi. Internetni tekshiring.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { setLoading(true); void load(); }} tintColor={palette.brand} />}
        contentContainerStyle={styles.content}
      >
        <ScreenHeader eyebrow="O‘zbekiston bunyodkorlari" title="Assalomu alaykum" action={<IconButton name="notifications-outline" badge />} />

        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroIcon}><Ionicons name="sparkles" size={22} color="#FFF1B6" /></View>
          <Text style={styles.heroTitle}>Hayotingiz — tarix. Yutuqlaringiz — meros.</Text>
          <Text style={styles.heroBody}>Yangi yutuq, ijodiy ish yoki hayotingizdagi muhim voqeani raqamli tarixingizga qo‘shing.</Text>
          <Pressable onPress={() => router.push('/compose')} style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}>
            <Ionicons name="add" size={20} color={palette.brandDeep} />
            <Text style={styles.heroButtonText}>Yangi ma’lumot qo‘shish</Text>
          </Pressable>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metric}><Text style={styles.metricValue}>{candidateCount || '—'}</Text><Text style={styles.metricLabel}>Bunyodkor</Text></View>
          <View style={styles.divider} />
          <View style={styles.metric}><Text style={styles.metricValue}>100</Text><Text style={styles.metricLabel}>Reyting</Text></View>
          <View style={styles.divider} />
          <View style={styles.metric}><Text style={styles.metricValue}>14</Text><Text style={styles.metricLabel}>Yo‘nalish</Text></View>
        </View>

        <SectionTitle title="Yangi bunyodkorlar" action={<Pressable onPress={() => router.push('/discover')}><Text style={styles.link}>Barchasi</Text></Pressable>} />
        {error ? <EmptyState icon="cloud-offline-outline" title="Aloqa uzildi" body={error} /> : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
            {articles.slice(0, 7).map((article) => <ArticleCard key={article.id} article={article} compact />)}
          </ScrollView>
        )}

        <SectionTitle title="Siz uchun imkoniyatlar" />
        <View style={styles.opportunity}>
          <View style={styles.opportunityIcon}><Ionicons name="rocket-outline" size={24} color={palette.brand} /></View>
          <View style={styles.opportunityCopy}>
            <Text style={styles.opportunityTitle}>Profilingizni 100% to‘ldiring</Text>
            <Text style={styles.opportunityBody}>Tasdiqlashga yuboring va ilk Bunyodkor nishonini oling.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={palette.inkMuted} />
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { padding: spacing.lg, paddingBottom: 30 },
  hero: { marginTop: spacing.lg, borderRadius: radii.xl, padding: 24, minHeight: 270, overflow: 'hidden', ...shadow },
  heroGlow: { position: 'absolute', width: 230, height: 230, borderRadius: 115, right: -70, top: -95, backgroundColor: 'rgba(255,255,255,0.10)' },
  heroIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: '#fff', fontSize: 25, lineHeight: 31, fontWeight: '900', letterSpacing: -0.7, marginTop: 19, maxWidth: 310 },
  heroBody: { color: 'rgba(255,255,255,0.77)', fontSize: 14, lineHeight: 20, marginTop: 9, maxWidth: 320 },
  heroButton: { height: 49, alignSelf: 'flex-start', borderRadius: 16, backgroundColor: '#fff', paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 19 },
  heroButtonText: { color: palette.brandDeep, fontSize: 14, fontWeight: '800' },
  metrics: { marginTop: 14, paddingVertical: 16, paddingHorizontal: 8, borderRadius: radii.lg, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, flexDirection: 'row', alignItems: 'center' },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { color: palette.ink, fontSize: 20, fontWeight: '900' },
  metricLabel: { color: palette.inkMuted, fontSize: 11, fontWeight: '600', marginTop: 3 },
  divider: { width: 1, height: 31, backgroundColor: palette.line },
  link: { color: palette.brand, fontSize: 14, fontWeight: '800' },
  horizontal: { gap: 12, paddingBottom: 8 },
  opportunity: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: palette.surface, borderRadius: radii.lg, padding: 15, borderWidth: 1, borderColor: palette.line },
  opportunityIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: palette.brandSoft, alignItems: 'center', justifyContent: 'center' },
  opportunityCopy: { flex: 1 },
  opportunityTitle: { color: palette.ink, fontSize: 15, fontWeight: '800' },
  opportunityBody: { color: palette.inkMuted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
