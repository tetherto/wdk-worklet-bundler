#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/constants.ts
var DEFAULT_OUTPUT_DIR, DEFAULT_BUNDLE_FILENAME, DEFAULT_TYPES_FILENAME, DEFAULT_ENTRY_FILENAME, DEFAULT_BUNDLE_PATH, DEFAULT_TYPES_PATH, DEFAULT_BUNDLE_BUILD_HOSTS;
var init_constants = __esm({
  "src/constants.ts"() {
    "use strict";
    DEFAULT_OUTPUT_DIR = ".wdk";
    DEFAULT_BUNDLE_FILENAME = "wdk-worklet.bundle.js";
    DEFAULT_TYPES_FILENAME = "index.d.ts";
    DEFAULT_ENTRY_FILENAME = "wdk-worklet.generated.js";
    DEFAULT_BUNDLE_PATH = `./.wdk-bundle/${DEFAULT_BUNDLE_FILENAME}`;
    DEFAULT_TYPES_PATH = `./${DEFAULT_OUTPUT_DIR}/${DEFAULT_TYPES_FILENAME}`;
    DEFAULT_BUNDLE_BUILD_HOSTS = ["ios-arm64", "ios-arm64-simulator", "ios-x64-simulator", "android-arm64", "android-arm", "android-arm64", "android-ia32", "android-x64"];
  }
});

// package.json
var require_package = __commonJS({
  "package.json"(exports2, module2) {
    module2.exports = {
      name: "@tetherto/wdk-worklet-bundler",
      version: "1.0.0-beta.1",
      description: "CLI tool for generating WDK worklet bundles",
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
      bin: {
        "wdk-worklet-bundler": "./bin/wdk-worklet-bundler.js"
      },
      files: [
        "dist",
        "bin",
        "README.md"
      ],
      repository: {
        type: "git",
        url: "https://github.com/tetherto/wdk-worklet-bundler.git"
      },
      bugs: {
        url: "https://github.com/tetherto/wdk-worklet-bundler/issues"
      },
      homepage: "https://github.com/tetherto/wdk-worklet-bundler#readme",
      keywords: [
        "wdk",
        "bare-runtime",
        "bundle",
        "worklet",
        "hrpc",
        "react-native",
        "crypto",
        "wallet"
      ],
      scripts: {
        build: "tsup src/index.ts src/cli.ts --format cjs --dts --clean",
        dev: "tsup src/index.ts src/cli.ts --format cjs --dts --watch",
        lint: "standard",
        "lint:fix": "standard --fix",
        test: "jest",
        "test:coverage": "jest --coverage",
        prepare: "tsup src/index.ts src/cli.ts --format cjs --dts --clean",
        prepublishOnly: "tsup src/index.ts src/cli.ts --format cjs --dts --clean && jest",
        prepack: "tsup src/index.ts src/cli.ts --format cjs --dts --clean"
      },
      dependencies: {
        ajv: "^8.17.1",
        "bare-pack": "^2.0.0",
        commander: "^12.1.0"
      },
      devDependencies: {
        standard: "17.1.2",
        "@types/jest": "^29.5.14",
        "@types/node": "^22.10.2",
        jest: "^29.7.0",
        "ts-jest": "^29.2.5",
        tsup: "^8.3.5",
        typescript: "^5.7.2"
      },
      engines: {
        node: ">=18"
      },
      author: "Tether",
      license: "Apache-2.0"
    };
  }
});

// src/config/schema.ts
function validateConfigSchema(config) {
  const valid = validate(config);
  if (!valid && validate.errors) {
    const errors = validate.errors.map((e) => {
      const path6 = e.instancePath || "root";
      return `  - ${path6}: ${e.message}`;
    });
    throw new Error(`Invalid configuration:
${errors.join("\n")}`);
  }
}
function validateConfig(config) {
  validateConfigSchema(config);
}
var import_ajv, configSchema, ajv, validate;
var init_schema = __esm({
  "src/config/schema.ts"() {
    "use strict";
    import_ajv = __toESM(require("ajv"));
    configSchema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      required: ["networks"],
      properties: {
        networks: {
          type: "object",
          additionalProperties: {
            type: "object",
            required: ["package"],
            properties: {
              package: { type: "string", description: "WDK wallet/protocol module name" }
            }
          },
          minProperties: 1,
          description: "Map of module keys to package name"
        },
        protocols: {
          type: "object",
          additionalProperties: {
            type: "object",
            required: ["package"],
            properties: {
              package: { type: "string", description: "WDK protocol module name" }
            }
          },
          description: "Map of protocol keys to package name"
        },
        preloadModules: {
          type: "array",
          items: { type: "string" },
          description: "Modules to preload (native addons)"
        },
        output: {
          type: "object",
          properties: {
            bundle: { type: "string", description: "Output bundle path" },
            types: { type: "string", description: "Output types path" }
          }
        },
        options: {
          type: "object",
          properties: {
            minify: { type: "boolean", description: "Minify output" },
            sourceMaps: { type: "boolean", description: "Generate source maps" },
            targets: {
              type: "array",
              items: { type: "string" },
              description: "Target platforms for bare-pack"
            }
          }
        }
      }
    };
    ajv = new import_ajv.default({ allErrors: true, verbose: true });
    validate = ajv.compile(configSchema);
  }
});

