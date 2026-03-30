/**
 * Configuration loader
 */

import fs from 'fs'
import path from 'path'
import type { WdkBundleConfig, ResolvedConfig } from './types'
import { validateConfig } from './schema'
import { DEFAULT_BUNDLE_PATH, DEFAULT_TYPES_PATH, DEFAULT_IOS_ADDONS_DIR, DEFAULT_MACOS_ADDONS_DIR, DEFAULT_ANDROID_ADDONS_DIR } from '../constants'

const CONFIG_FILES = [
  'wdk.config.js',
  'wdk.config.cjs',
  'wdk.config.mjs'
]

/**
 * Find config file in directory
 */
function findConfigFile (dir: string): string | null {
  for (const filename of CONFIG_FILES) {
    const filepath = path.join(dir, filename)
    if (fs.existsSync(filepath)) {
      return filepath
    }
  }
  return null
}

async function loadConfigFile (filepath: string): Promise<WdkBundleConfig> {
  const ext = path.extname(filepath)

  if (ext === '.json' || filepath.endsWith('.wdkrc')) {
    const content = fs.readFileSync(filepath, 'utf-8')
    try {
      return JSON.parse(content)
    } catch (error) {
      throw new Error(
        `Invalid JSON in config file ${filepath}: ${error instanceof Error ? error.message : error}`
      )
    }
  }

  // For JS files, clear require cache for hot reloading
  const resolved = require.resolve(filepath)
  delete require.cache[resolved]

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require(filepath)

  // Handle ES module default exports
  return config.default || config
}

export async function loadConfig (configPath?: string): Promise<ResolvedConfig> {
  const cwd = process.cwd()

  // Find config file
  let filepath: string

  if (configPath) {
    filepath = path.resolve(cwd, configPath)
    if (!fs.existsSync(filepath)) {
      throw new Error(`Config file not found: ${filepath}`)
    }
  } else {
    const found = findConfigFile(cwd)
    if (!found) {
      throw new Error(
        'No wdk.config.js found. Run `npx wdk-worklet-bundler init` to create one.\n' +
          `Searched for: ${CONFIG_FILES.join(', ')}`
      )
    }
    filepath = found
  }

  // Load config
  const config = await loadConfigFile(filepath)

  // Validate config
  validateConfig(config)

  const projectRoot = path.dirname(filepath)

  // Resolve output paths
  const resolvedOutput = {
    bundle: path.resolve(
      projectRoot,
      config.output?.bundle || DEFAULT_BUNDLE_PATH
    ),
    types: path.resolve(
      projectRoot,
      config.output?.types || DEFAULT_TYPES_PATH
    ),
    addons: {
      ios: path.resolve(projectRoot, config.output?.addons?.ios || DEFAULT_IOS_ADDONS_DIR),
      macos: path.resolve(projectRoot, config.output?.addons?.macos || DEFAULT_MACOS_ADDONS_DIR),
      android: path.resolve(projectRoot, config.output?.addons?.android || DEFAULT_ANDROID_ADDONS_DIR)
    }
  }

  return {
    ...config,
    configPath: filepath,
    projectRoot,
    resolvedOutput
  }
}

export { validateConfig } from './schema'
