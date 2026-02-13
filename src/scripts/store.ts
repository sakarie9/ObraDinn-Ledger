import type { HintsUsed, HintState } from "./types";

const STORAGE_KEY = "obraDinnState";

function createDefaultHintState(): HintState {
  return {
    identity: 0,
    fate: 0,
    guessed_id: null,
    guessed_fate: { cause_id: null, weapon: null, offender_id: null },
    status: "pending",
    fate_status: "pending",
  };
}

function ensureConsistency(state: HintState): HintState {
  if (!state.guessed_fate) {
    state.guessed_fate = { cause_id: null, weapon: null, offender_id: null };
  }
  return state;
}

export function loadState(): HintsUsed {
  if (typeof localStorage === "undefined") return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function saveState(state: HintsUsed): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getHintState(filename: string): HintState {
  const state = loadState();
  if (!state[filename]) return createDefaultHintState();
  return ensureConsistency(state[filename]);
}

export function updateHintState(
  filename: string,
  updater: (state: HintState) => void,
): HintState {
  const allState = loadState();
  const fileState = ensureConsistency(
    allState[filename] ?? createDefaultHintState(),
  );
  updater(fileState);
  allState[filename] = fileState;
  saveState(allState);
  return fileState;
}

export function resetData(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function resetFaceData(filename: string): void {
  const allState = loadState();
  delete allState[filename];
  saveState(allState);
}
