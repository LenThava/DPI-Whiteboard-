# Tremola Whiteboard

Whiteboard Mini-App fuer Tremola.

## Benutzung

- Name eintragen (kein muss)
- mit `Notiz`  eine Notiz schreiben (wie sticky notes)
- mit `Zeichnen` auf dem bord zeichnen
- mit `Auswahl` Objekte wählen in dem man eine box darum zeichnet (multi objekt wahl möglich)
- Ausgewaehlte Objekte können bearbeitet oder gelöscht werden (falls ein objekt schon gewählt wurde werden die knöpfe grau)
  

## Lokal starten

`index.html` im Browser öffnen.

oder mit Py3 server:

```bash
python3 -m http.server 8080
```

danach über `http://localhost:8080` öffnen

## next steps um mit Tremola zu integrieren

- als Mini-App in Tremola webview laden
- window.tremolaWhiteboardStore in Tremola implementieren
- appendEvent schreibt Events (mit tinySSB)
- loadEvents liest eigene und BLE synchronisation events
- mit android testen

späterer anschluss an den  Event-Store und tinySSB/BLE
