# Development Plan

## First Vertical Slice

Build a full path from user action to event to replayed board state.

1. Create local events from the UI.
2. Store events locally.
3. Replay events into the current board state.
4. Render the board from replayed state.
5. Add tests for replay convergence.

## Suggested Group Split

- Event model and replay logic
- UI and board interactions
- Tremola/tinySSB adapter
- Tests, demo script, documentation

## Next Milestones

### Milestone 1: Local MVP

- Text notes
- Move and edit notes
- Delete objects
- Draw freehand strokes
- Activity log

### Milestone 2: Sync Simulation

- Import and export event logs
- Merge events from two peers
- Verify both peers converge to the same state

### Milestone 3: Tremola Integration

- Replace local storage adapter with tinySSB append/read calls
- Test event replication between two Android devices
- Show basic sync status

### Milestone 4: Stretch Features

- Rectangles, circles, lines, arrows
- Conflict UI for text edits
- Export/import demo
- Optional LoRa discussion or prototype
