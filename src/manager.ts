import { App, Notice, normalizePath } from 'obsidian';
import { GitHubClient, GitHubRelease, ManifestData } from './github';

export interface InstalledPluginInfo {
	id: string;
	name: string;
	version: string;
	repo: string; // "owner/repo"
	latestVersion?: string;
	hasUpdate?: boolean;
	lastChecked?: number;
	pinned?: boolean;
}

export interface EcosystemItem {
	id: string;
	name: string;
	repo: string; // "owner/repo"
	taglineRu: string;
	taglineEn: string;
	category: string;
}

export const ECOSYSTEM_PLUGINS: EcosystemItem[] = [
	{
		id: 'obsidian-avm-file-extensions',
		name: 'AVM File Extensions',
		repo: 'loklp42/obsidian-avm-file-extensions',
		taglineRu: 'Редактор кода (CodeMirror 6), поддержка 50+ расширений и интерактивная векторная SVG Студия.',
		taglineEn: 'Code editor (CodeMirror 6), 50+ formats support and infinite-zoom vector SVG Studio.',
		category: 'Code & Graphics'
	},
	{
		id: 'obsidian-avm-folder-notes',
		name: 'AVM Folder Notes',
		repo: 'loklp42/obsidian-avm-folder-notes',
		taglineRu: 'Архитектура папок-заметок (Notion-style) и векторная система иконок для проводника и вкладок.',
		taglineEn: 'Folder notes architecture (Notion-style) and vector icons engine for explorer and tabs.',
		category: 'Structure & Visual'
	}
];

export class PluginManager {
	private app: App;
	private client: GitHubClient;

	constructor(app: App, client: GitHubClient) {
		this.app = app;
		this.client = client;
	}

	getPluginDir(pluginId: string): string {
		const configDir = this.app.vault.configDir;
		return normalizePath(`${configDir}/plugins/${pluginId}`);
	}

	/**
	 * Check if plugin folder exists and has manifest.json
	 */
	async isPluginInstalled(pluginId: string): Promise<boolean> {
		const dir = this.getPluginDir(pluginId);
		const manifestPath = normalizePath(`${dir}/manifest.json`);
		return await this.app.vault.adapter.exists(manifestPath);
	}

	/**
	 * Read local manifest of installed plugin
	 */
	async getLocalManifest(pluginId: string): Promise<ManifestData | null> {
		const manifestPath = normalizePath(`${this.getPluginDir(pluginId)}/manifest.json`);
		try {
			if (await this.app.vault.adapter.exists(manifestPath)) {
				const content = await this.app.vault.adapter.read(manifestPath);
				return JSON.parse(content) as ManifestData;
			}
		} catch (e) {
			console.error(`Failed to read manifest for ${pluginId}:`, e);
		}
		return null;
	}

	/**
	 * Download and install/update plugin from GitHub release
	 */
	async installFromRelease(
		owner: string,
		repo: string,
		release: GitHubRelease
	): Promise<{ success: boolean; manifest?: ManifestData; error?: string }> {
		const assets = this.client.findPluginAssets(release);

		if (!assets.manifestAsset || !assets.mainAsset) {
			return {
				success: false,
				error: 'Release is missing manifest.json or main.js files.'
			};
		}

		try {
			// 1. Download and parse manifest.json first to know plugin ID
			const manifestJsonText = await this.client.downloadText(assets.manifestAsset.browser_download_url);
			const manifest = JSON.parse(manifestJsonText) as ManifestData;
			if (!manifest.id) {
				return { success: false, error: 'manifest.json missing required id property.' };
			}

			// 2. Ensure target directory exists
			const pluginDir = this.getPluginDir(manifest.id);
			if (!(await this.app.vault.adapter.exists(pluginDir))) {
				await this.app.vault.adapter.mkdir(pluginDir);
			}

			// 3. Download main.js
			const mainJsText = await this.client.downloadText(assets.mainAsset.browser_download_url);
			await this.app.vault.adapter.write(normalizePath(`${pluginDir}/main.js`), mainJsText);

			// 4. Save manifest.json
			await this.app.vault.adapter.write(normalizePath(`${pluginDir}/manifest.json`), manifestJsonText);

			// 5. Download styles.css if available
			if (assets.stylesAsset) {
				const stylesText = await this.client.downloadText(assets.stylesAsset.browser_download_url);
				await this.app.vault.adapter.write(normalizePath(`${pluginDir}/styles.css`), stylesText);
			}

			// 6. Reload plugin in Obsidian without requiring full app reload
			await this.reloadPluginInObsidian(manifest.id);

			return { success: true, manifest };
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			return { success: false, error: msg };
		}
	}

	/**
	 * Reload and re-enable plugin via internal Obsidian plugin manager
	 */
	async reloadPluginInObsidian(pluginId: string): Promise<void> {
		try {
			const pluginsObj = (this.app as any).plugins;
			if (!pluginsObj) return;

			await pluginsObj.loadManifests();

			// If plugin is currently enabled, disable and re-enable it cleanly
			if (pluginsObj.enabledPlugins?.has(pluginId)) {
				await pluginsObj.disablePlugin(pluginId);
				await pluginsObj.enablePlugin(pluginId);
			} else {
				await pluginsObj.enablePlugin(pluginId);
			}
		} catch (e) {
			console.warn(`Could not hot-reload plugin ${pluginId}:`, e);
		}
	}

	/**
	 * Compare semver strings (returns true if latest is strictly newer than current)
	 */
	static isNewerVersion(current: string, latest: string): boolean {
		const cleanCurrent = current.replace(/^[vV]/, '').trim();
		const cleanLatest = latest.replace(/^[vV]/, '').trim();

		if (cleanCurrent === cleanLatest) return false;

		const cParts = cleanCurrent.split('.').map(n => parseInt(n, 10) || 0);
		const lParts = cleanLatest.split('.').map(n => parseInt(n, 10) || 0);

		for (let i = 0; i < Math.max(cParts.length, lParts.length); i++) {
			const c = cParts[i] || 0;
			const l = lParts[i] || 0;
			if (l > c) return true;
			if (l < c) return false;
		}
		return false;
	}
}
