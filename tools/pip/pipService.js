import { promises as fs } from 'fs';
import path from 'path';
import { exec as _exec } from 'child_process';
import { promisify } from 'util';

const exec = promisify(_exec);

const pipService = {
  async updateRequirementsAndInstall(newRequirements, repoRoot) {
    const filePath = this._getRequirementsPath(repoRoot);
    const existing = await this._readSet(filePath);
    const merged = new Set([...existing, ...this._normalizeList(newRequirements)]);

    const changed =
      merged.size !== existing.size || [...merged].some((x) => !existing.has(x));

    if (!changed) return { updated: false, filePath };

    await this._writeSet(filePath, merged);

    try {
      await this._pipInstallFile(filePath);
      return { updated: true, filePath };
    } catch (err) {
      // Fallback: best-effort install by list
      await this._pipInstallList([...merged]);
      return { updated: true, filePath, warning: err.message };
    }
  },

  _getRequirementsPath(root) {
    return path.join(root || process.cwd(), 'requirements.txt');
  },

  async _readSet(filePath) {
    try {
      const txt = await fs.readFile(filePath, 'utf8');
      return this._normalizeSet(txt.split(/\r?\n/));
    } catch {
      return new Set();
    }
  },

  _normalizeList(arr) {
    return (arr || [])
      .map((s) => String(s || '').trim())
      .filter(Boolean);
  },

  _normalizeSet(lines) {
    return new Set(
      this._normalizeList(lines).map((l) =>
        l.replace(/^(-e\s+)?\s*/, '').replace(/\s+#.*$/, '')
      )
    );
  },

  async _writeSet(filePath, set) {
    const lines = [...set].sort((a, b) => a.localeCompare(b));
    await fs.writeFile(filePath, lines.join('\n') + '\n', 'utf8');
  },

  async _pipInstallFile(filePath) {
    await exec(`pip install -r "${filePath}"`, { cwd: path.dirname(filePath) });
  },

  async _pipInstallList(pkgs) {
    if (!pkgs.length) return;
    await exec(`pip install ${pkgs.map((p) => JSON.stringify(p)).join(' ')}`);
  }
};

export default pipService;
