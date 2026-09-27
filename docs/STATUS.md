# Nuva — estado del proyecto y pendientes

Última actualización: 26 de septiembre de 2026 · último commit de la sesión: `8a13d59`.
Leer junto con `CLAUDE.md` (reglas) y `docs/PRODUCT_BRIEF.md` (producto).

---

## 1 · Qué está hecho

Todo en `main`, con commits por pieza y verificado en el navegador (web) con Expo.

**App (Expo SDK 57, Expo Router, TS strict, Reanimated 4)**
- Onboarding completo: welcome, Q1–Q6, magic moment, paywall (shell, sin compras).
- Tabs: Today (4 tarjetas: registro, insight, medicación, Find Your Words), Patterns (calendario + tendencia), Words, You.
- Tracker: `/log` → `/log/severity` → `/log/validation` (si hay estadística con fuente) → `/log/saved`. "Edit today" precarga lo registrado y guardar reemplaza el día.
- Insights: 90 textos en `content/insights/*.md` (15 × 6 categorías), cargados con `scripts/seed-insights.mjs`. Uno por día, ponderado por lo registrado en 7 días.
- Find Your Words, HRT/medicación, Health Report (PDF en el teléfono con `expo-print` + `expo-sharing`), export CSV.
- You, Settings (cuenta, export, privacidad, borrar cuenta real vía `delete_my_account()`), Reminders.
- Recordatorios **locales** con `expo-notifications` (check-in diario, insight, HRT, reporte mensual). No necesitan servidor.
- Estadísticas de validación: 12 de 34 cargadas con fuente (`content/validation-stats.csv`, `scripts/seed-validation-stats.mjs`). Los otros 22 quedan vacíos a propósito (sin dato de perimenopausia confiable).
- Íconos iOS (claro/oscuro/tintado, sin alfa), Android, splash y favicon: `node scripts/generate-icons.mjs`.
- Analytics PostHog (región US) por HTTP, sin SDK: `src/lib/analytics`. Clave pública `phc_` en `.env`.
- Política de privacidad en la app y en **https://nuvacare.app/privacy/** (GitHub Pages, `scripts/build-site.mjs`, workflow `pages.yml`). HTTPS forzado.

**Supabase** (proyecto `bofhszpztmxeebwjhdxw`)
- Todas las tablas con RLS `(select auth.uid()) = user_id` en la misma migración.
- Usuarias anónimas por defecto (`ensureSession`); el onboarding se sincroniza a `onboarding_answers` + `profiles` al entrar a la app.
- Emails (Resend, dominio `nuvacare.app` verificado): Edge Functions `send-emails` y `email-unsubscribe` desplegadas (código en `supabase/functions/`), `email_due()`, `email_log`, cron `nuva-send-emails` cada hora con token en Vault. **Apagado**: corre en dry run hasta que exista el secreto `EMAIL_ENABLED=true`.
- Secretos de Edge Functions cargados: `RESEND_API_KEY`. (Nunca en el repo.)

**Servicios**
- GitHub Pages con dominio `nuvacare.app` (DNS apuntando a GitHub; registros de Resend intactos).
- PostHog: proyecto US, recibiendo eventos (`environment` = development/production).
- Resend: dominio verificado.

---

## 2 · Pendiente — bloqueado por el Apple Developer Program (USD 99/año)

En este orden recomendado:

1. **Sign in with Apple** (y **Google**): vincular la identidad a la usuaria anónima existente (`linkIdentity`) para no perder datos. Artboard: `design/screens/Auth.dc.html`. Registrar `nuvacare.app` en Apple para el relay de "Ocultar mi email".
2. **Dev build / TestFlight**: `npx eas-cli build --profile development --platform ios` (desde Windows sólo por EAS). Recién ahí anda MMKV (en Expo Go usa el respaldo en archivo).
3. **RevenueCat + Superwall**: productos de suscripción en App Store Connect, paywall real (`(onboarding)/paywall.tsx`), `TrialStarted.dc.html`, eventos `trial_started` / `subscription_started` (ya tipados en analytics, sin disparar).
4. **Bloqueo del contenido pago en el servidor**: hoy una usuaria anónima puede leer `insights` y `word_templates` (el paywall es sólo del lado cliente). Gatear con el entitlement de RevenueCat (webhook → tabla de entitlements → RLS).
5. **Encender los emails** (cuando haya usuarias con email, tras el login):
   - secreto `EMAIL_ENABLED=true` en Supabase;
   - interruptor "Email as well" en Settings que escriba `profiles.email_reminders`;
   - nombrar a **Resend** en `src/content/privacy.ts` en el mismo cambio.
6. **Push del servidor** (APNs): segmentos del brief §5.8 (trial día 1–3, re-enganche). Registrar `profiles.push_token`. Los recordatorios diarios ya funcionan como notificaciones locales.
7. **Universal links** (`nuvacare.app` → abrir la app), para que los emails puedan tener botón.

---

## 3 · Pendiente — sin bloqueo

- **Pruebas en el iPhone con Expo Go** (`npx expo start -c`), dejadas para el final a pedido. Checklist:
  onboarding completo → permiso de notificaciones al entrar; recordatorio llega a la hora elegida; registrar síntomas con estadística (sofocos, ansiedad) → pantalla de validación; "Edit today"; insight del día y "Mark as read"; Find Your Words + copiar; HRT: agregar medicación con hora, marcar tomada; Health report → Preview y Export PDF (hoja de compartir); CSV; Reminders (interruptores); Settings → borrar cuenta; modo oscuro; movimiento reducido (Ajustes de iOS → Accesibilidad).
- Las 22 estadísticas de validación sin dato: sólo si aparece una fuente específica de perimenopausia (no inventar).
- Posible limpieza de usuarios anónimos de prueba en `auth.users` (sin datos).

---

## 4 · Cosas que conviene saber (errores que ya costaron tiempo)

- **Servidores de Expo zombis**: en Windows la línea de comando es `...expo\bin\cli" start`; un filtro por "expo start" no los encuentra. Si quedan vivos reescriben `.expo/types/router.d.ts` y `tsc` falla con rutas absurdas (`/../lib/supabase/...`). Matar con PowerShell: `Where-Object { $_.CommandLine -match 'expo\S*\s+start' }`. Para regenerar tipos: borrar `router.d.ts`, levantar un servidor, esperar a que el archivo exista y deje de cambiar, matarlo, correr `npx tsc --noEmit`.
- **No correr `prettier`**: el repo no tiene config y reformatea todo (comillas dobles, `tokens.ts` generado).
- **Edge Functions no sirven HTML**: Supabase las devuelve como `text/plain`. Por eso la baja de emails redirige a páginas estáticas del sitio.
- **`supabase/functions` está excluido del `tsconfig`** (es Deno).
- **PubMed/PMC piden captcha** al buscar fuentes; usar la API de Europe PMC (`search`, `fullTextXML`, `supplementaryFiles`).
- **Colores**: nunca literales en componentes; usar tokens o `alpha(token, opacidad)` de `src/constants/nuva.ts`.
- **Claves**: `.env` es público (está en el repo) — sólo claves públicas (`EXPO_PUBLIC_*`, `phc_`). Secretos (`re_`, `phs_`, service role) sólo en Supabase. Nunca pegar secretos en el chat.
- Sin revisor clínico: el contenido de salud se escribe completo, sólo con afirmaciones bien establecidas, nunca estadísticas inventadas.
