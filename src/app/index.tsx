import { Redirect } from 'expo-router';

/** Onboarding is the entry point until auth and the app shell land. */
export default function Index() {
  return <Redirect href="/welcome" />;
}
