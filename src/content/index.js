import { CHAPTER1_CHALLENGES } from './challenges/chapter1.js';
import { MALWARE_CHALLENGES } from './challenges/malware.js';
import { CHAPTER1_LESSONS, CHAPTER1_SCENES } from './quests/chapter1.js';
import { QUESTS } from './quests/index.js';
import { MALWARE_CREATURES, CREATURES_BY_ID } from './malware/creatures.js';

export const ALL_CHALLENGES = [...CHAPTER1_CHALLENGES, ...MALWARE_CHALLENGES];
export const CHALLENGES = Object.fromEntries(ALL_CHALLENGES.map((c) => [c.id, c]));
export const LESSONS = { ...CHAPTER1_LESSONS };
export const SCENES = { 'bells-of-the-silent-watch': CHAPTER1_SCENES };

export { QUESTS, MALWARE_CREATURES, CREATURES_BY_ID };
