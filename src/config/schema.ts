/**
 * JSON Schema for wdk.config.js validation
 */

import Ajv from 'ajv';
import type { WdkConfig } from './types';

export const configSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['modules', 'networks'],
  properties: {
    modules: {
      type: 'object',
      additionalProperties: { type: 'string' },
      minProperties: 1,
      description: 'Map of module keys to package paths',
    },
    networks: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        required: ['module', 'chainId', 'blockchain'],
        properties: {
          module: { type: 'string', description: 'Key from modules object' },
          chainId: { type: 'number', description: 'Chain ID' },
          blockchain: { type: 'string', description: 'Blockchain identifier' },
          provider: { type: 'string', description: 'RPC provider URL' },
        },
      },
      minProperties: 1,
    },
    preloadModules: {
      type: 'array',
      items: { type: 'string' },
      description: 'Modules to preload (native addons)',
    },
    output: {
      type: 'object',
      properties: {
        bundle: { type: 'string', description: 'Output bundle path' },
        types: { type: 'string', description: 'Output types path' },
      },
    },
    options: {
      type: 'object',
      properties: {
        minify: { type: 'boolean', description: 'Minify output' },
        sourceMaps: { type: 'boolean', description: 'Generate source maps' },
        targets: {
          type: 'array',
          items: { type: 'string' },
          description: 'Target platforms for bare-pack',
        },
      },
    },
  },
};

const ajv = new Ajv({ allErrors: true, verbose: true });
const validate = ajv.compile(configSchema);

/**
 * Validate configuration against JSON schema
 */
export function validateConfigSchema(config: unknown): asserts config is WdkConfig {
  const valid = validate(config);

  if (!valid && validate.errors) {
    const errors = validate.errors.map((e) => {
      const path = e.instancePath || 'root';
      return `  - ${path}: ${e.message}`;
    });
    throw new Error(`Invalid configuration:\n${errors.join('\n')}`);
  }
}

/**
 * Validate module-network references
 */
export function validateModuleNetworkMapping(config: WdkConfig): void {
  const moduleKeys = Object.keys(config.modules);

  for (const [networkName, networkConfig] of Object.entries(config.networks)) {
    if (!moduleKeys.includes(networkConfig.module)) {
      throw new Error(
        `Network "${networkName}" references module "${networkConfig.module}" ` +
          `which is not defined in modules. Available: ${moduleKeys.join(', ')}`
      );
    }
  }
}

/**
 * Validate no duplicate chain IDs
 */
export function validateNoDuplicateChainIds(config: WdkConfig): void {
  const chainIds = new Map<number, string>();

  for (const [networkName, networkConfig] of Object.entries(config.networks)) {
    // Skip chainId 0 (used for non-EVM chains like Spark)
    if (networkConfig.chainId === 0) continue;

    const existing = chainIds.get(networkConfig.chainId);
    if (existing) {
      throw new Error(
        `Duplicate chainId ${networkConfig.chainId}: ` +
          `used by both "${existing}" and "${networkName}"`
      );
    }
    chainIds.set(networkConfig.chainId, networkName);
  }
}

/**
 * Run all validations
 */
export function validateConfig(config: unknown): asserts config is WdkConfig {
  validateConfigSchema(config);
  validateModuleNetworkMapping(config as WdkConfig);
  validateNoDuplicateChainIds(config as WdkConfig);
}
