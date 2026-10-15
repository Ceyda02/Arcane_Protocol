/**
 * Chapter 1: The Bells of the Silent Watch.
 * Narrative content is data. Placeholders: {name}, {address}.
 * Dialogue node kinds: line { speaker, text, if? } | choice { prompt, options: [{ id, text, set, replies }] }
 * Scene kinds: dialogue | lesson | challenge | ending
 * Core learning is identical whichever choices the player makes. Choices change who explains and what extra clue appears.
 */
export const CHAPTER1_LESSONS = {
  'events-alerts-incidents': {
    id: 'events-alerts-incidents',
    title: 'Events, Alerts, and Incidents',
    intro: {
      ash: 'Three words, and keep them apart. Every night this gate writes down what happens. I need you to know which of those writings should wake me.',
      elowen: 'Think of the gate as a diary that writes itself. Some lines are ordinary, some ring a little bell, and a few turn out to matter. The trick is knowing which is which.',
    },
    sections: [
      {
        heading: 'An event is anything that happens and gets recorded',
        body: ['A gate opens. A pass is checked. A lantern is refilled. Each is an event. Most events are completely ordinary.'],
      },
      {
        heading: 'An alert is a signal that someone should look closer',
        body: [
          'Systems raise alerts when events match a rule, such as “the gate opened three times in a minute”.',
          'An alert is an indicator that needs investigation. It is not automatic proof of an attack.',
        ],
      },
      {
        heading: 'A confirmed incident is an alert that investigation has proven harmful',
        body: [
          'After looking into an alert you reach one of two answers. Either it was harmless (a false positive), or evidence shows real harm or a policy violation (a confirmed incident).',
        ],
      },
    ],
    technical: 'In a SOC, events are normalized log records, alerts are detections that fire on them, and an incident is declared after triage confirms malicious or unauthorized activity. A true positive is an alert that correctly flags something harmful; a false positive is an alert that flags something benign.',
  },
  'reading-the-ledger': {
    id: 'reading-the-ledger',
    title: 'Reading a Ledger',
    intro: { ash: 'Now the ledger itself. Read it slowly.', elowen: 'Let’s read the ledger together. Slowly. The pattern hides between the rows.' },
    sections: [
      {
        heading: 'A log line answers who, what, where, and when',
        body: [
          'Each row records a time, a source address (where the request came from), an account (who it claimed to be), an event (what happened), and an outcome (how it ended).',
          'A single row rarely tells you much. The story is in how rows connect: the same account, the same address, or events close together in time.',
        ],
      },
      {
        heading: 'What “normal” looks like matters',
        body: ['A traveler whose pass expired and who then renews it makes a harmless pair of rows. A guard failing from an address nobody has seen before, then succeeding, then exporting records is a different story.'],
      },
    ],
    technical: 'Useful pivots when reading authentication logs are username, source IP, user agent, geolocation versus baseline, time of day, and the actions that follow a successful login. Documentation-range IPs such as 192.0.2.x, 198.51.100.x, and 203.0.113.x are used in this game so nothing points at a real system.',
  },
  'timelines-and-time-zones': {
    id: 'timelines-and-time-zones',
    title: 'Timelines',
    intro: { ash: 'Order matters. What came first is rarely what was loudest.', elowen: 'Order matters. A story told out of order can point at the wrong culprit.' },
    sections: [
      {
        heading: 'Timestamps let you rebuild a sequence',
        body: ['If you sort events by time, you can see cause and effect: a login, then an export, then a gate opening tells a different story than the same events shuffled.'],
      },
      {
        heading: 'Do this first: compare time carefully',
        body: ['Compare hours first, then minutes, then seconds. Make sure every record uses the same clock before you trust the order.'],
      },
    ],
    technical: 'Prefer UTC and ISO 8601 (2026-03-14T22:05:00Z) when correlating records. Always record the source of each timestamp, since systems can have clock drift.',
  },
  'time-zones': {
    id: 'time-zones',
    title: 'When the Clocks Disagree',
    intro: { ash: 'One last trap. Not every clock in the realm agrees.', elowen: 'One last trap. Different towers keep different clocks.' },
    sections: [
      {
        heading: 'Different systems write time differently',
        body: [
          'A time like 23:03:30 +01:00 means “the local clock says 23:03:30, and that clock is one hour ahead of UTC”.',
          'To convert to UTC, subtract a positive offset or add a negative one. 23:03:30 +01:00 is 22:03:30 UTC. 17:04:10 -05:00 is 22:04:10 UTC.',
        ],
      },
      {
        heading: 'Watch for dates rolling over',
        body: ['00:06:00 +02:00 on the next day is 22:06:00 UTC on the previous day. Convert the date too, not just the time.'],
      },
    ],
    technical: 'A common forensic error is sorting raw local timestamps from multiple sources. Normalize to UTC first, note any known clock skew, and record the original value alongside the converted one.',
  },
  'context-and-correlation': {
    id: 'context-and-correlation',
    title: 'Context, Correlation, and False Positives',
    intro: { ash: 'This is where watchers fail. They count failures, or they ignore them. Neither is judgment.', elowen: 'Here is the hard part: there is no magic number. Context is the spell.' },
    sections: [
      {
        heading: 'No single number of failures proves an attack',
        body: [
          'Some people mistype passwords three times. Some attackers try once per account and stay quiet. A fixed threshold catches some of each and misses others.',
        ],
      },
      {
        heading: 'Correlation connects separate signals',
        body: [
          'Ask what else happened around the failures. One address touching many accounts, a success, a security setting change, and a data export are four weak signals that together form a strong one.',
        ],
      },
      {
        heading: 'False positives are part of the job',
        body: ['Most alerts are benign. Good analysts compare against normal behavior, verify with the owner, and say clearly what is confirmed and what is not.'],
      },
    ],
    technical: 'Detection rules often combine thresholds with context: new source, impossible travel, a changed authentication factor, or sensitive actions following a login. Tune rules against baselines to reduce false positives without hiding real signals.',
  },
};

