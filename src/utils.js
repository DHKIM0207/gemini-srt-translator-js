import fs from 'fs';
import fetch from 'node-fetch';
import semver from 'semver';
import { execSync } from 'child_process';
import readline from 'readline';
import { highlight, info, success, setColorMode } from './logger.js';

export function getInstalledVersion(packageName) {
  try {
    const packageJsonPath = new URL(`../../node_modules/${packageName}/package.json`, import.meta.url);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    // If not found in node_modules, check current package
    try {
      const currentPackageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
      if (currentPackageJson.name === packageName) {
        return currentPackageJson.version;
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }
}

export async function getLatestNpmVersion(packageName) {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (response.status === 200) {
      const data = await response.json();
      
      // Get all versions and filter out pre-release versions
      const versions = Object.keys(data.versions || {});
      const stableVersions = versions.filter(v => !semver.prerelease(v));
      
      if (stableVersions.length > 0) {
        // Sort and get the latest
        return stableVersions.sort(semver.rcompare)[0];
      }
      
      return data['dist-tags']?.latest || null;
    }
  } catch (error) {
    console.error('Error fetching latest version:', error);
  }
  return null;
}

export function displayProgressBar(packageName) {
  const width = 40;
  let position = 0;
  let direction = 1;
  const barLength = 10;
  
  const intervalId = setInterval(() => {
    position += direction;
    
    if (position >= width - barLength || position <= 0) {
      direction *= -1;
    }
    
    const bar = '[' + ' '.repeat(position) + '#'.repeat(barLength) + ' '.repeat(width - position - barLength) + ']';
    process.stdout.write(`\rInstalling ${packageName}: ${bar}`);
  }, 100);
  
  return () => {
    clearInterval(intervalId);
    const bar = '[' + '#'.repeat(width) + ']';
    process.stdout.write(`\rInstalling ${packageName}: ${bar} Complete!\n`);
  };
}

export async function upgradePackage(packageName, useColors = true) {
  setColorMode(useColors);
  
  const installedVersion = getInstalledVersion(packageName);
  const latestVersion = await getLatestNpmVersion(packageName);
  
  if (!installedVersion || !latestVersion) {
    return;
  }
  
  if (semver.lt(installedVersion, latestVersion)) {
    info(`There is a new version of ${packageName} available: ${latestVersion}.`);
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question(
        `Do you want to upgrade ${packageName} from version ${installedVersion} to ${latestVersion}? (y/n): `,
        resolve
      );
    });
    rl.close();
    
    if (answer.toLowerCase() === 'y') {
      highlight(`Upgrading ${packageName}...`);
      
      const stopProgress = displayProgressBar(packageName);
      
      try {
        // Global install
        execSync(`npm install -g ${packageName}@${latestVersion}`, {
          stdio: 'ignore'
        });
        
        stopProgress();
        success(`${packageName} upgraded to version ${latestVersion}.`);
        info('Please restart your script.\n');
        process.exit(0);
      } catch (error) {
        stopProgress();
        console.error(`\nError upgrading ${packageName}:`, error.message);
      }
    } else {
      info(`${packageName} upgrade skipped.\n`);
    }
  }
}