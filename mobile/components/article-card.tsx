import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radii, shadow, spacing } from '@/lib/theme';
import type { Article } from '@/lib/types';

export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  const category = article.category?.split(';').filter(Boolean)[0] || 'Bunyodkor';
  return (
    <Pressable
      onPress={() => router.push(`/article/${article.slug}`)}
      style={({ pressed }) => [styles.card, compact && styles.compactCard, pressed && styles.pressed]}
    >
      <View style={[styles.imageWrap, compact && styles.compactImage]}>
        {article.image_url ? (
          <Image source={{ uri: article.thumb_image_url || article.image_url }} contentFit="cover" transition={250} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={styles.placeholder}><Ionicons name="person" size={28} color={palette.brand} /></View>
        )}
        <View style={styles.verified}><Ionicons name="checkmark" size={11} color="#fff" /></View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.category} numberOfLines={1}>{category}</Text>
        <Text style={[styles.name, compact && styles.compactName]} numberOfLines={2}>{article.title}</Text>
        {!compact ? <Text style={styles.description} numberOfLines={2}>{article.description || 'O‘zbekiston bunyodkor yoshlari vakili'}</Text> : null}
        <View style={styles.meta}>
          <Ionicons name="sparkles-outline" size={14} color={palette.gold} />
          <Text style={styles.metaText}>Tasdiqlangan profil</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: 12, borderWidth: 1, borderColor: palette.line, flexDirection: 'row', gap: 14, ...shadow },
  compactCard: { width: 270 },
  imageWrap: { width: 104, height: 126, borderRadius: 18, overflow: 'hidden', backgroundColor: palette.brandSoft },
  compactImage: { width: 84, height: 104 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  verified: { position: 'absolute', right: 7, bottom: 7, width: 22, height: 22, borderRadius: 11, backgroundColor: palette.brand, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, justifyContent: 'center', minWidth: 0 },
  category: { color: palette.brand, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.55 },
  name: { color: palette.ink, fontSize: 17, lineHeight: 21, fontWeight: '800', marginTop: 4 },
  compactName: { fontSize: 15, lineHeight: 19 },
  description: { color: palette.inkMuted, fontSize: 13, lineHeight: 18, marginTop: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 9 },
  metaText: { color: palette.inkMuted, fontSize: 11, fontWeight: '600' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
});
