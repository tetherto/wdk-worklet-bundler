/**
 * Configuration types for wdk-worklet-bundler
 */

/**
 * Network configuration
 */
export interface NetworkConfig {
  /** Module key from modules object */
  module: string
  /** Chain ID */
  chainId: number
  /** Blockchain identifier */
  blockchain: string
  /** RPC provider URL */
  provider?: string
  /** Additional config properties */
  [key: string]: unknown
}

/**
 * WDK Configuration file format
 */
export interface WdkConfig {
  /** Module definitions: key -> package path */
  modules: Record<string, string>

  /** Network configurations */
  networks: Record<string, NetworkConfig>

  /** Modules to preload (native addons like spark-frost-bare-addon) */
  preloadModules?: string[]

  /** Output paths */
  output?: {
    bundle?: string
    types?: string
  }

  /** Build options */
  options?: {
    minify?: boolean
    sourceMaps?: boolean
    targets?: string[]
  }
}

/**
 * Resolved configuration with absolute paths
 */
export interface ResolvedConfig extends WdkConfig {
  /** Absolute path to config file */
  configPath: string
  /** Absolute path to project root */
  projectRoot: string
  /** Resolved output paths (absolute) */
  resolvedOutput: {
    bundle: string
    types: string
  }
}
