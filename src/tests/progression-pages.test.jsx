import { describe, expect, it } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from '../state/GameContext.jsx';
import App from '../app/App.jsx';
import { DEFAULT_PLAYER } from '../content/archetypes.js';
import { createInitialState } from '../storage/saveSchema.js';
import { SAVE_KEY } from '../storage/saveStorage.js';
import { completeChapter1, newStore } from './helpers.js';
import { INVESTIGATION_BOARDS } from '../content/investigationBoards.js';
import { t } from '../i18n/index.js';

const seed = (game) => window.localStorage.setItem(SAVE_KEY, JSON.stringify(game));
const renderApp = (route) => render(<GameProvider><MemoryRouter initialEntries={[route]}><App /></MemoryRouter></GameProvider>);
const english = (game) => ({ ...game, settings: { ...game.settings, language: 'en' } });

describe('investigation board and demonstrated skills', () => {
  it('shows the real prerequisites before the evidence board is unlocked', async () => {
    seed(english({ ...createInitialState(), player: { ...DEFAULT_PLAYER } }));
    renderApp('/investigation-board');
    expect(await screen.findByRole('heading', { name: 'The case file is not ready' })).toBeInTheDocument();
    expect(screen.getByText('Inspect the Ledger')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to the chapter' })).toHaveAttribute('href', '/quest/bells-of-the-silent-watch');
  });

  it('saves evidence review, board selections, a repaired timeline, conclusion, and corroboration', async () => {
    const user = userEvent.setup();
    seed(english(completeChapter1(newStore()).game));
    renderApp('/investigation-board');

    expect(await screen.findByRole('heading', { name: 'The Investigator’s Table' })).toBeInTheDocument();
    const board = INVESTIGATION_BOARDS.watchtower;
    for (const item of board.evidence) {
      const title = t('en', `investigation.clue.${item.id}.title`);
      const card = screen.getAllByText(title).find((element) => element.closest('details')).closest('details');
      await user.click(within(card).getByText(title));
      await user.click(within(card).getByRole('radio', { name: t('en', `investigation.status.${item.status}`) }));
      if (board.expectedBoardEvidence.includes(item.id)) {
        await user.click(within(card).getByRole('checkbox', { name: 'Place on the evidence board' }));
      }
    }

    const timelineOrder = board.timeline.map((item) => item.id).reverse();
    const correctOrder = board.timeline.map((item) => item.id);
    for (let targetIndex = 0; targetIndex < correctOrder.length; targetIndex += 1) {
      let currentIndex = timelineOrder.indexOf(correctOrder[targetIndex]);
      while (currentIndex > targetIndex) {
        const movingId = timelineOrder[currentIndex];
        await user.click(screen.getByRole('button', {
          name: `Move earlier: ${t('en', `investigation.clue.${movingId}.title`)}`,
        }));
        [timelineOrder[currentIndex - 1], timelineOrder[currentIndex]] = [timelineOrder[currentIndex], timelineOrder[currentIndex - 1]];
        currentIndex -= 1;
      }
    }

    for (const id of board.correctConnections) {
      await user.click(screen.getByLabelText(t('en', `investigation.connection.${id}`)));
    }
    await user.click(screen.getByLabelText(t('en', 'investigation.conclusion.supported-correlation')));
    await user.click(screen.getByLabelText('Ask Bram, examine the session records, and verify the export’s contents.'));
    await user.click(screen.getByRole('button', { name: 'Submit evidence review' }));

    expect(await screen.findByRole('heading', { name: 'Case review complete' })).toBeInTheDocument();
    expect(screen.getByText('Evidence score: 100%')).toBeInTheDocument();
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY));
    expect(saved.progress.investigationRecords.watchtower).toEqual({ passed: true, bestScore: 1, attempts: 1, rewardedXp: 35 });
    expect(saved.progress.investigationDrafts.watchtower.timelineOrder).toEqual(correctOrder);
  });

  it('restores saved investigation evidence classifications after leaving the page', async () => {
    const user = userEvent.setup();
    seed(english(completeChapter1(newStore()).game));
    const rendered = renderApp('/investigation-board');
    const evidenceTitle = t('en', 'investigation.clue.owner-statement.title');
    const card = screen.getByText(evidenceTitle).closest('details');
    await user.click(within(card).getByText(evidenceTitle));
    await user.click(within(card).getByRole('radio', { name: 'Unverified / unresolved' }));
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(SAVE_KEY)).progress.investigationDrafts.watchtower.evidenceStatuses['owner-statement']).toBe('unresolved');
    });

    rendered.unmount();
    renderApp('/investigation-board');
    const restoredCard = screen.getByText(evidenceTitle).closest('details');
    await user.click(within(restoredCard).getByText(evidenceTitle));
    expect(within(restoredCard).getByRole('radio', { name: 'Unverified / unresolved' })).toBeChecked();
  });

  it('derives skill progress from distinct passed challenges and offers a next step', async () => {
    const user = userEvent.setup();
    seed(english(completeChapter1(newStore()).game));
    renderApp('/skill-tree');
    expect(await screen.findByRole('heading', { name: 'Skill tree' })).toBeInTheDocument();
    expect(screen.getAllByText(/demonstrated this concept in multiple passed challenges/i).length).toBeGreaterThan(0);
    const malwareSkill = screen.getByRole('button', { name: /Malware analysis/i });
    expect(malwareSkill).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getAllByRole('link', { name: 'Open chapter' })).toHaveLength(1);
    await user.click(malwareSkill);
    expect(malwareSkill).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('link', { name: 'Open chapter' }).length).toBeGreaterThan(1);
    expect(screen.getByRole('region', { name: /Malware analysis/i })).toBeVisible();
    const forensicsSkill = screen.getByRole('button', { name: /Digital forensics/i });
    await user.click(forensicsSkill);
    expect(forensicsSkill).toHaveAttribute('aria-expanded', 'true');
    expect(malwareSkill).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region', { name: /Malware analysis/i })).not.toBeInTheDocument();
    expect(screen.getByText(/not a certification/i)).toBeInTheDocument();
  });
});
