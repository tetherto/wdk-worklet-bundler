/**
 * Network configurations code generator
 */

import type { ResolvedConfig } from '../config/types';

/**
 * Generate network configurations code section
 */
export function generateNetworkConfigsCode(config: ResolvedConfig): string {
  const lines: string[] = [];

  lines.push('// Network configurations (embedded from wdk.config.js)');
  lines.push('const embeddedNetworkConfigs = {');

  for (const [name, networkConfig] of Object.entries(config.networks)) {
    // Remove the 'module' key as it's only used for mapping
    const { module: _module, ...configWithoutModule } = networkConfig;

    const configJson = JSON.stringify(configWithoutModule, null, 2)
      .split('\n')
      .map((line, i) => (i === 0 ? line : '  ' + line))
      .join('\n');

    lines.push(`  '${name}': ${configJson},`);
  }

  lines.push('};');

  return lines.join('\n');
}
