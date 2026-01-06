import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CLI_PATH = path.resolve(__dirname, '../../dist/cli.js');

describe('CLI Integration Tests', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wdk-cli-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const runCli = (args: string): string => {
    try {
      return execSync(`node ${CLI_PATH} ${args} 2>&1`, {
        encoding: 'utf-8',
        cwd: tempDir,
      });
    } catch (error: unknown) {
      const execError = error as { stdout?: string; stderr?: string; message?: string };
      // Error output might be in stdout due to 2>&1 redirect, or in stderr/message
      return execError.stdout || execError.stderr || execError.message || '';
    }
  };

  describe('init command', () => {
    it('should create wdk.config.js with default config', () => {
      const output = runCli('init -y');

      expect(output).toContain('Created wdk.config.js');
      expect(fs.existsSync(path.join(tempDir, 'wdk.config.js'))).toBe(true);
    });

    it('should create config with proper structure', () => {
      runCli('init -y');

      const configPath = path.join(tempDir, 'wdk.config.js');
      const content = fs.readFileSync(configPath, 'utf-8');

      expect(content).toContain('modules:');
      expect(content).toContain('networks:');
      expect(content).toContain('@tetherto/wdk');
    });

    it('should warn if config already exists', () => {
      // Create first config
      runCli('init -y');

      // Try to create again without -y
      const output = runCli('init');

      expect(output).toContain('already exists');
    });

    it('should overwrite with -y flag', () => {
      // Create first config
      runCli('init -y');

      // Modify it
      fs.appendFileSync(path.join(tempDir, 'wdk.config.js'), '// modified');

      // Overwrite
      runCli('init -y');

      const content = fs.readFileSync(path.join(tempDir, 'wdk.config.js'), 'utf-8');
      expect(content).not.toContain('// modified');
    });
  });

  describe('validate command', () => {
    it('should validate valid config', () => {
      // Create a valid config
      const config = `
module.exports = {
  modules: {
    core: '@tetherto/wdk',
  },
  networks: {
    ethereum: {
      module: 'core',
      chainId: 1,
      blockchain: 'ethereum',
    },
  },
};
`;
      fs.writeFileSync(path.join(tempDir, 'wdk.config.js'), config);

      // Create fake node_modules
      const wdkPath = path.join(tempDir, 'node_modules', '@tetherto', 'wdk');
      fs.mkdirSync(wdkPath, { recursive: true });
      fs.writeFileSync(
        path.join(wdkPath, 'package.json'),
        JSON.stringify({ name: '@tetherto/wdk', version: '1.0.0' })
      );

      const output = runCli('validate');

      expect(output).toContain('Config file valid');
    });

    it('should fail on missing dependencies', () => {
      // Create a valid config but don't install modules
      const config = `
module.exports = {
  modules: {
    core: '@tetherto/wdk',
  },
  networks: {
    ethereum: {
      module: 'core',
      chainId: 1,
      blockchain: 'ethereum',
    },
  },
};
`;
      fs.writeFileSync(path.join(tempDir, 'wdk.config.js'), config);

      const output = runCli('validate');

      expect(output).toContain('NOT INSTALLED');
    });

    it('should fail on invalid config', () => {
      // Create an invalid config
      const config = `
module.exports = {
  modules: {},
  networks: {},
};
`;
      fs.writeFileSync(path.join(tempDir, 'wdk.config.js'), config);

      const output = runCli('validate');

      expect(output).toContain('Invalid configuration');
    });

    it('should error when no config file exists', () => {
      const output = runCli('validate');

      expect(output).toContain('No wdk.config.js found');
    });
  });

  describe('list-modules command', () => {
    it('should list available modules', () => {
      const output = runCli('list-modules');

      expect(output).toContain('@tetherto/wdk');
      expect(output).toContain('@tetherto/wdk-wallet-evm');
      expect(output).toContain('@tetherto/wdk-wallet-btc');
      expect(output).toContain('@tetherto/wdk-wallet-spark');
    });

    it('should output JSON with --json flag', () => {
      const output = runCli('list-modules --json');

      const modules = JSON.parse(output);
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.find((m: { name: string }) => m.name === '@tetherto/wdk')).toBeDefined();
    });

    it('should show required badge for core module', () => {
      const output = runCli('list-modules');

      expect(output).toContain('[required]');
    });
  });

  describe('clean command', () => {
    it('should remove .wdk folder', () => {
      // Create .wdk folder
      const wdkDir = path.join(tempDir, '.wdk');
      fs.mkdirSync(wdkDir);
      fs.writeFileSync(path.join(wdkDir, 'test.js'), 'test');

      const output = runCli('clean -y');

      expect(output).toContain('Removed .wdk folder');
      expect(fs.existsSync(wdkDir)).toBe(false);
    });

    it('should handle missing .wdk folder', () => {
      const output = runCli('clean -y');

      expect(output).toContain('Nothing to clean');
    });
  });

  describe('generate command', () => {
    it('should fail when config is missing', () => {
      const output = runCli('generate');

      expect(output).toContain('No wdk.config.js found');
    });

    it('should fail when dependencies are missing', () => {
      // Create a valid config
      const config = `
module.exports = {
  modules: {
    core: '@tetherto/wdk',
  },
  networks: {
    ethereum: {
      module: 'core',
      chainId: 1,
      blockchain: 'ethereum',
    },
  },
};
`;
      fs.writeFileSync(path.join(tempDir, 'wdk.config.js'), config);

      const output = runCli('generate');

      expect(output).toContain('missing dependencies');
    });

    it('should suggest --install flag when dependencies are missing', () => {
      const config = `
module.exports = {
  modules: {
    core: '@tetherto/wdk',
  },
  networks: {
    ethereum: {
      module: 'core',
      chainId: 1,
      blockchain: 'ethereum',
    },
  },
};
`;
      fs.writeFileSync(path.join(tempDir, 'wdk.config.js'), config);

      const output = runCli('generate');

      expect(output).toContain('--install');
    });

    it('should attempt install with --install flag', () => {
      const config = `
module.exports = {
  modules: {
    core: '@tetherto/wdk',
  },
  networks: {
    ethereum: {
      module: 'core',
      chainId: 1,
      blockchain: 'ethereum',
    },
  },
};
`;
      fs.writeFileSync(path.join(tempDir, 'wdk.config.js'), config);
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'test-project', version: '1.0.0' })
      );

      const output = runCli('generate --install');

      // Should attempt to install
      expect(output).toContain('Installing missing dependencies');
    });

    it('should warn about local paths that cannot be auto-installed', () => {
      const config = `
module.exports = {
  modules: {
    core: './local-wdk-module',
  },
  networks: {
    ethereum: {
      module: 'core',
      chainId: 1,
      blockchain: 'ethereum',
    },
  },
};
`;
      fs.writeFileSync(path.join(tempDir, 'wdk.config.js'), config);

      const output = runCli('generate --install');

      expect(output).toContain('Failed to install');
    });

    it('should inform when --cleanup is used without --install', () => {
      const config = `
module.exports = {
  modules: {
    core: '@tetherto/wdk',
  },
  networks: {
    ethereum: {
      module: 'core',
      chainId: 1,
      blockchain: 'ethereum',
    },
  },
};
`;
      fs.writeFileSync(path.join(tempDir, 'wdk.config.js'), config);

      // Create fake node_modules so validation passes
      const wdkPath = path.join(tempDir, 'node_modules', '@tetherto', 'wdk');
      fs.mkdirSync(wdkPath, { recursive: true });
      fs.writeFileSync(
        path.join(wdkPath, 'package.json'),
        JSON.stringify({ name: '@tetherto/wdk', version: '1.0.0' })
      );

      const output = runCli('generate --cleanup --dry-run');

      expect(output).toContain('No dependencies to clean up');
    });

    it('should generate source files with --source-only', () => {
      // Create a valid config
      const config = `
module.exports = {
  modules: {
    core: '@tetherto/wdk',
  },
  networks: {
    ethereum: {
      module: 'core',
      chainId: 1,
      blockchain: 'ethereum',
    },
  },
};
`;
      fs.writeFileSync(path.join(tempDir, 'wdk.config.js'), config);

      const output = runCli('generate --source-only');

      expect(output).toContain('Source files generated');
      expect(fs.existsSync(path.join(tempDir, '.wdk', 'wdk-worklet.generated.js'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, '.wdk', 'hrpc'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, '.wdk', 'schema'))).toBe(true);
    });

    it('should show dry run output', () => {
      // Create a valid config
      const config = `
module.exports = {
  modules: {
    core: '@tetherto/wdk',
  },
  networks: {
    ethereum: {
      module: 'core',
      chainId: 1,
      blockchain: 'ethereum',
    },
  },
};
`;
      fs.writeFileSync(path.join(tempDir, 'wdk.config.js'), config);

      // Create fake node_modules
      const wdkPath = path.join(tempDir, 'node_modules', '@tetherto', 'wdk');
      fs.mkdirSync(wdkPath, { recursive: true });
      fs.writeFileSync(
        path.join(wdkPath, 'package.json'),
        JSON.stringify({ name: '@tetherto/wdk', version: '1.0.0' })
      );

      const output = runCli('generate --dry-run');

      expect(output).toContain('Dry run');
      expect(output).toContain('.wdk/wdk-worklet.generated.js');
    });
  });

  describe('custom config path', () => {
    it('should use custom config path with -c flag', () => {
      // Create config in custom location
      const customConfigPath = path.join(tempDir, 'custom', 'my-config.js');
      fs.mkdirSync(path.dirname(customConfigPath), { recursive: true });

      const config = `
module.exports = {
  modules: {
    core: '@tetherto/wdk',
  },
  networks: {
    ethereum: {
      module: 'core',
      chainId: 1,
      blockchain: 'ethereum',
    },
  },
};
`;
      fs.writeFileSync(customConfigPath, config);

      const output = runCli(`validate -c custom/my-config.js`);

      expect(output).toContain('custom/my-config.js');
    });

    it('should error on non-existent config path', () => {
      const output = runCli('validate -c nonexistent.js');

      expect(output).toContain('Config file not found');
    });
  });
});
