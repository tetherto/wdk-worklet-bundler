import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  resolveModule,
  validateDependencies,
  detectPackageManager,
  generateInstallCommand,
} from '../../src/validators/dependencies';

describe('Dependency Validator', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wdk-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('resolveModule', () => {
    it('should resolve installed npm module', () => {
      // Create fake node_modules structure
      const modulePath = path.join(tempDir, 'node_modules', '@tetherto', 'wdk');
      fs.mkdirSync(modulePath, { recursive: true });
      fs.writeFileSync(
        path.join(modulePath, 'package.json'),
        JSON.stringify({ name: '@tetherto/wdk', version: '1.0.0' })
      );

      const result = resolveModule('@tetherto/wdk', tempDir);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('@tetherto/wdk');
      expect(result?.version).toBe('1.0.0');
      expect(result?.isLocal).toBe(false);
    });

    it('should return null for missing npm module', () => {
      const result = resolveModule('@tetherto/nonexistent', tempDir);
      expect(result).toBeNull();
    });

    it('should resolve local module path', () => {
      // Create local module
      const localModule = path.join(tempDir, 'local-module');
      fs.mkdirSync(localModule, { recursive: true });
      fs.writeFileSync(
        path.join(localModule, 'package.json'),
        JSON.stringify({ name: 'my-local-module', version: '0.1.0' })
      );

      const result = resolveModule('./local-module', tempDir);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('my-local-module');
      expect(result?.version).toBe('0.1.0');
      expect(result?.isLocal).toBe(true);
    });

    it('should resolve local module without package.json', () => {
      const localModule = path.join(tempDir, 'simple-module');
      fs.mkdirSync(localModule, { recursive: true });
      fs.writeFileSync(path.join(localModule, 'index.js'), 'module.exports = {}');

      const result = resolveModule('./simple-module', tempDir);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('simple-module');
      expect(result?.version).toBe('local');
      expect(result?.isLocal).toBe(true);
    });

    it('should return null for missing local module', () => {
      const result = resolveModule('./nonexistent', tempDir);
      expect(result).toBeNull();
    });

    it('should handle absolute paths', () => {
      const absoluteModule = path.join(tempDir, 'absolute-module');
      fs.mkdirSync(absoluteModule, { recursive: true });
      fs.writeFileSync(
        path.join(absoluteModule, 'package.json'),
        JSON.stringify({ name: 'absolute-mod', version: '2.0.0' })
      );

      const result = resolveModule(absoluteModule, tempDir);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('absolute-mod');
      expect(result?.isLocal).toBe(true);
    });
  });

  describe('validateDependencies', () => {
    it('should return valid when all modules are installed', () => {
      // Setup installed modules
      const wdkPath = path.join(tempDir, 'node_modules', '@tetherto', 'wdk');
      const erc4337Path = path.join(tempDir, 'node_modules', '@tetherto', 'wdk-wallet-evm-erc-4337');

      fs.mkdirSync(wdkPath, { recursive: true });
      fs.mkdirSync(erc4337Path, { recursive: true });

      fs.writeFileSync(
        path.join(wdkPath, 'package.json'),
        JSON.stringify({ name: '@tetherto/wdk', version: '1.0.0' })
      );
      fs.writeFileSync(
        path.join(erc4337Path, 'package.json'),
        JSON.stringify({ name: '@tetherto/wdk-wallet-evm-erc-4337', version: '1.0.0' })
      );

      const modules = {
        core: '@tetherto/wdk',
        erc4337: '@tetherto/wdk-wallet-evm-erc-4337',
      };

      const result = validateDependencies(modules, tempDir);

      expect(result.valid).toBe(true);
      expect(result.installed).toHaveLength(2);
      expect(result.missing).toHaveLength(0);
    });

    it('should return invalid when modules are missing', () => {
      const modules = {
        core: '@tetherto/wdk',
        erc4337: '@tetherto/wdk-wallet-evm-erc-4337',
      };

      const result = validateDependencies(modules, tempDir);

      expect(result.valid).toBe(false);
      expect(result.installed).toHaveLength(0);
      expect(result.missing).toContain('@tetherto/wdk');
      expect(result.missing).toContain('@tetherto/wdk-wallet-evm-erc-4337');
    });

    it('should handle mixed installed and missing modules', () => {
      // Only install one module
      const wdkPath = path.join(tempDir, 'node_modules', '@tetherto', 'wdk');
      fs.mkdirSync(wdkPath, { recursive: true });
      fs.writeFileSync(
        path.join(wdkPath, 'package.json'),
        JSON.stringify({ name: '@tetherto/wdk', version: '1.0.0' })
      );

      const modules = {
        core: '@tetherto/wdk',
        erc4337: '@tetherto/wdk-wallet-evm-erc-4337',
      };

      const result = validateDependencies(modules, tempDir);

      expect(result.valid).toBe(false);
      expect(result.installed).toHaveLength(1);
      expect(result.missing).toContain('@tetherto/wdk-wallet-evm-erc-4337');
    });
  });

  describe('detectPackageManager', () => {
    it('should detect pnpm', () => {
      fs.writeFileSync(path.join(tempDir, 'pnpm-lock.yaml'), '');
      expect(detectPackageManager(tempDir)).toBe('pnpm');
    });

    it('should detect yarn', () => {
      fs.writeFileSync(path.join(tempDir, 'yarn.lock'), '');
      expect(detectPackageManager(tempDir)).toBe('yarn');
    });

    it('should default to npm', () => {
      expect(detectPackageManager(tempDir)).toBe('npm');
    });

    it('should prefer pnpm over yarn if both exist', () => {
      fs.writeFileSync(path.join(tempDir, 'pnpm-lock.yaml'), '');
      fs.writeFileSync(path.join(tempDir, 'yarn.lock'), '');
      expect(detectPackageManager(tempDir)).toBe('pnpm');
    });
  });

  describe('generateInstallCommand', () => {
    it('should generate npm install command', () => {
      const missing = ['@tetherto/wdk', '@tetherto/wdk-wallet-evm-erc-4337'];
      const cmd = generateInstallCommand(missing, 'npm');
      expect(cmd).toBe('npm install @tetherto/wdk @tetherto/wdk-wallet-evm-erc-4337');
    });

    it('should generate yarn add command', () => {
      const missing = ['@tetherto/wdk'];
      const cmd = generateInstallCommand(missing, 'yarn');
      expect(cmd).toBe('yarn add @tetherto/wdk');
    });

    it('should generate pnpm add command', () => {
      const missing = ['@tetherto/wdk'];
      const cmd = generateInstallCommand(missing, 'pnpm');
      expect(cmd).toBe('pnpm add @tetherto/wdk');
    });

    it('should filter out local paths', () => {
      const missing = ['@tetherto/wdk', './local-module', '/absolute/path'];
      const cmd = generateInstallCommand(missing, 'npm');
      expect(cmd).toBe('npm install @tetherto/wdk');
    });

    it('should return empty string if only local paths', () => {
      const missing = ['./local-module', '/absolute/path'];
      const cmd = generateInstallCommand(missing, 'npm');
      expect(cmd).toBe('');
    });
  });
});
