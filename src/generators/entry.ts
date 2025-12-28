/**
 * Worklet entry point generator
 */

import fs from 'fs'
import path from 'path'
import type { ResolvedConfig } from '../config/types'
import { generateWalletModulesCode } from './wallet-modules'
import { generateNetworkConfigsCode } from './network-configs'

/**
 * Static crypto helpers code
 */
const CRYPTO_HELPERS = `
// ============================================================
// CRYPTO HELPERS
// ============================================================
const memzero = (buffer) => {
  if (!buffer) return
  if (Buffer.isBuffer(buffer)) buffer.fill(0)
  else if (buffer instanceof Uint8Array) buffer.fill(0)
  else if (buffer instanceof ArrayBuffer) new Uint8Array(buffer).fill(0)
  else if (buffer.buffer instanceof ArrayBuffer) {
    new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength).fill(0)
  }
}

const generateEncryptionKey = () => {
  const key = crypto.randomBytes(32)
  const keyBase64 = key.toString('base64')
  memzero(key)
  return keyBase64
}

const encrypt = (data, keyBase64) => {
  const key = Buffer.from(keyBase64, 'base64')
  const iv = crypto.randomBytes(12)
  const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()])
  const authTag = cipher.getAuthTag()
  const result = Buffer.concat([iv, encrypted, authTag])
  const resultBase64 = result.toString('base64')
  memzero(key); memzero(iv); memzero(encrypted); memzero(authTag)
  return resultBase64
}

const decrypt = (encryptedBase64, keyBase64) => {
  const key = Buffer.from(keyBase64, 'base64')
  const encryptedBuffer = Buffer.from(encryptedBase64, 'base64')
  const iv = encryptedBuffer.subarray(0, 12)
  const authTag = encryptedBuffer.subarray(encryptedBuffer.length - 16)
  const encrypted = encryptedBuffer.subarray(12, encryptedBuffer.length - 16)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  memzero(key); memzero(encryptedBuffer); memzero(iv); memzero(authTag); memzero(encrypted)
  return decrypted
}

const generateEntropy = (wordCount) => {
  if (wordCount !== 12 && wordCount !== 24) throw new Error('Word count must be 12 or 24')
  const entropyLength = wordCount === 12 ? 16 : 32
  const entropyBuffer = crypto.randomBytes(entropyLength)
  const entropy = new Uint8Array(entropyLength)
  entropy.set(entropyBuffer)
  memzero(entropyBuffer)
  return entropy
}

const encryptSecrets = (seed, entropy) => {
  const encryptionKey = generateEncryptionKey()
  const seedBuffer = Buffer.isBuffer(seed) ? seed : Buffer.from(seed)
  const entropyBuffer = Buffer.isBuffer(entropy) ? entropy : Buffer.from(entropy)
  const encryptedSeedBuffer = encrypt(seedBuffer, encryptionKey)
  const encryptedEntropyBuffer = encrypt(entropyBuffer, encryptionKey)
  memzero(seedBuffer); memzero(entropyBuffer)
  return { encryptionKey, encryptedSeedBuffer, encryptedEntropyBuffer }
}

const safeStringify = (obj) => JSON.stringify(obj, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
)

const withErrorHandling = (handler) => async (...args) => {
  try { return await handler(...args) }
  catch (error) { throw new Error(rpcException.stringifyError(error)) }
}

const callWdkMethod = async (methodName, network, accountIndex, args = null, options = {}) => {
  if (!wdk) throw new Error('WDK not initialized. Call initializeWDK first.')
  const account = await wdk.getAccount(network, accountIndex)
  if (typeof account[methodName] !== 'function') {
    if (options.defaultValue !== undefined) {
      console.warn(\`\${methodName} not available for network: \${network}, returning default value\`)
      return options.defaultValue
    }
    const availableMethods = Object.keys(account).filter(key => typeof account[key] === 'function').join(', ')
    throw new Error(\`Method "\${methodName}" not found on account for network "\${network}". Available methods: \${availableMethods}\`)
  }
  const result = await account[methodName](args)
  return options.transformResult ? options.transformResult(result) : result
}
`.trim()

/**
 * Static RPC handlers code
 */
