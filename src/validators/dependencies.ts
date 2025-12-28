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
