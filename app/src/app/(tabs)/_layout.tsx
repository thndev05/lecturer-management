import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../../lib/preferences';
import { Icon } from '../../components/ui';
export default function TabLayout() {
  const { colors } = usePreferences();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const sidebar = Platform.OS === 'web' && width >= 900;
  const sidebarWidth = collapsed ? 76 : 220;
  return (
    <Tabs
      screenOptions={{
        headerTitle: t('brand'),
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerLeft: sidebar
          ? () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t(collapsed ? 'expandSidebar' : 'collapseSidebar')}
                accessibilityState={{ expanded: !collapsed }}
                onPress={() => setCollapsed((value) => !value)}
                style={{
                  width: 44,
                  height: 44,
                  marginLeft: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={collapsed ? 'menu-outline' : 'chevron-back-outline'} />
              </Pressable>
            )
          : undefined,
        tabBarPosition: sidebar ? 'left' : 'bottom',
        tabBarShowLabel: !sidebar || !collapsed,
        tabBarLabelPosition: sidebar ? 'beside-icon' : 'below-icon',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarActiveBackgroundColor: colors.soft,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderColor: colors.border,
          ...(sidebar
            ? { width: sidebarWidth, minWidth: sidebarWidth, maxWidth: sidebarWidth, flexShrink: 0 }
            : {}),
        },
        tabBarItemStyle: { minHeight: 56 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('overview'),
          tabBarIcon: ({ color }) => (
            <Icon name="grid-outline" color={typeof color === 'string' ? color : colors.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="lecturers"
        options={{
          title: t('lecturers'),
          tabBarIcon: ({ color }) => (
            <Icon
              name="people-outline"
              color={typeof color === 'string' ? color : colors.primary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t('account'),
          tabBarIcon: ({ color }) => (
            <Icon
              name="person-circle-outline"
              color={typeof color === 'string' ? color : colors.primary}
            />
          ),
        }}
      />
    </Tabs>
  );
}
