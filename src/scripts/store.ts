import type { HintsUsed, HintState } from './types';

const STORAGE_KEY = 'obraDinnState';

export function loadState(): HintsUsed {
  if (typeof localStorage === 'undefined') return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function saveState(state: HintsUsed) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getHintState(filename: string): HintState {
  const state = loadState();
  if (!state[filename]) {
    return {
      identity: 0,
      fate: 0,
      guessed_id: null,
      guessed_fate: { cause_id: null, weapon: null, offender_id: null },
      status: 'pending',
      fate_status: 'pending'
    };
  }
  // Ensure structure consistency
  if (!state[filename].guessed_fate) {
      state[filename].guessed_fate = { cause_id: null, weapon: null, offender_id: null };
  }
  return state[filename];
}

export function updateHintState(filename: string, updater: (state: HintState) => void) {
  const allState = loadState();
  let fileState = allState[filename];
  if (!fileState) {
      // Initialize if not exists
      fileState = {
          identity: 0,
          fate: 0,
          guessed_id: null,
          guessed_fate: { cause_id: null, weapon: null, offender_id: null },
          status: 'pending',
          fate_status: 'pending'
      };
  }
  // Ensure consistency
  if (!fileState.guessed_fate) {
      fileState.guessed_fate = { cause_id: null, weapon: null, offender_id: null };
  }

  updater(fileState);
  allState[filename] = fileState;
  saveState(allState);
  return fileState;
}

export function resetData() {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
}
