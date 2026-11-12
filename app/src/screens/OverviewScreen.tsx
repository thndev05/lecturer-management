import { View, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import { useLecturers } from '../lib/queries';
import { usePreferences } from '../lib/preferences';
import { errorText } from '../lib/api';
import LecturerRow from '../components/LecturerRow';
import {
  Button,
  Card,
  Empty,
  ErrorMessage,
  Heading,
  Icon,
  Label,
  Page,
  styles,
  type IconName,
} from '../components/ui';
export default function OverviewScreen() {
  const { t } = useTranslation();
  const { colors } = usePreferences();
  const { admin } = useAuth();
  const query = useLecturers();
  const rows = query.data ?? [];
  const total = rows.reduce((sum, row) => sum + row.SumClass, 0);
  const metrics: { title: string; value: string; icon: IconName }[] = [
    { title: 'totalLecturers', value: String(rows.length), icon: 'people-outline' },
    { title: 'totalClasses', value: String(total), icon: 'library-outline' },
    {
      title: 'average',
      value: rows.length ? (total / rows.length).toFixed(1) : '0',
      icon: 'stats-chart-outline',
    },
  ];
  return (
    <Page
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching}
          onRefresh={() => {
            void query.refetch();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <Heading title={`${t('hello')}, ${admin?.Fullname ?? ''}`} subtitle={t('intro')} />
      <View style={[styles.row, { flexWrap: 'wrap', alignItems: 'stretch' }]}>
        {metrics.map((metric) => (
          <Card key={metric.title} style={{ flex: 1, minWidth: 140, gap: 12 }}>
            <View
              style={{
                backgroundColor: colors.soft,
                width: 44,
                height: 44,
                borderRadius: 13,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={metric.icon} />
            </View>
            <Label muted size={13}>
              {t(metric.title)}
            </Label>
            <Label size={32} weight="800">
              {query.isPending || query.isError ? '—' : metric.value}
            </Label>
          </Card>
        ))}
      </View>
      {query.isError ? (
        <>
          <ErrorMessage message={errorText(query.error)} />
          <Button
            title={t('retry')}
            onPress={() => {
              void query.refetch();
            }}
          />
        </>
      ) : null}
      <Card style={{ backgroundColor: colors.soft }}>
        <Icon name="school-outline" size={32} />
        <Label size={20} weight="700">
          {t('quick')}
        </Label>
        <Label muted>{t('directoryHint')}</Label>
        <Button
          title={t('add')}
          icon="add"
          style={{ alignSelf: 'flex-start' }}
          onPress={() => router.push('/new-lecturer')}
        />
      </Card>
      <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}>
        <Label size={20} weight="700">
          {t('lecturers')}
        </Label>
        <Button
          title={t('viewAll')}
          variant="secondary"
          onPress={() => router.push('/lecturers')}
        />
      </View>
      {query.isPending ? (
        <Label muted>{t('loading')}</Label>
      ) : rows.length ? (
        rows.slice(0, 4).map((row) => <LecturerRow key={row.IDGV} lecturer={row} />)
      ) : !query.isError ? (
        <Empty title={t('empty')} hint={t('emptyHint')} />
      ) : null}
    </Page>
  );
}
