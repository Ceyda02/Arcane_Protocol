import { describe, it, expect } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from '../state/GameContext.jsx';
import App from '../app/App.jsx';
import { SAVE_KEY } from '../storage/saveStorage.js';
import { createInitialState } from '../storage/saveSchema.js';
import { DEFAULT_PLAYER } from '../content/archetypes.js';
import { completeChapter1, newStore } from './helpers.js';

const seed = (game) => window.localStorage.setItem(SAVE_KEY, JSON.stringify(game));
const baseGame = (over = {}) => ({ ...createInitialState(), player: { ...DEFAULT_PLAYER }, pathId: 'blue', settings: { ...createInitialState().settings, language: 'en', textSpeed: 'instant', reducedMotion: 'on' }, ...over });
const renderApp = (route = '/') => render(<GameProvider><MemoryRouter initialEntries={[route]}><App /></MemoryRouter></GameProvider>);

describe('new player flow', () => {
  it('title -> character creation -> assessment -> results -> map', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(screen.getByRole('button', { name: /new game|yeni oyun/i }));
    expect(screen.getByRole('heading', { name: /create your character/i })).toBeInTheDocument();

    // Name is required
    await user.click(screen.getByRole('button', { name: /begin the adventure/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/name/i);
    await user.type(screen.getByLabelText(/^name$/i), 'Mira');
    await user.click(screen.getByRole('button', { name: /begin the adventure/i }));

    expect(await screen.findByRole('heading', { name: /trial of three runes|üç rün sınavı/i })).toBeInTheDocument();
    expect(screen.getByText(/not a validated psychometric test|geçerliliği kanıtlanmış bir kişilik testi/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /begin the trial|sınava başla/i }));

    // Answer every question with the first option, via keyboard-accessible radios
    for (let i = 0; i < 14; i += 1) {
      const radios = screen.getAllByRole('radio');
      await user.click(radios[0]);
      const next = screen.queryByRole('button', { name: /^(next|sonraki)$/i }) ?? screen.getByRole('button', { name: /see my path|yolumu gör/i });
      await user.click(next);
    }
    expect(await screen.findByRole('heading', { name: /your starting path/i })).toBeInTheDocument();
    expect(screen.getByText(/Recommended:/)).toBeInTheDocument();

    // Choose another path, then enter the world
    await user.click(screen.getByRole('button', { name: /walk the red order/i }));
    expect(screen.getByRole('button', { name: /your current order/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /enter hexaria/i }));
    expect(await screen.findByRole('heading', { name: /hexaria dünya haritası/i })).toBeInTheDocument();
  });

  it('"Start now" creates the default character immediately', async () => {
    const user = userEvent.setup();
    renderApp('/create');
    await user.click(screen.getByRole('button', { name: /start now as/i }));
    expect(await screen.findByRole('heading', { name: /trial of three runes|üç rün sınavı/i })).toBeInTheDocument();
  });

  it('the player can skip the trial and choose a path themselves', async () => {
    const user = userEvent.setup();
    seed(baseGame({ pathId: null }));
    renderApp('/assessment');
    await user.click(screen.getByRole('button', { name: /skip and choose a path myself/i }));
    expect(screen.getByRole('heading', { name: /choose your order/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enter hexaria/i })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /walk the purple order/i }));
    expect(screen.getByRole('button', { name: /enter hexaria/i })).toBeEnabled();
  });

  it('shows the opening assessment in Turkish when Turkish is selected', async () => {
    const user = userEvent.setup();
    seed(baseGame({ settings: { ...createInitialState().settings, language: 'tr' } }));
    renderApp('/assessment');
    expect(screen.getByRole('heading', { name: 'Üç Rün Sınavı' })).toBeInTheDocument();
    expect(screen.getByText(/14 sorudan oluşan/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sınava başla' }));
    expect(screen.getByRole('heading', { name: /Tarayıcınıza bir web sitesi adı yazdığınızda DNS ne yapar/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Site adını, bilgisayarınızın bağlanabileceği bir IP adresine dönüştürür/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Henüz emin değilim' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sonraki' })).toBeDisabled();
  });
});

