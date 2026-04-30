# Tremola Whiteboard

Offline-first collaboration board as a Tremola mini-app prototype.

The app stores every board action as an append-only event. The current board is reconstructed by deterministic replay of all known events. This keeps the UI independent from the later tinySSB/BLE storage layer and makes the project easy to test early.

## MVP Scope

- Create text notes
- Move text notes
- Edit text notes
- Draw simple freehand strokes
- Delete objects
- Rebuild board state from events
- Show a compact latest-action status
- Prepare the event adapter for tinySSB synchronization
- Use a mobile-first UI shaped for a Tremola Android WebView
- Select objects by drawing a selection box around them

## Architecture

```text
Tremola Android WebView
        |
        v
eventStore.appendEvent(event)
        |
        v
localStorage now, Tremola/tinySSB bridge later
        |
        v
replayEvents(events)
        |
        v
current board state
```

The important rule is: UI actions never mutate board objects directly. They always append events first, then the board is rendered from replayed events.

`src/storage.js` chooses the event store. In the browser it uses `localStorage`. In Tremola it automatically uses `window.tremolaWhiteboardStore` if that bridge exists. `src/tremola-adapter.js` is the only file that should need real tinySSB bridge calls later.

## Tremola and tinySSB Synchronization

In this browser prototype, events are stored in `localStorage`. In Tremola, the same event objects should be appended to a tinySSB feed instead.

The app should keep this shape:

```text
UI action -> board event -> tinySSB append-only log -> replayEvents(events)
```

When two Android devices meet over BLE, Tremola/tinySSB replicates feed entries between them. After synchronization, each device loads the same set of board events, sorts them deterministically, and rebuilds the board through `replayEvents`. The UI does not need a central server and does not need live internet access.

The important integration point is implementing this bridge inside Tremola:

```js
window.tremolaWhiteboardStore = {
  async appendEvent({ appId, boardId, event }) {
    // append event JSON to tinySSB
  },
  async loadEvents({ appId, boardId }) {
    // return own and replicated events for this app/board
  }
};
```

The UI already calls only `eventStore.appendEvent(event)` and `eventStore.loadEvents()`, so `replayEvents(events)` stays the same.

So the project can be developed locally first, then connected to Tremola once the mini-app bridge API is available.

## Run Locally

This project has no external dependencies.

```bash
npm test
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Repository Status

This is a starter version for group development. The tinySSB/Tremola integration should replace `src/storage.js` with a real adapter later while keeping the event model and replay logic stable.
