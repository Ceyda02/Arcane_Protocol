import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from '../state/GameContext.jsx';
import App from '../app/App.jsx';
import { DEFAULT_PLAYER } from '../content/archetypes.js';
import { createInitialState } from '../storage/saveSchema.js';
import { SAVE_KEY } from '../storage/saveStorage.js';
import { completeChapter1, newStore } from './helpers.js';

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

  it('resolves the case only when the timeline, conclusion, and next evidence are supported', async () => {
    const user = userEvent.setup();
    seed(english(completeChapter1(newStore()).game));
    renderApp('/investigation-board');

    await user.click(screen.getByLabelText('The unfamiliar login sequence happens before the sensitive export.'));
    await user.click(screen.getByLabelText('The export happens before the later gate opening.'));
    await user.click(screen.getByLabelText('Bram’s account was used from an unfamiliar address, followed by a sensitive export.'));
    await user.click(screen.getByLabelText('Ask Bram, examine the session records, and verify the export’s contents.'));
    await user.click(screen.getByRole('button', { name: 'Submit evidence review' }));

    expect(await screen.findByRole('heading', { name: 'Case review complete' })).toBeInTheDocument();
    expect(screen.getByText('Evidence score: 100%')).toBeInTheDocument();
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY));
    expect(saved.progress.investigationRecords.watchtower).toEqual({ passed: true, bestScore: 1, attempts: 1 });
  });

  it('derives skill progress from distinct passed challenges and offers a next step', async () => {
    seed(english(completeChapter1(newStore()).game));
    renderApp('/skill-tree');
    expect(await screen.findByRole('heading', { name: 'Skill tree' })).toBeInTheDocument();
    expect(screen.getAllByText(/demonstrated this concept in multiple passed challenges/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Open chapter' }).length).toBeGreaterThan(0);
    expect(screen.getByText(/not a certification/i)).toBeInTheDocument();
  });
});
