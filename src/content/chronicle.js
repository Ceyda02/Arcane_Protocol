export const CHRONICLE_TABS = ['quests', 'clues', 'mysteries', 'lessons', 'people', 'journey'];

export const CHRONICLE_PEOPLE = [
  { id: 'rowan', minimumStage: 1, nameKey: 'chronicle.person.rowan.name', roleKey: 'chronicle.person.rowan.role', factsKey: 'chronicle.person.rowan.facts' },
  { id: 'ash', minimumStage: 1, nameKey: 'chronicle.person.ash.name', roleKey: 'chronicle.person.ash.role', factsKey: 'chronicle.person.ash.facts' },
  { id: 'elowen', minimumStage: 1, nameKey: 'chronicle.person.elowen.name', roleKey: 'chronicle.person.elowen.role', factsKey: 'chronicle.person.elowen.facts' },
  { id: 'bram', minimumStage: 5, nameKey: 'chronicle.person.bram.name', roleKey: 'chronicle.person.bram.role', factsKey: 'chronicle.person.bram.facts' },
  { id: 'orla', minimumStage: 10, nameKey: 'chronicle.person.orla.name', roleKey: 'chronicle.person.orla.role', factsKey: 'chronicle.person.orla.facts' },
];

export const CHRONICLE_MYSTERIES = [
  { id: 'owner-statement', titleKey: 'chronicle.mystery.owner.title', summaryKey: 'chronicle.mystery.owner.summary', unlockAt: 'investigation' },
  { id: 'source-identity', titleKey: 'chronicle.mystery.source.title', summaryKey: 'chronicle.mystery.source.summary', unlockAt: 'investigation' },
  { id: 'archive-scope', titleKey: 'chronicle.mystery.archive.title', summaryKey: 'chronicle.mystery.archive.summary', unlockAt: 'investigation' },
  { id: 'other-accounts', titleKey: 'chronicle.mystery.accounts.title', summaryKey: 'chronicle.mystery.accounts.summary', unlockAt: 'investigation' },
];

export const QUEST_TRANSLATION_KEYS = {
  'bells-of-the-silent-watch': 'bells',
  'encounter-worm': 'worm',
  'encounter-trojan': 'trojan',
  'encounter-ransomware': 'ransomware',
  'night-watch-2': 'watch',
};

export const CHALLENGE_FINDING_KEYS = {
  'c1-events': 'events',
  'c1-ledger': 'ledger',
  'c1-timeline': 'timeline',
  'c1-timezones': 'timezones',
  'c1-shapeshifter': 'shapeshifter',
  'worm-beginner': 'worm',
  'worm-intermediate': 'worm',
  'worm-boss': 'worm',
  'trojan-beginner': 'trojan',
  'trojan-intermediate': 'trojan',
  'trojan-boss': 'trojan',
  'ransomware-beginner': 'ransomware',
  'ransomware-intermediate': 'ransomware',
  'ransomware-boss': 'ransomware',
};
