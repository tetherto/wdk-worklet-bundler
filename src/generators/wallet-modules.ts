/**
 * Wallet modules code generator
 */

import type { ResolvedConfig } from '../config/types';

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert module key to variable name
 */
function toVarName(key: string): string {
  return `WalletManager${key
    .split(/[-_]/)
    .map(capitalize)
    .join('')}`;
}

/**
 * Get networks that use a specific module
 */
function getNetworksForModule(
  moduleKey: string,
  config: ResolvedConfig
): string[] {
  return Object.entries(config.networks)
    .filter(([_, cfg]) => cfg.module === moduleKey)
    .map(([name]) => name);
}

/**
 * Generate wallet modules code section
 */
export function generateWalletModulesCode(config: ResolvedConfig): string {
  const lines: string[] = [];

  // Preload modules first (native addons like spark-frost-bare-addon)
  if (config.preloadModules?.length) {
    lines.push('// Preload modules (native addons)');
    for (const mod of config.preloadModules) {
      lines.push(`require('${mod}');`);
    }
    lines.push('');
  }

  // Determine core module path
  const coreModule = config.modules.core || '@tetherto/wdk';

  // Load WDK core
  lines.push('// Load WDK core');
  lines.push(`const wdkModule = require('${coreModule}');`);
  lines.push('const WDK = wdkModule.default || wdkModule.WDK || wdkModule;');
  lines.push('');

  // Track module variables for network mapping
  const moduleVars: { varName: string; networks: string[] }[] = [];

  // Load wallet modules
  lines.push('// Load wallet modules');
  for (const [key, modulePath] of Object.entries(config.modules)) {
    if (key === 'core') continue;

    const varName = toVarName(key);
    const networks = getNetworksForModule(key, config);

    lines.push(`const ${key}Module = require('${modulePath}');`);
    lines.push(`const ${varName} = ${key}Module.default || ${key}Module;`);

    moduleVars.push({ varName, networks });
  }
  lines.push('');

  // Map networks to wallet managers
  lines.push('// Map networks to wallet managers');
  lines.push('const walletManagers = {};');
  for (const { varName, networks } of moduleVars) {
    for (const network of networks) {
      lines.push(`walletManagers['${network}'] = ${varName};`);
    }
  }
  lines.push('');

  // Required networks array
  const requiredNetworks = Object.keys(config.networks);
  lines.push(`const requiredNetworks = ${JSON.stringify(requiredNetworks)};`);

  return lines.join('\n');
}
