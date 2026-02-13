export interface FaceData {
  identity_hints: string[];
  fate_hints: string[];
}

export interface CrewMember {
  id: number;
  name: string;
  role: string;
  origin: string;
}

export interface FateStructure {
  id: number;
  label: string;
  has_weapon: boolean;
  requires_offender: boolean;
  weapons: string[];
}

export interface HintState {
  identity: number; // number of hints revealed
  fate: number;
  guessed_id: number | null;
  guessed_fate: {
    cause_id: number | null;
    weapon: string | null;
    offender_id: number | null;
  };
  status: 'verified' | 'pending' | 'incorrect';
  fate_status: 'verified' | 'pending' | 'incorrect';
}

export type HintsUsed = Record<string, HintState>; // key is filename e.g. "face_01.png"
