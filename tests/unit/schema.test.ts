import {
  validateConfigSchema,
  validateModuleNetworkMapping,
  validateNoDuplicateChainIds,
  validateConfig,
} from '../../src/config/schema';

describe('Config Schema Validation', () => {
  describe('validateConfigSchema', () => {
    it('should accept valid config with required fields', () => {
      const config = {
        modules: {
          core: '@tetherto/wdk',
          erc4337: '@tetherto/wdk-wallet-evm-erc-4337',
        },
        networks: {
          ethereum: {
            module: 'erc4337',
            chainId: 1,
            blockchain: 'ethereum',
          },
        },
      };

      expect(() => validateConfigSchema(config)).not.toThrow();
    });

    it('should accept config with optional fields', () => {
      const config = {
        modules: {
          core: '@tetherto/wdk',
        },
        networks: {
          ethereum: {
            module: 'core',
            chainId: 1,
            blockchain: 'ethereum',
            provider: 'https://eth.drpc.org',
          },
        },
        output: {
          bundle: './dist/bundle.js',
          types: './dist/types.d.ts',
        },
        options: {
          minify: true,
          sourceMaps: false,
          targets: ['ios-arm64', 'android-arm64'],
        },
      };

      expect(() => validateConfigSchema(config)).not.toThrow();
    });

    it('should reject config without modules', () => {
      const config = {
        networks: {
          ethereum: {
            module: 'erc4337',
            chainId: 1,
            blockchain: 'ethereum',
          },
        },
      };

      expect(() => validateConfigSchema(config)).toThrow('Invalid configuration');
    });

    it('should reject config without networks', () => {
      const config = {
        modules: {
          core: '@tetherto/wdk',
        },
      };

      expect(() => validateConfigSchema(config)).toThrow('Invalid configuration');
    });

    it('should reject config with empty modules', () => {
      const config = {
        modules: {},
        networks: {
          ethereum: {
            module: 'erc4337',
            chainId: 1,
            blockchain: 'ethereum',
          },
        },
      };

      expect(() => validateConfigSchema(config)).toThrow('Invalid configuration');
    });

    it('should reject network without required fields', () => {
      const config = {
        modules: {
          core: '@tetherto/wdk',
        },
        networks: {
          ethereum: {
            module: 'core',
            // missing chainId and blockchain
          },
        },
      };

      expect(() => validateConfigSchema(config)).toThrow('Invalid configuration');
    });

    it('should reject invalid chainId type', () => {
      const config = {
        modules: {
          core: '@tetherto/wdk',
        },
        networks: {
          ethereum: {
            module: 'core',
            chainId: '1', // should be number
            blockchain: 'ethereum',
          },
        },
      };

      expect(() => validateConfigSchema(config)).toThrow('Invalid configuration');
    });
  });

  describe('validateModuleNetworkMapping', () => {
    it('should accept valid module references', () => {
      const config = {
        modules: {
          core: '@tetherto/wdk',
          erc4337: '@tetherto/wdk-wallet-evm-erc-4337',
        },
        networks: {
          ethereum: {
            module: 'erc4337',
            chainId: 1,
            blockchain: 'ethereum',
          },
          polygon: {
            module: 'erc4337',
            chainId: 137,
            blockchain: 'polygon',
          },
        },
      };

      expect(() => validateModuleNetworkMapping(config)).not.toThrow();
    });

    it('should reject invalid module reference', () => {
      const config = {
        modules: {
          core: '@tetherto/wdk',
        },
        networks: {
          ethereum: {
            module: 'nonexistent', // not in modules
            chainId: 1,
            blockchain: 'ethereum',
          },
        },
      };

      expect(() => validateModuleNetworkMapping(config)).toThrow(
        'Network "ethereum" references module "nonexistent"'
      );
    });
  });

  describe('validateNoDuplicateChainIds', () => {
    it('should accept unique chain IDs', () => {
      const config = {
        modules: {
          erc4337: '@tetherto/wdk-wallet-evm-erc-4337',
        },
        networks: {
          ethereum: {
            module: 'erc4337',
            chainId: 1,
            blockchain: 'ethereum',
          },
          polygon: {
            module: 'erc4337',
            chainId: 137,
            blockchain: 'polygon',
          },
        },
      };

      expect(() => validateNoDuplicateChainIds(config)).not.toThrow();
    });

    it('should reject duplicate chain IDs', () => {
      const config = {
        modules: {
          erc4337: '@tetherto/wdk-wallet-evm-erc-4337',
        },
        networks: {
          ethereum: {
            module: 'erc4337',
            chainId: 1,
            blockchain: 'ethereum',
          },
          mainnet: {
            module: 'erc4337',
            chainId: 1, // duplicate
            blockchain: 'ethereum',
          },
        },
      };

      expect(() => validateNoDuplicateChainIds(config)).toThrow(
        'Duplicate chainId 1'
      );
    });

    it('should allow multiple chainId 0 (non-EVM chains)', () => {
      const config = {
        modules: {
          spark: '@tetherto/wdk-wallet-spark',
          btc: '@tetherto/wdk-wallet-btc',
        },
        networks: {
          spark: {
            module: 'spark',
            chainId: 0,
            blockchain: 'spark',
          },
          bitcoin: {
            module: 'btc',
            chainId: 0,
            blockchain: 'bitcoin',
          },
        },
      };

      expect(() => validateNoDuplicateChainIds(config)).not.toThrow();
    });
  });

  describe('validateConfig (full validation)', () => {
    it('should run all validations', () => {
      const config = {
        modules: {
          core: '@tetherto/wdk',
          erc4337: '@tetherto/wdk-wallet-evm-erc-4337',
        },
        networks: {
          ethereum: {
            module: 'erc4337',
            chainId: 1,
            blockchain: 'ethereum',
          },
        },
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should fail on invalid module reference even if schema is valid', () => {
      const config = {
        modules: {
          core: '@tetherto/wdk',
        },
        networks: {
          ethereum: {
            module: 'missing',
            chainId: 1,
            blockchain: 'ethereum',
          },
        },
      };

      expect(() => validateConfig(config)).toThrow('references module "missing"');
    });
  });
});
