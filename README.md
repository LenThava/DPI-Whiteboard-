# DPI Whiteboard Tremola App

Offline-first collaboration board as a Tremola mini-app prototype.

The app stores every board action as an append-only event. The current board is reconstructed by deterministic replay of all known events. This keeps the UI independent from the later tinySSB/BLE storage layer and makes the project easy to test early.

## MVP Scope

- Create text notes
- Move text notes
- Edit text notes
- Draw simple freehand strokes
- Delete objects
- Rebuild board state from events
- Show a local activity log
- Prepare the event adapter for tinySSB synchronization
- Use a mobile-first UI shaped for a Tremola Android WebView

## Architecture

```text
Tremola Android WebView
        |
        v
appendEvent(event)
        |
        v
localStorage adapter now, tinySSB adapter later
        |
        v
replayEvents(events)
        |
        v
current board state
```

The important rule is: UI actions never mutate board objects directly. They always append events first, then the board is rendered from replayed events.

`src/storage.js` is the temporary local adapter. `src/tremola-adapter.js` marks the boundary where the later Tremola/tinySSB append/read API should be connected.

## Run Locally

This project has no external dependencies.

```bash
npm test
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Repository Status

This is a starter version for group development. The tinySSB/Tremola integration should replace `src/storage.js` with a real adapter later while keeping the event model and replay logic stable.
