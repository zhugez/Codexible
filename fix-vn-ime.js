#!/usr/bin/env node
/**
 * Vietnamese IME fix for Claude Opus (all versions)
 *
 * Finds the Claude cli.js and applies the IME patch that strips DEL (0x7f)
 * characters from text input, fixing the double-character/ghost-character
 * issue when typing Vietnamese.
 *
 * Usage:
 *   node fix-vn-ime.js            # Auto-detect and patch
 *   node fix-vn-ime.js --dry-run  # Show what would be patched
 *   node fix-vn-ime.js --restore  # Restore from backup
 *   node fix-vn-ime.js --check    # Check if already patched
 *
 * Works with npm, pnpm, bun, and direct installs on Linux/macOS/Windows.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const DORK = '/* _0x0a0d_ime_fix_ */';

function log(msg) { console.log('[fix-vn-ime] ' + msg); }
function error(msg) { console.error('[fix-vn-ime] ERROR: ' + msg); }

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');
const restore = args.includes('--restore') || args.includes('-r');
const check = args.includes('--check') || args.includes('-c');

// ---------------------------------------------------------------------------
// Glob fallback (works without npm glob package)
// ---------------------------------------------------------------------------
function glob(pattern) {
    // Try npm glob package first
    try {
        const { globSync } = require('glob');
        return globSync(pattern);
    } catch {}

    // Fallback: simple manual glob for pnpm @anthropic-ai+claude-code@*/node_modules/.../cli.js
    // Pattern: **/@anthropic-ai+claude-code@*/node_modules/@anthropic-ai/claude-code/cli.js
    const normalized = pattern.replace(/\\/g, '/');
    const parts = normalized.split('/');
    const results = [];

    function walk(dir, partIdx) {
        if (partIdx >= parts.length) return [dir];
        const part = parts[partIdx];
        const isLast = partIdx === parts.length - 1;

        try {
            if (!fs.existsSync(dir)) return [];
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            const out = [];

            if (part === '**') {
                // Recurse all subdirs
                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        out.push(...walk(path.join(dir, entry.name), partIdx + 1));
                    }
                }
                // Also continue without consuming **
                out.push(...walk(dir, partIdx + 1));
            } else if (part.includes('*')) {
                const regex = new RegExp('^' + part.replace(/\*/g, '[^/]*').replace(/\?/g, '.') + '$');
                for (const entry of entries) {
                    if (regex.test(entry.name)) {
                        const next = path.join(dir, entry.name);
                        if (isLast) {
                            if (entry.isFile() && entry.name === 'cli.js') out.push(next);
                        } else {
                            out.push(...walk(next, partIdx + 1));
                        }
                    }
                }
            } else {
                const next = path.join(dir, part);
                if (isLast) {
                    if (fs.existsSync(next) && fs.statSync(next).isFile()) out.push(next);
                } else {
                    out.push(...walk(next, partIdx + 1));
                }
            }
            return out;
        } catch { return []; }
    }

    const root = parts[0] === '' ? '/' : parts[0];
    return walk(root, 1).sort();
}

// ---------------------------------------------------------------------------
// Resolve pnpm shell shim to actual cli.js
// ---------------------------------------------------------------------------
function resolveFromShellScript(scriptPath) {
    if (!fs.existsSync(scriptPath)) return null;

    const content = fs.readFileSync(scriptPath, 'utf8').split('\n').slice(0, 30).join('\n');
    const lines = content.split('\n');
    const scriptDir = path.dirname(scriptPath);
    const isWin = os.platform() === 'win32';

    // Handle Windows batch SET VAR=... style
    for (const line of lines) {
        const match = line.match(/SET\s+\w+=(.+)/i) || line.match(/^\s*(?:set\s+)?(\w+)=(.+)/i);
        if (match) {
            const val = match[2].trim();
            if (val.includes('node_modules') && val.includes('cli.js')) {
                if (fs.existsSync(val)) return val;
            }
        }
    }

    // Handle bash/sh style pnpm shim:
    //   exec "$basedir/node" "$basedir/global/5/.pnpm/@anthropic-ai+claude-code@X.X.X/node_modules/@anthropic-ai/claude-code/cli.js" "$@"
    //   exec node "$basedir/global/5/.pnpm/@anthropic-ai+claude-code@X.X.X/node_modules/@anthropic-ai/claude-code/cli.js" "$@"
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('exec ')) continue;

        // Extract all quoted strings from the exec line
        const stringMatches = [...trimmed.matchAll(/["']([^"']+)["']/g)].map(m => m[1]);

        for (const str of stringMatches) {
            if (!str.includes('cli.js')) continue;

            let cliPath = str;

            // Expand $basedir or ${basedir} prefix
            if (cliPath.startsWith('$basedir') || cliPath.startsWith('${basedir}')) {
                const suffix = cliPath.replace(/^[$]{0,1}[{]?basedir[}]?/, '');
                cliPath = scriptDir + suffix.replace(/\//g, path.sep);
            }

            // Handle WSL-style paths like /mnt/c/Users/...  ->  C:\Users\...
            if (cliPath.startsWith('/mnt/')) {
                cliPath = cliPath.replace('/mnt/', '');
                cliPath = cliPath.replace(/^\/([a-z])\//i, (m, d) => d.toUpperCase() + ':/');
            }

            if (fs.existsSync(cliPath)) return cliPath;
        }
    }

    // Fallback: find latest cli.js in pnpm global
    const pnpmGlobal = path.join(
        isWin ? process.env.LOCALAPPDATA || '' : os.homedir(),
        isWin ? 'pnpm/global' : '.local/share/pnpm'
    );
    if (fs.existsSync(pnpmGlobal)) {
        try {
            for (const entry of fs.readdirSync(pnpmGlobal)) {
                const cliPath = path.join(pnpmGlobal, entry, '.pnpm', '@anthropic-ai+claude-code@*',
                    'node_modules', '@anthropic-ai', 'claude-code', 'cli.js');
                const matches = glob(cliPath);
                if (matches.length > 0) return matches[matches.length - 1];
            }
        } catch {}
    }
    return null;
}

