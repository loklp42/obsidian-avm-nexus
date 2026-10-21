import { App, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import { Language, TRANSLATIONS } from './i18n';
import { GitHubClient } from './github';
import { PluginManager, ECOSYSTEM_PLUGINS, InstalledPluginInfo } from './manager';
import { AddRepoModal } from './add-modal';
import { renderHeroBanner, renderDonateBanner, createSectionHeading, AVM_ICONS } from './ui-components';

export interface NexusSettings {
	language: Language;
	githubToken: string;
	autoUpdate: boolean;
	allowPrereleases: boolean;
	lastGlobalCheck: number;
	trackedPlugins: Record<string, InstalledPluginInfo>;
}

const DEFAULT_SETTINGS: NexusSettings = {
	language: 'ru',
	githubToken: '',
	autoUpdate: true,
	allowPrereleases: false,
	lastGlobalCheck: 0,
	trackedPlugins: {
		'obsidian-avm-file-extensions': {
			id: 'obsidian-avm-file-extensions',
			name: 'AVM File Extensions',
			version: '1.0.0',
			repo: 'loklp42/obsidian-avm-file-extensions',
		},
		'obsidian-avm-folder-notes': {
			id: 'obsidian-avm-folder-notes',
			name: 'AVM Folder Notes',
			version: '1.0.0',
			repo: 'loklp42/obsidian-avm-folder-notes',
		}
	}
};

export default class AvmNexusPlugin extends Plugin {
	settings!: NexusSettings;
	githubClient!: GitHubClient;
	manager!: PluginManager;

	async onload() {
		await this.loadSettings();

		this.githubClient = new GitHubClient(this.settings.githubToken);
		this.manager = new PluginManager(this.app, this.githubClient);

		this.addSettingTab(new AvmNexusSettingTab(this.app, this));

		this.addCommand({
			id: 'nexus-check-updates',
			name: 'Check for plugin updates',
			callback: async () => {
				await this.checkAllUpdates(true);
			}
		});

		this.addCommand({
			id: 'nexus-open-hub',
			name: 'Open Nexus Hub',
			callback: () => {
				(this.app as any).setting.open();
				(this.app as any).setting.openTabById(this.manifest.id);
			}
		});

		if (this.settings.autoUpdate) {
			window.setTimeout(() => {
				this.checkAllUpdates(false);
			}, 3500);
		}
	}

	async loadSettings() {
		const data = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
		if (!this.settings.trackedPlugins) {
			this.settings.trackedPlugins = Object.assign({}, DEFAULT_SETTINGS.trackedPlugins);
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
		if (this.githubClient) {
			this.githubClient.setToken(this.settings.githubToken);
		}
	}

	async checkAllUpdates(showNotice = false): Promise<number> {
		const t = TRANSLATIONS[this.settings.language] || TRANSLATIONS.ru;
		if (showNotice) new Notice(t.noticeCheckingStart);

		let updatesCount = 0;
		const plugins = Object.values(this.settings.trackedPlugins);

		for (const p of plugins) {
			const parsed = GitHubClient.parseRepoUrl(p.repo);
			if (!parsed) continue;

			try {
				const release = await this.githubClient.getLatestRelease(parsed.owner, parsed.repo);
				if (release) {
					p.latestVersion = release.tag_name;
					p.lastChecked = Date.now();

					const localManifest = await this.manager.getLocalManifest(p.id);
					const currentVer = localManifest ? localManifest.version : p.version;
					p.version = currentVer;

					if (PluginManager.isNewerVersion(currentVer, release.tag_name)) {
						p.hasUpdate = true;
						updatesCount++;
					} else {
						p.hasUpdate = false;
					}
				}
			} catch (e) {
				console.warn(`Nexus check failed for ${p.id}:`, e);
			}
		}

		this.settings.lastGlobalCheck = Date.now();
		await this.saveSettings();

		if (showNotice) {
			if (updatesCount > 0) {
				new Notice(`${t.noticeUpdatesFound} ${updatesCount}`);
			} else {
				new Notice(t.noticeNoUpdates);
			}
		}

		return updatesCount;
	}
}

class AvmNexusSettingTab extends PluginSettingTab {
	plugin: AvmNexusPlugin;
	private activeTab: 'featured' | 'installed' | 'settings' = 'featured';

	constructor(app: App, plugin: AvmNexusPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass('avm-nexus-container');

		const lang = this.plugin.settings.language || 'ru';
		const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;

		// ── Hero Banner ────────────────────────────────────
		renderHeroBanner(containerEl, {
			title: t.headerTitle,
			badge: 'Ecosystem Hub',
			desc: t.headerDesc,
			iconSvg: AVM_ICONS.nexus
		});

		// ── Actions & Subnavigation Bar ────────────────────
		const navBar = containerEl.createDiv({ cls: 'avm-nexus-navbar' });

		const tabsWrap = navBar.createDiv({ cls: 'avm-nexus-tabs' });
		const tabItems = [
			{ id: 'featured', label: t.tabFeatured },
			{ id: 'installed', label: t.tabInstalled },
			{ id: 'settings', label: t.tabSettings },
		] as const;

		for (const item of tabItems) {
			const tabBtn = tabsWrap.createEl('button', {
				cls: `avm-nexus-tab ${this.activeTab === item.id ? 'is-active' : ''}`,
				text: item.label
			});
			tabBtn.onclick = () => {
				this.activeTab = item.id;
				this.display();
			};
		}

		const rightControls = navBar.createDiv({ cls: 'avm-nexus-nav-right' });

		// Language selector
		const langSelect = rightControls.createEl('select', { cls: 'avm-lang-select dropdown' });
		langSelect.createEl('option', { value: 'ru', text: 'Русский' });
		langSelect.createEl('option', { value: 'en', text: 'English' });
		langSelect.value = lang;
		langSelect.onchange = async () => {
			this.plugin.settings.language = langSelect.value as Language;
			await this.plugin.saveSettings();
			this.display();
		};

		// ── Render Views ───────────────────────────────────
		if (this.activeTab === 'featured') {
			this.renderFeaturedView(containerEl, t);
		} else if (this.activeTab === 'installed') {
			this.renderInstalledView(containerEl, t);
		} else {
			this.renderSettingsView(containerEl, t);
		}

		// ── Financial Support Section ──────────────────────
		this.renderDonateSection(containerEl, t);
	}

	private renderFeaturedView(containerEl: HTMLElement, t: any) {
		const topRow = containerEl.createDiv({ cls: 'avm-nexus-actions-row' });
		const addBtn = topRow.createEl('button', {
			cls: 'avm-nexus-btn avm-nexus-btn--cta',
			text: `+ ${t.btnAddRepo}`
		});
		addBtn.onclick = () => {
			new AddRepoModal(this.app, this.plugin.githubClient, this.plugin.manager, t, () => {
				this.display();
			}).open();
		};

		const checkBtn = topRow.createEl('button', {
			cls: 'avm-nexus-btn',
			text: t.btnCheckUpdates
		});
		checkBtn.onclick = async () => {
			checkBtn.disabled = true;
			await this.plugin.checkAllUpdates(true);
			checkBtn.disabled = false;
			this.display();
		};

		const cardsWrap = containerEl.createDiv({ cls: 'avm-nexus-cards-grid' });

		for (const item of ECOSYSTEM_PLUGINS) {
			const card = cardsWrap.createDiv({ cls: 'avm-nexus-card' });
			const cardHead = card.createDiv({ cls: 'avm-nexus-card-header' });

			const titleBox = cardHead.createDiv({ cls: 'avm-nexus-card-titlebox' });
			titleBox.createDiv({ text: item.name, cls: 'avm-nexus-card-title' });
			titleBox.createSpan({ text: item.category, cls: 'avm-nexus-card-badge' });

			const isRu = this.plugin.settings.language === 'ru';
			card.createEl('p', {
				text: isRu ? item.taglineRu : item.taglineEn,
				cls: 'avm-nexus-card-tagline'
			});

			const footer = card.createDiv({ cls: 'avm-nexus-card-footer' });
			const statusLabel = footer.createSpan({ cls: 'avm-nexus-card-status' });
			const actionBtn = footer.createEl('button', { cls: 'avm-nexus-btn' });

			this.updateCardState(item, statusLabel, actionBtn, t);
		}
	}

	private async updateCardState(item: any, statusLabel: HTMLElement, actionBtn: HTMLButtonElement, t: any) {
		const isInstalled = await this.plugin.manager.isPluginInstalled(item.id);
		const tracked = this.plugin.settings.trackedPlugins[item.id];

		if (!isInstalled) {
			statusLabel.textContent = t.statusNotInstalled;
			statusLabel.addClass('is-muted');
			actionBtn.textContent = t.btnInstall;
			actionBtn.addClass('avm-nexus-btn--cta');
			actionBtn.onclick = async () => {
				actionBtn.disabled = true;
				actionBtn.textContent = t.statusInstalling;
				const parsed = GitHubClient.parseRepoUrl(item.repo);
				if (parsed) {
					const release = await this.plugin.githubClient.getLatestRelease(parsed.owner, parsed.repo);
					if (release) {
						await this.plugin.manager.installFromRelease(parsed.owner, parsed.repo, release);
						this.plugin.settings.trackedPlugins[item.id] = {
							id: item.id,
							name: item.name,
							version: release.tag_name,
							repo: item.repo,
							latestVersion: release.tag_name,
							hasUpdate: false
						};
						await this.plugin.saveSettings();
						new Notice(`${t.noticeInstalledSuccess} ${item.name}`);
					}
				}
				this.display();
			};
		} else {
			const manifest = await this.plugin.manager.getLocalManifest(item.id);
			const currentVersion = manifest ? manifest.version : (tracked?.version || '1.0.0');
			const latestVersion = tracked?.latestVersion;

			if (latestVersion && PluginManager.isNewerVersion(currentVersion, latestVersion)) {
				statusLabel.textContent = `${t.statusUpdateAvailable} (${currentVersion} → ${latestVersion})`;
				statusLabel.addClass('is-warning');
				actionBtn.textContent = t.btnUpdate;
				actionBtn.addClass('avm-nexus-btn--cta');
				actionBtn.onclick = async () => {
					actionBtn.disabled = true;
					actionBtn.textContent = t.statusUpdating;
					const parsed = GitHubClient.parseRepoUrl(item.repo);
					if (parsed) {
						const release = await this.plugin.githubClient.getLatestRelease(parsed.owner, parsed.repo);
						if (release) {
							await this.plugin.manager.installFromRelease(parsed.owner, parsed.repo, release);
							if (tracked) {
								tracked.version = release.tag_name;
								tracked.hasUpdate = false;
							}
							await this.plugin.saveSettings();
							new Notice(`${t.noticeUpdatedSuccess} ${release.tag_name}`);
						}
					}
					this.display();
				};
			} else {
				statusLabel.textContent = `${t.statusUpToDate} (v${currentVersion})`;
				statusLabel.addClass('is-success');
				actionBtn.textContent = t.btnInstalled;
				actionBtn.disabled = true;
			}
		}
	}

	private renderInstalledView(containerEl: HTMLElement, t: any) {
		const topRow = containerEl.createDiv({ cls: 'avm-nexus-actions-row' });
		const addBtn = topRow.createEl('button', {
			cls: 'avm-nexus-btn avm-nexus-btn--cta',
			text: `+ ${t.btnAddRepo}`
		});
		addBtn.onclick = () => {
			new AddRepoModal(this.app, this.plugin.githubClient, this.plugin.manager, t, () => {
				this.display();
			}).open();
		};

		const checkBtn = topRow.createEl('button', {
			cls: 'avm-nexus-btn',
			text: t.btnCheckUpdates
		});
		checkBtn.onclick = async () => {
			checkBtn.disabled = true;
			await this.plugin.checkAllUpdates(true);
			checkBtn.disabled = false;
			this.display();
		};

		const list = containerEl.createDiv({ cls: 'avm-nexus-list' });
		const plugins = Object.values(this.plugin.settings.trackedPlugins);

		if (plugins.length === 0) {
			list.createEl('p', { text: 'Нет добавленных плагинов.', cls: 'avm-nexus-empty-hint' });
			return;
		}

		for (const p of plugins) {
			const item = list.createDiv({ cls: 'avm-nexus-list-item' });
			const info = item.createDiv({ cls: 'avm-nexus-item-info' });

			const titleRow = info.createDiv({ cls: 'avm-nexus-item-title-row' });
			titleRow.createEl('strong', { text: p.name, cls: 'avm-nexus-item-name' });
			titleRow.createSpan({ text: `v${p.version}`, cls: 'avm-nexus-version-pill' });
			if (p.hasUpdate && p.latestVersion) {
				titleRow.createSpan({
					text: `Update: v${p.latestVersion}`,
					cls: 'avm-nexus-version-pill is-update'
				});
			}

			info.createEl('a', {
				text: `https://github.com/${p.repo}`,
				href: `https://github.com/${p.repo}`,
				cls: 'avm-nexus-item-repo'
			});

			const itemActions = item.createDiv({ cls: 'avm-nexus-item-actions' });

			if (p.hasUpdate && p.latestVersion) {
				const updateBtn = itemActions.createEl('button', {
					cls: 'avm-nexus-btn avm-nexus-btn--cta',
					text: t.btnUpdate
				});
				updateBtn.onclick = async () => {
					updateBtn.disabled = true;
					updateBtn.textContent = t.statusUpdating;
					const parsed = GitHubClient.parseRepoUrl(p.repo);
					if (parsed) {
						const rel = await this.plugin.githubClient.getLatestRelease(parsed.owner, parsed.repo);
						if (rel) {
							await this.plugin.manager.installFromRelease(parsed.owner, parsed.repo, rel);
							p.version = rel.tag_name;
							p.hasUpdate = false;
							await this.plugin.saveSettings();
							new Notice(`${t.noticeUpdatedSuccess} ${rel.tag_name}`);
						}
					}
					this.display();
				};
			}

			const removeBtn = itemActions.createEl('button', {
				cls: 'avm-nexus-btn mod-warning',
				text: t.btnRemove
			});
			removeBtn.onclick = async () => {
				delete this.plugin.settings.trackedPlugins[p.id];
				await this.plugin.saveSettings();
				new Notice(t.noticeRemovedSuccess);
				this.display();
			};
		}
	}

	private renderSettingsView(containerEl: HTMLElement, t: any) {
		// ── Section 1: GitHub Authentication ──────────────
		createSectionHeading(containerEl, t.headingAuth, AVM_ICONS.key);

		new Setting(containerEl)
			.setName(t.settingsTokenTitle)
			.setDesc(t.settingsTokenDesc)
			.addText(text => {
				text.setPlaceholder(t.settingsTokenPlaceholder);
				text.setValue(this.plugin.settings.githubToken);
				text.inputEl.type = 'password';
				text.inputEl.style.width = '240px';
				text.onChange(async val => {
					this.plugin.settings.githubToken = val.trim();
					await this.plugin.saveSettings();
				});
			});

		// Collapsible guide for creating a GitHub token (collapsed by default)
		const details = containerEl.createEl('details', { cls: 'avm-nexus-guide-details' });
		const summary = details.createEl('summary', { cls: 'avm-nexus-guide-summary' });
		summary.createSpan({ text: t.settingsGuideSummary, cls: 'avm-nexus-summary-text' });

		const guideBody = details.createDiv({ cls: 'avm-nexus-guide-body' });
		const guideTop = guideBody.createDiv({ cls: 'avm-nexus-guide-top' });

		const guideBtn = guideTop.createEl('a', {
			cls: 'avm-nexus-btn avm-nexus-btn--small avm-nexus-btn--cta',
			text: t.settingsGuideBtn,
			href: 'https://github.com/settings/tokens/new'
		});
		guideBtn.setAttribute('target', '_blank');

		const guideSteps = guideBody.createEl('ol', { cls: 'avm-nexus-guide-steps' });
		guideSteps.createEl('li', { text: t.settingsGuideStep1 });
		guideSteps.createEl('li', { text: t.settingsGuideStep2 });
		guideSteps.createEl('li', { text: t.settingsGuideStep3 });
		guideSteps.createEl('li', { text: t.settingsGuideStep4 });

		// ── Section 2: Updates & Releases ─────────────────
		createSectionHeading(containerEl, t.headingUpdates, AVM_ICONS.refresh);

		new Setting(containerEl)
			.setName(t.settingsAutoUpdateTitle)
			.setDesc(t.settingsAutoUpdateDesc)
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.autoUpdate);
				toggle.onChange(async val => {
					this.plugin.settings.autoUpdate = val;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName(t.settingsPrereleaseTitle)
			.setDesc(t.settingsPrereleaseDesc)
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.allowPrereleases);
				toggle.onChange(async val => {
					this.plugin.settings.allowPrereleases = val;
					await this.plugin.saveSettings();
				});
			});
	}

	private renderDonateSection(containerEl: HTMLElement, t: any) {
		renderDonateBanner(containerEl, t);
	}
}
