import { describe, expect, it } from 'vitest';
import { t } from '../i18n/index.js';
import { createInitialState, migrateSave, sanitizeState } from '../storage/saveSchema.js';

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
    expect(result.data.version).toBe(3);
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
      'investigation.connection.login-to-export', 'investigation.connection.export-to-gate',
      'investigation.conclusion.supported-correlation', 'investigation.nextEvidence.corroborating-records',
      'investigation.feedback.connectionsTry', 'investigation.feedback.conclusionTry', 'investigation.feedback.evidenceTry',
    ];
    for (const language of ['en', 'tr']) {
      for (const key of keys) expect(t(language, key)).not.toBe(key);
    }
  });
});
