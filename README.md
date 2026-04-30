# Tremola Whiteboard

Whiteboard Mini-App fürr Tremola.

## Benutzung

- Mit Notiz eine Notiz erstellen (Post it mässig)
- mit Zeichnen kann man auf dem Whiteboard zeichnen
- Mit Auswahl können Objekte (auch mehrere) bearbeitet oder bewegt oder gelöscht werden
 

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
