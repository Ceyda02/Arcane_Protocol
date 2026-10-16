import { INVESTIGATION_BOARDS } from '../content/investigationBoards.js';

const round2 = (value) => Math.round(value * 100) / 100;

export function evaluateInvestigation(boardId, answer, challengeRecords) {
  const board = INVESTIGATION_BOARDS[boardId];
  if (!board) return { unlocked: false, missingChallenges: [], passed: false, score: 0 };

  const missingChallenges = board.requiredChallenges.filter((id) => !challengeRecords[id]?.passed);
  if (missingChallenges.length) return { unlocked: false, missingChallenges, passed: false, score: 0 };

  const selected = Array.isArray(answer?.connections)
    ? [...new Set(answer.connections.filter((id) => board.connectionIds.includes(id)))]
    : [];
  const connectionsCorrect = selected.length === board.correctConnections.length
    && board.correctConnections.every((id) => selected.includes(id))
    && selected.length === (Array.isArray(answer?.connections) ? new Set(answer.connections).size : 0);
  const conclusionCorrect = board.conclusionIds.includes(answer?.conclusionId)
    && answer.conclusionId === board.correctConclusionId;
  const nextEvidenceCorrect = board.nextEvidenceIds.includes(answer?.nextEvidenceId)
    && answer.nextEvidenceId === board.correctNextEvidenceId;
  const score = round2((connectionsCorrect ? 0.4 : 0) + (conclusionCorrect ? 0.3 : 0) + (nextEvidenceCorrect ? 0.3 : 0));

  return {
    unlocked: true,
    missingChallenges: [],
    passed: connectionsCorrect && conclusionCorrect && nextEvidenceCorrect,
    score,
    checks: { connectionsCorrect, conclusionCorrect, nextEvidenceCorrect },
  };
}
