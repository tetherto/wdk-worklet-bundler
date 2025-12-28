import fs from 'fs'
import path from 'path'
import os from 'os'
import { generateWalletModulesCode } from '../../src/generators/wallet-modules'
import { generateNetworkConfigsCode } from '../../src/generators/network-configs'
import { generateEntryPoint } from '../../src/generators/entry'
import type { ResolvedConfig } from '../../src/config/types'

describe('Code Generators', () => {
  const createMockConfig = (overrides?: Partial<ResolvedConfig>): ResolvedConfig => ({
    modules: {
      core: '@tetherto/wdk',
      erc4337: '@tetherto/wdk-wallet-evm-erc-4337',
    },
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
      },
    },
    configPath: '/test/wdk.config.js',
    projectRoot: '/test',
    resolvedOutput: {
      bundle: '/test/.wdk/wdk.bundle.js',
      types: '/test/.wdk/wdk.d.ts',
    },
    ...overrides,
  })

  describe('generateWalletModulesCode', () => {
    it('should generate core module import', () => {
      const config = createMockConfig()
      const code = generateWalletModulesCode(config)

      expect(code).toContain("const wdkModule = require('@tetherto/wdk')")
      expect(code).toContain('const WDK = wdkModule.default || wdkModule.WDK || wdkModule')
    })

    it('should generate wallet module imports', () => {
      const config = createMockConfig()
      const code = generateWalletModulesCode(config)

      expect(code).toContain("const erc4337Module = require('@tetherto/wdk-wallet-evm-erc-4337')")
      expect(code).toContain('const WalletManagerErc4337 = erc4337Module.default || erc4337Module')
    })

    it('should map networks to wallet managers', () => {
      const config = createMockConfig()
      const code = generateWalletModulesCode(config)

      expect(code).toContain("walletManagers['ethereum'] = WalletManagerErc4337")
      expect(code).toContain("walletManagers['polygon'] = WalletManagerErc4337")
    })

    it('should generate required networks array', () => {
      const config = createMockConfig()
      const code = generateWalletModulesCode(config)

      expect(code).toContain('const requiredNetworks = ["ethereum","polygon"]')
    })

    it('should handle preload modules', () => {
      const config = createMockConfig({
        preloadModules: ['spark-frost-bare-addon'],
      })
      const code = generateWalletModulesCode(config)

      expect(code).toContain("require('spark-frost-bare-addon')")
      expect(code).toContain('// Preload modules (native addons)')
    })

    it('should handle multiple wallet modules', () => {
      const config = createMockConfig({
        modules: {
          core: '@tetherto/wdk',
          erc4337: '@tetherto/wdk-wallet-evm-erc-4337',
          spark: '@tetherto/wdk-wallet-spark',
        },
        networks: {
          ethereum: {
            module: 'erc4337',
            chainId: 1,
            blockchain: 'ethereum',
          },
          spark: {
            module: 'spark',
            chainId: 0,
            blockchain: 'spark',
          },
        },
      })
      const code = generateWalletModulesCode(config)

      expect(code).toContain("const erc4337Module = require('@tetherto/wdk-wallet-evm-erc-4337')")
      expect(code).toContain("const sparkModule = require('@tetherto/wdk-wallet-spark')")
      expect(code).toContain('WalletManagerErc4337')
      expect(code).toContain('WalletManagerSpark')
    })

    it('should convert kebab-case module keys to PascalCase', () => {
      const config = createMockConfig({
        modules: {
          core: '@tetherto/wdk',
          'evm-erc-4337': '@tetherto/wdk-wallet-evm-erc-4337',
        },
        networks: {
          ethereum: {
            module: 'evm-erc-4337',
            chainId: 1,
            blockchain: 'ethereum',
          },
        },
      })
      const code = generateWalletModulesCode(config)

      expect(code).toContain('WalletManagerEvmErc4337')
    })
  })

  describe('generateNetworkConfigsCode', () => {
    it('should generate embedded network configs', () => {
      const config = createMockConfig()
      const code = generateNetworkConfigsCode(config)

      expect(code).toContain('const embeddedNetworkConfigs = {')
      expect(code).toContain("'ethereum':")
      expect(code).toContain("'polygon':")
    })

    it('should include chainId and blockchain', () => {
      const config = createMockConfig()
      const code = generateNetworkConfigsCode(config)

      expect(code).toContain('"chainId": 1')
      expect(code).toContain('"blockchain": "ethereum"')
      expect(code).toContain('"chainId": 137')
      expect(code).toContain('"blockchain": "polygon"')
    })

    it('should include provider when specified', () => {
      const config = createMockConfig()
      const code = generateNetworkConfigsCode(config)

      expect(code).toContain('"provider": "https://eth.drpc.org"')
    })

    it('should exclude module key from output', () => {
      const config = createMockConfig()
      const code = generateNetworkConfigsCode(config)

      // The 'module' key should not appear in the output
      expect(code).not.toContain('"module": "erc4337"')
    })

    it('should handle additional config properties', () => {
      const config = createMockConfig({
        networks: {
          ethereum: {
            module: 'erc4337',
            chainId: 1,
            blockchain: 'ethereum',
            bundlerUrl: 'https://bundler.example.com',
            paymasterUrl: 'https://paymaster.example.com',
          },
        },
      })
      const code = generateNetworkConfigsCode(config)

      expect(code).toContain('"bundlerUrl": "https://bundler.example.com"')
      expect(code).toContain('"paymasterUrl": "https://paymaster.example.com"')
    })
  })

  describe('generateEntryPoint', () => {
    let tempDir: string

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wdk-entry-test-'))
    })

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true })
    })

    it('should create entry file in output directory', async () => {
      const config = createMockConfig()
      const entryPath = await generateEntryPoint(config, tempDir)

      expect(fs.existsSync(entryPath)).toBe(true)
      expect(entryPath).toBe(path.join(tempDir, 'wdk-worklet.generated.js'))
    })

    it('should include generated header comment', async () => {
      const config = createMockConfig()
      const entryPath = await generateEntryPoint(config, tempDir)
      const content = fs.readFileSync(entryPath, 'utf-8')

      expect(content).toContain('Auto-generated by @tetherto/wdk-worklet-bundler')
      expect(content).toContain('DO NOT EDIT MANUALLY')
    })

    it('should include core dependencies', async () => {
      const config = createMockConfig()
      const entryPath = await generateEntryPoint(config, tempDir)
      const content = fs.readFileSync(entryPath, 'utf-8')

      expect(content).toContain("require('./hrpc')")
      expect(content).toContain("require('@scure/bip39')")
      expect(content).toContain("require('bare-crypto')")
    })

    it('should include crypto helpers', async () => {
      const config = createMockConfig()
      const entryPath = await generateEntryPoint(config, tempDir)
      const content = fs.readFileSync(entryPath, 'utf-8')

      expect(content).toContain('const memzero')
      expect(content).toContain('const generateEncryptionKey')
      expect(content).toContain('const encrypt')
      expect(content).toContain('const decrypt')
    })

    it('should include RPC handlers', async () => {
      const config = createMockConfig()
      const entryPath = await generateEntryPoint(config, tempDir)
      const content = fs.readFileSync(entryPath, 'utf-8')

      expect(content).toContain('rpc.onWorkletStart')
      expect(content).toContain('rpc.onGenerateEntropyAndEncrypt')
      expect(content).toContain('rpc.onInitializeWDK')
      expect(content).toContain('rpc.onCallMethod')
      expect(content).toContain('rpc.onDispose')
    })

    it('should include wallet modules code', async () => {
      const config = createMockConfig()
      const entryPath = await generateEntryPoint(config, tempDir)
      const content = fs.readFileSync(entryPath, 'utf-8')

      expect(content).toContain("require('@tetherto/wdk')")
      expect(content).toContain("require('@tetherto/wdk-wallet-evm-erc-4337')")
    })

    it('should include network configs', async () => {
      const config = createMockConfig()
      const entryPath = await generateEntryPoint(config, tempDir)
      const content = fs.readFileSync(entryPath, 'utf-8')

      expect(content).toContain('embeddedNetworkConfigs')
      expect(content).toContain("'ethereum':")
    })

    it('should create output directory if it does not exist', async () => {
      const config = createMockConfig()
      const nestedDir = path.join(tempDir, 'nested', 'output')

      const entryPath = await generateEntryPoint(config, nestedDir)

      expect(fs.existsSync(nestedDir)).toBe(true)
      expect(fs.existsSync(entryPath)).toBe(true)
    })
  })
})
