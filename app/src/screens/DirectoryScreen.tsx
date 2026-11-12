import { useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLecturers } from '../lib/queries';
import { useAuth } from '../lib/auth';
import { errorText } from '../lib/api';
import { usePreferences } from '../lib/preferences';
import {
  paginateLecturers,
  selectLecturers,
  type ClassFilter,
  type Sort,
  type Lecturer,
} from '../lib/data';
import { exportLecturers } from '../lib/export';
import type { ExportFormat } from '../lib/export-data';
import LecturerRow from '../components/LecturerRow';
import { Button, Card, Empty, ErrorMessage, Field, Heading, Label, styles } from '../components/ui';

export default function DirectoryScreen() {
  const { t } = useTranslation();
  const { colors, language } = usePreferences();
  const { api } = useAuth();
  const query = useLecturers();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ClassFilter>('all');
  const [sort, setSort] = useState<Sort>('code');
  const [page, setPage] = useState(1);
  const list = useRef<FlatList<Lecturer>>(null);
  const [exporting, setExporting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const rows = useMemo(
    () => selectLecturers(query.data ?? [], search, filter, sort, language),
    [query.data, search, filter, sort, language],
  );
  const pagination = paginateLecturers(rows, page);
  function changePage(nextPage: number) {
    setPage(nextPage);
    list.current?.scrollToOffset({ offset: 0, animated: true });
  }
  async function download(format: ExportFormat) {
    if (lock.current) return;
    lock.current = true;
    setExporting(true);
    setError('');
    try {
      await exportLecturers(await api<Lecturer[]>('/giang-vien/export'), format);
      setShowExport(false);
    } catch (err) {
      setError(errorText(err));
    } finally {
      lock.current = false;
      setExporting(false);
    }
  }
  return (
    <>
      <FlatList
        ref={list}
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={[
          styles.page,
          { width: '100%', maxWidth: 1128, alignSelf: 'center', gap: 12 },
        ]}
        data={pagination.items}
        keyExtractor={(item) => item.IDGV}
        renderItem={({ item }) => <LecturerRow lecturer={item} />}
        ListFooterComponent={
          rows.length && !query.isError ? (
            <View
              style={{ gap: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}
            >
              <Label muted size={13}>
                {t('pageRange', {
                  start: pagination.start,
                  end: pagination.end,
                  total: rows.length,
                })}
              </Label>
              <View style={[styles.row, { justifyContent: 'center', flexWrap: 'wrap' }]}>
                <Button
                  title={t('previousPage')}
                  icon="chevron-back"
                  variant="secondary"
                  disabled={pagination.page === 1}
                  onPress={() => changePage(pagination.page - 1)}
                />
                <Label size={13} weight="600">
                  {t('pageNumber', { page: pagination.page, total: pagination.totalPages })}
                </Label>
                <Button
                  title={t('nextPage')}
                  icon="chevron-forward"
                  variant="secondary"
                  disabled={pagination.page === pagination.totalPages}
                  onPress={() => changePage(pagination.page + 1)}
                />
              </View>
            </View>
          ) : undefined
        }
        ListFooterComponentStyle={{ paddingTop: 12 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => {
              void query.refetch();
            }}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: 22, marginBottom: 12 }}>
            <Heading
              title={t('directory')}
              subtitle={t('directoryHint')}
              action={
                <Button title={t('add')} icon="add" onPress={() => router.push('/new-lecturer')} />
              }
            />
            <Field
              label={t('lecturers')}
              placeholder={t('search')}
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setPage(1);
              }}
              maxLength={120}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {(['all', 'zero', 'few', 'many'] as ClassFilter[]).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: value === filter }}
                  onPress={() => {
                    setFilter(value);
                    setPage(1);
                  }}
                  style={{
                    minHeight: 44,
                    justifyContent: 'center',
                    paddingHorizontal: 16,
                    borderRadius: 24,
                    backgroundColor: filter === value ? colors.soft : colors.card,
                    borderWidth: 1,
                    borderColor: filter === value ? colors.primary : colors.border,
                  }}
                >
                  <Label
                    size={13}
                    weight="600"
                    style={{ color: filter === value ? colors.primary : colors.muted }}
                  >
                    {t(value)}
                  </Label>
                </Pressable>
              ))}
            </ScrollView>
            <View style={{ gap: 10 }}>
              <Label muted size={12}>
                {t('sort')}
              </Label>
              <View style={[styles.row, { flexWrap: 'wrap' }]}>
                {(['code', 'name', 'asc', 'desc'] as Sort[]).map((value) => (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: sort === value }}
                    onPress={() => {
                      setSort(value);
                      setPage(1);
                    }}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 9,
                      borderBottomWidth: 2,
                      borderBottomColor: sort === value ? colors.primary : 'transparent',
                    }}
                  >
                    <Label size={12} weight={sort === value ? '700' : '400'}>
                      {t(value)}
                    </Label>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}>
              <Label muted size={13}>
                {t('results', { count: rows.length })}
              </Label>
              <Button
                title={t('export')}
                variant="secondary"
                icon="download-outline"
                busy={exporting}
                onPress={() => {
                  setError('');
                  setShowExport(true);
                }}
              />
            </View>
            <ErrorMessage message={error} />
            {query.isError ? (
              <>
                <ErrorMessage message={errorText(query.error)} />
                <Button
                  title={t('retry')}
                  onPress={() => {
                    void query.refetch();
                  }}
                  variant="secondary"
                />
              </>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          query.isPending ? (
            <Label muted>{t('loading')}</Label>
          ) : query.isError ? undefined : (
            <Empty
              title={t(search || filter !== 'all' ? 'noResults' : 'empty')}
              hint={t(search || filter !== 'all' ? 'noResultsHint' : 'emptyHint')}
            />
          )
        }
      />
      <Modal
        visible={showExport}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!exporting) setShowExport(false);
        }}
      >
        <View
          style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: 24 }}
        >
          <Card style={{ width: '100%', maxWidth: 420, alignSelf: 'center', gap: 16 }}>
            <Label size={22} weight="700">
              {t('export')}
            </Label>
            <Label muted>{t('exportHint')}</Label>
            <Button
              title={t('exportExcel')}
              icon="grid-outline"
              disabled={exporting}
              onPress={() => {
                void download('xlsx');
              }}
            />
            <Button
              title={t('exportJson')}
              icon="code-slash-outline"
              variant="secondary"
              disabled={exporting}
              onPress={() => {
                void download('json');
              }}
            />
            {exporting ? <Label muted>{t('saving')}</Label> : null}
            <ErrorMessage message={error} />
            <Button
              title={t('cancel')}
              variant="secondary"
              disabled={exporting}
              onPress={() => setShowExport(false)}
            />
          </Card>
        </View>
      </Modal>
    </>
  );
}
