/**
 * The privacy policy, as the app shows it.
 *
 * Written from what the code actually does, file by file, and nothing else:
 * every claim below can be checked against `src/lib` and the migrations. When
 * a new service is wired in — RevenueCat, PostHog, Resend, Apple or Google
 * sign-in — this changes in the same pull request, before it ships.
 *
 * App Store Connect also needs this at a public URL. The same sections are
 * published to GitHub Pages by `scripts/build-site.mjs` and
 * `.github/workflows/pages.yml`:
 * https://octaviosancho-dev.github.io/nuva-app/privacy/
 */

export const PRIVACY_UPDATED = '26 September 2026';

export interface PrivacySection {
  title: string;
  paragraphs: string[];
}

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: 'The short version',
    paragraphs: [
      'Nuva stores what you log so it can show it back to you. Your log can only be read by your account. We do not sell your data, we do not share it with advertisers, and we do not use it to train AI models. You can delete all of it from Settings, at any time, in one step.',
    ],
  },
  {
    title: 'What we store',
    paragraphs: [
      'Your answers to the six setup questions. The symptoms you log, with their severity and date. The medications you add, with the dose, form, reminder hour and any notes you write, and the days you mark a dose as taken. Which insights you have read, and how many times you have copied your sentences in Find your words. Your timezone and the hour you chose for your daily check-in.',
      'Your account starts without a name or an email address: the app creates an anonymous identifier the first time it opens, and everything you log belongs to it.',
    ],
  },
  {
    title: 'Where it lives',
    paragraphs: [
      'Your data is kept in a database run by Supabase, our database provider. Every table that holds your data is locked so that only your account can read or change its own rows.',
      'Some things stay on your phone and are never sent anywhere: a copy of your setup answers, your notification preferences, the reminders your phone schedules, and the Health report PDF and CSV export, which are built on your phone when you export them and are not uploaded.',
    ],
  },
  {
    title: 'What we do with it',
    paragraphs: [
      'We use it to run the features you see: the tracker, your patterns, the daily insight chosen from what you logged, the sentences in Find your words, your medication reminders and your Health report. That is the whole list.',
      'Nuva is a tracking and education tool. It does not diagnose, and nothing it shows is medical advice.',
    ],
  },
  {
    title: 'Product analytics',
    paragraphs: [
      'We use PostHog, a product analytics service based in the United States, to understand how the app is used and make it better — for example, how long a log takes, and which screens are opened. It receives a short record each time certain things happen, tied to your anonymous account identifier, never your name or email address.',
      'Some of these records include health-related information: your answers to the six setup questions, the name of a symptom when its statistic is shown to you, which insight you open, and how many symptoms you logged in a day. PostHog does not receive your full log, your severities, your medications or anything you type. Your IP address is not used to work out where you are.',
    ],
  },
  {
    title: 'Who else sees it',
    paragraphs: [
      'No one, unless you choose to share it. When you export your Health report or copy your sentences, you decide where they go.',
      'Supabase stores your data on our behalf, and PostHog receives the usage records described above. Neither uses them for anything else. Before we add any other service — for payments or email — this policy will say which one, what it receives and why, before it is switched on.',
    ],
  },
  {
    title: 'Deleting it',
    paragraphs: [
      'Settings › Delete my account removes your account and every row that belongs to it, immediately: logs, medications, doses, reads, answers and your profile. It cannot be undone. Copies may remain in our database provider’s encrypted backups until those backups expire on their normal schedule; they are never restored into the app.',
      'Deleting the app from your phone does not delete your account. Until you can sign in with Apple or Google, your data is tied to this phone, so delete the account from Settings first if that is what you want.',
    ],
  },
  {
    title: 'Your rights',
    paragraphs: [
      'You can see everything you have logged in the app, export it as a PDF or a CSV file, and delete it. Depending on where you live, you may have further rights over your data, such as asking what we hold or asking us to correct it.',
    ],
  },
  {
    title: 'Changes',
    paragraphs: [
      'If this policy changes, the date at the top changes with it, and anything that affects how your data is used is shown in the app before it takes effect.',
    ],
  },
];
