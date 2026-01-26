# @tetherto/wdk-worklet-bundler

CLI tool for generating optimized WDK worklet bundles. This tool packages specific blockchain modules (Wallets, Protocols) into a single artifact designed to run in a separate **Bare runtime** thread, isolated from your main React Native application loop.

This architecture ensures:
*   **Performance:** Heavy cryptographic operations do not block the UI thread.
*   **Compatibility:** Provides a Node.js-like environment (via `bare-node-runtime`) for standard crypto libraries.
*   **Isolation:** Securely encapsulates wallet logic and private keys.

## Installation

```bash
# Global installation
npm install -g @tetherto/wdk-worklet-bundler

# Or as a project dependency (recommended)
npm install --save-dev @tetherto/wdk-worklet-bundler

# Or run directly without installation
npx @tetherto/wdk-worklet-bundler
```

## Quick Start

1.  **Initialize** a configuration in your React Native project:
    ```bash
    wdk-worklet-bundler init
    ```

2.  **Configure** your networks in `wdk.config.js`:
    ```javascript
    module.exports = {
      networks: {
        ethereum: {
          package: '@tetherto/wdk-wallet-evm-erc-4337'
        },
        bitcoin: {
          package: '@tetherto/wdk-wallet-btc'
        }
      }
    };
    ```

3.  **Generate** the bundle:
    ```bash
    # Automatically installs missing WDK modules to your devDependencies
    wdk-worklet-bundler generate --install
    ```

4.  **Use** it in your App:
    ```typescript
    import { bundle, HRPC } from './.wdk'; // Default output location
    
    // Pass to your WdkAppProvider or worklet loader
    ```

## Architecture

The bundler orchestrates the creation of a standalone JavaScript environment ("Worklet") that communicates with your main application.

*   **Host (React Native App):** Your UI layer. It loads the generated bundle and communicates with it via HRPC (Host-Remote Procedure Call).
*   **Guest (Worklet Bundle):** A compact, optimized bundle containing your selected Wallet and Protocol modules. It runs inside the **Bare runtime** (a minimal Node.js-compatible runtime for mobile).
*   **Bundler (The Chef):** This CLI tool. It resolves dependencies, generates the entry point code, and compiles everything using `bare-pack`.

We recommend installing all WDK modules and the core library as **`devDependencies`** to keep your application bundle clean. The bundler compiles them into the separate worklet artifact.

## Commands

### `generate`
Builds the worklet bundle.

```bash
wdk-worklet-bundler generate [options]
```

**Options:**
*   `-c, --config <path>`: Path to config file.
*   `--install`: Automatically install missing modules listed in your config (saves to `devDependencies`).
*   `--keep-artifacts`: Keep the intermediate `.wdk/` folder (useful for debugging generated source code). By default, this is cleaned up.
*   `--source-only`: Generate the entry files but skip the final `bare-pack` bundling step.
*   `--skip-generation`: Skip artifact generation and use existing files.
*   `--dry-run`: Print what would happen without writing files.
*   `--no-types`: Skip generating TypeScript definitions (`index.d.ts`).
*   `-v, --verbose`: Show verbose output.

### `init`
Creates a fresh `wdk.config.js` file.

```bash
wdk-worklet-bundler init [options]
```

**Options:**
*   `-y, --yes`: Use defaults without prompting.

### `validate`
Checks if your configuration is valid and if all required dependencies are installed.

```bash
wdk-worklet-bundler validate [options]
```

**Options:**
*   `-c, --config <path>`: Path to config file.

### `list-modules`
List available WDK modules.

```bash
wdk-worklet-bundler list-modules [options]
```

**Options:**
*   `--json`: Output as JSON.

### `clean`
Remove generated `.wdk` folder.

```bash
wdk-worklet-bundler clean [options]
```

**Options:**
*   `-y, --yes`: Skip confirmation.

## Configuration Reference (`wdk.config.js`)

```javascript
module.exports = {
  // Map logical network names to WDK wallet packages
  networks: {
    ethereum: { 
      package: '@tetherto/wdk-wallet-evm-erc-4337' 
    },
    local_dev: {
      package: './local-packages/my-custom-wallet' // Local paths supported
    }
  },

  // Map logical protocol names to WDK protocol packages
  protocols: {
    aaveEvm: {
      package: '@tetherto/wdk-protocol-aave-lending-evm'
    }
  },

  // Native addons to preload (e.g. for specific crypto requirements)
  preloadModules: [
    'spark-frost-bare-addon'
  ],

  // Customize output locations
  output: {
    bundle: './.wdk-bundle/wdk-worklet.bundle.js',
    types: './.wdk/index.d.ts'
  },

  // Build options
  options: {
    minify: false, // Optional: Minify the bundle
    sourceMaps: false, // Optional: Generate source maps
    targets: ['ios-arm64', 'android-arm64'] // bare-pack targets
  }
};
```

## Troubleshooting

**"Module not found" during generation:**
Run `wdk-worklet-bundler generate --install`. This ensures all packages defined in your config (plus the core `@tetherto/pear-wrk-wdk`) are present in your `node_modules`.

**"Missing dependency" inside the worklet:**
If you see runtime errors about missing modules inside the worklet, ensure `pear-wrk-wdk` is properly installed. The bundler treats it as an external dependency that must be present.

## License

Apache-2.0