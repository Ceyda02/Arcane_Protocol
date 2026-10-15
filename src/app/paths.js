/** Route helpers, shared by pages and the Continue Adventure logic. */
export const questPath = (quest) => (quest.kind === 'encounter' ? `/encounter/${quest.id}` : `/quest/${quest.id}`);
export const studyPath = (creatureId) => `/study/${creatureId}`;