// src/config/loader.ts
var loader_exports = {};
__export(loader_exports, {
  loadConfig: () => loadConfig,
  validateConfig: () => validateConfig
});
function findConfigFile(dir) {
  for (const filename of CONFIG_FILES) {
    const filepath = import_path.default.join(dir, filename);
    if (import_fs.default.existsSync(filepath)) {
      return filepath;
    }
  }
  return null;
}
async function loadConfigFile(filepath) {
  const ext = import_path.default.extname(filepath);
  if (ext === ".json" || filepath.endsWith(".wdkrc")) {
    const content = import_fs.default.readFileSync(filepath, "utf-8");
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Invalid JSON in config file ${filepath}: ${error instanceof Error ? error.message : error}`
      );
    }
  }
  const resolved = require.resolve(filepath);
  delete require.cache[resolved];
  const config = require(filepath);
  return config.default || config;
}
async function loadConfig(configPath) {
  const cwd = process.cwd();
  let filepath;
  if (configPath) {
    filepath = import_path.default.resolve(cwd, configPath);
    if (!import_fs.default.existsSync(filepath)) {
      throw new Error(`Config file not found: ${filepath}`);
    }
  } else {
    const found = findConfigFile(cwd);
    if (!found) {
      throw new Error(
        `No wdk.config.js found. Run \`npx wdk-worklet-bundler init\` to create one.
Searched for: ${CONFIG_FILES.join(", ")}`
      );
    }
    filepath = found;
  }
  const config = await loadConfigFile(filepath);
  validateConfig(config);
  const projectRoot = import_path.default.dirname(filepath);
  const resolvedOutput = {
    bundle: import_path.default.resolve(
      projectRoot,
      config.output?.bundle || DEFAULT_BUNDLE_PATH
    ),
    types: import_path.default.resolve(
      projectRoot,
      config.output?.types || DEFAULT_TYPES_PATH
    )
  };
  return {
    ...config,
    configPath: filepath,
    projectRoot,
    resolvedOutput
  };
}
var import_fs, import_path, CONFIG_FILES;
var init_loader = __esm({
  "src/config/loader.ts"() {
    "use strict";
    import_fs = __toESM(require("fs"));
    import_path = __toESM(require("path"));
    init_schema();
    init_constants();
    init_schema();
    CONFIG_FILES = [
      "wdk.config.js",
      "wdk.config.cjs",
      "wdk.config.mjs"
    ];
  }
});

