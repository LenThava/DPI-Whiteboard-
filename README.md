# Tremola Whiteboard

Kleine offline-first Whiteboard Mini-App fuer Tremola.

## Benutzung

- `Notiz` waehlen und eine Notiz schreiben
- `Zeichnen` waehlen und auf der Flaeche zeichnen
- `Auswahl` waehlen und einen Rahmen um Objekte ziehen
- Ausgewaehlte Objekte koennen bearbeitet oder geloescht werden

## Lokal starten

Einfach `index.html` im Browser oeffnen.

Oder mit lokalem Server:

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080` oeffnen.

## Naechste Schritte fuer Tremola

- Mini-App in Tremola WebView laden
- `window.tremolaWhiteboardStore` in Tremola implementieren
- `appendEvent` schreibt Events in tinySSB
- `loadEvents` liest eigene und per BLE synchronisierte Events
- Mit zwei Android-Geraeten testen

Die UI bleibt gleich. Nur der Event-Store wird spaeter an tinySSB/BLE angeschlossen.