export const CHAPTER1_SCENES = [
  {
    id: 'arrival',
    type: 'dialogue',
    background: 'village',
    objective: 'Meet the Watch and hear about the gate.',
    nodes: [
      { speaker: 'narrator', text: 'Dusk settles over the border village of Alderwick. Smoke curls from the chimneys. On the watchtower, a lantern burns amber against the violet sky.' },
      { speaker: 'rowan', text: 'There you are, {name}. I am Rowan, a royal investigator. The crown sent me because the village gate keeps crying wolf.' },
      { speaker: 'ash', text: 'Keeper Ash, captain of the Night Watch. Every night the gate’s enchantment reports intruders. We run out. We find nothing. Or we think we find nothing.' },
      { speaker: 'elowen', text: 'And I am Elowen. I study how these enchantments watch and report. They are not wrong, exactly. They are just very, very loud.' },
      { speaker: 'ash', text: 'We cannot tell which alerts are real. One day we will ignore the real one.' },
      {
        type: 'choice',
        prompt: 'Where do you start?',
        options: [
          { id: 'ash', text: 'Ask Keeper Ash what the Watch has seen.', set: { askedFirst: 'ash' }, replies: [{ speaker: 'ash', text: 'Good. Start with what the people on the wall know. I will explain how we separate noise from danger.' }] },
          { id: 'elowen', text: 'Ask Elowen how the enchantment decides to ring.', set: { askedFirst: 'elowen' }, replies: [{ speaker: 'elowen', text: 'Good question. I will explain what the gate records and what its bell really means.' }] },
        ],
      },
      { speaker: 'rowan', text: 'Whichever way you begin, the problem is the same: a thousand records and one decision about which ones matter.', if: { flag: 'askedFirst', is: 'ash' } },
      { speaker: 'rowan', text: 'Whichever way you begin, the problem is the same: a thousand records and one decision about which ones matter.', if: { flag: 'askedFirst', is: 'elowen' } },
      { speaker: 'narrator', text: 'The Book in your satchel grows warm. Its first blank page begins to fill with faint ink.' },
    ],
  },
  { id: 'lesson-events', type: 'lesson', lessonId: 'events-alerts-incidents', objective: 'Learn the difference between events, alerts, and incidents.' },
  { id: 'challenge-events', type: 'challenge', challengeId: 'c1-events', grimoire: 'events-alerts-incidents', objective: 'Name each sign correctly.' },
  { id: 'lesson-ledger', type: 'lesson', lessonId: 'reading-the-ledger', objective: 'Learn how to read a log table.' },
  { id: 'challenge-ledger', type: 'challenge', challengeId: 'c1-ledger', grimoire: 'reading-the-ledger', objective: 'Find the entries worth investigating.' },
  {
    id: 'clue',
    type: 'dialogue',
    background: 'village',
    objective: 'React to what you found.',
    nodes: [
      { speaker: 'rowan', text: 'Bram’s account, from an address he has never used. Bram is the guard on the east wall.' },
      { type: 'choice', prompt: 'What do you do with this?', options: [
        { id: 'ask', text: 'Ask Bram directly, in private, whether he exported the ledger.', set: { askedBram: true }, replies: [{ speaker: 'ash', text: 'Bram was asleep in the barracks at that hour. He says he never left. That is a useful clue, though not yet proof.' }] },
        { id: 'record', text: 'Record the pattern first and verify later.', set: { askedBram: false }, replies: [{ speaker: 'elowen', text: 'Writing it down first is wise. You will want the original order of events, not just your memory of it.' }] },
      ] },
      { speaker: 'rowan', text: 'Either way, we need to know the exact order of events before we say anything to anyone.' },
    ],
  },
  { id: 'lesson-timeline', type: 'lesson', lessonId: 'timelines-and-time-zones', objective: 'Learn how timestamps rebuild a sequence.' },
  { id: 'challenge-timeline', type: 'challenge', challengeId: 'c1-timeline', objective: 'Order the events.' },
  { id: 'lesson-tz', type: 'lesson', lessonId: 'time-zones', objective: 'Learn to normalize different time zones.' },
  { id: 'challenge-tz', type: 'challenge', challengeId: 'c1-timezones', grimoire: 'timelines-and-time-zones', objective: 'Order events from four clocks.' },
  {
    id: 'shapeshifter-intro',
    type: 'dialogue',
    background: 'village',
    objective: 'Face the thing wearing a guard’s face.',
    nodes: [
      { speaker: 'narrator', text: 'A figure steps from the shadow of the tower. Its outline shifts like heat above a road. For a moment it wears Bram’s face. Then Orla’s. Then nobody’s.' },
      { speaker: 'shapeshifter', text: 'You count my footsteps, little watcher. But the footsteps of the honest and the dishonest sound the same until you know where to listen.' },
      { speaker: 'elowen', text: 'It borrows faces. Trusted names, trusted places. That is what makes it hard to catch.' },
      { speaker: 'rowan', text: 'Then we do not chase faces. We study behavior. New records just arrived from the Night Watch.' },
    ],
  },
  { id: 'lesson-context', type: 'lesson', lessonId: 'context-and-correlation', objective: 'Learn context, correlation, and false positives.' },
  { id: 'challenge-shape', type: 'challenge', challengeId: 'c1-shapeshifter', grimoire: 'context-and-correlation', objective: 'Decide what the evidence supports.' },
  {
    id: 'resolution',
    type: 'ending',
    background: 'village',
    objective: 'Summarize what you know and what you do not.',
    nodes: [
      { speaker: 'narrator', text: 'The shapeshifter flickers, then thins into the dark between lanterns.' },
      { speaker: 'ash', text: 'The bell was not lying, and it was not telling the whole truth either. You showed me how to hear the difference.' },
      { speaker: 'rowan', text: 'Let us be exact about what we know. Bram’s account was used from an unfamiliar address, in a pattern that matches a compromise. And what we do not know?' },
      { speaker: 'elowen', text: 'Who was behind it, how they got the password, and what was in that export. We should not guess at those.' },
      { speaker: 'ash', text: 'To confirm it we need Bram’s word that it was not him, the session records from that night, and the contents of the export. Until then it is a strong lead, not a verdict.' },
      { speaker: 'narrator', text: 'A new page appears in the Book, and the Bestiary opens a door to the first creature you have met.' },
    ],
    summary: {
      known: ['Bram’s account was used from an address he had never used.', 'Failures, then a success, then an export formed a pattern.'],
      uncertain: ['How the password was obtained.', 'What the exported ledger contained.', 'Whether other accounts were affected.'],
      needed: ['Bram’s confirmation that he did not perform the actions.', 'Session records for the night in question.', 'Details of the export.'],
    },
  },
];
