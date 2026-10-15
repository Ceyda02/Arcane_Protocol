/**
 * World definition. Unlock rules are data: { quests: [...ids that must be complete], anyQuests: [...at least one], minLevel }.
 * `playable: false` means the region is visible but has no content in this release.
 */
export const REGIONS = [
  {
    id: 'crownlands',
    name: 'The Crownlands',
    x: 30, y: 62,
    lore: 'A peaceful kingdom of villages, markets, and an old academy. The Night Watch still keeps its border towers lit.',
    skills: ['logs_ir', 'forensics', 'malware'],
    unlock: {},
    quests: ['bells-of-the-silent-watch', 'encounter-worm', 'encounter-trojan', 'encounter-ransomware'],
    comingSoon: ['night-watch-2'],
  },
  {
    id: 'rune_gates',
    name: 'The Rune Gates',
    x: 52, y: 70,
    lore: 'An ancient web of magical gates. Messages cross them in packets, and one gate keeps delivering to the wrong door.',
    skills: ['networking'],
    unlock: { quests: ['bells-of-the-silent-watch'] },
    quests: [],
    comingSoon: [],
  },
  {
    id: 'shattered_web',
    name: 'The Shattered Web',
    x: 70, y: 52,
    lore: 'Enchanted libraries and merchant portals stitched together by trust. Not all of that trust was earned.',
    skills: ['webapp', 'coding'],
    unlock: { quests: ['encounter-trojan'] },
    quests: [],
    comingSoon: [],
  },
  {
    id: 'nightwatch_citadel',
    name: 'The Nightwatch Citadel',
    x: 44, y: 28,
    lore: 'The kingdom’s watch-fortress, where every alarm bell in Hexaria is answered.',
    skills: ['logs_ir'],
    unlock: { quests: ['bells-of-the-silent-watch'] },
    quests: [],
    comingSoon: ['night-watch-2'],
  },
  {
    id: 'crimson_depths',
    name: 'The Crimson Depths',
    x: 18, y: 28,
    lore: 'Hidden stairs lead to a training vault where authorized seekers test fictional locks.',
    skills: ['vuln', 'webapp'],
    unlock: { quests: ['encounter-trojan'], minLevel: 3 },
    quests: [],
    comingSoon: [],
  },
  {
    id: 'veil_of_twilight',
    name: 'The Veil of Twilight',
    x: 80, y: 22,
    lore: 'Where attackers’ and defenders’ knowledge meet. Wards are tested, then taught to see better.',
    skills: ['logs_ir', 'vuln'],
    unlock: { quests: ['encounter-worm', 'encounter-trojan'], minLevel: 4 },
    quests: [],
    comingSoon: [],
  },
  {
    id: 'memory_crypt',
    name: 'The Memory Crypt',
    x: 62, y: 82,
    lore: 'A cold archive of lost records, kept in order for those patient enough to reconstruct them.',
    skills: ['forensics'],
    unlock: { quests: ['encounter-ransomware'] },
    quests: [],
    comingSoon: [],
  },
];

export const WORLD_UNLOCK_NOTES = {
  minLevel: (n) => `Reach level ${n}`,
};
