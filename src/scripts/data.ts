import type { CrewMember, FateStructure, CorrectFate } from "./types";

let crewCache: CrewMember[] | null = null;
let correctNamesCache: Record<string, number> | null = null;
let correctFatesCache: Record<string, CorrectFate | CorrectFate[]> | null =
  null;
let fatesStructureCache: FateStructure[] | null = null;

export async function loadData() {
  if (crewCache) return; // 改为检查 crewCache 而不是 facesCache

  const base = import.meta.env.BASE_URL;
  try {
    const [crew, correctNames, correctFates, fatesStructure] =
      await Promise.all([
        // faces 数据不再需要，当前面部的数据已经通过 data-hints 内联了
        fetch(`${base}/data/name_lists.json`).then((r) => r.json()),
        fetch(`${base}/data/correct_name_list.json`).then((r) => r.json()),
        fetch(`${base}/data/correct_fates_list.json`).then((r) => r.json()),
        fetch(`${base}/data/fates_structure.json`).then((r) => r.json()),
      ]);

    crewCache = crew;
    correctNamesCache = correctNames;
    correctFatesCache = correctFates;
    fatesStructureCache = fatesStructure;
  } catch (e) {
    console.error("Failed to load data:", e);
  }
}

export function getCrew() {
  return crewCache;
}
export function getCorrectNames() {
  return correctNamesCache;
}
export function getCorrectFates() {
  return correctFatesCache;
}
export function getFatesStructure() {
  return fatesStructureCache;
}
