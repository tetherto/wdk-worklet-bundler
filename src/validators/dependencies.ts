/**
 * Dependency validator
 */

import fs from 'fs';
import path from 'path';

export interface ModuleInfo {
  name: string;
  path: string;
  version: string;
  isLocal: boolean;
}

export interface ValidationResult {
  valid: boolean;
  installed: ModuleInfo[];
  missing: string[];
}

/**
 * Resolve a module to its location
 */
export function resolveModule(
  modulePath: string,
  projectRoot: string
): ModuleInfo | null {
  // Check if it's a local path
  if (modulePath.startsWith('.') || modulePath.startsWith('/')) {
    const absolutePath = path.resolve(projectRoot, modulePath);
    if (fs.existsSync(absolutePath)) {
      const pkgPath = path.join(absolutePath, 'package.json');
      let pkg = { name: path.basename(absolutePath), version: 'local' };

      if (fs.existsSync(pkgPath)) {
        try {
          pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        } catch {
          // Use default if package.json is malformed
        }
      }

      return {
        name: pkg.name,
        path: absolutePath,
        version: pkg.version,
        isLocal: true,
      };
    }
    return null;
  }

  // Check in node_modules
  const nodeModulesPath = path.join(projectRoot, 'node_modules', modulePath);

  if (!fs.existsSync(nodeModulesPath)) {
    return null;
  }

  const pkgPath = path.join(nodeModulesPath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return null;
  }

  let pkg: { name: string; version: string };
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch {
    return null;
  }

  return {
    name: pkg.name,
    path: nodeModulesPath,
    version: pkg.version,
    isLocal: false,
  };
}

/**
 * Validate all modules are installed
 */
export function validateDependencies(
  modules: Record<string, string>,
  projectRoot: string
): ValidationResult {
  const installed: ModuleInfo[] = [];
  const missing: string[] = [];

  for (const [_key, modulePath] of Object.entries(modules)) {
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
    missing,
  };
}

/**
 * Detect package manager
 */
export function detectPackageManager(
  projectRoot: string
): 'npm' | 'yarn' | 'pnpm' {
  if (fs.existsSync(path.join(projectRoot, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (fs.existsSync(path.join(projectRoot, 'yarn.lock'))) {
    return 'yarn';
  }
  return 'npm';
}

/**
 * Generate install command for missing dependencies
 */
export function generateInstallCommand(
  missing: string[],
  packageManager: 'npm' | 'yarn' | 'pnpm' = 'npm'
): string {
  // Filter out local paths
  const packages = missing.filter(
    (m) => !m.startsWith('.') && !m.startsWith('/')
  );

  if (packages.length === 0) {
    return '';
  }

  switch (packageManager) {
    case 'yarn':
      return `yarn add ${packages.join(' ')}`;
    case 'pnpm':
      return `pnpm add ${packages.join(' ')}`;
    default:
      return `npm install ${packages.join(' ')}`;
  }
}

export interface InstallResult {
  success: boolean;
  command: string;
  installed: string[];
  failed: string[];
  error?: string;
}

export interface UninstallResult {
  success: boolean;
  command: string;
  removed: string[];
  failed: string[];
  error?: string;
}

/**
 * Install missing dependencies
 */
export function installDependencies(
  missing: string[],
  projectRoot: string,
  options: { verbose?: boolean } = {}
): InstallResult {
  const { execSync } = require('child_process');

  // Filter out local paths - we can only install npm packages
  const packages = missing.filter(
    (m) => !m.startsWith('.') && !m.startsWith('/')
  );

  const localPaths = missing.filter(
    (m) => m.startsWith('.') || m.startsWith('/')
  );

  if (packages.length === 0) {
    return {
      success: localPaths.length === 0,
      command: '',
      installed: [],
      failed: localPaths,
      error: localPaths.length > 0
        ? `Cannot auto-install local paths: ${localPaths.join(', ')}`
        : undefined,
    };
  }

  const packageManager = detectPackageManager(projectRoot);
  const command = generateInstallCommand(packages, packageManager);

  try {
    execSync(command, {
      cwd: projectRoot,
      stdio: options.verbose ? 'inherit' : 'pipe',
    });

    return {
      success: localPaths.length === 0,
      command,
      installed: packages,
      failed: localPaths,
      error: localPaths.length > 0
        ? `Cannot auto-install local paths: ${localPaths.join(', ')}`
        : undefined,
    };
  } catch (error) {
    return {
      success: false,
      command,
      installed: [],
      failed: [...packages, ...localPaths],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Generate uninstall command for packages
 */
export function generateUninstallCommand(
  packages: string[],
  packageManager: 'npm' | 'yarn' | 'pnpm' = 'npm'
): string {
  // Filter out local paths
  const npmPackages = packages.filter(
    (m) => !m.startsWith('.') && !m.startsWith('/')
  );

  if (npmPackages.length === 0) {
    return '';
  }

  switch (packageManager) {
    case 'yarn':
      return `yarn remove ${npmPackages.join(' ')}`;
    case 'pnpm':
      return `pnpm remove ${npmPackages.join(' ')}`;
    default:
      return `npm uninstall ${npmPackages.join(' ')}`;
  }
}

/**
 * Uninstall dependencies
 */
export function uninstallDependencies(
  packages: string[],
  projectRoot: string,
  options: { verbose?: boolean } = {}
): UninstallResult {
  const { execSync } = require('child_process');

  // Filter out local paths - we can only uninstall npm packages
  const npmPackages = packages.filter(
    (m) => !m.startsWith('.') && !m.startsWith('/')
  );

  if (npmPackages.length === 0) {
    return {
      success: true,
      command: '',
      removed: [],
      failed: [],
    };
  }

  const packageManager = detectPackageManager(projectRoot);
  const command = generateUninstallCommand(npmPackages, packageManager);

  try {
    execSync(command, {
      cwd: projectRoot,
      stdio: options.verbose ? 'inherit' : 'pipe',
    });

    return {
      success: true,
      command,
      removed: npmPackages,
      failed: [],
    };
  } catch (error) {
    return {
      success: false,
      command,
      removed: [],
      failed: npmPackages,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
