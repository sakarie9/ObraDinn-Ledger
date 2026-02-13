import type { FaceData, CrewMember, FateStructure } from './types';

// Cache
let facesCache: Record<string, FaceData> | null = null;
let crewCache: CrewMember[] | null = null;
let correctNamesCache: Record<string, number> | null = null;
let correctFatesCache: Record<string, any> | null = null;
let fatesStructureCache: FateStructure[] | null = null;

export async function loadData() {
    if (facesCache) return;

    try {
        const [faces, crew, correctNames, correctFates, fatesStructure] = await Promise.all([
            fetch('/data/faces_data.json').then(r => r.json()),
            fetch('/data/name_lists.json').then(r => r.json()),
            fetch('/data/correct_name_list.json').then(r => r.json()),
            fetch('/data/correct_fates_list.json').then(r => r.json()),
            fetch('/data/fates_structure.json').then(r => r.json())
        ]);

        facesCache = faces;
        crewCache = crew;
        correctNamesCache = correctNames;
        correctFatesCache = correctFates;
        fatesStructureCache = fatesStructure;
    } catch (e) {
        console.error("Failed to load data:", e);
    }
}

export function getFaces() { return facesCache; }
export function getCrew() { return crewCache; }
export function getCorrectNames() { return correctNamesCache; }
export function getCorrectFates() { return correctFatesCache; }
export function getFatesStructure() { return fatesStructureCache; }
