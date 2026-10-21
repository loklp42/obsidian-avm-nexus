export type Language = 'ru' | 'en';

export interface TranslationDict {
	// Header & navigation
	headerTitle: string;
	headerDesc: string;
	langLabel: string;
	tabFeatured: string;
	tabInstalled: string;
	tabSettings: string;

	// Actions
	btnAddRepo: string;
	btnCheckUpdates: string;
	btnUpdateAll: string;
	btnInstall: string;
	btnUpdate: string;
	btnInstalled: string;
	btnRemove: string;
	btnOpening: string;
	btnSave: string;
	btnCancel: string;

	// Statuses
	statusUpToDate: string;
	statusUpdateAvailable: string;
	statusNotInstalled: string;
	statusChecking: string;
	statusInstalling: string;
	statusUpdating: string;
	statusFailed: string;

	// Add Modal
	modalAddTitle: string;
	modalAddDesc: string;
	modalRepoPlaceholder: string;
	modalRepoHelp: string;
	modalBtnFetch: string;
	modalFoundPlugin: string;
	modalNotFound: string;

	// Settings Headings
	headingAuth: string;
	headingUpdates: string;
	headingDonate: string;

	// Settings Items
	settingsTokenTitle: string;
	settingsTokenDesc: string;
	settingsTokenPlaceholder: string;
	settingsGuideSummary: string;
	settingsGuideStep1: string;
	settingsGuideStep2: string;
	settingsGuideStep3: string;
	settingsGuideStep4: string;
	settingsGuideBtn: string;

	settingsAutoUpdateTitle: string;
	settingsAutoUpdateDesc: string;
	settingsPrereleaseTitle: string;
	settingsPrereleaseDesc: string;

	// Donate section
	donateTitle: string;
	donateDesc: string;
	donateBtn: string;

