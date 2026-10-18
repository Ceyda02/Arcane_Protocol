import { describe, expect, it } from 'vitest';
import { t } from '../i18n/index.js';
import { localizeBestiaryCreature } from '../i18n/bestiary.js';
import { localizeChapter1 } from '../i18n/chapter1.js';
import { CHAPTER1_LESSONS, CHAPTER1_SCENES } from '../content/quests/chapter1.js';
import { CHAPTER1_CHALLENGES } from '../content/challenges/chapter1.js';
import { createInitialState, migrateSave, sanitizeState } from '../storage/saveSchema.js';
import { REALM_CREATURES } from '../content/bestiary.js';
import { MALWARE_CREATURES } from '../content/malware/creatures.js';

describe('language preference', () => {
  it('defaults new games to Turkish', () => {
    expect(createInitialState().settings.language).toBe('tr');
  });

  it('preserves supported language choices and falls back for invalid values', () => {
    const state = createInitialState();
    expect(sanitizeState({ ...state, settings: { ...state.settings, language: 'en' } }).state.settings.language).toBe('en');
    expect(sanitizeState({ ...state, settings: { ...state.settings, language: 'fr' } }).state.settings.language).toBe('tr');
  });

  it('migrates existing v1 saves without discarding game progress', () => {
    const oldSave = { ...createInitialState(), version: 1, progress: { ...createInitialState().progress, xp: 140 } };
    const result = migrateSave(oldSave);
    expect(result.ok).toBe(true);
    expect(result.data.version).toBe(4);
    expect(result.data.settings.language).toBe('en');
    expect(result.data.progress.xp).toBe(140);
  });

  it('uses English as a fallback for missing translations', () => {
    expect(t('tr', 'settings.reading')).toBe('Okuma');
    expect(t('tr', 'menu.main')).toBe('Ana menü');
    expect(t('en', 'settings.reading')).toBe('Reading');
    expect(t('tr', 'unknown.translation.key')).toBe('unknown.translation.key');
  });

  it('provides localized labels for the investigation board and skill tree', () => {
    const keys = [
      'skillTree.title', 'skillTree.recommended', 'skillTree.tier.unexplored', 'skillTree.tier.demonstrated',
      'skillTree.tier.practiced', 'skillTree.measurementNote', 'skillTree.disclaimer',
      'investigation.title', 'investigation.sealed', 'investigation.evidenceTitle', 'investigation.connectionsTitle',
      'investigation.conclusionTitle', 'investigation.nextEvidenceTitle', 'investigation.submit',
      'investigation.caseTitle', 'investigation.case.watchtower.title', 'investigation.case.watchtower.intro',
      'investigation.case.watchtower.objective.timeline', 'investigation.classifyEvidence', 'investigation.status.unresolved',
      'investigation.boardEvidence', 'investigation.timelineTitle', 'investigation.learning.technical',
      'investigation.connection.login-to-export', 'investigation.connection.export-to-gate',
      'investigation.conclusion.supported-correlation', 'investigation.nextEvidence.corroborating-records',
      'investigation.feedback.connectionsTry', 'investigation.feedback.conclusionTry', 'investigation.feedback.evidenceTry',
    ];
    for (const language of ['en', 'tr']) {
      for (const key of keys) expect(t(language, key)).not.toBe(key);
    }
    for (const key of ['investigation.caseTitle', 'investigation.case.watchtower.intro', 'investigation.status.unresolved', 'investigation.timelineTitle']) {
      expect(t('tr', key)).not.toBe(t('en', key));
    }
  });

  it('localizes the Bestiary interface and creature metadata in both languages', () => {
    const keys = [
      'bestiary.title', 'bestiary.tabs', 'bestiary.malwareTab', 'bestiary.realmTab',
      'bestiary.chooseCreature', 'bestiary.category.Infection', 'bestiary.blurb.Infection',
      'bestiary.detail.meetCreature', 'realWorld.title', 'realWorld.whatItIs',
      'realWorld.perspectives', 'realWorld.order.blue',
    ];
    for (const language of ['en', 'tr']) {
      for (const key of keys) expect(t(language, key)).not.toBe(key);
    }
    const shapeshifter = REALM_CREATURES.find((creature) => creature.id === 'shapeshifter');
    const worm = MALWARE_CREATURES.find((creature) => creature.id === 'worm');
    expect(localizeBestiaryCreature(shapeshifter, 'tr').name).toBe('Şekil Değiştiren');
    expect(localizeBestiaryCreature(shapeshifter, 'tr').concepts).toContain('Bağlam');
    expect(localizeBestiaryCreature(worm, 'tr').name).toBe('Solucan');
    expect(localizeBestiaryCreature(worm, 'en')).toBe(worm);
  });

  it('localizes Chapter 1 dialogue, lessons, and every challenge without changing answer data', () => {
    const scene = localizeChapter1(CHAPTER1_SCENES[0], 'tr');
    expect(scene.nodes[0].text).toMatch(/Alacakaranlık/);
    expect(scene.nodes[0].speaker).toBe('narrator');
    expect(scene.nodes[5].options[0].id).toBe('ash');
    expect(scene.nodes[5].options[0].text).toMatch(/Kale Muhafızı Ash/);

    const lesson = localizeChapter1(CHAPTER1_LESSONS['events-alerts-incidents'], 'tr');
    expect(lesson.title).toBe('Olaylar, Uyarılar ve Güvenlik Vakaları');
    expect(lesson.sections[0].heading).toBe('Olay, gerçekleşen ve kayda geçen her şeydir');

    for (const challenge of CHAPTER1_CHALLENGES) {
      const localized = localizeChapter1(challenge, 'tr');
      expect(localized.title).not.toBe(challenge.title);
      expect(localized.id).toBe(challenge.id);
      if (challenge.data.correct) expect(localized.data.correct).toEqual(challenge.data.correct);
      if (challenge.data.correctIds) expect(localized.data.correctIds).toEqual(challenge.data.correctIds);
      if (challenge.data.correctOrder) expect(localized.data.correctOrder).toEqual(challenge.data.correctOrder);
    }
    expect(localizeChapter1(CHAPTER1_SCENES[0], 'en')).toBe(CHAPTER1_SCENES[0]);
  });

  it('defines all new Chapter 1 and challenge UI labels in both languages', () => {
    const keys = [
      'chapter.next', 'chapter.skipAnimation', 'chapter.transcript', 'chapter.transcriptLabel', 'chapter.nothingSaid', 'chapter.hide',
      'chapter.show', 'chapter.technicalDetail', 'chapter.readyForChallenge', 'challenge.goal',
      'chapter.stepOf', 'chapter.of', 'chapter.objective', 'chapter.reviewTitle', 'chapter.reviewDescription',
      'chapter.backToReview', 'chapter.lesson', 'chapter.practice', 'chapter.endingTitle', 'chapter.finish',
      'completion.chapterComplete', 'completion.xpEarned', 'completion.unlocked', 'completion.grimoirePage',
      'completion.returnToMap', 'completion.openGrimoire', 'completion.viewBestiary',
      'challenge.check', 'challenge.completeFirst', 'challenge.choose', 'challenge.correct',
      'challenge.evidence', 'challenge.decision', 'challenge.statedPurpose', 'challenge.provenance',
      'challenge.requestedPermissions', 'challenge.verdict', 'challenge.alreadyPassedNotice', 'challenge.continue', 'challenge.verdict.approve',
      'challenge.verdict.sandbox', 'challenge.verdict.reject',
    ];
    for (const language of ['en', 'tr']) {
      for (const key of keys) expect(t(language, key)).not.toBe(key);
    }
  });
});
