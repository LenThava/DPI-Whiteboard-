# Event Model

All shared state is derived from immutable events.

## Event Envelope

```json
{
  "eventId": "alice:1",
  "author": "alice",
  "seq": 1,
  "time": 1760000000000,
  "op": "create_text",
  "objectId": "alice:object:1"
}
```

## Supported Operations

### `create_text`

```json
{
  "op": "create_text",
  "objectId": "alice:object:1",
  "x": 120,
  "y": 80,
  "text": "Idea: offline board"
}
```

### `move`

```json
{
  "op": "move",
  "objectId": "alice:object:1",
  "x": 200,
  "y": 140
}
```

### `edit_text`

```json
{
  "op": "edit_text",
  "objectId": "alice:object:1",
  "text": "Updated note"
}
```

### `draw_stroke`

```json
{
  "op": "draw_stroke",
  "objectId": "bob:stroke:3",
  "points": [[10, 20], [15, 24], [22, 30]],
  "color": "#2d6cdf",
  "width": 4
}
```

### `delete`

```json
{
  "op": "delete",
  "objectId": "alice:object:1"
}
```

## Deterministic Replay

Events are sorted by:

1. `time`
2. `author`
3. `seq`
4. `eventId`

The same set of events therefore produces the same board state on every device.

## Conflict Rules

- Text note creation is idempotent by `objectId`.
- Moving a text note uses the latest deterministic move event.
- Editing a text note uses the latest deterministic edit event.
- Delete wins permanently for the same `objectId`.
- Freehand strokes are append-only and are not edited after creation.

These rules are intentionally simple for the MVP and can later be replaced with richer CRDT behavior.
