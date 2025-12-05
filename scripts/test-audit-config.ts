#!/usr/bin/env npx ts-node
/**
 * Test script for audit config extraction from curriculum plans
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  loadAuditConfig,
  isFeatureAllowed,
  getGrammarRequirementsForModule,
  getForbiddenFeatures,
  getFeatureIntroModule,
  getLevelDir
} from './lib/audit-config';

const PROJECT_ROOT = path.resolve(__dirname, '..');

async function readFile(filePath: string): Promise<string> {
  const fullPath = path.resolve(PROJECT_ROOT, filePath);
  return fs.readFileSync(fullPath, 'utf-8');
}

async function main() {
  console.log('Loading audit config from curriculum plans...\n');

  const config = await loadAuditConfig('l2-uk-en', readFile);

  console.log('=== LEVEL CONFIGURATIONS ===\n');

  for (const [level, levelConfig] of Object.entries(config.levels)) {
    console.log(`${level} (dir: ${getLevelDir(level)}):`);
    console.log(`  Module count: ${levelConfig.moduleCount}`);
    console.log(`  Vocabulary: ${levelConfig.vocabularyTarget} new, ${levelConfig.cumulativeVocab} cumulative`);
    console.log(`  Immersion: ${(levelConfig.immersionLevel * 100).toFixed(0)}% Ukrainian`);
    console.log(`  Grammar requirements:`);
    for (const req of levelConfig.grammarRequirements) {
      const status = req.allowedFromModule !== null
        ? `✅ From M${req.allowedFromModule.toString().padStart(2, '0')}`
        : `❌ Not allowed`;
      console.log(`    - ${req.feature}: ${status}`);
    }
    console.log();
  }

  console.log('=== FEATURE CHECKS ===\n');

  // Test some specific feature checks for A1
  const a1Tests = [
    { module: 5, feature: 'Nominative' },
    { module: 5, feature: 'Accusative' },
    { module: 15, feature: 'Accusative' },
    { module: 5, feature: 'Dative' },
    { module: 20, feature: 'Adjectives' },
    { module: 5, feature: 'свій' },
  ];

  console.log('A1 feature checks:');
  for (const tc of a1Tests) {
    const allowed = isFeatureAllowed(config, 'A1', tc.module, tc.feature);
    const introModule = getFeatureIntroModule(config, 'A1', tc.feature);
    const intro = introModule !== null ? `(intro M${introModule})` : '(not at A1)';
    console.log(`  M${tc.module.toString().padStart(2, '0')}: ${tc.feature} = ${allowed ? '✅' : '❌'} ${intro}`);
  }

  // Test A2 features
  const a2Tests = [
    { module: 1, feature: 'Dative' },
    { module: 4, feature: 'Instrumental' },
    { module: 1, feature: 'свій' },
  ];

  console.log('\nA2 feature checks:');
  for (const tc of a2Tests) {
    const allowed = isFeatureAllowed(config, 'A2', tc.module, tc.feature);
    const introModule = getFeatureIntroModule(config, 'A2', tc.feature);
    const intro = introModule !== null ? `(intro M${introModule})` : '(not at A2)';
    console.log(`  M${tc.module.toString().padStart(2, '0')}: ${tc.feature} = ${allowed ? '✅' : '❌'} ${intro}`);
  }

  console.log('\n=== FORBIDDEN FEATURES BY LEVEL ===\n');

  for (const level of ['A1', 'A2', 'B1', 'B2']) {
    const forbidden = getForbiddenFeatures(config, level);
    console.log(`${level}: ${forbidden.length > 0 ? forbidden.join(', ') : '(none)'}`);
  }

  console.log('\n=== CONFIG SUMMARY ===\n');
  console.log(`Language pair: ${config.languagePair}`);
  console.log(`Levels loaded: ${Object.keys(config.levels).join(', ')}`);
}

main().catch(console.error);
