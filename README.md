# @tetherto/wdk-worklet-bundler

CLI tool for generating WDK worklet bundles from configuration. Creates custom bundles with only the blockchain modules you need.

## Installation

```bash
npm install -g @tetherto/wdk-worklet-bundler
# or
npx @tetherto/wdk-worklet-bundler
```

## Quick Start

```bash
# 1. Initialize config in your React Native project
wdk-worklet-bundler init

# 2. Edit wdk.config.js to configure your networks

# 3. Install WDK modules
npm install @tetherto/wdk @tetherto/wdk-wallet-evm-erc-4337

# 4. Generate the bundle
wdk-worklet-bundler generate
```

## Commands

### `wdk-worklet-bundler init`

Create a new `wdk.config.js` configuration file.

```bash
wdk-worklet-bundler init                    # Interactive setup
wdk-worklet-bundler init -y                 # Use defaults
wdk-worklet-bundler init --from-pear-wrk-wdk ./path  # Migrate from pear-wrk-wdk
```

### `wdk-worklet-bundler generate`

Generate the WDK bundle from your configuration.

```bash
wdk-worklet-bundler generate                # Full build
wdk-worklet-bundler generate --source-only  # Generate source files only (skip bare-pack)
wdk-worklet-bundler generate --dry-run      # Preview what will be generated
wdk-worklet-bundler generate --verbose      # Show detailed output
wdk-worklet-bundler generate --no-types     # Skip TypeScript declaration generation
wdk-worklet-bundler generate -c custom.config.js  # Use custom config file
```

### `wdk-worklet-bundler validate`

Validate your configuration without building.

```bash
wdk-worklet-bundler validate
wdk-worklet-bundler validate -c custom.config.js
```

### `wdk-worklet-bundler list-modules`

List available WDK modules.

```bash
wdk-worklet-bundler list-modules
wdk-worklet-bundler list-modules --json
```

### `wdk-worklet-bundler clean`

Remove the generated `.wdk` folder.

```bash
wdk-worklet-bundler clean
wdk-worklet-bundler clean -y  # Skip confirmation
```

## Configuration

Create a `wdk.config.js` file in your project root:

```javascript
module.exports = {
  // WDK modules to include in the bundle
  modules: {
    core: '@tetherto/wdk',
    erc4337: '@tetherto/wdk-wallet-evm-erc-4337',
    spark: '@tetherto/wdk-wallet-spark',
    // Local packages are also supported:
    // myCustomWallet: './path/to/local-wallet-module',
  },

  // Network configurations
  networks: {
    ethereum: {
      module: 'erc4337',
      chainId: 1,
      blockchain: 'ethereum',
      provider: 'https://eth.drpc.org',
    },
    polygon: {
      module: 'erc4337',
      chainId: 137,
      blockchain: 'polygon',
      provider: 'https://polygon.drpc.org',
    },
    spark: {
      module: 'spark',
      chainId: 0,
      blockchain: 'spark',
    },
  },

  // Optional: Native addons to preload
  preloadModules: [
    'spark-frost-bare-addon',
  ],

  // Optional: Output paths (defaults shown)
  output: {
    bundle: './.wdk/wdk.bundle.js',
    types: './.wdk/wdk.d.ts',
  },

  // Optional: Build options
  options: {
    targets: [
      'ios-arm64',
      'ios-arm64-simulator',
      'android-arm64',
      'android-arm',
    ],
  },
};
```

### Configuration Options

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `modules` | `Record<string, string>` | Yes | Map of module keys to package names or local paths |
| `networks` | `Record<string, NetworkConfig>` | Yes | Network configurations |
| `preloadModules` | `string[]` | No | Native addons to preload before WDK |
| `output.bundle` | `string` | No | Output path for bundle (default: `.wdk/wdk.bundle.js`) |
| `output.types` | `string` | No | Output path for TypeScript types (default: `.wdk/wdk.d.ts`) |
| `options.targets` | `string[]` | No | bare-pack target platforms |

### Network Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `module` | `string` | Yes | Key from `modules` object |
| `chainId` | `number` | Yes | Chain ID (use 0 for non-EVM chains) |
| `blockchain` | `string` | Yes | Blockchain identifier |
| `provider` | `string` | No | RPC provider URL |
| `...` | `unknown` | No | Additional chain-specific options |

## Available WDK Modules

| Package | Description |
|---------|-------------|
| `@tetherto/wdk` | WDK Core (required) |
| `@tetherto/wdk-wallet-evm` | EVM chains (EOA wallets) |
| `@tetherto/wdk-wallet-evm-erc-4337` | EVM with Account Abstraction |
| `@tetherto/wdk-wallet-btc` | Bitcoin |
| `@tetherto/wdk-wallet-spark` | Spark (Lightning) |
| `@tetherto/wdk-wallet-ton` | TON |
| `@tetherto/wdk-wallet-sol` | Solana |

### Using Local/Custom Modules

You can use local wallet modules by specifying a relative or absolute path:

```javascript
module.exports = {
  modules: {
    core: '@tetherto/wdk',
    // Relative path (from config file location)
    myWallet: './my-custom-wallet',
    // Absolute path
    anotherWallet: '/path/to/wallet-module',
  },
  networks: {
    custom: {
      module: 'myWallet',
      chainId: 12345,
      blockchain: 'custom',
    },
  },
};
```

Local modules are validated during `wdk-worklet-bundler validate` and shown as `(local)` in the output.

## Using the Generated Bundle

After running `wdk-worklet-bundler generate`, import the bundle in your React Native app:

```typescript
// In your app
import { bundle, HRPC } from './.wdk';

// Pass to WdkAppProvider
<WdkAppProvider wdkBundle={{ bundle, HRPC }} ... />
```

### TypeScript Path Alias (Optional)

Add to your `tsconfig.json`:

```json
{
  "include": ["**/*.ts", "**/*.tsx", ".wdk/**/*"]
}
```

## Programmatic API

```typescript
import { loadConfig, generateBundle, validateDependencies } from '@tetherto/wdk-worklet-bundler';

// Load and validate config
const config = await loadConfig('./wdk.config.js');

// Check dependencies
const validation = validateDependencies(config.modules, config.projectRoot);
if (!validation.valid) {
  console.error('Missing:', validation.missing);
}

// Generate bundle
const result = await generateBundle(config, {
  verbose: true,
  skipTypes: false,
});

if (result.success) {
  console.log('Bundle:', result.bundlePath);
  console.log('Size:', result.bundleSize);
}
```

## Troubleshooting

### "bare-pack failed" errors

This usually means:
1. WDK modules are not installed - run `npm install`
2. A dependency uses Node.js APIs not available in Bare runtime

Use `--source-only` to generate source files and debug:
```bash
wdk-worklet-bundler generate --source-only
```

### "Module not found" errors

Ensure all modules in your config are installed:
```bash
wdk-worklet-bundler validate
```

### Duplicate chainId errors

Each network must have a unique `chainId` (except 0 for non-EVM chains).

## Migration from pear-wrk-wdk

```bash
wdk-worklet-bundler init --from-pear-wrk-wdk ./path/to/pear-wrk-wdk
```

This will:
1. Read your existing `schema.json`
2. Generate a `wdk.config.js` with your networks
3. You'll need to update chainIds and providers manually

## License

Apache-2.0
