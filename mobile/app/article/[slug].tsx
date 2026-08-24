import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingScreen } from '@/components/loading-screen';
import { EmptyState } from '@/components/ui';
import { getArticle } from '@/lib/articles';
import { palette, radii, shadow, spacing } from '@/lib/theme';
import type { Article } from '@/lib/types';

function plainText(value: string | null) {
  return (value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (slug) getArticle(slug).then(setArticle).finally(() => setLoading(false)); }, [slug]);
  const content = useMemo(() => plainText(article?.content || article?.description || null), [article]);

  if (loading) return <LoadingScreen label="Bunyodkor profili ochilmoqda…" />;
  if (!article) return <SafeAreaView style={styles.safe}><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={24} color={palette.ink} /></Pressable><EmptyState icon="person-outline" title="Profil topilmadi" body="Ushbu profil mavjud emas yoki vaqtincha yashirilgan." /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} style={styles.navButton}><Ionicons name="chevron-back" size={23} color={palette.ink} /></Pressable>
          <View style={{ flexDirection: 'row', gap: 9 }}><Pressable onPress={() => void Share.share({ message: `https://www.bunyodkor.com/bunyodkorlar/${article.slug}` })} style={styles.navButton}><Ionicons name="share-outline" size={21} color={palette.ink} /></Pressable><Pressable style={styles.navButton}><Ionicons name="bookmark-outline" size={21} color={palette.ink} /></Pressable></View>
        </View>
        <View style={styles.hero}>
          {article.image_url ? <Image source={{ uri: article.image_url }} contentFit="cover" transition={250} style={StyleSheet.absoluteFill} /> : null}
          <View style={styles.fade} />
        </View>
        <View style={styles.sheet}>
          <View style={styles.badge}><Ionicons name="shield-checkmark" size={15} color={palette.brand} /><Text style={styles.badgeText}>Tasdiqlangan bunyodkor</Text></View>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.category}>{article.category?.split(';').filter(Boolean).join(' • ') || 'O‘zbekiston bunyodkorlari'}</Text>
          <View style={styles.metrics}>
            <View style={styles.metric}><Text style={styles.metricValue}>100</Text><Text style={styles.metricLabel}>Reyting</Text></View>
            <View style={styles.metric}><Text style={styles.metricValue}>{article.view_count || 0}</Text><Text style={styles.metricLabel}>Ko‘rishlar</Text></View>
            <View style={styles.metric}><Text style={styles.metricValue}>—</Text><Text style={styles.metricLabel}>Yutuqlar</Text></View>
          </View>
          <Text style={styles.section}>Biografiya</Text>
          <Text style={styles.body}>{content || 'Biografik ma’lumot tayyorlanmoqda.'}</Text>
          <View style={styles.timelineCard}><View style={styles.timelineIcon}><Ionicons name="time-outline" size={22} color={palette.brand} /></View><View style={{ flex: 1 }}><Text style={styles.timelineTitle}>Hayot yo‘li</Text><Text style={styles.timelineBody}>Ta’lim, faoliyat va muhim yutuqlar vaqt chizig‘ida jamlanadi.</Text></View><Ionicons name="chevron-forward" size={19} color={palette.inkMuted} /></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background }, nav: { height: 60, paddingHorizontal: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', zIndex: 5, left: 0, right: 0, top: 0 }, navButton: { width: 43, height: 43, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center', ...shadow }, back: { width: 43, height: 43, borderRadius: 22, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', margin: spacing.lg },
  hero: { height: 420, backgroundColor: palette.brandSoft }, fade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(3,22,15,0.08)' },
  sheet: { marginTop: -36, backgroundColor: palette.background, borderTopLeftRadius: 34, borderTopRightRadius: 34, padding: spacing.lg, minHeight: 500 }, badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: palette.brandSoft, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radii.pill }, badgeText: { color: palette.brandDeep, fontSize: 11, fontWeight: '800' },
  title: { color: palette.ink, fontSize: 29, lineHeight: 35, fontWeight: '900', letterSpacing: -0.9, marginTop: 14 }, category: { color: palette.inkMuted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  metrics: { flexDirection: 'row', gap: 10, marginTop: 19 }, metric: { flex: 1, paddingVertical: 13, alignItems: 'center', borderRadius: 17, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line }, metricValue: { color: palette.ink, fontSize: 18, fontWeight: '900' }, metricLabel: { color: palette.inkMuted, fontSize: 10, marginTop: 3 },
  section: { color: palette.ink, fontSize: 21, fontWeight: '900', marginTop: 26, marginBottom: 10 }, body: { color: '#3C4B44', fontSize: 15, lineHeight: 25 },
  timelineCard: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.lg, padding: 15, marginTop: 22, marginBottom: 30 }, timelineIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: palette.brandSoft, alignItems: 'center', justifyContent: 'center' }, timelineTitle: { color: palette.ink, fontSize: 14, fontWeight: '800' }, timelineBody: { color: palette.inkMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
});
