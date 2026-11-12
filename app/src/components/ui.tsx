import type { ReactNode, ComponentProps } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../lib/preferences';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export function Icon({
  name,
  size = 22,
  color,
}: {
  name: IconName;
  size?: number;
  color?: ComponentProps<typeof Ionicons>['color'];
}) {
  const { colors } = usePreferences();
  return <Ionicons name={name} size={size} color={color ?? colors.primary} />;
}
export function Label({
  children,
  muted = false,
  size = 15,
  weight = '400',
  style,
}: {
  children: ReactNode;
  muted?: boolean;
  size?: number;
  weight?: '400' | '500' | '600' | '700' | '800';
  style?: ComponentProps<typeof Text>['style'];
}) {
  const { colors } = usePreferences();
  return (
    <Text
      style={[
        {
          color: muted ? colors.muted : colors.text,
          fontSize: size,
          fontWeight: weight,
          lineHeight: size * 1.45,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  busy = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger';
  busy?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const { colors, isDark } = usePreferences();
  const foreground =
    variant === 'primary'
      ? isDark
        ? '#171329'
        : '#FFFFFF'
      : variant === 'danger'
        ? colors.danger
        : colors.primary;
  return (
    <TouchableOpacity
      cssInterop={false}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={[
        styles.button,
        style,
        {
          backgroundColor: variant === 'primary' ? colors.primary : colors.soft,
          opacity: disabled || busy ? 0.5 : 1,
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={foreground} />
      ) : icon ? (
        <Icon name={icon} color={foreground} size={19} />
      ) : null}
      <Label weight="600" style={{ color: foreground, flexShrink: 1, textAlign: 'center' }}>
        {title}
      </Label>
    </TouchableOpacity>
  );
}
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors } = usePreferences();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
    >
      {children}
    </View>
  );
}
export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const { colors } = usePreferences();
  return (
    <View style={{ gap: 8 }}>
      <Label weight="600" size={13}>
        {label}
      </Label>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.danger : colors.border,
            color: colors.text,
          },
          props.style,
        ]}
      />
      {error ? <ErrorMessage message={error} /> : null}
    </View>
  );
}
export function ErrorMessage({ message }: { message?: string }) {
  const { colors } = usePreferences();
  return message ? (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{ color: colors.danger, fontSize: 14, lineHeight: 21 }}
    >
      {message}
    </Text>
  ) : null;
}
export function Page({
  children,
  refreshControl,
}: {
  children: ReactNode;
  refreshControl?: ComponentProps<typeof ScrollView>['refreshControl'];
}) {
  const { colors } = usePreferences();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        contentContainerStyle={styles.page}
      >
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export function Heading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View
      style={[
        styles.row,
        { justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' },
      ]}
    >
      <View style={{ flex: 1, minWidth: 190, gap: 6 }}>
        <Label size={28} weight="800">
          {title}
        </Label>
        {subtitle ? <Label muted>{subtitle}</Label> : null}
      </View>
      {action}
    </View>
  );
}
export function Avatar({ uri, name, size = 54 }: { uri?: string; name: string; size?: number }) {
  const { colors } = usePreferences();
  return (
    <View
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: size * 0.29,
        backgroundColor: colors.soft,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Label size={size * 0.3} weight="700" style={{ color: colors.primary }}>
        {name
          .trim()
          .split(/\s+/)
          .slice(-2)
          .map((part) => part[0])
          .join('')}
      </Label>
      {uri ? (
        <Image source={{ uri }} accessibilityLabel={name} style={StyleSheet.absoluteFill} />
      ) : null}
    </View>
  );
}
export function Empty({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 44, gap: 12 }}>
      <Icon name="people-outline" size={38} />
      <Label size={18} weight="700">
        {title}
      </Label>
      {hint ? (
        <Label muted style={{ textAlign: 'center' }}>
          {hint}
        </Label>
      ) : null}
      {action}
    </Card>
  );
}
export function Loading() {
  const { t } = useTranslation();
  const { colors } = usePreferences();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: colors.bg,
      }}
    >
      <ActivityIndicator color={colors.primary} />
      <Label muted>{t('loading')}</Label>
    </View>
  );
}
export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  page: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  content: { width: '100%', maxWidth: 1080, alignSelf: 'center', gap: 26 },
  card: { borderWidth: 1, borderRadius: 18, padding: 22, gap: 14 },
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});
