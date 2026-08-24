import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/lib/theme';

export function LoadingScreen({ label = 'Yuklanmoqda…' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.mark}><Text style={styles.markText}>B</Text></View>
      <ActivityIndicator color={palette.brand} style={styles.spinner} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 74, height: 74, borderRadius: 24, backgroundColor: palette.brand, alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#fff', fontSize: 38, fontWeight: '900' },
  spinner: { marginTop: 22 },
  label: { marginTop: 10, color: palette.inkMuted, fontSize: 14, fontWeight: '600' },
});