function resolvePath(p, isWin) {
    if (!p || !fs.existsSync(p)) return null;
    if (!isWin) {
        try { return execSync('realpath "' + p + '"').toString().trim(); } catch {}
    }
    // Windows: if .cmd/.bat, resolve to actual js
    if (p.endsWith('.cmd') || p.endsWith('.bat')) {
        return resolveFromShellScript(p);
    }
    // Detect pnpm shim by shebang (bash/sh script with no extension on Windows)
    try {
        const fd = fs.openSync(p, 'r');
        const buf = Buffer.alloc(2);
        fs.readSync(fd, buf, 0, 2, 0);
        fs.closeSync(fd);
        const firstTwo = buf.toString('latin1');
        if (firstTwo === '#!' || firstTwo === 'SE' || firstTwo === '@@') {
            const resolved = resolveFromShellScript(p);
            if (resolved) return resolved;
        }
    } catch (_) {}
    return p;
}

// ---------------------------------------------------------------------------
// Find Claude CLI
// ---------------------------------------------------------------------------
function findClaudeCli() {
    const isWin = os.platform() === 'win32';

    // Try CLI resolution first
    try {
        const out = execSync(
            isWin ? 'where claude' : 'which claude',
            { stdio: ['ignore', 'pipe', 'ignore'] }
        ).toString().trim();
        const candidates = out.split(/\r?\n/);
        for (const candidate of candidates) {
            const resolved = resolvePath(candidate.trim(), isWin);
            if (resolved) return resolved;
        }
    } catch {}

    // Try bun
    try {
        const out = execSync('bun x claude --version', { stdio: ['pipe', 'pipe', 'ignore'] })
            .toString().trim();
        if (out) {
            const bunInstall = process.env.BUN_INSTALL ||
                (isWin ? path.join(process.env.USERPROFILE || '', '.bun') : path.join(os.homedir(), '.bun'));
            const p = path.join(bunInstall, 'bin', isWin ? 'claude.exe' : 'claude');
            if (fs.existsSync(p)) return p;
        }
    } catch {}

    // npm global
    try {
        const npmRoot = execSync('npm root -g').toString().trim();
        const p = path.join(npmRoot, '@anthropic-ai', 'claude-code', 'cli.js');
        if (fs.existsSync(p)) return p;
    } catch {}

    // pnpm global
    if (isWin) {
        const pnpmPaths = [
            path.join(process.env.LOCALAPPDATA || '', 'pnpm', 'claude'),
            path.join(process.env.APPDATA || '', 'pnpm', 'claude'),
        ];
        for (const p of pnpmPaths) {
            if (fs.existsSync(p)) {
                const resolved = resolveFromShellScript(p);
                if (resolved) return resolved;
            }
        }
        // Deep pnpm paths
        const pnpmGlobal = path.join(process.env.LOCALAPPDATA || '', 'pnpm', 'global');
        if (fs.existsSync(pnpmGlobal)) {
            try {
                for (const entry of fs.readdirSync(pnpmGlobal)) {
                    const cliPath = path.join(pnpmGlobal, entry, '.pnpm', '@anthropic-ai+claude-code@*',
                        'node_modules', '@anthropic-ai', 'claude-code', 'cli.js');
                    const matches = glob(cliPath);
                    if (matches.length > 0) return matches[matches.length - 1];
                }
            } catch {}
        }
    }

    return null;
}

