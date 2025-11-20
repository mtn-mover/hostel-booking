# Vercel Umgebungsvariablen Setup

## ✅ Bereits konfiguriert:
- DATABASE_URL (automatisch von Vercel Postgres)
- POSTGRES_URL (automatisch von Vercel Postgres)
- PRISMA_DATABASE_URL (automatisch von Vercel Postgres)

## 🔧 Noch zu konfigurieren:

### 1. NEXTAUTH_SECRET (Generiert)
```bash
vercel env add NEXTAUTH_SECRET
# Wert: 2P+ml21WzZUOQIyIDy3KlHzFlbqvSCzr1nHcJTT56FM=
# Environments: Production, Preview, Development
```

### 2. NEXTAUTH_URL
```bash
vercel env add NEXTAUTH_URL
# Wert: https://hostel-booking-na5734y2f-mtn-mover-projects.vercel.app
# Environments: Production
```

Für Preview und Development:
```bash
vercel env add NEXTAUTH_URL
# Preview Wert: https://$VERCEL_URL
# Environment: Preview

vercel env add NEXTAUTH_URL
# Development Wert: http://localhost:3000
# Environment: Development
```

### 3. Stripe Keys (WICHTIG: Verwende LIVE Keys für Production!)

**Für TEST Mode (Development):**
```bash
vercel env add STRIPE_PUBLIC_KEY
# Wert: pk_test_... (dein Stripe Publishable Key)
# Environment: Development

vercel env add STRIPE_SECRET_KEY
# Wert: sk_test_... (dein Stripe Secret Key)
# Environment: Development

vercel env add STRIPE_WEBHOOK_SECRET
# Wert: whsec_... (von Stripe Webhook nach Erstellung)
# Environment: Development
```

**Für LIVE Mode (Production):**
```bash
vercel env add STRIPE_PUBLIC_KEY
# Wert: pk_live_... (dein Stripe Live Publishable Key)
# Environment: Production

vercel env add STRIPE_SECRET_KEY
# Wert: sk_live_... (dein Stripe Live Secret Key)
# Environment: Production

vercel env add STRIPE_WEBHOOK_SECRET
# Wert: whsec_... (von Stripe Webhook nach Erstellung)
# Environment: Production
```

### 4. Optional: Email Konfiguration (für Buchungsbestätigungen)

```bash
vercel env add EMAIL_SERVER_HOST
# Wert: smtp.gmail.com (oder dein SMTP Server)
# Environments: Production, Preview, Development

vercel env add EMAIL_SERVER_PORT
# Wert: 587
# Environments: Production, Preview, Development

vercel env add EMAIL_SERVER_USER
# Wert: deine-email@gmail.com
# Environments: Production, Preview, Development

vercel env add EMAIL_SERVER_PASSWORD
# Wert: dein-app-passwort
# Environments: Production, Preview, Development

vercel env add EMAIL_FROM
# Wert: noreply@hostlopia.com
# Environments: Production, Preview, Development
```

## 🚀 Schnelle Einrichtung

### Automatisches Script (alle Variablen auf einmal):

Erstelle eine Datei `.env.production` mit:
```env
NEXTAUTH_SECRET=2P+ml21WzZUOQIyIDy3KlHzFlbqvSCzr1nHcJTT56FM=
NEXTAUTH_URL=https://hostel-booking-na5734y2f-mtn-mover-projects.vercel.app
STRIPE_PUBLIC_KEY=pk_test_DEIN_KEY_HIER
STRIPE_SECRET_KEY=sk_test_DEIN_KEY_HIER
STRIPE_WEBHOOK_SECRET=whsec_WIRD_SPÄTER_GESETZT
```

Dann führe aus:
```bash
cd Git_Repository/hostel-booking
vercel env pull .env.local
```

## ⚡ Nach dem Setzen der Variablen:

1. **Redeploy triggern:**
   ```bash
   vercel --prod
   ```

2. **Oder im Vercel Dashboard:**
   - Gehe zu: Deployments
   - Klicke auf das neueste Deployment
   - Klicke "Redeploy"

## 📝 Nächste Schritte:

1. ✅ Umgebungsvariablen setzen
2. 🔄 Redeploy
3. 🗄️ Datenbank migrieren
4. 🎯 Stripe Webhooks konfigurieren
