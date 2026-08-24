import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArticleCard } from '@/components/article-card';
import { EmptyState, ScreenHeader, SearchField } from '@/components/ui';
import { getPublishedArticles, searchPublishedArticles } from '@/lib/articles';
import { palette, radii, spacing } from '@/lib/theme';
import type { Article } from '@/lib/types';

const filters = ['Barchasi', 'Ta’lim', 'IT', 'San’at', 'Sport', 'Volontyorlik'];

export default function DiscoverScreen() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('Barchasi');
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(query.trim() ? await searchPublishedArticles(query) : await getPublishedArticles(80)); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { const id = setTimeout(() => void load(), 250); return () => clearTimeout(id); }, [load]);

  const filtered = useMemo(() => active === 'Barchasi' ? items : items.filter((x) => x.category?.toLocaleLowerCase('uz').includes(active.toLocaleLowerCase('uz'))), [active, items]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ArticleCard article={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <ScreenHeader eyebrow="Iqtidorlar xaritasi" title="Kashf etish" />
            <View style={styles.search}><SearchField value={query} onChangeText={setQuery} placeholder="Ism, soha yoki hudud bo‘yicha…" /></View>
            <FlatList
              horizontal
              data={filters}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
              renderItem={({ item }) => (
                <Pressable onPress={() => setActive(item)} style={[styles.filter, active === item && styles.filterActive]}>
                  {active === item ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                  <Text style={[styles.filterText, active === item && styles.filterTextActive]}>{item}</Text>
                </Pressable>
              )}
            />
            <Text style={styles.result}>{loading ? 'Qidirilmoqda…' : `${filtered.length} ta bunyodkor topildi`}</Text>
          </View>
        }
        ListEmptyComponent={!loading ? <EmptyState icon="search-outline" title="Natija topilmadi" body="Qidiruv so‘zini o‘zgartirib ko‘ring yoki boshqa yo‘nalishni tanlang." /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { padding: spacing.lg, paddingBottom: 34 },
  search: { marginTop: spacing.lg },
  filters: { gap: 8, paddingVertical: 15 },
  filter: { height: 38, paddingHorizontal: 14, borderRadius: radii.pill, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', gap: 5 },
  filterActive: { backgroundColor: palette.brand, borderColor: palette.brand },
  filterText: { color: palette.inkMuted, fontSize: 13, fontWeight: '700' },
  filterTextActive: { color: '#fff' },
  result: { color: palette.inkMuted, fontSize: 13, fontWeight: '600', marginBottom: 12 },
});
