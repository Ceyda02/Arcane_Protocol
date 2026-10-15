/**
 * Specialization Orders. `affinity` maps each assessed skill to a weight (0..1)
 * used by the deterministic assessment engine.
 */
export const PATHS = {
  blue: {
    id: 'blue',
    name: 'Blue Order',
    title: 'The Night Watch',
    colorKey: 'blue',
    focus: ['SOC analysis', 'SIEM and log analysis', 'Alert triage', 'Threat hunting', 'Incident response'],
    blurb: 'Watchers on the tower. You read the signs, separate noise from danger, and ring the bell when it matters.',
    starterQuest: 'The Bells of the Silent Watch',
    affinity: { logs_ir: 0.5, networking: 0.2, forensics: 0.15, webapp: 0.1, vuln: 0.05, coding: 0 },
    malwarePerspective: 'Detect and investigate: what do the logs and alerts show, and when do you escalate?',
  },
  red: {
    id: 'red',
    name: 'Red Order',
    title: 'The Shadow Seekers',
    colorKey: 'red',
    focus: ['Pentesting fundamentals', 'Reconnaissance', 'Web security', 'Vulnerability analysis', 'Safe validation and reporting'],
    blurb: 'Authorized seekers of hidden doors. You find weaknesses before others do, and you write down how to mend them.',
    starterQuest: "The Merchant's Broken Seal",
    affinity: { vuln: 0.4, webapp: 0.3, coding: 0.15, networking: 0.1, logs_ir: 0.05, forensics: 0 },
    malwarePerspective: 'Understand the weakness: which flaw let this in, and how would an authorized test confirm the fix?',
  },
  purple: {
    id: 'purple',
    name: 'Purple Order',
    title: 'The Veilkeepers',
    colorKey: 'purple',
    focus: ['Purple teaming', 'Detection engineering', 'Attack simulation', 'Defensive validation'],
    blurb: 'Keepers of the twin towers. You test the wards against safe, fictional attacks and teach them to see better.',
    starterQuest: 'The Spell That Left No Footprints',
    affinity: { logs_ir: 0.3, vuln: 0.25, webapp: 0.15, networking: 0.15, coding: 0.15, forensics: 0 },
    malwarePerspective: 'Validate coverage: simulate the behavior safely, then check whether your detection actually fires.',
  },
  echoes: {
    id: 'echoes',
    name: 'Order of Echoes',
    title: 'The Memory Keepers',
    colorKey: 'echoes',
    focus: ['Digital forensics', 'Evidence preservation', 'Timeline reconstruction', 'Incident documentation'],
    blurb: 'Archivists of what happened. You preserve the trail, order the events, and refuse to invent what you cannot prove.',
    starterQuest: 'The Last Entry in the Royal Ledger',
    affinity: { forensics: 0.5, logs_ir: 0.25, coding: 0.1, networking: 0.1, webapp: 0.05, vuln: 0 },
    malwarePerspective: 'Reconstruct and preserve: what happened, in what order, and what evidence must be kept intact?',
  },
};
export const PATH_ORDER = ['blue', 'red', 'purple', 'echoes']; // fixed order used for deterministic tie-breaks
export const PATH_LIST = PATH_ORDER.map((id) => PATHS[id]);
