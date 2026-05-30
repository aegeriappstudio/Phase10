# Phase 10 – Web-App

Eine kleine, eigenständige Web-App zur **Punkte-Erfassung** und als **Regelübersicht**
für das Kartenspiel *Phase 10* (Ravensburger).

## Funktionen

### 🎯 Spiel & Punkte
- 2 bis 6 Spieler anlegen
- Pro Durchgang die Restpunkte jedes Spielers erfassen und ankreuzen, wer seine Phase geschafft hat
- Automatische Berechnung von Gesamtpunkten, aktueller Phase und Tabellenstand
- Vollständiger Rundenverlauf inkl. Summenzeile
- Gewinner-Erkennung: Wer zuerst alle 10 Phasen schafft, gewinnt (bei Gleichstand entscheiden die wenigsten Punkte)
- „Letzte Runde löschen“ zum Korrigieren von Fehleingaben
- Spielstand wird automatisch im Browser gespeichert (localStorage) – auch nach dem Neuladen vorhanden

### 📖 Spielregeln
- Spielziel, Material & Vorbereitung
- Die 10 Phasen im Überblick
- Spielverlauf, Joker & „Aussetzen“-Karten
- Wertung (Punktewerte der Karten)
- Spezielle Regeln und Varianten

## Nutzung

Es ist **kein Build und kein Server nötig** – reine HTML/CSS/JavaScript-App.

Zwei Möglichkeiten:

1. **Eine Datei (am einfachsten):** `phase10.html` öffnen. Diese Datei enthält alles
   (HTML, CSS, JS) und läuft überall – auch direkt vom Smartphone, USB-Stick oder per E-Mail
   verschickt. Einfach doppelklicken.
2. **Projektordner:** `index.html` öffnen (nutzt die Dateien in `css/` und `js/`).

Optional lokal servieren:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

Die App ist responsiv und funktioniert auch offline auf dem Smartphone.

## Projektstruktur

```
phase10.html      # Eigenständige Einzeldatei (alles eingebettet) – einfach öffnen
index.html        # Aufbau & Ansichten (modulare Variante)
css/styles.css    # Phase-10-Look (dunkel/gold), responsiv
js/rules.js       # Phasenliste, Punktewerte & Regeltexte (Original-Anleitung)
js/app.js         # Spiel-Logik, Punkte-Erfassung, localStorage
build.js          # Erzeugt phase10.html aus den modularen Dateien (node build.js)
```

Die 10 Phasen und die Wertung entsprechen der **originalen Ravensburger-Spielanleitung**.

> Hinweis: *Phase 10* ist ein Spiel von Ravensburger. Diese App dient ausschließlich
> der privaten Punkte-Erfassung und Regelübersicht.
