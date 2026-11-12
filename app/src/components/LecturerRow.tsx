import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { Lecturer } from '../lib/data';
import { usePreferences } from '../lib/preferences';
import { Avatar, Icon, Label, styles } from './ui';
export default function LecturerRow({ lecturer }: { lecturer: Lecturer }) {
  const { t } = useTranslation();
  const { colors } = usePreferences();
  return (
    <TouchableOpacity
      cssInterop={false}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${lecturer.Fullname}, ${lecturer.IDGV}`}
      onPress={() => router.push({ pathname: '/lecturer/[id]', params: { id: lecturer.IDGV } })}
      style={[
        {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          padding: 16,
          backgroundColor: colors.card,
        },
        styles.row,
      ]}
    >
      <Avatar uri={lecturer.Image} name={lecturer.Fullname} />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <Label weight="700">{lecturer.Fullname}</Label>
        <Label muted size={12}>
          {lecturer.IDGV} · {lecturer.SumClass} {t('classUnit')}
        </Label>
      </View>
      <Icon name="chevron-forward" color={colors.muted} size={18} />
    </TouchableOpacity>
  );
}
