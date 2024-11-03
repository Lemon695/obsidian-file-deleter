import {App, Notice, Plugin, PluginSettingTab, Setting, TAbstractFile} from 'obsidian';

interface DeleteFileSettings {
	deleteFileSetting: string;
	// 新增设置项：是否显示删除通知
	showDeleteNotification: boolean;
}

const DEFAULT_SETTINGS: DeleteFileSettings = {
	deleteFileSetting: 'default',
	showDeleteNotification: true
}

export default class DeleteFilePlugin extends Plugin {
	settings: DeleteFileSettings;

	async onload() {
		await this.loadSettings();

		// 注册文件删除事件监听器
		this.registerEvent(
			this.app.vault.on('delete', (file: TAbstractFile) => {
				if (this.settings.showDeleteNotification) {
					// 当文件被删除时显示自定义通知
					new Notice(`File deleted: ${file.path}`);
				}

				// 在控制台记录删除操作
				console.log(`File deleted: ${file.path} at ${new Date().toLocaleString()}`);
			})
		);

		// 新增删除当前文件的命令
		this.addCommand({
			id: 'delete-current-file',
			name: 'Delete Current File',
			callback: async () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) {
					new Notice('No active file to delete.');
					return;
				}

				try {
					// 使用 Obsidian 的文件管理器删除文件
					await this.app.vault.delete(activeFile);
				} catch (err) {
					console.error(err);
					new Notice('Failed to delete the file.');
				}
			}
		});

		// 新增删除当前文件,移入回收站的命令
		this.addCommand({
			id: 'move-current-file-to-trash',
			name: 'Move Current File to Trash',
			callback: async () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) {
					new Notice('No active file to delete.');
					return;
				}

				try {
					// 使用 Obsidian 的文件管理器删除文件
					await this.app.fileManager.trashFile(activeFile);
				} catch (err) {
					console.error(err);
					new Notice('Failed to delete the file.');
				}
			}
		});

		// 添加设置标签
		this.addSettingTab(new DeleteFileSettingTab(this.app, this));
	}

	onunload() {
		console.log('DeleteFilePlugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class DeleteFileSettingTab extends PluginSettingTab {
	plugin: DeleteFilePlugin;

	constructor(app: App, plugin: DeleteFilePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		// 添加删除通知设置
		new Setting(containerEl)
			.setName('Show Delete Notifications')
			.setDesc('Show a notification when a file is deleted')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showDeleteNotification)
				.onChange(async (value) => {
					this.plugin.settings.showDeleteNotification = value;
					await this.plugin.saveSettings();
				}));
	}
}
