import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { track } from '@/lib/analytics';

import { renderReportHtml } from './html';
import { fetchMonthSummary, type Month } from './summary';

/**
 * Web has no file to hand to a share sheet — `printToFileAsync` opens the print
 * dialog of the *current* page there. So on web the report opens in its own
 * window and prints from that, where "Save as PDF" is one click. This is a
 * development path; the product runs on iOS.
 */
function openOnWeb(html: string, print: boolean): void {
  const win = window.open('', '_blank');
  if (!win) throw new Error('Your browser blocked the report window.');
  win.document.open();
  win.document.write(html);
  win.document.close();
  if (print) win.print();
}

/**
 * Shows the report in the system print preview — on iOS, the same sheet that
 * previews any document, with pinch-to-zoom and nothing saved.
 */
export async function previewReport(month: Month): Promise<void> {
  const html = renderReportHtml(await fetchMonthSummary(month));
  if (Platform.OS === 'web') {
    openOnWeb(html, false);
    return;
  }
  await Print.printAsync({ html });
  track('health_report_exported', { destination: 'print_preview' });
}

/**
 * Renders the PDF on the phone and opens the share sheet: Mail, Messages,
 * AirDrop, Files, or her specialist's portal.
 *
 * The PDF is written to the app's cache and nowhere else. It is never uploaded:
 * the report can be rebuilt from her logs at any time, so a server-side copy
 * would add a second place her health data lives and gain her nothing.
 */
export async function exportReport(month: Month): Promise<{ pages: number } | null> {
  const summary = await fetchMonthSummary(month);
  const html = renderReportHtml(summary);
  track('health_report_generated', {
    period_days: summary.daysElapsed,
    symptom_count: summary.symptomCount,
  });

  if (Platform.OS === 'web') {
    openOnWeb(html, true);
    track('health_report_exported', { destination: 'web_print' });
    return null;
  }

  const { uri, numberOfPages } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      UTI: 'com.adobe.pdf',
      mimeType: 'application/pdf',
      dialogTitle: `Nuva health report, ${summary.label}`,
    });
    // The share sheet does not say where it went, only that it opened.
    track('health_report_exported', { destination: 'share_sheet' });
  }
  return { pages: numberOfPages };
}
