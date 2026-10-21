# AVM Nexus

> Быстрый установщик плагинов с GitHub, менеджер автообновлений и центральный лаунчер экосистемы Ave Maria для Obsidian.

---

## Возможности

- **Витрина экосистемы Ave Maria:** Установка и обновление флагманских плагинов экосистемы (*AVM File Extensions*, *AVM Folder Notes*) в один клик.
- **Универсальная установка с GitHub:** Загрузка и активация любых сторонних плагинов по ссылке или формату `owner/repo` без перезагрузки Obsidian.
- **Диспетчер обновлений:** Проверка свежих релизов в фоне, тихий чекер при старте и пакетное обновление всех установленных бета-плагинов.
- **Поддержка GitHub PAT:** Авторизация через персональный токен для работы с приватными репозиториями и обхода лимитов GitHub API.
- **Строгий дизайн Ave Maria:** Чистый интерфейс без эмодзи, нативные скругления 8px/6px, золотистые статусы и двуязычная локализация (Русский / English).

---

## Установка

### Вариант 1. Через плагин BRAT (Рекомендуется)
1. Установите плагин **BRAT** (Beta Reviewers Auto-update Tester) из каталога сторонних плагинов Obsidian.
2. Откройте **Настройки → BRAT → Add Beta plugin**.
3. Вставьте ссылку на репозиторий:
   ```text
   https://github.com/loklp42/obsidian-avm-nexus
   ```
4. Нажмите **Add Plugin** — BRAT автоматически загрузит и установит актуальную версию.

### Вариант 2. Вручную
1. Скачайте файлы `main.js`, `manifest.json`, `styles.css` из последнего релиза.
2. Поместите их в папку вашего хранилища:
   ```text
   <Vault>/.obsidian/plugins/obsidian-avm-nexus/
   ```
3. Перезагрузите Obsidian (`Ctrl + P` → *Reload app without saving*).
4. Включите плагин в разделе **Настройки → Сторонние плагины**.

---

## Сборка

```bash
npm install
npm run build
```

---

## Лицензия

[MIT](LICENSE)

---

# AVM Nexus (English)

> High-speed GitHub plugin installer, update nexus, and ecosystem launcher for Obsidian.

---

## Features

- **Ave Maria Ecosystem Hub:** One-click install and update for flagship ecosystem plugins (*AVM File Extensions*, *AVM Folder Notes*).
- **Universal GitHub Installation:** Download and activate any community plugin via full URL or `owner/repo` syntax without restarting Obsidian.
- **Update Engine:** Background release verification, silent startup checks, and one-click batch updates for tracked plugins.
- **GitHub PAT Support:** Personal Access Token authentication for private repositories and higher GitHub API rate limits.
- **Ave Maria Design Standards:** Clean emoji-free UI, native 8px/6px border radiuses, gold accents, and bilingual localization (Russian / English).

---

## Installation

### Option 1. Via BRAT (Recommended)
1. Install the **BRAT** (Beta Reviewers Auto-update Tester) plugin from Obsidian's Community Plugins.
2. Open **Settings → BRAT → Add Beta plugin**.
3. Paste the repository link:
   ```text
   https://github.com/loklp42/obsidian-avm-nexus
   ```
4. Click **Add Plugin** — BRAT will automatically download and install the latest release.

### Option 2. Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release.
2. Place them into your vault folder:
   ```text
   <Vault>/.obsidian/plugins/obsidian-avm-nexus/
   ```
3. Reload Obsidian (`Ctrl + P` → *Reload app without saving*).
4. Enable the plugin under **Settings → Community plugins**.

---

## Build

```bash
npm install
npm run build
```

---

## License

[MIT](LICENSE)
