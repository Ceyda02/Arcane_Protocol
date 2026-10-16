export const INVESTIGATION_BOARDS = {
  watchtower: {
    id: 'watchtower',
    requiredChallenges: ['c1-ledger', 'c1-timeline', 'c1-shapeshifter'],
    skill: 'forensics',
    xp: 35,
    clueIds: ['login-pattern', 'ledger-export', 'gate-opening'],
    connectionIds: ['login-to-export', 'export-to-gate', 'same-person-proven'],
    correctConnections: ['login-to-export', 'export-to-gate'],
    conclusionIds: ['supported-correlation', 'proven-attribution', 'false-positive'],
    correctConclusionId: 'supported-correlation',
    nextEvidenceIds: ['corroborating-records', 'address-owner', 'assume-attacker'],
    correctNextEvidenceId: 'corroborating-records',
  },
};
