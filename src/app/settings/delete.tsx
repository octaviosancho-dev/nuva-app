import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  BackButton,
  Button,
  CrestHeader,
  GrainOverlay,
  TextLink,
  useEntrance,
} from '@/components/ui';
import { space, type as typeStyles } from '@/constants/tokens';
import { deleteMyAccount } from '@/lib/supabase/account';
import { useTheme } from '@/lib/theme';

/**
 * The confirmation for Delete my account. There is no artboard for it; it
 * follows the Settings screen's header and the app's plain register.
 *
 * This screen *is* the confirmation step — reaching it took a deliberate tap on
 * a row that already said "Permanent". It names exactly what goes, says it
 * cannot be undone, and puts the way out ("Keep my account") right under the
 * button. It does not plead, warn in red, or ask her to type anything: she is
 * an adult making a decision about her own data.
 *
 * The button is `secondary`, not `primary`. The ember glow marks the action a
 * screen wants her to take, and this screen does not want anything.
 */
export default function DeleteAccountScreen() {
  const { c } = useTheme();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leave = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/settings');
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteMyAccount();
      // Back to the very start, as a new install would be.
      router.replace('/');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setDeleting(false);
    }
  };

  const lead = useEntrance(0);
  const detail = useEntrance(1);
  const actions = useEntrance(2);

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={168} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            <BackButton onPress={leave} />
            <Text style={[typeStyles.displayMD, styles.title, { color: c.textOnNight }]}>
              Delete my account
            </Text>
          </View>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View style={lead}>
          <Text style={[typeStyles.body, { color: c.textPrimary }]}>
            This deletes your account and everything in it.
          </Text>
        </Animated.View>

        <Animated.View style={detail}>
          <Text style={[typeStyles.body, { color: c.textSecondary }]}>
            Every log and severity, your medications and doses, the insights you have read, the
            sentences you copied, and your answers from the start. It happens now, on our servers,
            and it cannot be undone. No copy is kept.
          </Text>
        </Animated.View>

        <View style={styles.push} />

        <Animated.View style={[styles.actions, actions]}>
          {error ? (
            <Text style={[typeStyles.bodySM, { color: c.clay }]}>{error}</Text>
          ) : null}
          <Button
            label="Delete everything"
            variant="secondary"
            loading={deleting}
            onPress={() => void onDelete()}
          />
          <View style={styles.keep}>
            <TextLink label="Keep my account" onPress={leave} />
          </View>
        </Animated.View>
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
    flexGrow: 1,
    paddingTop: 22,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
    gap: space.space4,
  },
  push: {
    flex: 1,
  },
  actions: {
    gap: space.space4,
  },
  keep: {
    alignItems: 'center',
  },
});
