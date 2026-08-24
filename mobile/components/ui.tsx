import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { palette, radii, shadow, spacing } from '@/lib/theme';

export function ScreenHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function IconButton({
  name,
  onPress,
  badge,
}: {
  name: ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  badge?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        void Haptics.selectionAsync();
        onPress?.();
      }}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      <Ionicons name={name} size={21} color={palette.ink} />
      {badge ? <View style={styles.badge} /> : null}
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.primaryButton,
        (disabled || loading) && styles.buttonDisabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : icon ? <Ionicons name={icon} size={19} color="#fff" /> : null}
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function SearchField(props: TextInputProps) {
  return (
    <View style={styles.searchWrap}>
      <Ionicons name="search" size={20} color={palette.inkMuted} />
      <TextInput
        placeholderTextColor="#87928C"
        selectionColor={palette.brand}
        returnKeyType="search"
        style={styles.searchInput}
        {...props}
      />
      {props.value ? (
        <Pressable onPress={() => props.onChangeText?.('')} hitSlop={10}>
          <Ionicons name="close-circle" size={19} color="#A4AEA8" />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Avatar({ uri, name, size = 52 }: { uri?: string | null; name: string; size?: number }) {
  if (uri) {
    return <Image source={{ uri }} contentFit="cover" transition={220} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{name.trim().charAt(0).toUpperCase()}</Text>
    </View>
  );
}

export function EmptyState({ icon, title, body }: { icon: ComponentProps<typeof Ionicons>['name']; title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}><Ionicons name={icon} size={28} color={palette.brand} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  headerCopy: { flex: 1 },
  eyebrow: { color: palette.brand, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  title: { color: palette.ink, fontSize: 34, lineHeight: 39, fontWeight: '800', letterSpacing: -1.2 },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: palette.ink, fontSize: 21, fontWeight: '800', letterSpacing: -0.45 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.line, ...shadow },
  badge: { position: 'absolute', right: 8, top: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5A52', borderWidth: 1.5, borderColor: '#fff' },
  primaryButton: { height: 54, borderRadius: 18, backgroundColor: palette.brand, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 22 },
  primaryLabel: { color: '#fff', fontSize: 16, fontWeight: '800' },
  buttonDisabled: { opacity: 0.55 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  searchWrap: { height: 52, borderRadius: 17, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, height: '100%', fontSize: 16, color: palette.ink },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: palette.brandSoft },
  avatarText: { color: palette.brandDeep, fontWeight: '800' },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: palette.brandSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: palette.ink, textAlign: 'center' },
  emptyBody: { color: palette.inkMuted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 7 },
  card: { backgroundColor: palette.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.line, padding: spacing.md, ...shadow },
});
