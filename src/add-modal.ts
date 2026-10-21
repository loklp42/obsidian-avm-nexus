import { App, Modal, Setting, Notice } from 'obsidian';
import { GitHubClient } from './github';
import { PluginManager } from './manager';
import { TranslationDict } from './i18n';

export class AddRepoModal extends Modal {
	private client: GitHubClient;
	private manager: PluginManager;
	private t: TranslationDict;
	private onInstalled: () => void;

	constructor(app: App, client: GitHubClient, manager: PluginManager, t: TranslationDict, onInstalled: () => void) {
		super(app);
		this.client = client;
		this.manager = manager;
		this.t = t;
		this.onInstalled = onInstalled;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('avm-nexus-modal');

		const head = contentEl.createDiv({ cls: 'avm-nexus-modal-header' });
		head.createEl('h2', { text: this.t.modalAddTitle, cls: 'avm-nexus-modal-title' });
		head.createEl('p', { text: this.t.modalAddDesc, cls: 'avm-nexus-modal-desc' });

		let repoInput = '';
		const statusEl = contentEl.createDiv({ cls: 'avm-nexus-modal-status' });

		new Setting(contentEl)
			.setName('GitHub Repository')
			.setDesc(this.t.modalRepoHelp)
			.addText(text => {
				text.setPlaceholder(this.t.modalRepoPlaceholder);
				text.inputEl.addClass('avm-nexus-input-full');
				text.onChange(value => {
					repoInput = value;
				});
				text.inputEl.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						fetchAndInstall();
					}
				});
			});

		const actionsRow = contentEl.createDiv({ cls: 'avm-nexus-modal-actions' });
		const installBtn = actionsRow.createEl('button', {
			cls: 'avm-nexus-btn avm-nexus-btn--cta',
			text: this.t.modalBtnFetch
		});
		const cancelBtn = actionsRow.createEl('button', {
			cls: 'avm-nexus-btn',
			text: this.t.btnCancel
		});

		cancelBtn.onclick = () => this.close();

		const fetchAndInstall = async () => {
			const parsed = GitHubClient.parseRepoUrl(repoInput);
			if (!parsed) {
				statusEl.textContent = 'Укажите корректный адрес репозитория (например: owner/repo)';
				statusEl.addClass('is-error');
				return;
			}

			statusEl.removeClass('is-error');
			statusEl.textContent = `${this.t.statusChecking} ${parsed.owner}/${parsed.repo}`;
			installBtn.disabled = true;

			try {
				const release = await this.client.getLatestRelease(parsed.owner, parsed.repo);
				if (!release) {
					statusEl.textContent = this.t.modalNotFound;
					statusEl.addClass('is-error');
					installBtn.disabled = false;
					return;
				}

				statusEl.textContent = `${this.t.statusInstalling} (${release.tag_name})...`;
				const result = await this.manager.installFromRelease(parsed.owner, parsed.repo, release);

				if (!result.success || !result.manifest) {
					statusEl.textContent = `Ошибка: ${result.error || 'Не удалось установить'}`;
					statusEl.addClass('is-error');
					installBtn.disabled = false;
					return;
				}

				new Notice(`${this.t.noticeInstalledSuccess} ${result.manifest.name} (${result.manifest.version})`);
				this.onInstalled();
				this.close();
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : String(err);
				statusEl.textContent = `Ошибка: ${msg}`;
				statusEl.addClass('is-error');
				installBtn.disabled = false;
			}
		};

		installBtn.onclick = fetchAndInstall;
	}

	onClose() {
		this.contentEl.empty();
	}
}
