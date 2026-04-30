import { EVENT_TYPES, createEventFactory, replayEvents } from "./replay.js";
import { appendLocalEvent, loadEvents } from "./storage.js";

const board = document.querySelector("#board");
const activityLog = document.querySelector("#activity-log");
const syncStatus = document.querySelector("#sync-status");
const modeHint = document.querySelector("#mode-hint");
const toolButtons = {
  select: document.querySelector("#tool-select"),
  note: document.querySelector("#tool-note"),
  draw: document.querySelector("#tool-draw")
};
const editButton = document.querySelector("#edit-selected");
const deleteButton = document.querySelector("#delete-selected");
const noteSheet = document.querySelector("#note-sheet");
const noteForm = document.querySelector("#note-form");
const noteText = document.querySelector("#note-text");
const cancelNoteButton = document.querySelector("#cancel-note");
const saveNoteButton = document.querySelector("#save-note");

const BOARD_WIDTH = 1000;
const BOARD_HEIGHT = 680;

const author = getOrCreateAuthor();
const createEvent = createEventFactory(author, loadEvents().length);

let currentTool = "select";
let selectedObjectId = null;
let dragState = null;
let drawingState = null;
let noteDraft = null;
let state = replayEvents(loadEvents());

render();

toolButtons.select.addEventListener("click", () => setTool("select"));
toolButtons.note.addEventListener("click", () => {
  setTool("note");
  openNoteSheet({
    mode: "create",
    x: Math.round(BOARD_WIDTH / 2 - 110),
    y: Math.round(BOARD_HEIGHT / 2 - 36),
    text: ""
  });
});
toolButtons.draw.addEventListener("click", () => setTool("draw"));

editButton.addEventListener("click", () => {
  const object = state.objects.find((candidate) => candidate.id === selectedObjectId);

  if (object?.type === "text") {
    openNoteSheet({
      mode: "edit",
      objectId: object.id,
      x: object.x,
      y: object.y,
      text: object.text
    });
  }
});

deleteButton.addEventListener("click", () => {
  if (!selectedObjectId) {
    return;
  }

  appendEvent(EVENT_TYPES.DELETE, { objectId: selectedObjectId });
  selectedObjectId = null;
});

cancelNoteButton.addEventListener("click", closeNoteSheet);

noteSheet.addEventListener("click", (event) => {
  if (event.target === noteSheet) {
    closeNoteSheet();
  }
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = noteText.value.trim();

  if (!text || !noteDraft) {
    noteText.focus();
    return;
  }

  if (noteDraft.mode === "edit") {
    appendEvent(EVENT_TYPES.EDIT_TEXT, {
      objectId: noteDraft.objectId,
      text
    });
  } else {
    appendEvent(EVENT_TYPES.CREATE_TEXT, {
      objectId: `${author}:object:${Date.now()}`,
      x: noteDraft.x,
      y: noteDraft.y,
      text
    });
  }

  closeNoteSheet();
  setTool("select");
});

board.addEventListener("pointerdown", (event) => {
  const point = getBoardPoint(event);

  if (currentTool === "note") {
    openNoteSheet({
      mode: "create",
      x: point.x,
      y: point.y,
      text: ""
    });
    return;
  }

  if (currentTool === "draw") {
    drawingState = {
      objectId: `${author}:stroke:${Date.now()}`,
      points: [[point.x, point.y]]
    };
    board.setPointerCapture(event.pointerId);
    return;
  }

  const objectId = event.target.closest("[data-object-id]")?.dataset.objectId;
  selectedObjectId = objectId || null;

  if (selectedObjectId) {
    const object = state.objects.find((candidate) => candidate.id === selectedObjectId);

    if (object?.type === "text") {
      dragState = {
        pointerId: event.pointerId,
        objectId: selectedObjectId,
        offsetX: point.x - object.x,
        offsetY: point.y - object.y
      };
      board.setPointerCapture(event.pointerId);
    }
  }

  render();
});

board.addEventListener("pointermove", (event) => {
  const point = getBoardPoint(event);

  if (drawingState) {
    drawingState.points.push([point.x, point.y]);
    renderPreviewStroke(drawingState.points);
    return;
  }

  if (dragState) {
    const object = state.objects.find((candidate) => candidate.id === dragState.objectId);

    if (object) {
      object.x = point.x - dragState.offsetX;
      object.y = point.y - dragState.offsetY;
      render();
    }
  }
});

board.addEventListener("pointerup", (event) => {
  if (drawingState) {
    const points = simplifyPoints(drawingState.points);

    if (points.length > 1) {
      appendEvent(EVENT_TYPES.DRAW_STROKE, {
        objectId: drawingState.objectId,
        points,
        color: "#2d6cdf",
        width: 4
      });
    }

    drawingState = null;
    board.releasePointerCapture(event.pointerId);
    return;
  }

  if (dragState) {
    const point = getBoardPoint(event);
    appendEvent(EVENT_TYPES.MOVE, {
      objectId: dragState.objectId,
      x: point.x - dragState.offsetX,
      y: point.y - dragState.offsetY
    });
    board.releasePointerCapture(event.pointerId);
    dragState = null;
  }
});

