import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import { errorText } from '../lib/api';
import { usePreferences } from '../lib/preferences';
import { Button, Card, ErrorMessage, Field, Icon, Label, Page, styles } from '../components/ui';

export default function AuthScreen() {
  const { t } = useTranslation();
  const { language, setLanguage, colors, isDark, setMode, storageError } = usePreferences();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  async function submit() {
    if (lock.current) return;
    setError('');
    if (!email.trim() || !password) return setError(t('required'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError(t('invalidEmail'));
    lock.current = true;
    setBusy(true);
    try {
      await auth.login(email, password);
      router.replace('/');
    } catch (err) {
      setError(errorText(err));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Page>
      <View
        style={{ width: '100%', maxWidth: 440, alignSelf: 'center', gap: 32, paddingVertical: 32 }}
      >
        <View style={[styles.row, { justifyContent: 'space-between' }]}>
          <View style={[styles.row, { flex: 1, minWidth: 0 }]}>
            <Icon name="school" size={30} />
            <Label weight="700" style={{ flexShrink: 1 }}>
              {t('brand')}
            </Label>
          </View>
          <View style={[styles.row, { gap: 4 }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t('appearance')}: ${t(isDark ? 'light' : 'dark')}`}
              onPress={() => {
                void setMode(isDark ? 'light' : 'dark');
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: colors.soft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={isDark ? 'sunny-outline' : 'moon-outline'} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('language')}
              onPress={() => {
                void setLanguage(language === 'vi' ? 'en' : 'vi');
              }}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Label weight="600">{language === 'vi' ? 'EN' : 'VI'}</Label>
            </Pressable>
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <Label size={32} weight="800">
            {t('loginTitle')}
          </Label>
          <Label muted>{t('loginHint')}</Label>
        </View>
        <Card style={{ gap: 20 }}>
          <Field
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            maxLength={254}
            editable={!busy}
          />
          <Field
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!visible}
            autoCapitalize="none"
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={() => {
              void submit();
            }}
            editable={!busy}
          />
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: visible }}
            accessibilityLabel={t(visible ? 'hidePassword' : 'showPassword')}
            onPress={() => setVisible(!visible)}
            style={[styles.row, { minHeight: 44 }]}
          >
            <Icon name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} />
            <Label size={13}>{t(visible ? 'hidePassword' : 'showPassword')}</Label>
          </Pressable>
          <ErrorMessage message={error || (storageError ? t('storage') : '')} />
          <Button
            title={t(busy ? 'saving' : 'login')}
            busy={busy}
            disabled={!email.trim() || !password}
            style={{ width: '100%', maxWidth: 280, alignSelf: 'center', minHeight: 54 }}
            onPress={() => {
              void submit();
            }}
          />
        </Card>
        <Label muted size={12} style={{ textAlign: 'center' }}>
          {t('authNote')}
        </Label>
      </View>
    </Page>
  );
}
