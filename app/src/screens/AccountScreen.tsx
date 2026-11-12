import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import { usePreferences } from '../lib/preferences';
import { errorText } from '../lib/api';
import {
  Avatar,
  Button,
  Card,
  ErrorMessage,
  Heading,
  Icon,
  Label,
  Page,
  styles,
} from '../components/ui';
export default function AccountScreen() {
  const { t } = useTranslation();
  const { admin, logout } = useAuth();
  const prefs = usePreferences();
  const [error, setError] = useState('');
  return (
    <Page>
      <Heading title={t('account')} subtitle={t('preferences')} />
      <Card>
        <View style={styles.row}>
          <Avatar name={admin?.Fullname ?? ''} size={68} />
          <View style={{ flex: 1 }}>
            <Label size={21} weight="700">
              {admin?.Fullname}
            </Label>
            <Label muted>{admin?.Email}</Label>
          </View>
        </View>
        <View style={styles.row}>
          <Icon name="shield-checkmark-outline" size={17} />
          <Label muted size={13}>
            {t('admin')}
          </Label>
        </View>
      </Card>
      <Card>
        <Label weight="700" size={17}>
          {t('language')}
        </Label>
        <View style={[styles.row, { flexWrap: 'wrap' }]}>
          {[
            ['vi', 'Tiếng Việt'],
            ['en', 'English'],
          ].map(([value, label]) => (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ checked: prefs.language === value }}
              onPress={() => {
                void prefs.setLanguage(value);
              }}
              style={[
                styles.button,
                {
                  backgroundColor: prefs.language === value ? prefs.colors.soft : prefs.colors.bg,
                  flex: 1,
                },
              ]}
            >
              <Label
                style={{
                  color: prefs.language === value ? prefs.colors.primary : prefs.colors.text,
                }}
                weight="600"
              >
                {label}
              </Label>
            </Pressable>
          ))}
        </View>
      </Card>
      <Card>
        <Label weight="700" size={17}>
          {t('appearance')}
        </Label>
        <View style={[styles.row, { flexWrap: 'wrap' }]}>
          {(['system', 'light', 'dark'] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ checked: prefs.mode === value }}
              onPress={() => {
                void prefs.setMode(value);
              }}
              style={[
                styles.button,
                {
                  backgroundColor: prefs.mode === value ? prefs.colors.soft : prefs.colors.bg,
                  flexGrow: 1,
                },
              ]}
            >
              <Label
                weight="600"
                style={{ color: prefs.mode === value ? prefs.colors.primary : prefs.colors.text }}
              >
                {t(value)}
              </Label>
            </Pressable>
          ))}
        </View>
      </Card>
      <ErrorMessage message={prefs.storageError ? t('storage') : error} />
      <Button
        title={t('logout')}
        icon="log-out-outline"
        variant="danger"
        onPress={() => {
          void logout().catch((err) => setError(errorText(err)));
        }}
      />
    </Page>
  );
}
