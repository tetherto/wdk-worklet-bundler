/**
 * JSON Schema for wdk.config.js validation
 */

import Ajv from 'ajv';
import type { WdkBundleConfig } from './types';

export const configSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['networks'],
  properties: {
    networks: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        required: ['package'],
        properties: {
          package: { type: 'string', description: 'WDK wallet/protocol module name' },
        },
      },
      minProperties: 1,
      description: 'Map of module keys to package name',
    },
    protocols: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        required: ['package'],
        properties: {
          package: { type: 'string', description: 'WDK protocol module name' },
        },
      },
      description: 'Map of protocol keys to package name',
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
export function validateConfigSchema(config: unknown): asserts config is WdkBundleConfig {
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
 * Run all validations
 */
export function validateConfig(config: unknown): asserts config is WdkBundleConfig {
  validateConfigSchema(config);
}
