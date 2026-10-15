/** Archetypes are narrative flavour only. They never gate lessons, quests, or abilities. */
export const ARCHETYPES = [
  { id: 'investigator', name: 'Royal Investigator', blurb: 'Sent by the crown to look closely at things others overlook.' },
  { id: 'mage', name: 'Mage', blurb: 'A student of the old arts who treats every spell as a system to understand.' },
  { id: 'knight', name: 'Knight', blurb: 'Sworn to guard the realm, steady under pressure.' },
  { id: 'ranger', name: 'Ranger', blurb: 'A tracker of faint signs in forests and ledgers alike.' },
  { id: 'scholar', name: 'Scholar', blurb: 'Keeper of footnotes, hunter of the exact source.' },
  { id: 'alchemist', name: 'Wandering Alchemist', blurb: 'Tests every mixture before trusting it.' },
  { id: 'heir', name: 'Royal Heir', blurb: 'Raised in court, determined to earn the crown through understanding.' },
  { id: 'princess', name: 'Princess', blurb: 'A royal who would rather read the archive than attend the feast.' },
  { id: 'prince', name: 'Prince', blurb: 'A royal who would rather walk the watch than attend the feast.' },
];

export const PORTRAITS = [
  { id: 'mage', name: 'Blue-robed Mage' },
  { id: 'sorceress', name: 'Staff Bearer' },
  { id: 'knight', name: 'Plumed Knight' },
  { id: 'princess', name: 'Crimson Gown' },
  { id: 'noble', name: 'Emerald Court' },
  { id: 'heir', name: 'Young Courtier' },
  { id: 'elder', name: 'Elder Sovereign' },
];

export const COLORS = [
  { id: 'violet', name: 'Violet', hex: '#6c5aa0' },
  { id: 'burgundy', name: 'Burgundy', hex: '#9b3047' },
  { id: 'forest', name: 'Forest', hex: '#3f7a4c' },
  { id: 'azure', name: 'Azure', hex: '#4f7fd0' },
  { id: 'gold', name: 'Antique gold', hex: '#d2a037' },
  { id: 'ash', name: 'Ash grey', hex: '#8b92a6' },
];

export const EQUIPMENT = [
  { id: 'lantern', name: 'Watchman’s lantern', blurb: 'Lights dark corridors and darker logs.' },
  { id: 'quill', name: 'Silver quill', blurb: 'For notes that must be exact.' },
  { id: 'satchel', name: 'Satchel of scrolls', blurb: 'References close at hand.' },
  { id: 'staff', name: 'Runed staff', blurb: 'A focus for careful spellwork.' },
  { id: 'shortsword', name: 'Traveller’s blade', blurb: 'Seldom drawn, always carried.' },
];

export const ADDRESS_OPTIONS = [
  { id: '', name: 'Just my name' },
  { id: 'Sir', name: 'Sir' },
  { id: 'Lady', name: 'Lady' },
  { id: 'Mx.', name: 'Mx.' },
  { id: 'Scholar', name: 'Scholar' },
];

export const DEFAULT_PLAYER = {
  name: 'Wren',
  address: '',
  archetypeId: 'investigator',
  portraitId: 'mage',
  color: 'violet',
  equipmentId: 'lantern',
};