// src/validators/dependencies.ts
var dependencies_exports = {};
__export(dependencies_exports, {
  checkOptionalPeerDependencies: () => checkOptionalPeerDependencies,
  detectPackageManager: () => detectPackageManager,
  generateInstallCommand: () => generateInstallCommand,
  generateUninstallCommand: () => generateUninstallCommand,
  installDependencies: () => installDependencies,
  resolveModule: () => resolveModule,
  uninstallDependencies: () => uninstallDependencies,
  validateDependencies: () => validateDependencies
});
function resolveModule(modulePath, projectRoot) {
  if (modulePath.startsWith(".") || modulePath.startsWith("/")) {
    const absolutePath = import_path2.default.resolve(projectRoot, modulePath);
    if (import_fs2.default.existsSync(absolutePath)) {
      const pkgPath2 = import_path2.default.join(absolutePath, "package.json");
      let pkg3 = { name: import_path2.default.basename(absolutePath), version: "local" };
      if (import_fs2.default.existsSync(pkgPath2)) {
        try {
          pkg3 = JSON.parse(import_fs2.default.readFileSync(pkgPath2, "utf-8"));
        } catch {
        }
      }
      return {
        name: pkg3.name,
        path: absolutePath,
        version: pkg3.version,
        isLocal: true
      };
    }
    return null;
  }
  const nodeModulesPath = import_path2.default.join(projectRoot, "node_modules", modulePath);
  if (!import_fs2.default.existsSync(nodeModulesPath)) {
    return null;
  }
  const pkgPath = import_path2.default.join(nodeModulesPath, "package.json");
  if (!import_fs2.default.existsSync(pkgPath)) {
    return null;
  }
  let pkg2;
  try {
    pkg2 = JSON.parse(import_fs2.default.readFileSync(pkgPath, "utf-8"));
  } catch {
    return null;
  }
  return {
    name: pkg2.name,
    path: nodeModulesPath,
    version: pkg2.version,
    isLocal: false
  };
}
function validateDependencies(modules, projectRoot) {
  const installed = [];
  const missing = [];
  for (const modulePath of modules) {
    const info = resolveModule(modulePath, projectRoot);
    if (info) {
      installed.push(info);
    } else {
      missing.push(modulePath);
    }
  }
  return {
    valid: missing.length === 0,
    installed,
    missing
  };
}
function checkOptionalPeerDependencies(installedModules, projectRoot, options = {}) {
  const missingPeers = /* @__PURE__ */ new Map();
  const visitedPaths = /* @__PURE__ */ new Set();
  const queue = installedModules.map((m) => ({ path: m.path, name: m.name }));
  const log = (msg) => {
    if (options.verbose) console.log(msg);
  };
  const IGNORED_PREFIXES = [
    "react",
    "@react-native",
    "expo",
    "@expo",
    "@types",
    "typescript",
    "jest",
    "eslint",
    "prettier",
    "metro",
    "babel",
    "webpack",
    "ts-node",
    "bare",
    "b4a",
    "sodium-javascript"
  ];
  while (queue.length > 0) {
    const { path: currentPath, name: currentName } = queue.shift();
    if (visitedPaths.has(currentPath)) continue;
    visitedPaths.add(currentPath);
    log(`[scan] Visiting: ${currentName}`);
    const pkgPath = import_path2.default.join(currentPath, "package.json");
    if (!import_fs2.default.existsSync(pkgPath)) continue;
    try {
      const pkg2 = JSON.parse(import_fs2.default.readFileSync(pkgPath, "utf-8"));
      const peerDeps = pkg2.peerDependencies || {};
      for (const [peerName, range] of Object.entries(peerDeps)) {
        if (IGNORED_PREFIXES.some((prefix) => peerName.startsWith(prefix)) || peerName === "react-native") {
          log(`  [scan] Skipping ignored peer: ${peerName}`);
          continue;
        }
        const peerInfo = resolveModule(peerName, projectRoot);
        if (!peerInfo) {
          log(`  [scan] Missing peer: ${peerName} (required by ${currentName})`);
          if (!missingPeers.has(peerName)) {
            missingPeers.set(peerName, {
              name: peerName,
              sources: []
            });
          }
          missingPeers.get(peerName).sources.push({
            parent: currentName,
            range
          });
        } else {
          log(`  [scan] Found peer: ${peerName}`);
          queue.push({ path: peerInfo.path, name: peerInfo.name });
        }
      }
      const deps = pkg2.dependencies || {};
      for (const depName of Object.keys(deps)) {
        if (IGNORED_PREFIXES.some((prefix) => depName.startsWith(prefix)) || depName === "react-native") {
          log(`  [scan] Skipping ignored dep: ${depName}`);
          continue;
        }
        let depInfo = resolveModule(depName, projectRoot);
        if (!depInfo) {
          const nestedPath = import_path2.default.join(currentPath, "node_modules", depName);
          if (import_fs2.default.existsSync(nestedPath)) {
            depInfo = {
              name: depName,
              path: nestedPath,
              version: "unknown",
              isLocal: false
            };
          }
        }
        if (depInfo) {
          log(`  [scan] Recursing into dep: ${depName}`);
          queue.push({ path: depInfo.path, name: depInfo.name });
        } else {
          log(`  [scan] Could not resolve dep: ${depName}`);
        }
      }
    } catch {
    }
  }
  return Array.from(missingPeers.values());
}
function detectPackageManager(projectRoot) {
  if (import_fs2.default.existsSync(import_path2.default.join(projectRoot, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (import_fs2.default.existsSync(import_path2.default.join(projectRoot, "yarn.lock"))) {
    return "yarn";
  }
  return "npm";
}
function generateInstallCommand(missing, packageManager = "npm") {
  const packages = missing.filter(
    (m) => !m.startsWith(".") && !m.startsWith("/")
  );
  if (packages.length === 0) {
    return "";
  }
  switch (packageManager) {
    case "yarn":
      return `yarn add ${packages.join(" ")}`;
    case "pnpm":
      return `pnpm add ${packages.join(" ")}`;
    default:
      return `npm install ${packages.join(" ")}`;
  }
}
function installDependencies(missing, projectRoot, options = {}) {
  const { execSync: execSync2 } = require("child_process");
  const packages = missing.filter(
    (m) => !m.startsWith(".") && !m.startsWith("/")
  );
  const localPaths = missing.filter(
    (m) => m.startsWith(".") || m.startsWith("/")
  );
  if (packages.length === 0) {
    return {
      success: localPaths.length === 0,
      command: "",
      installed: [],
      failed: localPaths,
      error: localPaths.length > 0 ? `Cannot auto-install local paths: ${localPaths.join(", ")}` : void 0
    };
  }
  const packageManager = detectPackageManager(projectRoot);
  const command = generateInstallCommand(packages, packageManager);
  try {
    execSync2(command, {
      cwd: projectRoot,
      stdio: options.verbose ? "inherit" : "pipe"
    });
    return {
      success: localPaths.length === 0,
      command,
      installed: packages,
      failed: localPaths,
      error: localPaths.length > 0 ? `Cannot auto-install local paths: ${localPaths.join(", ")}` : void 0
    };
  } catch (error) {
    return {
      success: false,
      command,
      installed: [],
      failed: [...packages, ...localPaths],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
function generateUninstallCommand(packages, packageManager = "npm") {
  const npmPackages = packages.filter(
    (m) => !m.startsWith(".") && !m.startsWith("/")
  );
  if (npmPackages.length === 0) {
    return "";
  }
  switch (packageManager) {
    case "yarn":
      return `yarn remove ${npmPackages.join(" ")}`;
    case "pnpm":
      return `pnpm remove ${npmPackages.join(" ")}`;
    default:
      return `npm uninstall ${npmPackages.join(" ")}`;
  }
}
function uninstallDependencies(packages, projectRoot, options = {}) {
  const { execSync: execSync2 } = require("child_process");
  const npmPackages = packages.filter(
    (m) => !m.startsWith(".") && !m.startsWith("/")
  );
  if (npmPackages.length === 0) {
    return {
      success: true,
      command: "",
      removed: [],
      failed: []
    };
  }
  const packageManager = detectPackageManager(projectRoot);
  const command = generateUninstallCommand(npmPackages, packageManager);
  try {
    execSync2(command, {
      cwd: projectRoot,
      stdio: options.verbose ? "inherit" : "pipe"
    });
    return {
      success: true,
      command,
      removed: npmPackages,
      failed: []
    };
  } catch (error) {
    return {
      success: false,
      command,
      removed: [],
      failed: npmPackages,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
var import_fs2, import_path2;
var init_dependencies = __esm({
  "src/validators/dependencies.ts"() {
    "use strict";
    import_fs2 = __toESM(require("fs"));
    import_path2 = __toESM(require("path"));
  }
});

// src/generators/wallet-modules.ts
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function toVarName(pkg2) {
  const clean = pkg2.replace(/^@[^/]+\//, "").replace(/[^a-zA-Z0-9]/g, "_");
  return clean.split("_").map(capitalize).join("");
}
function generateWalletModulesCode(config) {
  const lines = [];
  if (config.preloadModules?.length) {
    lines.push("// Preload modules");
    for (const mod of config.preloadModules) {
      lines.push(`require('${mod}');`);
    }
    lines.push("");
  }
  lines.push("// Load WDK core");
  lines.push(`const wdkModule = require('@tetherto/wdk', { with: { imports: 'bare-node-runtime/imports' }});`);
  lines.push("const WDK = wdkModule.default || wdkModule.WDK || wdkModule;");
  lines.push("");
  lines.push("// Load wallet modules");
  const packages = /* @__PURE__ */ new Map();
  for (const networkConfig of Object.values(config.networks)) {
    const pkg2 = networkConfig.package;
    if (!packages.has(pkg2)) {
      packages.set(pkg2, toVarName(pkg2));
    }
  }
  for (const [pkgPath, varName] of packages) {
    lines.push(`const ${varName}Raw = require('${pkgPath}', { with: { imports: 'bare-node-runtime/imports' }});`);
    lines.push(`const ${varName} = ${varName}Raw.default || ${varName}Raw;`);
  }
  lines.push("");
  lines.push("// Map networks to wallet managers");
  lines.push("const walletManagers = {};");
  for (const [networkName, networkConfig] of Object.entries(config.networks)) {
    const pkg2 = networkConfig.package;
    const varName = packages.get(pkg2);
    lines.push(`walletManagers['${networkName}'] = ${varName};`);
  }
  return lines.join("\n");
}
var init_wallet_modules = __esm({
  "src/generators/wallet-modules.ts"() {
    "use strict";
  }
});

// src/generators/protocol-modules.ts
function capitalize2(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function toVarName2(pkg2) {
  const clean = pkg2.replace(/^@[^/]+\//, "").replace(/[^a-zA-Z0-9]/g, "_");
  return clean.split("_").map(capitalize2).join("");
}
function generateProtocolModulesCode(config) {
  if (!config.protocols) {
    return "// No protocols configured";
  }
  const lines = [];
  lines.push("// Load protocol modules");
  const packages = /* @__PURE__ */ new Map();
  for (const protocolConfig of Object.values(config.protocols)) {
    const pkg2 = protocolConfig.package;
    if (!packages.has(pkg2)) {
      packages.set(pkg2, toVarName2(pkg2));
    }
  }
  for (const [pkgPath, varName] of packages) {
    lines.push(`const ${varName}Raw = require('${pkgPath}', { with: { imports: 'bare-node-runtime/imports' }});`);
    lines.push(`const ${varName} = ${varName}Raw.default || ${varName}Raw;`);
  }
  lines.push("");
  lines.push("// Map protocols to protocol managers");
  lines.push("const protocolManagers = {};");
  for (const [protocolName, protocolConfig] of Object.entries(config.protocols)) {
    const pkg2 = protocolConfig.package;
    const varName = packages.get(pkg2);
    lines.push(`protocolManagers['${protocolName}'] = ${varName};`);
  }
  return lines.join("\n");
}
var init_protocol_modules = __esm({
  "src/generators/protocol-modules.ts"() {
    "use strict";
  }
});

// src/generators/entry.ts
async function generateEntryPoint(config, outputDir) {
  const walletModulesCode = generateWalletModulesCode(config);
  const protocolModulesCode = generateProtocolModulesCode(config);
  const entryCode = `
// Auto-generated by @tetherto/wdk-worklet-bundler
// Generated at: ${(/* @__PURE__ */ new Date()).toISOString()}
// DO NOT EDIT MANUALLY

// Handle unhandled promise rejections and exceptions
if (typeof Bare !== 'undefined' && Bare.on) {
  Bare.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection in worklet:', error);
  })
  Bare.on('uncaughtException', (error) => {
    console.error('Uncaught exception in worklet:', error);
  })
}

require('bare-node-runtime/global');

const { IPC: BareIPC } = BareKit
const { HRPC, registerRpcHandlers, utils } = require('@tetherto/pear-wrk-wdk/worklet', { with: { imports: 'bare-node-runtime/imports' }});
const { logger } = utils;

// ============================================================
// WALLET MODULES (Generated from config)
// ============================================================
${walletModulesCode}

// ============================================================
// PROTOCOL MODULES (Generated from config)
// ============================================================
${protocolModulesCode}

const rpc = new HRPC(BareIPC);

let wdk = null;

const context = {
  wdk,
  WDK,
  walletManagers,
  protocolManagers: typeof protocolManagers !== 'undefined' ? protocolManagers : {},
  wdkLoadError: null
}

registerRpcHandlers(rpc, context);
logger.info('Worklet started');
`.trim();
  await import_fs3.default.promises.mkdir(outputDir, { recursive: true });
  const entryPath = import_path3.default.join(outputDir, DEFAULT_ENTRY_FILENAME);
  await import_fs3.default.promises.writeFile(entryPath, entryCode, "utf-8");
  return entryPath;
}
var import_fs3, import_path3;
var init_entry = __esm({
  "src/generators/entry.ts"() {
    "use strict";
    import_fs3 = __toESM(require("fs"));
    import_path3 = __toESM(require("path"));
    init_wallet_modules();
    init_protocol_modules();
    init_constants();
  }
});

// src/bundler/index.ts
var bundler_exports = {};
__export(bundler_exports, {
  generateBundle: () => generateBundle,
  generateSourceFiles: () => generateSourceFiles
});
function runBarePack(options) {
  const { entryPath, outputPath, importsPath, targets, cwd, verbose } = options;
  const args = ["--no-install", "bare-pack"];
  for (const target of targets) {
    if (!/^[a-z0-9-]+$/i.test(target)) {
      throw new Error(`Invalid target format: ${target}`);
    }
    args.push("--host", target);
  }
  args.push("--linked", "--imports", importsPath, "--out", outputPath, entryPath);
  if (verbose) {
    console.log(`  Running: npx ${args.join(" ")}`);
    console.log(`  CWD: ${cwd}`);
  }
  try {
    (0, import_child_process.execSync)(`npx ${args.join(" ")}`, {
      cwd,
      stdio: verbose ? "inherit" : "pipe"
    });
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString() : "";
    const stdout = error.stdout ? error.stdout.toString() : "";
    const output = stderr + stdout;
    const match = output.match(/MODULE_NOT_FOUND: Cannot find module '(.+?)'/);
    if (match && match[1]) {
      const missingModule = match[1];
      const err = new Error(`Missing module: ${missingModule}`);
      err.missingModule = missingModule;
      throw err;
    }
    throw error;
  }
}
function generateImportsFile(outputDir) {
  const imports = {};
  const importsPath = import_path4.default.join(outputDir, "pack.imports.json");
  import_fs4.default.writeFileSync(importsPath, JSON.stringify(imports, null, 2));
  return importsPath;
}
function generateIndexFile(outputDir) {
  const indexContent = `/**
 * WDK Bundle Exports
 * Generated by @tetherto/wdk-worklet-bundler
 */

const bundle = require('./${DEFAULT_BUNDLE_FILENAME}');

module.exports = {
  bundle
};
`;
  const indexPath = import_path4.default.join(outputDir, "index.js");
  import_fs4.default.writeFileSync(indexPath, indexContent);
}
function getDefaultHosts() {
  return DEFAULT_BUNDLE_BUILD_HOSTS;
}
async function generateBundle(config, options = {}) {
  const startTime = Date.now();
  const { dryRun, verbose, silent } = options;
  const log = (msg) => {
    if (!silent) console.log(msg);
  };
  const generatedDir = import_path4.default.join(config.projectRoot, DEFAULT_OUTPUT_DIR);
  if (dryRun) {
    log("Dry run - would generate:");
    log(`  Output dir: ${generatedDir}`);
    log(`  Entry: ${generatedDir}/wdk-worklet.generated.js`);
    log(`  HRPC: ${generatedDir}/hrpc/`);
    log(`  Schema: ${generatedDir}/schema/`);
    log(`  Bundle: ${config.resolvedOutput.bundle}`);
    if (!options.skipTypes) {
      log(`  Types: ${config.resolvedOutput.types}`);
    }
    return {
      success: true,
      bundlePath: config.resolvedOutput.bundle,
      typesPath: config.resolvedOutput.types,
      bundleSize: 0,
      duration: Date.now() - startTime
    };
  }
  try {
    import_fs4.default.mkdirSync(generatedDir, { recursive: true });
    import_fs4.default.mkdirSync(import_path4.default.dirname(config.resolvedOutput.bundle), { recursive: true });
    let entryPath;
    let importsPath;
    if (options.skipGeneration) {
      if (verbose) log("  Skipping artifact generation, using existing files...");
      entryPath = import_path4.default.join(generatedDir, DEFAULT_ENTRY_FILENAME);
      importsPath = import_path4.default.join(generatedDir, "pack.imports.json");
      if (!import_fs4.default.existsSync(entryPath)) {
        throw new Error(`Artifacts not found at ${entryPath}. Run without --skip-generation first.`);
      }
      if (!import_fs4.default.existsSync(importsPath)) {
        throw new Error(`Artifacts not found at ${importsPath}. Run without --skip-generation first.`);
      }
    } else {
      if (verbose) log("  Using HRPC bindings from @tetherto/pear-wrk-wdk");
      if (verbose) log("  Generating worklet entry point...");
      entryPath = await generateEntryPoint(config, generatedDir);
      if (verbose) log(`    Entry: ${entryPath}`);
      if (verbose) log("  Generating imports file...");
      importsPath = generateImportsFile(generatedDir);
    }
    if (verbose) log("  Running bare-pack...");
    const targets = config.options?.targets || getDefaultHosts();
    try {
      runBarePack({
        entryPath,
        outputPath: config.resolvedOutput.bundle,
        importsPath,
        targets,
        cwd: config.projectRoot,
        verbose
      });
    } catch (barePackError) {
      if (barePackError.missingModule) {
        return {
          success: false,
          bundlePath: config.resolvedOutput.bundle,
          typesPath: config.resolvedOutput.types,
          bundleSize: 0,
          duration: Date.now() - startTime,
          error: `Missing module: ${barePackError.missingModule}`,
          missingModule: barePackError.missingModule
        };
      }
      const errorMsg = barePackError instanceof Error ? barePackError.message : String(barePackError);
      return {
        success: false,
        bundlePath: config.resolvedOutput.bundle,
        typesPath: config.resolvedOutput.types,
        bundleSize: 0,
        duration: Date.now() - startTime,
        error: `bare-pack failed: ${errorMsg}

This usually means:
  1. WDK modules are not installed in the project
  2. A dependency uses Node.js APIs not available in Bare runtime

Generated files are available at:
  Entry: ${entryPath}
You can run bare-pack manually once dependencies are resolved.`
      };
    }
    let bundleSize = 0;
    if (import_fs4.default.existsSync(config.resolvedOutput.bundle)) {
      bundleSize = import_fs4.default.statSync(config.resolvedOutput.bundle).size;
    }
    if (!options.skipTypes) {
      if (verbose) log("  Generating TypeScript declarations...");
      await generateTypeDeclarations(config);
    }
    if (verbose) log("  Generating index.js...");
    generateIndexFile(generatedDir);
    return {
      success: true,
      bundlePath: config.resolvedOutput.bundle,
      typesPath: config.resolvedOutput.types,
      bundleSize,
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      bundlePath: config.resolvedOutput.bundle,
      typesPath: config.resolvedOutput.types,
      bundleSize: 0,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
async function generateTypeDeclarations(config) {
  const generatedDir = import_path4.default.join(config.projectRoot, ".wdk");
  const indexDtsPath = import_path4.default.join(generatedDir, "index.d.ts");
  import_fs4.default.mkdirSync(generatedDir, { recursive: true });
  const networks = Object.keys(config.networks);
  const protocols = config.protocols ? Object.keys(config.protocols) : [];
  const declarations = `
/**
 * WDK Bundle TypeScript Declarations
 * Generated by @tetherto/wdk-worklet-bundler
 * Generated at: ${(/* @__PURE__ */ new Date()).toISOString()}
 */

export type NetworkName = ${networks.map((n) => `'${n}'`).join(" | ")};
export type ProtocolName = ${protocols.length ? protocols.map((n) => `'${n}'`).join(" | ") : "never"};

export const bundle: string;
`;
  import_fs4.default.writeFileSync(indexDtsPath, declarations);
}
async function generateSourceFiles(config, options = {}) {
  const generatedDir = import_path4.default.join(config.projectRoot, DEFAULT_OUTPUT_DIR);
  if (options.verbose) console.log("  Generating worklet entry point...");
  const entryPath = await generateEntryPoint(config, generatedDir);
  generateImportsFile(generatedDir);
  generateIndexFile(generatedDir);
  return {
    entryPath
  };
}
var import_fs4, import_path4, import_child_process;
var init_bundler = __esm({
  "src/bundler/index.ts"() {
    "use strict";
    import_fs4 = __toESM(require("fs"));
    import_path4 = __toESM(require("path"));
    import_child_process = require("child_process");
    init_entry();
    init_constants();
  }
});

// src/cli.ts
var import_commander = require("commander");
var import_fs5 = __toESM(require("fs"));
var import_path5 = __toESM(require("path"));
init_constants();

// src/utils/banner.ts
function printBanner() {
  const banner = `
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    x        xxx      xxxx      xxx xxxxxxxxx              xxxxxxxxx x
    x     xxxxxx    xxxxxx   xxxxxx xxxxxxxxxxx          xxxxxxxxx   x
    x   xxxxxxxx  xxxxxxxx xxxxxxxx xxxxxxxxxxxxx     xxxxxxxxx      x
    x xxxxxxxxxxxxxxxxxx xxxxxxxxx         xxxxxxx  xxxxxxxxx        x
    x xxxxxx xxxxxxxxx xxxxxxxx            xxxxxxxxxxxxxxxx x        x
    x xxxx xxxxxxxx xxxxxxxxx xxxxxxxxxxxxxxxxxxx xxxxxx  xxxxxx     x
    x xxxxxxxxxxx xxxxxxxxx xxxxxxxxxxxxxxxxxxx   xxxx   xxxxxxxxx   x
    x xxxxxxxxx xxxxxxxx xxxxxxxxxxxxxxxxxxxx     xx       xxxxxxxxx x
    x                                                                x
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    
`;
  console.log(banner);
}

// src/cli.ts
var pkg = require_package();
var program = new import_commander.Command();
program.name("wdk-worklet-bundler").description("CLI tool for generating WDK worklet bundles").version(pkg.version);
function getPackageList(config) {
  const packages = /* @__PURE__ */ new Set();
  packages.add("@tetherto/wdk");
  packages.add("bare-node-runtime");
  if (config.networks) {
    for (const net of Object.values(config.networks)) {
      if (net.package) packages.add(net.package);
    }
  }
  if (config.protocols) {
    for (const protocol of Object.values(config.protocols)) {
      if (protocol.package) packages.add(protocol.package);
    }
  }
  if (config.preloadModules) {
    for (const mod of config.preloadModules) {
      packages.add(mod);
    }
  }
  return Array.from(packages);
}
program.command("generate").description("Generate WDK bundle from configuration").option("-c, --config <path>", "Path to config file").option("--install", "Auto-install missing dependencies").option("--keep-artifacts", "Keep intermediate generated files (useful for debugging)").option("--dry-run", "Show what would be generated without building").option("-v, --verbose", "Show verbose output").option("--no-types", "Skip TypeScript declaration generation").option("--source-only", "Only generate source files (skip bare-pack)").option("--skip-generation", "Skip artifact generation and use existing files").action(async (options) => {
  const { loadConfig: loadConfig2 } = await Promise.resolve().then(() => (init_loader(), loader_exports));
  const {
    validateDependencies: validateDependencies2,
    installDependencies: installDependencies2,
    checkOptionalPeerDependencies: checkOptionalPeerDependencies2
  } = await Promise.resolve().then(() => (init_dependencies(), dependencies_exports));
  const { generateBundle: generateBundle2, generateSourceFiles: generateSourceFiles2 } = await Promise.resolve().then(() => (init_bundler(), bundler_exports));
  let installedPackages = [];
  const promptYesNo = async (question) => {
    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return new Promise((resolve) => {
      rl.question(`${question} [Y/n] `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() !== "n");
      });
    });
  };
  try {
    console.log("\n\u{1F50D} Reading configuration...\n");
    const config = await loadConfig2(options.config);
    console.log(`  Config: ${config.configPath}`);
    console.log("\n\u{1F4E6} Checking core dependencies...\n");
    const requiredPackages = getPackageList(config);
    let validation = validateDependencies2(requiredPackages, config.projectRoot);
    for (const mod of validation.installed) {
      const version = mod.isLocal ? "local" : `v${mod.version}`;
      console.log(`  \u2713 ${mod.name} (${version})`);
    }
    for (const mod of validation.missing) {
      console.log(`  \u2717 ${mod} \u2014 NOT INSTALLED`);
    }
    if (!validation.valid) {
      let shouldInstall = options.install;
      if (!shouldInstall && !options.sourceOnly) {
        console.log("\n\u26A0\uFE0F  Missing core dependencies.");
        shouldInstall = await promptYesNo("Would you like to install them now?");
      }
      if (shouldInstall) {
        console.log("\n\u{1F4E5} Installing missing dependencies...\n");
        const result2 = installDependencies2(validation.missing, config.projectRoot, {
          verbose: options.verbose
        });
        if (result2.success) {
          installedPackages.push(...result2.installed);
          validation = validateDependencies2(requiredPackages, config.projectRoot);
        } else {
          console.log(`
\u274C Failed to install: ${result2.error || "Unknown error"}`);
          process.exit(1);
        }
      } else if (!options.sourceOnly) {
        console.log("\n\u274C Cannot proceed without core dependencies.");
        process.exit(1);
      }
    }
    if (validation.valid && !options.sourceOnly) {
      const missingPeers = checkOptionalPeerDependencies2(validation.installed, config.projectRoot, {
        verbose: options.verbose
      });
      if (missingPeers.length > 0) {
        console.log("\n\u{1F9E9} Checking peer dependencies...\n");
        console.log("  The following optional peer dependencies were found in your dependency tree.");
        console.log("  They are likely required for the worklet bundle to function correctly.\n");
        const packagesToInstall = [];
        for (const peer of missingPeers) {
          const ranges = [...new Set(peer.sources.map((s) => s.range))];
          const isSingle = ranges.length === 1;
          if (isSingle) {
            console.log(`  ? ${peer.name}@${ranges[0]}`);
            packagesToInstall.push(`${peer.name}@${ranges[0]}`);
            for (const source of peer.sources) {
              console.log(`    \u2514\u2500 required by ${source.parent}`);
            }
          } else {
            console.log(`  ? ${peer.name} (mixed requirements)`);
            console.log(`    \u26A0\uFE0F  Falling back to latest`);
            packagesToInstall.push(peer.name);
            for (const source of peer.sources) {
              console.log(`    \u2514\u2500 required by ${source.parent} @ ${source.range}`);
            }
          }
        }
        let shouldInstallPeers = options.install;
        if (!shouldInstallPeers) {
          console.log("\n\u26A0\uFE0F  Missing optional peer dependencies.");
          shouldInstallPeers = await promptYesNo("Would you like to install them now?");
        }
        if (shouldInstallPeers) {
          console.log("\n\u{1F4E5} Installing peer dependencies...\n");
          const result2 = installDependencies2(packagesToInstall, config.projectRoot, {
            verbose: options.verbose
          });
          if (result2.success) {
            installedPackages.push(...result2.installed);
          } else {
            console.log(`
\u26A0\uFE0F  Warning: Failed to install some peer dependencies: ${result2.error}`);
          }
        }
      }
    }
    console.log("\n\u{1F310} Networks configured:\n");
    for (const [name, cfg] of Object.entries(config.networks)) {
      console.log(`  \u251C\u2500\u2500 ${name} (${cfg.package})`);
    }
    if (options.sourceOnly) {
      console.log("\n\u{1F527} Generating source files (source-only mode)...\n");
      const result2 = await generateSourceFiles2(config, {
        verbose: options.verbose
      });
      console.log("\n\u2705 Source files generated successfully!\n");
      console.log(`  Entry: ${result2.entryPath}`);
      console.log("Run bare-pack manually to create the final bundle.\n");
      return;
    }
    console.log("\n\u{1F527} Building bundle...\n");
    const result = await generateBundle2(config, {
      dryRun: options.dryRun,
      verbose: options.verbose,
      skipTypes: !options.types,
      skipGeneration: options.skipGeneration
    });
    if (!result.success) {
      if (result.missingModule) {
        console.log(`
\u274C Build failed: Missing dependency '${result.missingModule}'
`);
        console.log(`\u{1F4A1} This appears to be a required dependency that was not detected automatically.`);
        console.log(`   Please install it manually and try again:
`);
        console.log(`   npm install ${result.missingModule}
`);
        process.exit(1);
      }
      console.log(`
\u274C Bundle generation failed:
`);
      console.log(result.error);
      process.exit(1);
    }
    const sizeKB = (result.bundleSize / 1024).toFixed(1);
    const duration = (result.duration / 1e3).toFixed(2);
    console.log("\n\u2705 Bundle generated successfully!\n");
    console.log(`  Bundle: ${result.bundlePath} (${sizeKB} KB)`);
    if (options.types !== false) {
      console.log(`  Types: ${result.typesPath}`);
    }
    console.log(`  Duration: ${duration}s
`);
    if (!options.keepArtifacts) {
      if (options.verbose) console.log("\u{1F9F9} Cleaning up intermediate files...\n");
      const generatedDir = import_path5.default.join(config.projectRoot, DEFAULT_OUTPUT_DIR);
      if (import_fs5.default.existsSync(generatedDir)) {
        try {
          import_fs5.default.rmSync(generatedDir, { recursive: true, force: true });
          if (options.verbose) console.log(`  \u2713 Removed ${generatedDir}
`);
        } catch (e) {
          console.log(`  \u26A0\uFE0F  Failed to cleanup ${generatedDir}: ${e}
`);
        }
      }
    } else {
      console.log(`\u2139\uFE0F  Keeping intermediate files in ${DEFAULT_OUTPUT_DIR}
`);
    }
  } catch (error) {
    console.error("\n\u274C Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
});
program.command("init").description("Create a new wdk.config.js file").option("-y, --yes", "Use defaults without prompting").action(async (options) => {
  const configPath = import_path5.default.join(process.cwd(), "wdk.config.js");
  if (import_fs5.default.existsSync(configPath) && !options.yes) {
    console.log("\n\u26A0\uFE0F  wdk.config.js already exists.\n");
    console.log("  Use --yes to overwrite.\n");
    process.exit(1);
  }
  const defaultNetworks = {
    ethereum: {
      package: "@tetherto/wdk-wallet-evm-erc-4337"
    }
  };
  const configContent = generateConfigTemplate(defaultNetworks, []);
  import_fs5.default.writeFileSync(configPath, configContent);
  console.log("\n\u2705 Created wdk.config.js\n");
  console.log("  Edit the file to configure your networks and modules.\n");
});
program.command("validate").description("Validate configuration without building").option("-c, --config <path>", "Path to config file").action(async (options) => {
  const { loadConfig: loadConfig2 } = await Promise.resolve().then(() => (init_loader(), loader_exports));
  const { validateDependencies: validateDependencies2 } = await Promise.resolve().then(() => (init_dependencies(), dependencies_exports));
  try {
    console.log("\n\u{1F50D} Validating configuration...\n");
    const config = await loadConfig2(options.config);
    console.log(`  \u2713 Config file valid: ${config.configPath}`);
    const requiredPackages = getPackageList(config);
    const validation = validateDependencies2(requiredPackages, config.projectRoot);
    console.log("\n\u{1F4E6} Dependencies:\n");
    for (const mod of validation.installed) {
      console.log(`  \u2713 ${mod.name}`);
    }
    for (const mod of validation.missing) {
      console.log(`  \u2717 ${mod} \u2014 NOT INSTALLED`);
    }
    if (validation.valid) {
      console.log("\n\u2705 Configuration is valid and ready to build!\n");
    } else {
      console.log("\n\u26A0\uFE0F  Missing dependencies. Install them before building.\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n\u274C Validation failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
});
program.command("list-modules").description("List available WDK modules").option("--json", "Output as JSON").action((options) => {
  const modules = [
    { name: "@tetherto/wdk", description: "WDK Core", required: true },
    { name: "@tetherto/wdk-wallet-evm", description: "EVM chains (EOA)" },
    { name: "@tetherto/wdk-wallet-evm-erc-4337", description: "EVM with Account Abstraction" },
    { name: "@tetherto/wdk-wallet-btc", description: "Bitcoin" },
    { name: "@tetherto/wdk-wallet-spark", description: "Spark (Lightning)" },
    { name: "@tetherto/wdk-wallet-ton", description: "TON" },
    { name: "@tetherto/wdk-wallet-solana", description: "Solana" }
  ];
  if (options.json) {
    console.log(JSON.stringify(modules, null, 2));
    return;
  }
  console.log("\n\u{1F4E6} Available WDK Modules\n");
  for (const mod of modules) {
    const badge = mod.required ? " [required]" : "";
    console.log(`  ${mod.name}${badge}`);
    console.log(`    ${mod.description}
`);
  }
});
program.command("clean").description("Remove generated .wdk folder").option("-y, --yes", "Skip confirmation").action(async (options) => {
  const wdkDir = import_path5.default.join(process.cwd(), DEFAULT_OUTPUT_DIR);
  if (!import_fs5.default.existsSync(wdkDir)) {
    console.log("\n\u2713 Nothing to clean - .wdk folder does not exist\n");
    return;
  }
  if (!options.yes) {
    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    const answer = await new Promise((resolve) => {
      rl.question("\n\u26A0\uFE0F  This will delete the .wdk folder. Continue? [y/N] ", resolve);
    });
    rl.close();
    if (answer.toLowerCase() !== "y") {
      console.log("\n  Cancelled.\n");
      return;
    }
  }
  try {
    import_fs5.default.rmSync(wdkDir, { recursive: true, force: true });
    console.log("\n\u2713 Removed .wdk folder\n");
  } catch (error) {
    console.error("\n\u274C Failed to remove .wdk folder:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
});
function generateConfigTemplate(networks, preloadModules) {
  const networksStr = Object.entries(networks).map(([key, value]) => {
    const pkg2 = value.package || value;
    return `    ${key}: { package: '${pkg2}' }`;
  }).join(",\n");
  const preloadStr = preloadModules.length > 0 ? `  preloadModules: [
    '${preloadModules.join("',\n    '")}'
  ],
` : "";
  return `/**
 * WDK Bundle Configuration
 * Generated by @tetherto/wdk-worklet-bundler
 *
 * For documentation see: https://github.com/tetherto/wdk-worklet-bundler
 */

module.exports = {
  // Network mappings
  // Map logical network names to WDK wallet packages
  networks: {
${networksStr}
  },

${preloadStr}  // Output paths (optional, defaults shown)
  output: {
    bundle: '${DEFAULT_BUNDLE_PATH}',
    types: '${DEFAULT_TYPES_PATH}'
  },

  // Build options (optional)
  options: {
    // minify: false,
    // sourceMaps: false,
    targets: ${DEFAULT_BUNDLE_BUILD_HOSTS}
  }
};
`;
}
if (process.argv.slice(2).length === 0) {
  printBanner();
  program.outputHelp();
}
program.parse();
