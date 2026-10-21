import { requestUrl, RequestUrlParam } from 'obsidian';

export interface GitHubAsset {
	name: string;
	browser_download_url: string;
	size: number;
}

export interface GitHubRelease {
	tag_name: string;
	name: string;
	draft: boolean;
	prerelease: boolean;
	published_at: string;
	body: string;
	assets: GitHubAsset[];
}

export interface ManifestData {
	id: string;
	name: string;
	version: string;
	minAppVersion: string;
	description: string;
	author?: string;
	isDesktopOnly?: boolean;
}

export class GitHubClient {
	private token?: string;

	constructor(token?: string) {
		this.token = token?.trim();
	}

	setToken(token?: string) {
		this.token = token?.trim();
	}

	private getHeaders(): Record<string, string> {
		const headers: Record<string, string> = {
			'Accept': 'application/vnd.github.v3+json',
			'User-Agent': 'Obsidian-AVM-Nexus',
		};
		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}
		return headers;
	}

	/**
	 * Parse repo string (handles "owner/repo", "https://github.com/owner/repo", etc.)
	 */
	static parseRepoUrl(input: string): { owner: string; repo: string } | null {
		const trimmed = input.trim().replace(/\/+$/, '');
		// Handle https://github.com/owner/repo or git@github.com:owner/repo
		const urlMatch = trimmed.match(/github\.com[/:]([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(\.git)?$/);
		if (urlMatch) {
			return { owner: urlMatch[1], repo: urlMatch[2] };
		}
		// Handle direct owner/repo
		const simpleMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
		if (simpleMatch) {
			return { owner: simpleMatch[1], repo: simpleMatch[2] };
		}
		return null;
	}

	/**
	 * Fetch the latest release metadata for a repository
	 */
	async getLatestRelease(owner: string, repo: string): Promise<GitHubRelease | null> {
		const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
		try {
			const req: RequestUrlParam = {
				url,
				headers: this.getHeaders(),
			};
			const res = await requestUrl(req);
			if (res.status === 200) {
				return res.json as GitHubRelease;
			}
			return null;
		} catch (e) {
			// Fallback: Check if releases list has entries even if latest is draft or tag-only
			try {
				const fallbackReq: RequestUrlParam = {
					url: `https://api.github.com/repos/${owner}/${repo}/releases?per_page=1`,
					headers: this.getHeaders(),
				};
				const fallbackRes = await requestUrl(fallbackReq);
				if (fallbackRes.status === 200 && Array.isArray(fallbackRes.json) && fallbackRes.json.length > 0) {
					return fallbackRes.json[0] as GitHubRelease;
				}
			} catch (_) {
				// Ignore fallback error
			}
			return null;
		}
	}

	/**
	 * Download raw text file content from URL
	 */
	async downloadText(url: string): Promise<string> {
		const req: RequestUrlParam = {
			url,
			headers: this.getHeaders(),
		};
		const res = await requestUrl(req);
		return res.text;
	}

	/**
	 * Download binary/text file as ArrayBuffer
	 */
	async downloadBuffer(url: string): Promise<ArrayBuffer> {
		const req: RequestUrlParam = {
			url,
			headers: this.getHeaders(),
		};
		const res = await requestUrl(req);
		return res.arrayBuffer;
	}

	/**
	 * Inspect release assets to ensure plugin files exist
	 */
	findPluginAssets(release: GitHubRelease): {
		manifestAsset?: GitHubAsset;
		mainAsset?: GitHubAsset;
		stylesAsset?: GitHubAsset;
	} {
		let manifestAsset: GitHubAsset | undefined;
		let mainAsset: GitHubAsset | undefined;
		let stylesAsset: GitHubAsset | undefined;

		for (const asset of release.assets) {
			if (asset.name === 'manifest.json') manifestAsset = asset;
			else if (asset.name === 'main.js') mainAsset = asset;
			else if (asset.name === 'styles.css') stylesAsset = asset;
		}

		return { manifestAsset, mainAsset, stylesAsset };
	}
}
