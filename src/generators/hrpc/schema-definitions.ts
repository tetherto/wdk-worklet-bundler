/**
 * HRPC Schema definitions
 * These define the RPC messages and methods for WDK worklet communication
 */

export interface SchemaField {
  name: string;
  type: string;
  required?: boolean;
  version?: number;
}

export interface SchemaEnum {
  name: string;
  namespace: string;
  offset?: number;
  enum: { key: string; version: number }[];
}

export interface SchemaStruct {
  name: string;
  namespace: string;
  compact?: boolean;
  flagsPosition?: number;
  fields: SchemaField[];
}

export interface HrpcMethod {
  id: number;
  name: string;
  request: {
    name: string;
    send?: boolean;
    stream?: boolean;
  };
  response?: {
    name: string;
    stream?: boolean;
  };
  version?: number;
}

/**
 * Core schema definitions for WDK RPC
 */
export const CORE_SCHEMA: (SchemaEnum | SchemaStruct)[] = [
  {
    name: 'log-type-enum',
    namespace: 'wdk-core',
    offset: 1,
    enum: [
      { key: 'info', version: 1 },
      { key: 'error', version: 1 },
      { key: 'debug', version: 1 },
    ],
  },
  {
    name: 'log-request',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: 0,
    fields: [
      { name: 'type', type: '@wdk-core/log-type-enum', version: 1 },
      { name: 'data', type: 'string', version: 1 },
    ],
  },
  {
    name: 'workletStart-request',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: 0,
    fields: [
      { name: 'enableDebugLogs', type: 'uint', required: false, version: 1 },
      { name: 'config', type: 'string', required: true, version: 1 },
    ],
  },
  {
    name: 'workletStart-response',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: 0,
    fields: [{ name: 'status', type: 'string', version: 1 }],
  },
  {
    name: 'dispose-request',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: -1,
    fields: [],
  },
  {
    name: 'callMethod-request',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: -1,
    fields: [
      { name: 'methodName', type: 'string', required: true, version: 1 },
      { name: 'network', type: 'string', required: true, version: 1 },
      { name: 'accountIndex', type: 'uint', required: true, version: 1 },
      { name: 'args', type: 'string', required: false, version: 1 },
    ],
  },
  {
    name: 'callMethod-response',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: 0,
    fields: [{ name: 'result', type: 'string', version: 1 }],
  },
  {
    name: 'generateEntropyAndEncrypt-request',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: -1,
    fields: [{ name: 'wordCount', type: 'uint', required: true, version: 1 }],
  },
  {
    name: 'generateEntropyAndEncrypt-response',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: 0,
    fields: [
      { name: 'encryptionKey', type: 'string', version: 1 },
      { name: 'encryptedSeedBuffer', type: 'string', version: 1 },
      { name: 'encryptedEntropyBuffer', type: 'string', version: 1 },
    ],
  },
  {
    name: 'getMnemonicFromEntropy-request',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: 0,
    fields: [
      { name: 'encryptedEntropy', type: 'string', required: true, version: 1 },
      { name: 'encryptionKey', type: 'string', required: true, version: 1 },
    ],
  },
  {
    name: 'getMnemonicFromEntropy-response',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: 0,
    fields: [{ name: 'mnemonic', type: 'string', version: 1 }],
  },
  {
    name: 'getSeedAndEntropyFromMnemonic-request',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: -1,
    fields: [{ name: 'mnemonic', type: 'string', required: true, version: 1 }],
  },
  {
    name: 'getSeedAndEntropyFromMnemonic-response',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: 0,
    fields: [
      { name: 'encryptionKey', type: 'string', version: 1 },
      { name: 'encryptedSeedBuffer', type: 'string', version: 1 },
      { name: 'encryptedEntropyBuffer', type: 'string', version: 1 },
    ],
  },
  {
    name: 'initializeWDK-request',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: 0,
    fields: [
      { name: 'encryptionKey', type: 'string', required: false, version: 1 },
      { name: 'encryptedSeed', type: 'string', required: false, version: 1 },
      { name: 'config', type: 'string', required: true, version: 1 },
    ],
  },
  {
    name: 'initializeWDK-response',
    namespace: 'wdk-core',
    compact: false,
    flagsPosition: 0,
    fields: [{ name: 'status', type: 'string', version: 1 }],
  },
];

/**
 * HRPC method definitions
 */
export const HRPC_METHODS: HrpcMethod[] = [
  {
    id: 0,
    name: '@wdk-core/log',
    request: { name: '@wdk-core/log-request', send: true },
    version: 1,
  },
  {
    id: 1,
    name: '@wdk-core/workletStart',
    request: { name: '@wdk-core/workletStart-request', stream: false },
    response: { name: '@wdk-core/workletStart-response', stream: false },
    version: 1,
  },
  {
    id: 2,
    name: '@wdk-core/dispose',
    request: { name: '@wdk-core/dispose-request', send: true },
    version: 1,
  },
  {
    id: 3,
    name: '@wdk-core/callMethod',
    request: { name: '@wdk-core/callMethod-request', stream: false },
    response: { name: '@wdk-core/callMethod-response', stream: false },
    version: 1,
  },
  {
    id: 4,
    name: '@wdk-core/generateEntropyAndEncrypt',
    request: { name: '@wdk-core/generateEntropyAndEncrypt-request', stream: false },
    response: { name: '@wdk-core/generateEntropyAndEncrypt-response', stream: false },
    version: 1,
  },
  {
    id: 5,
    name: '@wdk-core/getMnemonicFromEntropy',
    request: { name: '@wdk-core/getMnemonicFromEntropy-request', stream: false },
    response: { name: '@wdk-core/getMnemonicFromEntropy-response', stream: false },
    version: 1,
  },
  {
    id: 6,
    name: '@wdk-core/initializeWDK',
    request: { name: '@wdk-core/initializeWDK-request', stream: false },
    response: { name: '@wdk-core/initializeWDK-response', stream: false },
    version: 1,
  },
  {
    id: 7,
    name: '@wdk-core/getSeedAndEntropyFromMnemonic',
    request: { name: '@wdk-core/getSeedAndEntropyFromMnemonic-request', stream: false },
    response: { name: '@wdk-core/getSeedAndEntropyFromMnemonic-response', stream: false },
    version: 1,
  },
];
