/**
 * @tetherto/wdk-worklet-bundler
 *
 * CLI tool for generating WDK worklet bundles from configuration.
 */

// Config
export { loadConfig } from './config/loader'
export type { WdkConfig, ResolvedConfig, NetworkConfig } from './config/types'

// Validators
export { validateDependencies } from './validators/dependencies'
export type { ModuleInfo, ValidationResult } from './validators/dependencies'

// Bundler
export { generateBundle, generateSourceFiles } from './bundler'
export type { GenerateBundleOptions, GenerateBundleResult } from './bundler'

// Generators
export { generateEntryPoint } from './generators/entry'
export { generateWalletModulesCode } from './generators/wallet-modules'
export { generateNetworkConfigsCode } from './generators/network-configs'
export { generateHrpc, copyExistingHrpc } from './generators/hrpc'
export type { HrpcGeneratorResult } from './generators/hrpc'

// Schema definitions (for custom HRPC extensions)
export { CORE_SCHEMA, HRPC_METHODS } from './generators/hrpc/schema-definitions'
export type { SchemaField, SchemaEnum, SchemaStruct, HrpcMethod } from './generators/hrpc/schema-definitions'
