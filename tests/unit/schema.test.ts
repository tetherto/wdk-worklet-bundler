import { validateConfig } from '../../src/config/schema'

describe('Config Schema Validation', () => {
  describe('validateConfig', () => {
    it('should validate a correct config', () => {
      const config = {
        networks: {
          ethereum: {
            package: '@tetherto/wdk-wallet-evm-erc-4337'
          }
        },
        protocols: {
            aave: {
                package: '@tetherto/wdk-protocol-aave-v3'
            }
        },
        preloadModules: ['native-addon'],
        output: {
          bundle: './dist/bundle.js',
          types: './dist/types.d.ts'
        },
        options: {
          minify: true,
          sourceMaps: true,
          targets: ['android-arm64']
        }
      }

      expect(() => validateConfig(config)).not.toThrow()
    })

    it('should fail if networks is missing', () => {
      const config = {
        options: {}
      }

      expect(() => validateConfig(config)).toThrow('must have required property \'networks\'')
    })

    it('should fail if network package is missing', () => {
      const config = {
        networks: {
          ethereum: {
          }
        }
      }

      expect(() => validateConfig(config)).toThrow('must have required property \'package\'')
    })

    it('should fail if networks is empty', () => {
      const config = {
        networks: {}
      }

      expect(() => validateConfig(config)).toThrow('must NOT have fewer than 1 properties')
    })

    it('should validate protocols if present', () => {
        const config = {
            networks: {
                eth: { package: 'pkg' }
            },
            protocols: {
                myproto: {
                }
            }
        }
        expect(() => validateConfig(config)).toThrow('must have required property \'package\'')
    })
  })
})