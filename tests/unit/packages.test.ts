import { getPackageList } from '../../src/config/packages'
import type { WdkBundleConfig } from '../../src/config/types'

describe('getPackageList', () => {
  it.each(['hrpc', 'jsonrpc'] as const)(
    'includes the pear worklet runtime for %s bundles',
    (transport) => {
      const config: WdkBundleConfig = {
        transport,
        networks: {
          ethereum: { package: '@tetherto/wdk-wallet-evm' }
        }
      }

      expect(getPackageList(config)).toContain('@tetherto/pear-wrk-wdk')
    }
  )
})
