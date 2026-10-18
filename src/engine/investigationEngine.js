import { INVESTIGATION_BOARDS } from '../content/investigationBoards.js';

const round2 = (value) => Math.round(value * 100) / 100;

function validSet(values, allowed) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((value) => typeof value === 'string' && allowed.includes(value)))];
}

function isExactSet(selected, expected, original) {
  return selected.length === expected.length
    && expected.every((id) => selected.includes(id))
    && selected.length === (Array.isArray(original) ? new Set(original).size : 0);
}

export function evaluateInvestigation(boardId, answer, challengeRecords) {
  const board = INVESTIGATION_BOARDS[boardId];
  if (!board) return { unlocked: false, missingChallenges: [], passed: false, score: 0 };

  const missingChallenges = board.requiredChallenges.filter((id) => !challengeRecords[id]?.passed);
  if (missingChallenges.length) return { unlocked: false, missingChallenges, passed: false, score: 0 };

  const selected = validSet(answer?.connections, board.connectionIds);
  const connectionsCorrect = isExactSet(selected, board.correctConnections, answer?.connections);
  const timeline = validSet(answer?.timelineOrder, board.timeline.map((event) => event.id));
  const expectedTimeline = board.timeline.map((event) => event.id);
  const timelineCorrect = timeline.length === expectedTimeline.length
    && expectedTimeline.every((id, index) => timeline[index] === id)
    && timeline.length === (Array.isArray(answer?.timelineOrder) ? new Set(answer.timelineOrder).size : 0);
  const evidenceIds = board.evidence.map((item) => item.id);
  const statuses = answer?.evidenceStatuses && typeof answer.evidenceStatuses === 'object' && !Array.isArray(answer.evidenceStatuses)
    ? answer.evidenceStatuses
    : {};
  const evidenceStatusesCorrect = evidenceIds.every((id) => statuses[id] === board.evidence.find((item) => item.id === id).status)
    && Object.keys(statuses).length === evidenceIds.length;
  const boardEvidence = validSet(answer?.boardEvidence, evidenceIds);
  const boardEvidenceCorrect = isExactSet(boardEvidence, board.expectedBoardEvidence, answer?.boardEvidence);
  const conclusionCorrect = board.conclusionIds.includes(answer?.conclusionId)
    && answer.conclusionId === board.correctConclusionId;
  const nextEvidenceCorrect = board.nextEvidenceIds.includes(answer?.nextEvidenceId)
    && answer.nextEvidenceId === board.correctNextEvidenceId;
  const correctConnectionCount = selected.filter((id) => board.correctConnections.includes(id)).length;
  const wrongConnectionCount = selected.length - correctConnectionCount;
  const connectionScore = Math.max(0, correctConnectionCount - wrongConnectionCount) / board.correctConnections.length;
  const correctStatusCount = evidenceIds.filter((id) => statuses[id] === board.evidence.find((item) => item.id === id).status).length;
  const evidenceScore = correctStatusCount / evidenceIds.length;
  const correctBoardCount = boardEvidence.filter((id) => board.expectedBoardEvidence.includes(id)).length;
  const wrongBoardCount = boardEvidence.length - correctBoardCount;
  const boardEvidenceScore = Math.max(0, correctBoardCount - wrongBoardCount) / board.expectedBoardEvidence.length;
  const score = round2(
    connectionScore * 0.2
    + (timelineCorrect ? 0.2 : 0)
    + evidenceScore * 0.25
    + boardEvidenceScore * 0.1
    + (conclusionCorrect ? 0.15 : 0)
    + (nextEvidenceCorrect ? 0.1 : 0),
  );

  return {
    unlocked: true,
    missingChallenges: [],
    passed: connectionsCorrect && timelineCorrect && evidenceStatusesCorrect && boardEvidenceCorrect && conclusionCorrect && nextEvidenceCorrect,
    score,
    checks: { connectionsCorrect, timelineCorrect, evidenceStatusesCorrect, boardEvidenceCorrect, conclusionCorrect, nextEvidenceCorrect },
  };
}
