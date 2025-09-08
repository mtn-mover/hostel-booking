# Hostel Management System - Deployment Guide

## System Overview

Komplettes Hostel Management System mit:
- 🏠 Buchungswebseite mit Airbnb-Integration
- 🤖 Selbstlernender Chat-Bot (Claude API)
- 📱 Mobile Admin App für Chat-Übernahmen
- 🧠 Automatisches Learning-System

## 🚀 Quick Start

### 1. Hauptanwendung starten

```bash
# Im hostel-booking Verzeichnis
cd hostel-booking

# Umgebungsvariablen konfigurieren
cp .env.example .env.local

# Abhängigkeiten installieren
npm install

# Datenbank migrieren
npx prisma migrate dev

# Seed-Daten laden
npm run db:seed

# Development Server starten
npm run dev
```

Die Anwendung läuft dann auf http://localhost:3000

### 2. Mobile Admin App

```bash
# Im mobile-admin Verzeichnis
cd mobile-admin

# Abhängigkeiten installieren
npm install

# iOS (nur auf Mac)
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

## 🔑 Wichtige Umgebungsvariablen

Erstelle eine `.env.local` Datei mit folgenden Variablen:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Anthropic AI (Claude)
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Stripe Payments
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (optional)
EMAIL_SERVER="smtp://user:pass@server.com:587"
EMAIL_FROM="noreply@alpinehavenhostel.ch"

# Push Notifications (für Mobile App)
FCM_SERVER_KEY="your-firebase-server-key"
APNS_KEY_ID="your-apple-push-key"
```

## 📱 Mobile App Konfiguration

### Android
1. Firebase-Projekt erstellen
2. `google-services.json` in `mobile-admin/android/app/` platzieren
3. Push Notification Setup in Firebase Console

### iOS
1. Apple Developer Account
2. Push Notification Certificate erstellen
3. In Xcode konfigurieren

## 🧠 Learning System aktivieren

Das Learning-System lernt automatisch aus Admin-Interaktionen:

1. **Initial Knowledge Base**: Die Datei `src/lib/knowledge-base.ts` enthält Basis-Informationen
2. **Admin Dashboard**: Unter `/admin/learning` können Learnings überprüft werden
3. **Automatic Learning**: Jede Admin-Antwort wird analysiert und extrahiert

### Knowledge Base anpassen

Bearbeite `src/lib/knowledge-base.ts`:

```typescript
export const hostelKnowledgeBase = {
  general: {
    name: "Dein Hostel Name",
    address: "Deine Adresse",
    // ... weitere Infos
  }
}
```

## 🚀 Production Deployment

### Option 1: Vercel (Empfohlen für Web-App)

```bash
# Vercel CLI installieren
npm i -g vercel

# Deployment
vercel

# Umgebungsvariablen in Vercel Dashboard konfigurieren
```

### Option 2: Docker

```bash
# Docker Image bauen
docker build -t hostel-booking .

# Container starten
docker run -p 3000:3000 --env-file .env.production hostel-booking
```

### Option 3: Traditional Server

```bash
# Build erstellen
npm run build

# Production Server starten
npm start
```

## 📊 Monitoring & Analytics

### Learning Analytics Dashboard

- URL: `/admin/learning`
- Zeigt: Escalation-Rate, Knowledge Growth, Confidence Scores
- Ziel: < 10% Escalation-Rate nach 3 Monaten

### Key Performance Indicators

1. **Escalation Rate**: Prozentsatz der Chats, die an Admin weitergeleitet werden
2. **Response Accuracy**: Genauigkeit der automatischen Antworten
3. **Learning Growth**: Anzahl neuer gelernter Fakten pro Monat
4. **Guest Satisfaction**: Bewertung der Chat-Interaktionen

## 🔧 Wartung & Updates

### Datenbank-Backups

```bash
# Backup erstellen
sqlite3 dev.db ".backup backup.db"

# Backup wiederherstellen
sqlite3 dev.db ".restore backup.db"
```

### Knowledge Base Updates

```bash
# Neue Learnings anwenden
npm run apply-learnings

# Knowledge Base exportieren
npm run export-knowledge
```

## 🐛 Troubleshooting

### Häufige Probleme

1. **Chat antwortet nicht**: 
   - Prüfe ANTHROPIC_API_KEY
   - Check API Rate Limits

2. **Push Notifications funktionieren nicht**:
   - Firebase/APNS Konfiguration prüfen
   - Device Token verifizieren

3. **Learning System lernt nicht**:
   - Admin-Rolle in Datenbank prüfen
   - Learning-Jobs in Queue checken

## 📈 Skalierung

### Für hohe Last

1. **PostgreSQL statt SQLite**: 
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db"
   ```

2. **Redis für Sessions**:
   ```bash
   npm install redis connect-redis
   ```

3. **CDN für Assets**: Cloudflare oder ähnliche Services

## 🔒 Sicherheit

- [ ] HTTPS aktivieren (SSL Zertifikat)
- [ ] Rate Limiting implementieren
- [ ] Input Validation verstärken
- [ ] Regular Security Updates
- [ ] DSGVO-Konformität prüfen

## 📞 Support & Kontakt

Bei Fragen oder Problemen:
- GitHub Issues: [Link zu deinem Repository]
- Email: support@alpinehavenhostel.ch

## 🎯 Roadmap

- [ ] Voice Chat Integration
- [ ] Multi-Hostel Support
- [ ] Advanced Analytics Dashboard
- [ ] Automated Marketing Campaigns
- [ ] Integration mit Booking.com

---

**Entwickelt mit ❤️ für Alpine Haven Hostel**