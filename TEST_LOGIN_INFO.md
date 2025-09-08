# 🔐 Login-Anleitung für HOSTLOPIA Management System

## ✅ Status
Die Applikation läuft jetzt lokal auf **http://localhost:3001**

## 🔑 Admin-Login

### Schritt 1: Öffne die Admin-Seite
- Gehe zu: **http://localhost:3001/admin**
- Du wirst automatisch zur Login-Seite weitergeleitet

### Schritt 2: Login mit Admin-Credentials
- **Email**: `admin@alpinehavenhostel.ch`
- **Passwort**: `admin123`
- Klicke auf "Sign in with Email"

### Schritt 3: Nach erfolgreichem Login
Du wirst automatisch zum Admin-Dashboard weitergeleitet und hast Zugriff auf:
- **Dashboard**: http://localhost:3001/admin
- **Learning System**: http://localhost:3001/admin/learning
- **Apartments**: http://localhost:3001/admin/apartments
- **Bookings**: http://localhost:3001/admin/bookings
- **Chat Management**: http://localhost:3001/admin/chat

## 🤖 Chat-Bot testen (ohne Login)

Der Chat-Bot ist auf der Hauptseite verfügbar:
1. Öffne **http://localhost:3001**
2. Klicke auf das **Chat-Widget** unten rechts
3. Teste mit Beispielfragen:
   - "Wann ist Check-in?"
   - "Habt ihr Parkplätze?"
   - "Was kostet das Studio Apartment?"

## 🔧 Troubleshooting

### Problem: "Invalid email or password"
- Stelle sicher, dass du die exakte Email-Adresse verwendest: `admin@alpinehavenhostel.ch`
- Passwort ist case-sensitive: `admin123`

### Problem: Nach Login werde ich zur Hauptseite weitergeleitet
- Das ist korrekt, wenn du nicht als Admin eingeloggt bist
- Nur Accounts mit ADMIN-Rolle haben Zugriff auf /admin

### Problem: Session-Fehler
Wenn es Session-Probleme gibt:
```bash
# Server neu starten
Ctrl+C (zum Beenden)
npm run dev
```

## 📝 Wichtige Hinweise

1. **Middleware aktiv**: Alle `/admin`-Routen sind geschützt und erfordern Admin-Login
2. **Session-basiert**: Nach Login bleibt die Session aktiv bis zum Logout
3. **Role-based Access**: Nur User mit `role: 'ADMIN'` können auf Admin-Bereich zugreifen

## 🎯 Demo-Flow für Kunden

1. **Zeige die öffentliche Webseite** (ohne Login)
   - Apartments
   - Buchungssystem
   - AI Chat-Bot

2. **Login als Admin**
   - Verwende die Credentials oben
   - Zeige Admin-Dashboard

3. **Demonstriere Learning System**
   - Gehe zu `/admin/learning`
   - Zeige Analytics und Learning-Progress

4. **Chat-Escalation zeigen**
   - Stelle eine komplexe Frage im Chat
   - Zeige wie sie im Admin-Bereich erscheint

---

Die Applikation ist vollständig funktionsfähig mit Authentication und Role-based Access Control!