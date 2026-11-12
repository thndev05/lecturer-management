import { useRef, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { createImageUploadBody } from '../lib/image-upload';
import { useAuth } from '../lib/auth';
import { errorText } from '../lib/api';
import { validClassCount, type Lecturer } from '../lib/data';
import {
  Avatar,
  Button,
  Card,
  ErrorMessage,
  Field,
  Heading,
  Label,
  Page,
  styles,
} from '../components/ui';

export default function LecturerForm({ initial }: { initial?: Lecturer }) {
  const { t } = useTranslation();
  const { api } = useAuth();
  const cache = useQueryClient();
  const [id, setId] = useState(initial?.IDGV ?? '');
  const [name, setName] = useState(initial?.Fullname ?? '');
  const [classes, setClasses] = useState(String(initial?.SumClass ?? 0));
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [invalid, setInvalid] = useState(false);
  async function choosePhoto() {
    setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled) {
        const file = result.assets[0];
        if (
          (file.fileSize && file.fileSize > 5 * 1024 * 1024) ||
          (file.mimeType && !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimeType))
        )
          return setError(t('photoInvalid'));
        setAsset(file);
      }
    } catch {
      setError(t('permission'));
    }
  }
  async function submit() {
    if (lock.current) return;
    setInvalid(true);
    setError('');
    if (!id.trim() || id.trim().length > 50 || !name.trim() || name.trim().length > 120)
      return setError(t('required'));
    if (!validClassCount(classes)) return setError(t('invalidClasses'));
    if (!asset && !initial?.Image) return setError(t('photoRequired'));
    lock.current = true;
    setBusy(true);
    try {
      let image = initial?.Image ?? '';
      if (asset) {
        // SDK 58 fetch requires a Blob/File, not the legacy { uri, name, type } object.
        const file =
          Platform.OS === 'web'
            ? (asset.file ?? (await (await fetch(asset.uri)).blob()))
            : new File(asset.uri);
        const body = createImageUploadBody(
          file,
          Platform.OS === 'web' ? (asset.fileName ?? 'avatar.jpg') : (file as File).name,
        );
        image = (await api<{ Image: string }>('/uploads/image', { method: 'POST', body })).Image;
      }
      await api(initial ? `/giang-vien/${encodeURIComponent(initial.IDGV)}` : '/giang-vien', {
        method: initial ? 'PATCH' : 'POST',
        body: JSON.stringify({
          IDGV: id.trim(),
          Fullname: name.trim(),
          Image: image,
          SumClass: Number(classes),
        }),
      });
      await cache.invalidateQueries({ queryKey: ['lecturers'] });
      if (initial) cache.removeQueries({ queryKey: ['lecturer', initial.IDGV] });
      router.replace({ pathname: '/lecturer/[id]', params: { id: id.trim() } });
    } catch (err) {
      setError(errorText(err));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Page>
      <Heading title={t(initial ? 'editTitle' : 'add')} subtitle={t('addHint')} />
      <Card style={{ width: '100%', maxWidth: 680, alignSelf: 'center', gap: 22 }}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Label weight="600">{t('photo')}</Label>
          {asset ? (
            <Image
              source={{ uri: asset.uri }}
              style={{ width: 108, height: 108, borderRadius: 28 }}
              accessibilityLabel={t('photo')}
            />
          ) : (
            <Avatar uri={initial?.Image} name={name || '?'} size={108} />
          )}
          <Button
            title={t('choosePhoto')}
            style={{ alignSelf: 'center' }}
            icon="image-outline"
            variant="secondary"
            disabled={busy}
            onPress={() => {
              void choosePhoto();
            }}
          />
          <Label muted size={12}>
            {t('photoHint')}
          </Label>
        </View>
        <Field
          label={t('id')}
          value={id}
          onChangeText={setId}
          autoCapitalize="characters"
          maxLength={50}
          editable={!busy}
          error={invalid && !id.trim() ? t('required') : undefined}
        />
        <Field
          label={t('fullname')}
          value={name}
          onChangeText={setName}
          maxLength={120}
          editable={!busy}
          error={invalid && !name.trim() ? t('required') : undefined}
        />
        <Field
          label={t('classes')}
          value={classes}
          onChangeText={setClasses}
          keyboardType="number-pad"
          editable={!busy}
          maxLength={16}
          error={invalid && !validClassCount(classes) ? t('invalidClasses') : undefined}
        />
        <ErrorMessage message={error} />
        <View style={[styles.row, { flexWrap: 'wrap', justifyContent: 'flex-end' }]}>
          <Button
            title={t('cancel')}
            disabled={busy}
            variant="secondary"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/lecturers'))}
          />
          <Button
            title={t('save')}
            icon="checkmark"
            busy={busy}
            onPress={() => {
              void submit();
            }}
          />
        </View>
      </Card>
    </Page>
  );
}
