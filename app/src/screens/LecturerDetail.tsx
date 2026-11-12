import { useRef, useState } from 'react';
import { Modal, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import { usePreferences } from '../lib/preferences';
import { ApiError, errorText } from '../lib/api';
import type { Lecturer } from '../lib/data';
import {
  Avatar,
  Button,
  Card,
  ErrorMessage,
  Heading,
  Icon,
  Label,
  Loading,
  Page,
  styles,
} from '../components/ui';
import LecturerForm from './LecturerForm';

export default function LecturerDetail({ edit = false }: { edit?: boolean }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { api, token } = useAuth();
  const { t } = useTranslation();
  const { colors } = usePreferences();
  const { width } = useWindowDimensions();
  const narrow = width < 600;
  const cache = useQueryClient();
  const query = useQuery({
    queryKey: ['lecturer', id, token],
    queryFn: () => api<Lecturer>(`/giang-vien/${encodeURIComponent(id)}`),
    retry: (count, error) =>
      !(error instanceof ApiError && [401, 404].includes(error.status)) && count < 1,
  });
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  async function remove() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await api(`/giang-vien/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await cache.invalidateQueries({ queryKey: ['lecturers'] });
      cache.removeQueries({ queryKey: ['lecturer', id] });
      setConfirm(false);
      router.replace('/lecturers');
    } catch (err) {
      setError(errorText(err));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (query.isPending) return <Loading />;
  if (query.isError)
    return (
      <Page>
        <ErrorMessage message={errorText(query.error)} />
        <Button
          title={t('retry')}
          onPress={() => {
            void query.refetch();
          }}
        />
        <Button
          title={t('back')}
          variant="secondary"
          onPress={() => router.replace('/lecturers')}
        />
      </Page>
    );
  const row = query.data;
  if (edit) return <LecturerForm key={row.IDGV} initial={row} />;
  return (
    <Page>
      <Heading title={t('detail')} />
      <Card
        style={{
          width: '100%',
          maxWidth: 760,
          alignSelf: 'center',
          padding: 0,
          gap: 0,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            padding: 28,
            gap: 20,
            backgroundColor: colors.soft,
            flexDirection: narrow ? 'column' : 'row',
            alignItems: 'center',
          }}
        >
          <Avatar uri={row.Image} name={row.Fullname} size={112} />
          <View
            style={{
              flex: narrow ? undefined : 1,
              width: narrow ? '100%' : undefined,
              minWidth: 0,
              gap: 8,
              alignItems: narrow ? 'center' : 'flex-start',
            }}
          >
            <Label muted size={13} weight="600">
              {t('lecturer')}
            </Label>
            <Label size={26} weight="800" style={{ textAlign: narrow ? 'center' : 'left' }}>
              {row.Fullname}
            </Label>
            <View
              style={[
                styles.row,
                {
                  backgroundColor: colors.card,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  maxWidth: '100%',
                },
              ]}
            >
              <Icon name="id-card-outline" size={18} />
              <Label size={13} weight="600" style={{ flexShrink: 1 }}>
                {row.IDGV}
              </Label>
            </View>
          </View>
        </View>
        <View style={{ padding: 24 }}>
          <View
            style={[
              styles.row,
              {
                borderWidth: 1,
                borderColor: colors.border,
                padding: 20,
                backgroundColor: colors.bg,
                borderRadius: 14,
              },
            ]}
          >
            <View style={{ padding: 12, borderRadius: 12, backgroundColor: colors.soft }}>
              <Icon name="library-outline" size={26} />
            </View>
            <View style={{ flex: 1 }}>
              <Label muted size={13}>
                {t('totalClasses')}
              </Label>
              <Label size={30} weight="800">
                {row.SumClass}
              </Label>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.row,
            {
              padding: 24,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            },
          ]}
        >
          <Button
            title={t('remove')}
            icon="trash-outline"
            variant="danger"
            onPress={() => setConfirm(true)}
          />
          <Button
            title={t('edit')}
            icon="create-outline"
            onPress={() => router.push({ pathname: '/lecturer/[id]/edit', params: { id } })}
          />
        </View>
      </Card>
      <Modal
        transparent
        visible={confirm}
        animationType="fade"
        onRequestClose={() => {
          if (!busy) setConfirm(false);
        }}
      >
        <View
          style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: 24 }}
        >
          <Card style={{ maxWidth: 440, width: '100%', alignSelf: 'center' }}>
            <Icon name="alert-circle-outline" color={colors.danger} size={32} />
            <Label size={22} weight="700">
              {t('deleteTitle')}
            </Label>
            <Label muted>{t('deleteHint', { name: row.Fullname, id: row.IDGV })}</Label>
            <ErrorMessage message={error} />
            <Button
              title={t('remove')}
              variant="danger"
              busy={busy}
              onPress={() => {
                void remove();
              }}
            />
            <Button
              title={t('cancel')}
              variant="secondary"
              disabled={busy}
              onPress={() => setConfirm(false)}
            />
          </Card>
        </View>
      </Modal>
    </Page>
  );
}
