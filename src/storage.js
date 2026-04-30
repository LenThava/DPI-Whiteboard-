const STORAGE_KEY = "dpi-whiteboard-events";

// Adapter boundary: this file is intentionally small so Tremola/tinySSB can
// replace localStorage without changing the board UI or replay logic.

export function loadEvents() {
  try {
    const rawEvents = localStorage.getItem(STORAGE_KEY);
    return rawEvents ? JSON.parse(rawEvents) : [];
  } catch {
    return [];
  }
}

export function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function clearEvents() {
  localStorage.removeItem(STORAGE_KEY);
}

export function appendLocalEvent(event) {
  const events = loadEvents();
  const exists = events.some((candidate) => candidate.eventId === event.eventId);

  if (!exists) {
    events.push(event);
    saveEvents(events);
  }

  return events;
}
