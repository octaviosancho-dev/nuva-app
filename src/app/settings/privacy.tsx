import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackButton, CrestHeader, GrainOverlay } from '@/components/ui';
import { space, type as typeStyles } from '@/constants/tokens';
import { PRIVACY_SECTIONS, PRIVACY_UPDATED } from '@/content/privacy';
import { useTheme } from '@/lib/theme';

/**
 * The privacy policy, in the app. There is no artboard for it; it follows the
 * Settings header and sets the text in `body`, not `bodyLG` — that style
 * belongs to the daily insight alone.
 *
 * No entrance animation: this is a document to read, and it is simply there.
 */
export default function PrivacyScreen() {
  const { c } = useTheme();

  const leave = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/settings');
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={187} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            <BackButton onPress={leave} />
            <Text style={[typeStyles.displayMD, styles.title, { color: c.textOnNight }]}>
              Privacy
            </Text>
          </View>
          <Text style={[typeStyles.bodySM, { color: c.textOnNightMuted }]}>
            Updated {PRIVACY_UPDATED}
          </Text>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body}>
        {PRIVACY_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text accessibilityRole="header" style={[typeStyles.labelLG, { color: c.textPrimary }]}>
              {section.title}
            </Text>
            {section.paragraphs.map((p) => (
              <Text key={p.slice(0, 32)} style={[typeStyles.body, { color: c.textSecondary }]}>
                {p}
              </Text>
            ))}
          </View>
        ))}
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
    marginBottom: 10,
  },
  title: {
    flex: 1,
  },
  body: {
    paddingTop: 22,
    paddingHorizontal: space.space6,
    paddingBottom: space.space10,
    gap: space.space6,
  },
  section: {
    gap: space.space2,
  },
});
