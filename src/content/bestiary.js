/**
 * Realm Bestiary: the original creatures of Hexaria. (The Hollow King of the Malware Bestiary is the Rootkit.)
 * `unlockedBy`: a quest id whose reward unlocks the entry; null = appears in a future chapter.
 * Entries with art: null use a clearly marked placeholder glyph. Replace the asset key to upgrade.
 */
export const REALM_CREATURES = [
  {
    id: 'shapeshifter', name: 'The Shapeshifter', art: 'shapeshifter', unlockedBy: 'bells-of-the-silent-watch',
    tease: 'A figure whose face changes with whoever is nearby.',
    lore: 'It wears the faces of those you trust. It is not the face you should watch, but what the face does.',
    metaphor: 'A narrative metaphor for trusted identities behaving in untrusted ways, and for input that is not what it claims to be.',
    concepts: ['Context', 'Correlation', 'Baselines of normal behavior'],
    clue: 'Compare actions to what is normal for that identity.',
    lesson: 'Encountered in Chapter 1. Later chapters use the Shapeshifter to teach input validation and injection.',
    grimoire: 'context-and-correlation',
  },
  { id: 'wraith', name: 'The Whispering Wraith', art: 'ghost-a', unlockedBy: null, tease: 'A pale whisper hidden among ordinary footsteps.', lore: 'It hides in the noise, never louder than the crowd.', metaphor: 'Suspicious activity hidden among ordinary events.', concepts: ['Log analysis', 'Event correlation', 'Detection engineering'], clue: 'Look for what repeats, not what shouts.', lesson: 'Planned for a later Nightwatch chapter.', grimoire: null },
  { id: 'werewolf', name: 'The Werewolf at the Gate', art: 'werewolf', unlockedBy: null, tease: 'A familiar villager who is, tonight, not quite himself.', lore: 'The same face by day. A different creature by night.', metaphor: 'A compromised account behaving differently from its normal pattern.', concepts: ['Behavioral indicators', 'Alert triage', 'Incident investigation'], clue: 'Compare tonight to the usual pattern.', lesson: 'Planned for a later Nightwatch chapter.', grimoire: null },
  { id: 'vampire', name: 'The Vampire of Borrowed Names', art: 'vampire', unlockedBy: null, tease: 'A courteous guest, invited in under someone else’s name.', lore: 'It cannot enter uninvited, so it borrows an invitation.', metaphor: 'A narrative metaphor for stolen credentials. The real terms are credential theft, account compromise, and session hijacking.', concepts: ['Credential security', 'Multi-factor authentication', 'Session management'], clue: 'Who invited it, and from where?', lesson: 'Planned for the Shattered Web.', grimoire: null },
  { id: 'mimic', name: 'The Mimic', art: null, unlockedBy: null, tease: 'A chest that looks exactly like a chest.', lore: 'It looks trustworthy. That is its entire talent.', metaphor: 'Misleading input that appears trustworthy.', concepts: ['Data validation', 'Secure parsing', 'Verifying assumptions'], clue: 'Verify; do not assume.', lesson: 'Planned for the Shattered Web.', grimoire: null },
  { id: 'memory-eater', name: 'The Memory Eater', art: null, unlockedBy: null, tease: 'Pages go quiet where it has been.', lore: 'It eats the proof, not the object.', metaphor: 'Loss, alteration, or destruction of evidence.', concepts: ['Evidence preservation', 'Logging integrity', 'Forensic reasoning'], clue: 'What should be here that is not?', lesson: 'Planned for the Memory Crypt.', grimoire: null },
];
