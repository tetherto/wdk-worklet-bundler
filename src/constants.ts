export const DEFAULT_OUTPUT_DIR = '.wdk'
export const DEFAULT_BUNDLE_FILENAME = 'wdk-worklet.bundle.js'
export const DEFAULT_TYPES_FILENAME = 'index.d.ts'
export const DEFAULT_ENTRY_FILENAME = 'wdk-worklet.generated.js'

export const DEFAULT_BUNDLE_PATH = `./.wdk-bundle/${DEFAULT_BUNDLE_FILENAME}`
export const DEFAULT_TYPES_PATH = `./${DEFAULT_OUTPUT_DIR}/${DEFAULT_TYPES_FILENAME}`

export const DEFAULT_BUNDLE_BUILD_HOSTS = ['ios-arm64', 'ios-arm64-simulator', 'ios-x64-simulator', 'android-arm64', 'android-arm', 'android-ia32', 'android-x64']

// Bare-link addon output directories (relative to project root)
export const DEFAULT_IOS_ADDONS_DIR = './ios-addons'
export const DEFAULT_MACOS_ADDONS_DIR = './mac-addons'
export const DEFAULT_ANDROID_ADDONS_DIR = './android-addons'

// Native modules to link via bare-link
export const BARE_LINK_MODULES = [
  'bare-fs', 'bare-inspect', 'bare-type', 'sodium-native', 'bare-url',
  'bare-hrtime', 'bare-tty', 'bare-signals', 'bare-os', 'bare-performance',
  'bare-zlib', 'bare-pipe', 'bare-tls', 'bare-tcp', 'bare-dns', 'bare-crypto'
]

// Host triples for each platform
export const BARE_LINK_HOSTS: Record<string, string[]> = {
  ios: ['ios-arm64', 'ios-arm64-simulator', 'ios-x64-simulator'],
  macos: ['darwin-arm64', 'darwin-x64'],
  android: ['android-arm64', 'android-arm', 'android-ia32', 'android-x64']
}
