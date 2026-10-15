export const SKILLS = {
  networking: { id: 'networking', name: 'Networking', rune: 'ᚾ', blurb: 'How messages travel between systems.' },
  webapp: { id: 'webapp', name: 'Web & Application Security', rune: 'ᚹ', blurb: 'Keeping applications and their users safe.' },
  logs_ir: { id: 'logs_ir', name: 'Logs & Incident Response', rune: 'ᛚ', blurb: 'Reading evidence and responding to incidents.' },
  coding: { id: 'coding', name: 'Secure Coding', rune: 'ᚲ', blurb: 'Reading and writing code that resists abuse.' },
  vuln: { id: 'vuln', name: 'Vulnerability Investigation', rune: 'ᚢ', blurb: 'Finding weaknesses and explaining their cause.' },
  forensics: { id: 'forensics', name: 'Forensics & Analysis', rune: 'ᛈ', blurb: 'Preserving evidence and reasoning from it.' },
  malware: { id: 'malware', name: 'Threats & Malware', rune: 'ᛗ', blurb: 'Understanding how malicious software behaves and how to defend against it.' },
};
export const SKILL_LIST = Object.values(SKILLS);
export const ASSESSED_SKILLS = ['networking', 'webapp', 'logs_ir', 'coding', 'vuln', 'forensics'];