describe('reset flow', () => {
  it('asks for confirmation, cancel keeps progress, confirm erases it', async () => {
    const user = userEvent.setup();
    const completedGame = completeChapter1(newStore()).game;
    completedGame.settings.language = 'tr';
    seed(completedGame);
    renderApp('/settings');
    await user.click(screen.getByRole('button', { name: /tüm ilerlemeyi sıfırla/i }));
    const dlg = screen.getByRole('alertdialog');
    expect(within(dlg).getByText(/geri alınamaz/i)).toBeInTheDocument();
    await user.click(within(dlg).getByRole('button', { name: /vazgeç/i }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(SAVE_KEY)).progress.completedQuests).toContain('bells-of-the-silent-watch');

    await user.click(screen.getByRole('button', { name: /tüm ilerlemeyi sıfırla/i }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /evet, hepsini sil/i }));
    expect(await screen.findByRole('button', { name: /yeni oyun/i })).toBeInTheDocument();
    const saved = window.localStorage.getItem(SAVE_KEY);
    expect(saved === null || JSON.parse(saved).player === null).toBe(true);
  });

  it('Escape closes the confirmation dialog', async () => {
    const user = userEvent.setup();
    seed(baseGame());
    renderApp('/settings');
    await user.click(screen.getByRole('button', { name: /reset all progress/i }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('title screen confirms before starting a new game over an existing one', async () => {
    const user = userEvent.setup();
    seed(baseGame());
    renderApp('/');
    expect(screen.getByRole('button', { name: /continue adventure/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^new game$/i }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /keep my adventure/i }));
    expect(screen.getByRole('button', { name: /continue adventure/i })).toBeInTheDocument();
  });
});

describe('persistence', () => {
  it('progress survives leaving and returning (remount reads the save)', async () => {
    const user = userEvent.setup();
    seed(baseGame({ assessment: { completed: false, answers: {}, result: null } }));
    const first = renderApp('/profile');
    await user.click(screen.getByRole('button', { name: /^echoes|order of echoes$/i }));
    first.unmount();
    expect(JSON.parse(window.localStorage.getItem(SAVE_KEY)).pathId).toBe('echoes');
    renderApp('/profile');
    expect(screen.getByRole('button', { name: /order of echoes/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('survives a corrupt save by starting fresh with a message instead of crashing', () => {
    window.localStorage.setItem(SAVE_KEY, '{broken');
    renderApp('/');
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be read/i);
    expect(screen.getByRole('button', { name: /yeni oyun/i })).toBeInTheDocument();
  });
});

describe('localization and world map', () => {
  it('defaults the main menu to Turkish and persists a language change', async () => {
    const user = userEvent.setup();
    renderApp('/');
    expect(screen.getByRole('button', { name: /yeni oyun/i })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Dil'), 'en');
    expect(screen.getByRole('button', { name: /^new game$/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(SAVE_KEY)).settings.language).toBe('en');
      expect(document.documentElement.lang).toBe('en');
    });
  });

  it('shows nine selectable regions and translated detail text in Turkish', async () => {
    const user = userEvent.setup();
    seed(baseGame({ settings: { ...createInitialState().settings, language: 'tr' } }));
    renderApp('/map');
    expect(screen.getByRole('heading', { name: 'Krallık Toprakları' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unutulmuş Gözlemevi, kilitli/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Çürümüş Topraklar, kilitli/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Hexaria’nın dağ krallıklarını/i })).toHaveAttribute('src', '/hexaria-world-map.png');
    expect(screen.getByRole('navigation', { name: /Ana gezinme/i })).toBeInTheDocument();
    const encounterTitle = screen.getByText('Yayılan Çürüme');
    const encounterBadge = screen.getAllByText('Yaratık karşılaşması').find((badge) => badge.parentElement === encounterTitle.parentElement);
    expect(encounterTitle.parentElement).toHaveClass('quest-title-line');
    expect(encounterBadge).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Parçalanmış Ağ, kilitli/i }));
    expect(screen.getByRole('heading', { name: 'Parçalanmış Ağ' })).toBeInTheDocument();
    expect(screen.getByText(/yozlaşmış bir ormanın/i)).toBeInTheDocument();
  });

  it('shows passed findings, story tabs, and read state in the Chronicle', async () => {
    const user = userEvent.setup();
    const game = completeChapter1(newStore()).game;
    game.settings.language = 'tr';
    seed(game);
    renderApp('/journal');
    expect(await screen.findByRole('heading', { name: /Yankıların Kroniği/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Etkin Görevler' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sessiz Nöbetin Çanları' })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'İpuçlarının İzinde' }));
    expect(screen.getByText(/Kanıtların doğruladığı bilgileri/i)).toBeInTheDocument();
    expect(screen.getAllByText('Doğrulanmış gözlem').length).toBeGreaterThan(0);
    const readButton = screen.getAllByRole('button', { name: 'Okundu olarak işaretle' })[0];
    await user.click(readButton);
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(SAVE_KEY)).progress.chronicle.readEntryIds.length).toBe(1);
    });
  });

  it('pins a quest objective, shows the compact game tracker, and can hide it', async () => {
    const user = userEvent.setup();
    const initial = createInitialState();
    seed(baseGame({
      progress: {
        ...initial.progress,
        questState: { 'bells-of-the-silent-watch': { stage: 1, flags: {} } },
      },
    }));
    renderApp('/journal');

    const questCard = (await screen.findByRole('heading', { name: 'The Bells of the Silent Watch' })).closest('li');
    await user.click(within(questCard).getAllByRole('button', { name: 'Pin objective' })[0]);
    expect(await screen.findByRole('complementary', { name: 'Pinned objective' })).toHaveTextContent('Name the Signs');
    const tracker = screen.getByRole('complementary', { name: 'Pinned objective' });
    await user.click(within(tracker).getByRole('button', { name: 'Hide tracker' }));
    expect(screen.getAllByRole('button', { name: 'Show tracker' }).length).toBeGreaterThan(0);

    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY));
    expect(saved.progress.chronicle.pinnedObjectiveId).toBe('bells-of-the-silent-watch:c1-events');
    expect(saved.progress.chronicle.trackerHidden).toBe(true);
  });
});