	// Notices
	noticeCheckingStart: string;
	noticeNoUpdates: string;
	noticeUpdatesFound: string;
	noticeInstalledSuccess: string;
	noticeUpdatedSuccess: string;
	noticeRemovedSuccess: string;
	noticeError: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
	ru: {
		headerTitle: 'AVM Nexus',
		headerDesc: 'Центральный узел загрузки, мгновенной установки плагинов с GitHub и управления экосистемой Ave Maria.',
		langLabel: 'Язык интерфейса',
		tabFeatured: 'Экосистема AVM',
		tabInstalled: 'Установленные плагины',
		tabSettings: 'Параметры GitHub',

		btnAddRepo: 'Добавить репозиторий',
		btnCheckUpdates: 'Проверить обновления',
		btnUpdateAll: 'Обновить всё',
		btnInstall: 'Установить',
		btnUpdate: 'Обновить',
		btnInstalled: 'Установлен',
		btnRemove: 'Удалить',
		btnOpening: 'Открытие...',
		btnSave: 'Сохранить',
		btnCancel: 'Отмена',

		statusUpToDate: 'Актуальная версия',
		statusUpdateAvailable: 'Доступно обновление',
		statusNotInstalled: 'Не установлен',
		statusChecking: 'Проверка...',
		statusInstalling: 'Установка...',
		statusUpdating: 'Обновление...',
		statusFailed: 'Ошибка',

		modalAddTitle: 'Установка плагина с GitHub',
		modalAddDesc: 'Укажите репозиторий в формате «владелец/репозиторий» или вставьте прямую ссылку на GitHub.',
		modalRepoPlaceholder: 'например: owner/repo или https://github.com/...',
		modalRepoHelp: 'Репозиторий должен содержать релизы с файлами main.js, manifest.json и styles.css (если применимо).',
		modalBtnFetch: 'Найти и установить',
		modalFoundPlugin: 'Плагин найден:',
		modalNotFound: 'Релиз не найден или в репозитории отсутствуют файлы плагина.',

		headingAuth: 'Аутентификация GitHub',
		headingUpdates: 'Обновления и релизы',
		headingDonate: 'Поддержка проекта',

		settingsTokenTitle: 'Персональный токен GitHub (PAT)',
		settingsTokenDesc: 'Позволяет устанавливать плагины из закрытых (private) репозиториев и повышает лимит API с 60 до 5 000 запросов в час.',
		settingsTokenPlaceholder: 'ghp_************************************',
		settingsGuideSummary: 'Как получить токен GitHub (пошаговый гайд)',
		settingsGuideStep1: 'Перейдите на GitHub в раздел Settings → Developer settings → Personal access tokens → Tokens (classic).',
		settingsGuideStep2: 'Нажмите «Generate new token (classic)» и введите название заметки (например: Obsidian Nexus).',
		settingsGuideStep3: 'Укажите срок действия и отметьте галочку «repo» (только если планируете скачивать приватные плагины).',
		settingsGuideStep4: 'Нажмите «Generate token» внизу страницы, скопируйте ключ (начинается на ghp_) и вставьте в поле выше.',
		settingsGuideBtn: 'Открыть страницу создания токена',

		settingsAutoUpdateTitle: 'Автоматическое обновление плагинов',
		settingsAutoUpdateDesc: 'Проверять обновления при старте Obsidian и в фоновом режиме, выводя уведомления о новых релизах.',
		settingsPrereleaseTitle: 'Разрешить бета-версии (Pre-releases)',
		settingsPrereleaseDesc: 'Отслеживать и скачивать тестовые пре-релизы авторов, помеченные как Pre-release на GitHub.',

		donateTitle: 'Поддержать разработку экосистемы Ave Maria',
		donateDesc: 'Если вам нравятся наши плагины и вы хотите поддержать развитие открытых инструментов для Obsidian — вы можете отправить донат автору.',
		donateBtn: 'Поддержать через DonationAlerts',

		noticeCheckingStart: 'Nexus: проверка обновлений на GitHub...',
		noticeNoUpdates: 'Nexus: все плагины актуальны.',
		noticeUpdatesFound: 'Nexus: найдено обновлений:',
		noticeInstalledSuccess: 'Nexus: плагин успешно установлен и включен:',
		noticeUpdatedSuccess: 'Nexus: плагин обновлен до версии',
		noticeRemovedSuccess: 'Nexus: плагин удален из списка отслеживания.',
		noticeError: 'Nexus: произошла ошибка при обращении к GitHub.',
	},
	en: {
		headerTitle: 'AVM Nexus',
		headerDesc: 'Central hub for high-speed GitHub plugin installation, automated updates, and Ave Maria ecosystem management.',
		langLabel: 'Interface Language',
		tabFeatured: 'AVM Ecosystem',
		tabInstalled: 'Installed Plugins',
		tabSettings: 'GitHub Settings',

		btnAddRepo: 'Add repository',
		btnCheckUpdates: 'Check for updates',
		btnUpdateAll: 'Update all',
		btnInstall: 'Install',
		btnUpdate: 'Update',
		btnInstalled: 'Installed',
		btnRemove: 'Remove',
		btnOpening: 'Opening...',
		btnSave: 'Save',
		btnCancel: 'Cancel',

		statusUpToDate: 'Up to date',
		statusUpdateAvailable: 'Update available',
		statusNotInstalled: 'Not installed',
		statusChecking: 'Checking...',
		statusInstalling: 'Installing...',
		statusUpdating: 'Updating...',
		statusFailed: 'Error',

		modalAddTitle: 'Install Plugin from GitHub',
		modalAddDesc: 'Provide repository in "owner/repo" format or paste full GitHub URL.',
		modalRepoPlaceholder: 'e.g. owner/repo or https://github.com/...',
		modalRepoHelp: 'The repository must contain a release with main.js, manifest.json, and styles.css (if applicable).',
		modalBtnFetch: 'Fetch & install',
		modalFoundPlugin: 'Plugin detected:',
		modalNotFound: 'Release not found or plugin release assets are missing.',

		headingAuth: 'GitHub Authentication',
		headingUpdates: 'Updates & Releases',
		headingDonate: 'Support the Project',

		settingsTokenTitle: 'GitHub Personal Access Token (PAT)',
		settingsTokenDesc: 'Allows installing from private repositories and increases GitHub API rate limit from 60 to 5,000 requests/hour.',
		settingsTokenPlaceholder: 'ghp_************************************',
		settingsGuideSummary: 'How to get a GitHub token (step-by-step guide)',
		settingsGuideStep1: 'Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic).',
		settingsGuideStep2: 'Click "Generate new token (classic)" and enter a note description (e.g., Obsidian Nexus).',
		settingsGuideStep3: 'Choose expiration and check the "repo" scope (only needed if downloading private plugins).',
		settingsGuideStep4: 'Click "Generate token" at the bottom, copy the key (starts with ghp_), and paste it in the field above.',
		settingsGuideBtn: 'Open token creation page',

		settingsAutoUpdateTitle: 'Automatic plugin updates',
		settingsAutoUpdateDesc: 'Check for updates on Obsidian startup and periodically in background, displaying notifications when releases are found.',
		settingsPrereleaseTitle: 'Include pre-releases (Beta versions)',
		settingsPrereleaseDesc: 'Track and install pre-releases marked as Pre-release on GitHub.',

		donateTitle: 'Support Ave Maria Ecosystem Development',
		donateDesc: 'If you enjoy our plugins and want to support the development of modern open-source Obsidian tools, consider sending a donation.',
		donateBtn: 'Support via DonationAlerts',

		noticeCheckingStart: 'Nexus: checking updates on GitHub...',
		noticeNoUpdates: 'Nexus: all plugins are up to date.',
		noticeUpdatesFound: 'Nexus: updates available:',
		noticeInstalledSuccess: 'Nexus: plugin installed and activated:',
		noticeUpdatedSuccess: 'Nexus: plugin updated to version',
		noticeRemovedSuccess: 'Nexus: plugin removed from tracking.',
		noticeError: 'Nexus: an error occurred contacting GitHub.',
	}
};