// ---------------------------------------------------------------------------
// The patch: insert DEL-stripping code in function c (onInput handler)
// ---------------------------------------------------------------------------
function applyPatch(content) {
    if (content.includes(DORK)) {
        return { success: true, alreadyPatched: true };
    }

    // Find function c (the onInput handler that processes text input)
    const OLD = 'function c(A6,a){let s=G?G(A6,a):A6;if(s===""&&A6!=="")return;';
    const NEW = 'function c(A6,a){let s=G?G(A6,a):A6;if(s===""&&A6!=="")return;if(A6.match(/\\x7f/g))s=s.replace(/\\x7f/g,"");';

    const idx = content.indexOf(OLD);
    if (idx === -1) {
        return { success: false, message: 'Could not find target code pattern.\n' +
            '  Claude Opus version may have changed. Please report this at:\n' +
            '  https://github.com/0x0a0d/fix-vietnamese-claude-code/issues\n' +
            '  Include: Claude version (' + guessVersion(content) + ') and OS.' };
    }

    // Verify it's not already patched (DORK check)
    if (content.substring(Math.max(0, idx - 100), idx).includes(DORK)) {
        return { success: true, alreadyPatched: true };
    }

    const patched = content.substring(0, idx)
        + DORK + '\n'
        + NEW
        + content.substring(idx + OLD.length);

    // Verify
    if (!patched.includes(DORK) || !patched.includes(NEW)) {
        return { success: false, message: 'Patch verification failed.' };
    }

    return { success: true, alreadyPatched: false, patched };
}

function guessVersion(content) {
    const m = content.match(/"version"\s*:\s*"([^"]+)"/);
    if (m) return m[1];
    return 'unknown';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
    log('Claude Opus Vietnamese IME Fix');
    log('Node.js ' + process.version + ' | ' + os.platform() + ' | ' + os.arch());
    log('');

    const cliPath = findClaudeCli();

    if (!cliPath) {
        error('Could not find Claude Opus CLI.');
        error('Make sure Claude Opus is installed (npm install -g @anthropic-ai/claude-code)');
        error('or install via: https://docs.anthropic.com/en/docs/claude-code/setup');
        process.exit(1);
    }

    log('Found CLI: ' + cliPath);

    // Read content (latin1 for binary safety)
    let content;
    try {
        content = fs.readFileSync(cliPath, 'latin1');
    } catch (e) {
        error('Could not read file: ' + cliPath + '\n' + e.message);
        process.exit(1);
    }

    log('File size: ' + Math.round(content.length / 1024) + ' KB');

    // --check mode
    if (check) {
        if (content.includes(DORK)) {
            log('Status: PATCHED');
            log('Claude Opus is already fixed for Vietnamese IME.');
        } else {
            log('Status: NOT PATCHED');
            log('Run without --check to apply the fix.');
        }
        return;
    }

    // --restore mode
    if (restore) {
        const backup = cliPath + '.bak';
        if (fs.existsSync(backup)) {
            fs.copyFileSync(backup, cliPath);
            log('Restored from backup: ' + cliPath);
        } else {
            error('No backup found at: ' + backup);
            process.exit(1);
        }
        return;
    }

    // Apply patch
    const result = applyPatch(content);

    if (result.alreadyPatched) {
        log('Claude Opus is already patched for Vietnamese IME.');
        return;
    }

    if (!result.success) {
        error(result.message);
        process.exit(1);
    }

    if (dryRun) {
        log('Dry run: patch would be applied (use without --dry-run to save).');
        log('');
        log('=== Change ===');
        log('  Before: function c(A6,a){let s=G?G(A6,a):A6;if(s===""&&A6!=="")return;');
        log('  After:  function c(A6,a){let s=G?G(A6,a):A6;if(s===""&&A6!=="")return;');
        log('                if(A6.match(/\\x7f/g))s=s.replace(/\\x7f/g,"");');
        return;
    }

    // Backup
    const backup = cliPath + '.bak';
    if (!fs.existsSync(backup)) {
        fs.copyFileSync(cliPath, backup);
        log('Backup: ' + backup);
    }

    // Write
    fs.writeFileSync(cliPath, result.patched, 'latin1');
    log('Patched: ' + cliPath);
    log('');
    log('SUCCESS! Vietnamese IME is now fixed.');
    log('If it doesn\'t work, restore with: node fix-vn-ime.js --restore');
}

main();
