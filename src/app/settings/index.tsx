import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { Trash2, UserRound } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { BackButton, CrestHeader, GrainOverlay, ListRow, useEntrance } from '@/components/ui';
import { space, type as typeStyles } from '@/constants/tokens';
import { fetchAccount, type AccountSummary } from '@/lib/supabase/account';
import { useTheme } from '@/lib/theme';

/** "Nuva 1.0.0 · 14" — the build number only when the native build has one. */
function versionLine(): string {
  const config = Constants.expoConfig;
  const build = config?.ios?.buildNumber ?? config?.android?.versionCode;
  return `Nuva ${config?.version ?? ''}${build ? ` · ${build}` : ''}`.trim();
}

/**
 * Settings, from `design/screens/Settings.dc.html`.
 *
 * Only what works today is here. The artboard also has Subscription (lands
 * with RevenueCat, milestone 5), the push and email toggles (notifications,
 * milestone 12), Export everything (the Health Report, milestone 11) and the
 * privacy policy (needs a hosted document). A toggle that changes nothing, or
 * a row that opens nothing, is a small lie — each joins when it is true.
 *
 * Delete my account is built in full, because it is the one control here that
 * has to work from the first release: she must always be able to take
 * everything back.
 */
export default function SettingsScreen() {
  const { c } = useTheme();
  const [account, setAccount] = useState<AccountSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void fetchAccount()
        .then((a) => {
          if (!cancelled) setAccount(a);
        })
        .catch(() => {
          if (!cancelled) setAccount({ email: null, provider: null, anonymous: true });
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const leave = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/you');
    }
  };

  const accountRow = useEntrance(0, account !== null);
  const dataRow = useEntrance(1, account !== null);

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={168} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            <BackButton onPress={leave} />
            <Text style={[typeStyles.displayMD, styles.title, { color: c.textOnNight }]}>
              Settings
            </Text>
          </View>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={[typeStyles.eyebrow, styles.section, { color: c.textTertiary }]}>ACCOUNT</Text>
        <Animated.View style={accountRow}>
          <ListRow
            icon={UserRound}
            tint={c.sand}
            title={account?.email ?? 'Guest account'}
            subtitle={
              !account
                ? ' '
                : account.anonymous
                  ? 'Your data is tied to this phone for now'
                  : `Signed in with ${account.provider ?? 'your account'}`
            }
          />
        </Animated.View>

        <Text style={[typeStyles.eyebrow, styles.section, { color: c.textTertiary }]}>
          YOUR DATA
        </Text>
        <Animated.View style={dataRow}>
          <ListRow
            icon={Trash2}
            tint={c.claySoft}
            title="Delete my account"
            subtitle="Permanent, including every log"
            onPress={() => router.push('/settings/delete')}
          />
        </Animated.View>

        <Text style={[typeStyles.caption, styles.version, { color: c.textTertiary }]}>
          {versionLine()}
        </Text>
      </ScrollView>

      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerInner: {
    flex: 1,
    paddingTop: 58,
    paddingHorizontal: space.space6,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
  },
  title: {
    flex: 1,
  },
  body: {
    paddingTop: space.space2,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
    gap: space.space3,
  },
  section: {
    // The artboard's 18px above and -2px below, inside a 12px gap.
    marginTop: 18,
    marginBottom: -2,
  },
  version: {
    marginTop: 14,
    textAlign: 'center',
  },
});