board.addEventListener("dblclick", (event) => {
  const objectId = event.target.closest("[data-object-id]")?.dataset.objectId;
  const object = state.objects.find((candidate) => candidate.id === objectId);

  if (object?.type !== "text") {
    return;
  }

  openNoteSheet({
    mode: "edit",
    objectId: object.id,
    x: object.x,
    y: object.y,
    text: object.text
  });
});

function appendEvent(op, payload) {
  const events = appendLocalEvent(createEvent(op, payload));
  state = replayEvents(events);
  render();
}

function setTool(tool) {
  currentTool = tool;

  for (const [name, button] of Object.entries(toolButtons)) {
    button.classList.toggle("is-active", name === tool);
  }

  renderModeHint();
}

function render() {
  board.innerHTML = "";

  for (const object of state.objects) {
    if (object.type === "stroke") {
      renderStroke(object);
    }

    if (object.type === "text") {
      renderTextNote(object);
    }
  }

  renderActivity();
  renderModeHint();
  renderSelectionActions();
  syncStatus.textContent = `${state.activity.length} local`;
}

function renderTextNote(object) {
  const group = svgElement("g", {
    "data-object-id": object.id,
    class: `note ${object.id === selectedObjectId ? "is-selected" : ""}`,
    transform: `translate(${object.x} ${object.y})`
  });
  const lines = wrapText(object.text, 18);
  const height = Math.max(74, lines.length * 20 + 34);

  group.append(
    svgElement("rect", {
      width: 210,
      height,
      rx: 6,
      class: "note-bg"
    })
  );

  lines.forEach((line, index) => {
    const text = svgElement("text", {
      x: 16,
      y: 30 + index * 20,
      class: "note-text"
    });
    text.textContent = line;
    group.append(text);
  });

  board.append(group);
}

function renderStroke(object) {
  const polyline = svgElement("polyline", {
    "data-object-id": object.id,
    class: `stroke ${object.id === selectedObjectId ? "is-selected" : ""}`,
    points: object.points.map(([x, y]) => `${x},${y}`).join(" "),
    fill: "none",
    stroke: object.color,
    "stroke-width": object.width,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });

  board.append(polyline);
}

function renderPreviewStroke(points) {
  render();
  const preview = svgElement("polyline", {
    class: "stroke preview",
    points: points.map(([x, y]) => `${x},${y}`).join(" "),
    fill: "none",
    stroke: "#2d6cdf",
    "stroke-width": 4,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });

  board.append(preview);
}

function renderActivity() {
  activityLog.innerHTML = "";

  for (const event of state.activity.slice(-5).reverse()) {
    const item = document.createElement("li");
    item.textContent = event.op.replaceAll("_", " ");
    activityLog.append(item);
  }
}

function getBoardPoint(event) {
  const rect = board.getBoundingClientRect();
  const scaleX = BOARD_WIDTH / rect.width;
  const scaleY = BOARD_HEIGHT / rect.height;

  return {
    x: clamp(Math.round((event.clientX - rect.left) * scaleX), 0, BOARD_WIDTH - 210),
    y: clamp(Math.round((event.clientY - rect.top) * scaleY), 0, BOARD_HEIGHT - 74)
  };
}

function openNoteSheet(draft) {
  noteDraft = draft;
  noteText.value = draft.text;
  saveNoteButton.textContent = draft.mode === "edit" ? "Save" : "Add note";
  noteSheet.classList.add("is-open");
  noteSheet.setAttribute("aria-hidden", "false");
  window.setTimeout(() => noteText.focus(), 80);
}

function closeNoteSheet() {
  noteDraft = null;
  noteText.value = "";
  noteSheet.classList.remove("is-open");
  noteSheet.setAttribute("aria-hidden", "true");
}

function renderModeHint() {
  const hints = {
    select: selectedObjectId ? "Drag selected note or edit it" : "Select or drag notes",
    note: "Tap the board to place a note",
    draw: "Draw with touch or mouse"
  };

  modeHint.textContent = hints[currentTool];
}

function renderSelectionActions() {
  const object = state.objects.find((candidate) => candidate.id === selectedObjectId);
  const hasSelection = Boolean(object);

  editButton.disabled = object?.type !== "text";
  deleteButton.disabled = !hasSelection;
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }

  return element;
}

function wrapText(text, maxLength) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;

    if (next.length > maxLength) {
      if (line) {
        lines.push(line);
      }
      line = word;
    } else {
      line = next;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

function simplifyPoints(points) {
  return points.filter((point, index) => index === 0 || index % 2 === 0 || index === points.length - 1);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getOrCreateAuthor() {
  const key = "dpi-whiteboard-author";
  const existing = localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const generated = `peer-${crypto.randomUUID().slice(0, 8)}`;
  localStorage.setItem(key, generated);
  return generated;
}