describe('chapter 1 in the UI', () => {
  it('renders and completes the first challenge in Turkish', async () => {
    const user = userEvent.setup();
    seed(baseGame({
      settings: { ...createInitialState().settings, language: 'tr', textSpeed: 'instant', reducedMotion: 'on' },
      progress: { ...createInitialState().progress, questState: { 'bells-of-the-silent-watch': { stage: 2, flags: {} } } },
    }));
    renderApp('/quest/bells-of-the-silent-watch');

    expect(await screen.findByRole('heading', { name: 'İşaretleri Adlandır' })).toBeInTheDocument();
    expect(screen.getByText(/Adım 3/)).toBeInTheDocument();
    expect(screen.getByText(/Amaç:/)).toBeInTheDocument();
    const selects = screen.getAllByRole('combobox');
    for (const [select, value] of selects.map((element, index) => [element, ['event', 'alert', 'false_positive', 'incident'][index]])) {
      await user.selectOptions(select, value);
    }
    await user.click(screen.getByRole('button', { name: 'Yanıtımı kontrol et' }));
    expect(await screen.findByText(/Aferin/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Öyküye devam et' }));
    expect(await screen.findByText('Kayıt Defterini Okumak')).toBeInTheDocument();
  });

  it('shows Chapter 1 completion details in Turkish', async () => {
    seed(completeChapter1(newStore()).game);
    renderApp('/quest/bells-of-the-silent-watch');
    expect(await screen.findByRole('heading', { name: /Bölüm tamamlandı: Sessiz Nöbetin Çanları/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bildiklerimiz' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Haritaya dön' })).toBeInTheDocument();
  });

  it('Continue Adventure resumes Chapter 1; dialogue advances with the keyboard; a choice changes who teaches', async () => {
    const user = userEvent.setup();
    seed(baseGame());
    renderApp('/');
    await user.click(screen.getByRole('button', { name: /continue adventure/i }));
    expect(await screen.findByRole('heading', { name: /bells of the silent watch/i })).toBeInTheDocument();
    expect(screen.getByText(/step 1 of/i)).toBeInTheDocument();
    // Enter advances (focus not on a control)
    document.activeElement?.blur?.();
    await user.keyboard('{Enter}');
    expect(screen.getByText(/I am Rowan, a royal investigator/)).toBeInTheDocument();
    document.activeElement?.blur?.();
    await user.keyboard('{Enter}');
    expect(screen.getByText(/Keeper Ash, captain of the Night Watch/)).toBeInTheDocument();
    for (let i = 0; i < 3; i += 1) { document.activeElement?.blur?.(); await user.keyboard('{Enter}'); }
    await user.click(await screen.findByRole('button', { name: /ask elowen/i }));
    await user.click(await screen.findByRole('button', { name: /^next$/i })); // reply
    // Transcript records the conversation
    await user.click(screen.getByRole('button', { name: /transcript/i }));
    expect(screen.getByLabelText(/dialogue transcript/i)).toHaveTextContent(/Ask Elowen/);
  });

  it('cannot skip the challenge: Continue only appears after a pass; hints and retries work', async () => {
    const user = userEvent.setup();
    seed(baseGame({ progress: { ...createInitialState().progress, questState: { 'bells-of-the-silent-watch': { stage: 2, flags: { askedFirst: 'ash' } } } } }));
    renderApp('/quest/bells-of-the-silent-watch');
    expect(await screen.findByText(/name the signs/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continue the story/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check my answer/i })).toBeDisabled();

    // wrong answers: everything "Event"
    const selects = screen.getAllByRole('combobox');
    for (const sel of selects) await user.selectOptions(sel, 'Event');
    await user.click(screen.getByRole('button', { name: /show a hint/i }));
    expect(screen.getByText(/An event is just a recorded happening/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /check my answer/i }));
    expect(screen.getByText(/Not yet/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continue the story/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    await user.selectOptions(selects[0], 'Event');
    await user.selectOptions(selects[1], 'Alert');
    await user.selectOptions(selects[2], 'False positive');
    await user.selectOptions(selects[3], 'Confirmed incident');
    await user.click(screen.getByRole('button', { name: /check my answer/i }));
    expect(await screen.findByText(/Well done/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /continue the story/i }));
    expect(await screen.findByText(/Reading a Ledger/)).toBeInTheDocument();
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY));
    expect(saved.progress.grimoire).toContain('events-alerts-incidents');
    expect(saved.progress.questState['bells-of-the-silent-watch'].stage).toBe(3);
  });

  it('sort-order challenge is keyboard operable with move buttons', async () => {
    const user = userEvent.setup();
    seed(baseGame({ progress: { ...createInitialState().progress, questState: { 'bells-of-the-silent-watch': { stage: 7, flags: {} } } } }));
    renderApp('/quest/bells-of-the-silent-watch');
    expect(await screen.findByText(/build the timeline/i)).toBeInTheDocument();
    const up = screen.getAllByRole('button', { name: /move earlier/i });
    expect(up[0]).toBeDisabled();
    const firstBefore = screen.getAllByRole('listitem')[0].textContent;
    const down = screen.getAllByRole('button', { name: /move later/i });
    down[0].focus();
    await user.keyboard('{Enter}');
    expect(screen.getAllByRole('listitem')[0].textContent).not.toBe(firstBefore);
  });
});

