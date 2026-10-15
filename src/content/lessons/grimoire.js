import { MALWARE_CREATURES } from '../malware/creatures.js';

/**
 * Cyber Grimoire pages. Fantasy flavour never replaces the correct technical definition.
 * Fields: concept, plain, technical, example { label, text }, mistake, takeaway, links, source (quest/encounter title)
 */
const HANDWRITTEN = [
  {
    id: 'events-alerts-incidents', title: 'Events, Alerts, and Incidents', category: 'Foundations', source: 'The Bells of the Silent Watch',
    concept: 'Event, alert, false positive, and confirmed incident.',
    plain: 'An event is something that happened and was recorded. An alert is a signal that someone should look closer. A confirmed incident is an alert that investigation has proven harmful.',
    technical: 'In security operations, events are normalized log records. Detection rules turn some into alerts. Triage classifies an alert as a true positive (a real issue) or a false positive (benign). An incident is declared when malicious or unauthorized activity is confirmed.',
    example: { label: 'Gate example', text: 'Event: gate opened at 21:02.\nAlert: gate opened 3 times in 60 seconds.\nFalse positive: it was the lamplighter hauling oil.\nIncident: a forged pass was used.' },
    mistake: 'Treating every alert as proof of an attack, or every alert as noise.',
    takeaway: 'An alert is an indicator that needs investigation. Verify before you conclude.',
    links: [{ label: 'NIST SP 800-61: Computer Security Incident Handling Guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final' }],
  },
  {
    id: 'reading-the-ledger', title: 'Reading a Log Table', category: 'Logs & Investigation', source: 'The Bells of the Silent Watch',
    concept: 'Reading authentication and activity logs.',
    plain: 'Each log row says when something happened, where it came from, who it claimed to be, what happened, and how it ended. Meaning comes from how rows connect.',
    technical: 'Common pivots: account, source IP, user agent, geolocation against baseline, time of day, and what happens after a successful login.',
    example: { label: 'Suspicious pattern (synthetic)', text: '22:01:45  203.0.113.77  guard_bram  login  denied\n22:01:49  203.0.113.77  guard_bram  login  denied\n22:02:10  203.0.113.77  guard_bram  login  ok\n22:04:30  203.0.113.77  guard_bram  ledger_export  ok' },
    mistake: 'Judging a single row in isolation, such as flagging one expired pass or ignoring a quiet export.',
    takeaway: 'Read rows together and compare them to what is normal for that account.',
    links: [{ label: 'MITRE ATT&CK knowledge base', url: 'https://attack.mitre.org/' }],
  },
  {
    id: 'timelines-and-time-zones', title: 'Timelines and Time Zones', category: 'Forensics', source: 'The Bells of the Silent Watch',
    concept: 'Building a timeline and normalizing time zones.',
    plain: 'Sort events by time to see cause and effect. Before you do, make sure every record uses the same clock.',
    technical: 'Convert to UTC before ordering. A positive offset means the local clock is ahead of UTC, so subtract it. A date can roll over when converting.',
    example: { label: 'Converting to UTC', text: '23:03:30 +01:00  ->  22:03:30 UTC\n17:04:10 -05:00  ->  22:04:10 UTC\n00:06:00 +02:00 (next day)  ->  22:06:00 UTC' },
    mistake: 'Sorting raw local times from different systems.',
    takeaway: 'Normalize to UTC first, and keep the original timestamps for reference.',
    links: [{ label: 'NIST SP 800-61: Computer Security Incident Handling Guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final' }],
  },
  {
    id: 'context-and-correlation', title: 'Context, Correlation, and False Positives', category: 'Logs & Investigation', source: 'The Bells of the Silent Watch',
    concept: 'Why no fixed number of failed logins proves an attack.',
    plain: 'A few failures can be a typo, and a quiet attacker may try once per account. Look at what else happened around them.',
    technical: 'Effective detections combine signals: a new source address, many accounts from one address, a success after failures, a changed authentication factor, and a sensitive action. Tune rules against baselines to reduce false positives.',
    example: { label: 'Weak signals that combine (synthetic)', text: 'one address, four accounts, then a success\nsign-in method changed\narchive export' },
    mistake: 'Relying on a single threshold, or dismissing failures entirely.',
    takeaway: 'Say what you know, what you do not, and what evidence would confirm it.',
    links: [{ label: 'MITRE ATT&CK knowledge base', url: 'https://attack.mitre.org/' }],
  },
  {
    id: 'how-worms-spread', title: 'How Worms Spread', category: 'Threats & Malware', source: 'The Spreading Blight',
    concept: 'Worm propagation, patching, segmentation, and isolation.',
    plain: 'A worm copies itself from machine to machine without anyone clicking anything. It uses weaknesses in services that are reachable on the network.',
    technical: 'Worms exploit remote services or misconfigurations, then repeat from each new host. Defenses: patch the vulnerable service, segment the network, restrict lateral ports, monitor for one host contacting many, and isolate infected hosts. Patching does not remove an existing infection.',
    example: { label: 'Synthetic propagation records', text: '02:14:03 gatehouse -> barracks tcp/4430 malformed request\n02:14:03 gatehouse -> market   tcp/4430 malformed request\n02:14:05 gatehouse -> stables  tcp/4430 rejected (patched)' },
    mistake: 'Patching an already-infected host and assuming it is clean.',
    takeaway: 'Find the first infected host, isolate it, and patch what has not yet been reached.',
    links: [{ label: 'MITRE ATT&CK T1210: Exploitation of Remote Services', url: 'https://attack.mitre.org/techniques/T1210/' }, { label: 'NIST SP 800-83', url: 'https://csrc.nist.gov/pubs/sp/800/83/r1/final' }],
  },
  {
    id: 'trojans-and-trust', title: 'Trojans and Trust', category: 'Threats & Malware', source: 'The False Ally',
    concept: 'Deceptive software, provenance, and least privilege.',
    plain: 'A Trojan pretends to be something helpful. Compare what a tool says it does with what it asks to access, and where it came from.',
    technical: 'Check publisher, signature, and checksum against an official source. Grant least privilege: only the permissions the stated purpose needs. Use a sandbox for plausible but unverified tools, and application control where practical.',
    example: { label: 'Mismatch (synthetic)', text: 'purpose: adds numbers\nrequested: read_all_archive, send_anywhere, run_hidden\nsignature: none   checksum: MISMATCH' },
    mistake: 'Rejecting everything that asks for broad access, or approving everything that looks polished.',
    takeaway: 'Verify the source and match permissions to purpose.',
    links: [{ label: 'MITRE ATT&CK T1204: User Execution', url: 'https://attack.mitre.org/techniques/T1204/' }, { label: 'CISA: Recognize and report phishing', url: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing' }],
  },
  {
    id: 'ransomware-response', title: 'Responding to Ransomware', category: 'Threats & Malware', source: 'The Iron Usurper',
    concept: 'Containment, evidence preservation, backup integrity, and recovery priority.',
    plain: 'When files are locked, stop the spread, keep the evidence, choose a clean backup, and restore the most critical things first. Payment is not a recovery plan.',
    technical: 'Identify and isolate affected hosts, capture memory and disk images, find the first affected host from the earliest events, verify that backups predate the compromise and are isolated and tested, restore by business criticality, rebuild, reset credentials, and report. Many incidents include data theft, so scope matters.',
    example: { label: 'Symptom vs source (synthetic)', text: '03:09 SCRIBE-PC-07 attachment opened\n03:12 ARCHIVE-01 4,812 files renamed *.locked' },
    mistake: 'Treating the loudest symptom as the source, or restoring from the newest backup without checking it.',
    takeaway: 'Contain, preserve, verify, restore by priority, and report.',
    links: [{ label: 'CISA #StopRansomware Guide', url: 'https://www.cisa.gov/stopransomware/ransomware-guide' }, { label: 'MITRE ATT&CK T1486: Data Encrypted for Impact', url: 'https://attack.mitre.org/techniques/T1486/' }],
  },
];

/** One generated page per creature, so every Bestiary entry has a Grimoire page. */
const GENERATED = MALWARE_CREATURES.map((c) => ({
  id: `beast-${c.id}`,
  title: `${c.name}: ${c.malwareType}`,
  category: 'Threats & Malware',
  source: c.title,
  concept: c.malwareType,
  plain: c.definition,
  technical: `${c.behavior} ${c.distinguish}`,
  example: { label: 'Synthetic evidence', text: c.evidence.join('\n') },
  mistake: c.distinguish,
  takeaway: c.defense,
  links: c.references,
}));

export const GRIMOIRE_PAGES = [...HANDWRITTEN, ...GENERATED];
export const GRIMOIRE_BY_ID = Object.fromEntries(GRIMOIRE_PAGES.map((p) => [p.id, p]));
export const GRIMOIRE_CATEGORIES = [...new Set(GRIMOIRE_PAGES.map((p) => p.category))];