const RPC_HANDLERS = `
// ============================================================
// RPC HANDLERS
// ============================================================
rpc.onWorkletStart(withErrorHandling(async (init) => {
  return { status: 'started' }
}))

rpc.onGenerateEntropyAndEncrypt(withErrorHandling(async (request) => {
  const { wordCount } = request
  if (wordCount !== 12 && wordCount !== 24) throw new Error('Word count must be 12 or 24')
  const entropy = generateEntropy(wordCount)
  const mnemonic = entropyToMnemonic(entropy, wordlist)
  const seedBuffer = mnemonicToSeedSync(mnemonic)
  const encryptionKey = generateEncryptionKey()
  const encryptedSeedBuffer = encrypt(seedBuffer, encryptionKey)
  const entropyBuffer = Buffer.from(entropy)
  const encryptedEntropyBuffer = encrypt(entropyBuffer, encryptionKey)
  memzero(entropy); memzero(seedBuffer); memzero(entropyBuffer)
  return { encryptionKey, encryptedSeedBuffer, encryptedEntropyBuffer }
}))

rpc.onGetMnemonicFromEntropy(withErrorHandling(async (request) => {
  const { encryptedEntropy, encryptionKey } = request
  const entropyBuffer = decrypt(encryptedEntropy, encryptionKey)
  const entropy = new Uint8Array(entropyBuffer.length)
  entropy.set(entropyBuffer)
  const mnemonic = entropyToMnemonic(entropy, wordlist)
  memzero(entropyBuffer); memzero(entropy)
  return { mnemonic }
}))

rpc.onGetSeedAndEntropyFromMnemonic(withErrorHandling(async (request) => {
  const { mnemonic } = request
  if (!mnemonic || typeof mnemonic !== 'string') throw new Error('Mnemonic phrase must be a non-empty string')
  const seed = mnemonicToSeedSync(mnemonic)
  const entropy = mnemonicToEntropy(mnemonic, wordlist)
  return encryptSecrets(seed, entropy)
}))

rpc.onInitializeWDK(withErrorHandling(async (init) => {
  if (!WDK) {
    throw new Error('WDK not loaded')
  }
  if (wdk) {
    console.log('Disposing existing WDK instance...')
    wdk.dispose()
  }

  // Merge embedded configs with runtime configs (runtime takes precedence)
  const runtimeConfigs = init.config ? JSON.parse(init.config) : {}
  const mergedConfigs = { ...embeddedNetworkConfigs, ...runtimeConfigs }

  const missingNetworks = requiredNetworks.filter(network => !mergedConfigs[network])
  if (missingNetworks.length > 0) {
    throw new Error(\`Missing network configurations: \${missingNetworks.join(', ')}\`)
  }

  let decryptedSeedBuffer
  if (init.encryptionKey && init.encryptedSeed) {
    console.log('Initializing WDK with encrypted seed')
    decryptedSeedBuffer = decrypt(init.encryptedSeed, init.encryptionKey)
  } else {
    throw new Error('(encryptionKey + encryptedSeed) must be provided')
  }

  wdk = new WDK(decryptedSeedBuffer)

  for (const [networkName, config] of Object.entries(mergedConfigs)) {
    if (config && typeof config === 'object') {
      const walletManager = walletManagers[networkName]
      if (!walletManager) throw new Error(\`No wallet manager found for network: \${networkName}\`)
      console.log(\`Registering \${networkName} wallet\`)
      wdk.registerWallet(networkName, walletManager, config)
    }
  }

  console.log('WDK initialization complete')
  return { status: 'initialized' }
}))

rpc.onCallMethod(withErrorHandling(async (payload) => {
  const { methodName, network, accountIndex, args: argsJson } = payload
  const args = argsJson ? JSON.parse(argsJson) : null
  const result = await callWdkMethod(methodName, network, accountIndex, args)
  return { result: safeStringify(result) }
}))

rpc.onDispose(withErrorHandling(() => {
  if (wdk) { wdk.dispose(); wdk = null }
}))

console.log('[WDK Worklet] Entry point loaded (generated by @tetherto/wdk-worklet-bundler)')
`.trim()

/**
 * Generate complete worklet entry point
 */
export async function generateEntryPoint(config: ResolvedConfig, outputDir: string): Promise<string> {
  const walletModulesCode = generateWalletModulesCode(config)
  const networkConfigsCode = generateNetworkConfigsCode(config)

  const entryCode = `
// Auto-generated by @tetherto/wdk-worklet-bundler
// Generated at: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY

// Handle unhandled promise rejections and exceptions
if (typeof process !== 'undefined' && process.on) {
  process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection in worklet:', error)
  })
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception in worklet:', error)
  })
}

// Initialize core dependencies
const { IPC: BareIPC } = BareKit
const HRPC = require('./hrpc')
const { entropyToMnemonic, mnemonicToSeedSync, mnemonicToEntropy } = require('@scure/bip39')
const { wordlist } = require('@scure/bip39/wordlists/english')
const crypto = require('bare-crypto')

// Error handling helper
const rpcException = {
  stringifyError: (error) => {
    if (error instanceof Error) {
      return JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    }
    return String(error)
  }
}

// ============================================================
// WALLET MODULES (Generated from config)
// ============================================================
${walletModulesCode}

// ============================================================
// NETWORK CONFIGURATIONS (Generated from config)
// ============================================================
${networkConfigsCode}

// Initialize RPC
const IPC = BareIPC
const rpc = new HRPC(IPC)

// WDK state
let wdk = null

${CRYPTO_HELPERS}

${RPC_HANDLERS}
`.trim()

  // Ensure output directory exists
  await fs.promises.mkdir(outputDir, { recursive: true })

  const entryPath = path.join(outputDir, 'wdk-worklet.generated.js')
  await fs.promises.writeFile(entryPath, entryCode, 'utf-8')

  return entryPath
}