describe('Malware Bestiary in the UI', () => {
  it('shows the Bestiary interface and Hexaria creature details in Turkish', async () => {
    const user = userEvent.setup();
    const initial = createInitialState();
    seed(baseGame({
      settings: { ...initial.settings, language: 'tr', textSpeed: 'instant', reducedMotion: 'on' },
      progress: { ...initial.progress, bestiary: { shapeshifter: 'seen' } },
    }));
    renderApp('/bestiary');

    expect(await screen.findByRole('heading', { name: 'Yaratık Kitabı' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Zararlı Yazılım Yaratıkları (0/12)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bulaşma' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bilinmeyen yaratık.*Kalenin birbirine bağlı koridorları/ })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Diyar Yaratıkları' }));
    await user.click(screen.getByRole('button', { name: /Şekil Değiştiren/ }));
    expect(screen.getByText('Güvendiğin kişilerin yüzlerini takar. İzlemen gereken yüz değil, o yüzün yaptıklarıdır.')).toBeInTheDocument();
    expect(screen.getByText('Mecaz:')).toBeInTheDocument();
  });

  it('locked creatures are anonymous silhouettes; encounters are gated behind Chapter 1', async () => {
    const user = userEvent.setup();
    seed(baseGame());
    renderApp('/bestiary');
    expect(screen.queryByText('The Worm')).not.toBeInTheDocument();
    expect(screen.getAllByText(/unknown creature/i).length).toBeGreaterThanOrEqual(12);
    // groups by category
    for (const g of ['Infection', 'Deception', 'Surveillance', 'Persistence', 'Destruction', 'Coordinated Threats']) expect(screen.getByRole('heading', { name: g })).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /unknown creature/i })[0]);
    expect(screen.getByText(/to meet this creature/i)).toBeInTheDocument();
  });

  it('after Chapter 1 the Worm encounter opens from the Bestiary and shows Real-World Knowledge', async () => {
    const user = userEvent.setup();
    const game = completeChapter1(newStore()).game;
    seed({ ...game, settings: { ...game.settings, language: 'en' } });
    renderApp('/bestiary');
    await user.click(screen.getAllByRole('button', { name: /unknown creature/i })[0]);
    await user.click(screen.getByRole('button', { name: /begin the encounter/i }));
    expect(await screen.findByRole('heading', { name: /the worm: the spreading blight/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /real-world knowledge/i })).toBeInTheDocument();
    expect(screen.getByText(/A worm is malware that copies itself/i)).toBeInTheDocument();
    expect(screen.getByText(/Blue Order \(yours\)/)).toBeInTheDocument();
  });

  it('plays the Worm boss in the UI: wrong patient zero is explained, then isolating patient zero wins', async () => {
    const user = userEvent.setup();
    let game = completeChapter1(newStore()).game;
    game = { ...game, settings: { ...game.settings, language: 'en', reducedMotion: 'on' }, progress: { ...game.progress, challengeRecords: { ...game.progress.challengeRecords, 'worm-beginner': { passed: true, bestScore: 1, attempts: 1, hintsUsed: 0, xpAwarded: 15 }, 'worm-intermediate': { passed: true, bestScore: 1, attempts: 1, hintsUsed: 0, xpAwarded: 20 } } } };
    seed(game);
    renderApp('/encounter/encounter-worm');
    expect(await screen.findByText(/stop the spreading blight/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check my answer/i })).toBeDisabled();
    // wrong guess
    await user.click(screen.getByRole('button', { name: 'Barracks' }));
    expect(screen.getByText(/victim, not the source/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Gatehouse' }));
    expect(await screen.findByText(/step 2: contain it/i)).toBeInTheDocument();

    // Select Gatehouse in the accessible table and isolate it
    const table = screen.getByRole('table', { name: /halls and their status/i });
    const row = within(table).getByText(/^Gatehouse$/).closest('tr');
    await user.click(within(row).getByRole('button', { name: /select/i }));
    await user.click(screen.getByRole('button', { name: /^isolate$/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /check my answer/i })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: /check my answer/i }));
    expect(await screen.findByText(/Well done/)).toBeInTheDocument();
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY));
    expect(saved.progress.challengeRecords['worm-boss'].passed).toBe(true);
    expect(saved.progress.completedQuests).toContain('encounter-worm');
    expect(saved.progress.bestiary.worm).toBe('defeated');
  });

  it('status is never colour-only: map markers and chips carry text', () => {
    seed(baseGame());
    renderApp('/map');
    expect(screen.getByRole('button', { name: /the crownlands, available/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /the rune gates, locked/i })).toBeInTheDocument();
    expect(screen.getAllByText(/available|locked|completed/i).length).toBeGreaterThan(0);
  });

  it('map shows genuine unlock requirements for a locked region and does not offer to play it', async () => {
    const user = userEvent.setup();
    seed(baseGame());
    renderApp('/map');
    await user.click(screen.getByRole('button', { name: /the rune gates, locked/i }));
    expect(screen.getByText(/to enter/i)).toBeInTheDocument();
    expect(screen.getByText(/Complete “The Bells of the Silent Watch”/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^begin$/i })).not.toBeInTheDocument();
  });

  it('opens an unlocked regional field study from the map in Turkish', async () => {
    const user = userEvent.setup();
    const game = completeChapter1(newStore()).game;
    game.settings.language = 'tr';
    seed(game);
    renderApp('/map');
    await user.click(screen.getByRole('button', { name: /Rün Kapıları, açık/i }));
    expect(screen.getByRole('heading', { name: 'Bölge saha çalışmaları' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Saha çalışması' }));
    expect(await screen.findByRole('heading', { name: 'Virüs: Rün Vebası' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Saha çalışmasına başla' }));
    expect(await screen.findByRole('radio', { name: /Bir ana dosyaya eklenir/i })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Bir ana dosyaya eklenir/i }));
    await user.click(screen.getByRole('button', { name: 'Yanıtımı kontrol et' }));
    expect(await screen.findByText(/Aferin\./)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tamam' }));
    expect(await screen.findByRole('heading', { name: 'Saha çalışması tamamlandı' })).toBeInTheDocument();
    expect(screen.getByText('Virüs: Dosya bulaştıran virüs')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(SAVE_KEY)).progress.challengeRecords['virus-beginner'].passed).toBe(true);
  });
});

describe('Grimoire', () => {
  it('shows an empty state at first, then search, bookmarks and review-later work', async () => {
    const user = userEvent.setup();
    seed(baseGame());
    const a = renderApp('/grimoire');
    expect(screen.getByText(/the grimoire is blank/i)).toBeInTheDocument();
    a.unmount();
    const completedGame = completeChapter1(newStore()).game;
    completedGame.settings.language = 'en';
    seed(completedGame);
    renderApp('/grimoire');
    expect(screen.getByRole('heading', { name: /cyber grimoire/i })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/search/i), 'time zone');
    expect(screen.getAllByRole('button', { name: /timelines and time zones/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /reading a log table/i })).not.toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /bookmark/i })[0]);
    expect(JSON.parse(window.localStorage.getItem(SAVE_KEY)).library.bookmarks).toContain('timelines-and-time-zones');
    await user.click(screen.getByRole('button', { name: /review later/i }));
    await user.clear(screen.getByLabelText(/search/i));
    await user.selectOptions(screen.getByLabelText(/^show$/i), 'bookmarks');
    expect(screen.getAllByRole('button', { name: /timelines and time zones/i }).length).toBeGreaterThan(0);
  });
});
