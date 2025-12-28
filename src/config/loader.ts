/**
 * Configuration loader
 */

import fs from 'fs';
import path from 'path';
import type { WdkConfig, ResolvedConfig } from './types';
import { validateConfig } from './schema';

const CONFIG_FILES = [
  'wdk.config.js',
  'wdk.config.cjs',
  'wdk.config.mjs',
  'wdk.config.json',
  '.wdkrc',
  '.wdkrc.json',
  '.wdkrc.js',
];

/**
 * Find config file in directory
 */
function findConfigFile(dir: string): string | null {
  for (const filename of CONFIG_FILES) {
    const filepath = path.join(dir, filename);
    if (fs.existsSync(filepath)) {
      return filepath;
    }
  }
  return null;
}

/**
 * Load configuration from file
 */
async function loadConfigFile(filepath: string): Promise<WdkConfig> {
  const ext = path.extname(filepath);

  if (ext === '.json' || filepath.endsWith('.wdkrc')) {
    const content = fs.readFileSync(filepath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Invalid JSON in config file ${filepath}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  // For JS files, clear require cache for hot reloading
  const resolved = require.resolve(filepath);
  delete require.cache[resolved];

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require(filepath);

  // Handle ES module default exports
  return config.default || config;
}

/**
 * Load and validate configuration
 */
export async function loadConfig(configPath?: string): Promise<ResolvedConfig> {
  const cwd = process.cwd();

  // Find config file
  let filepath: string;

  if (configPath) {
    filepath = path.resolve(cwd, configPath);
    if (!fs.existsSync(filepath)) {
      throw new Error(`Config file not found: ${filepath}`);
    }
  } else {
    const found = findConfigFile(cwd);
    if (!found) {
      throw new Error(
        'No wdk.config.js found. Run `npx wdk-worklet-bundler init` to create one.\n' +
          `Searched for: ${CONFIG_FILES.join(', ')}`
      );
    }
    filepath = found;
  }

  // Load config
  const config = await loadConfigFile(filepath);

  // Validate config
  validateConfig(config);

  const projectRoot = path.dirname(filepath);

  // Resolve output paths
  const resolvedOutput = {
    bundle: path.resolve(
      projectRoot,
      config.output?.bundle || './.wdk/wdk.bundle.js'
    ),
    types: path.resolve(
      projectRoot,
      config.output?.types || './.wdk/wdk.d.ts'
    ),
  };

  return {
    ...config,
    configPath: filepath,
    projectRoot,
    resolvedOutput,
  };
}

/**
 * Create config index file
 */
export { validateConfig } from './schema';
