// Tauri Service for desktop file operations and native functionality
// Use dynamic import to avoid build errors when Tauri is not available

export interface FileDialogOptions {
  title?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  defaultPath?: string;
  multiple?: boolean;
  directory?: boolean;
}

export interface FileSystemOptions {
  baseDir?:
    | 'app'
    | 'app-config'
    | 'app-data'
    | 'app-local-data'
    | 'app-cache'
    | 'app-log'
    | 'desktop'
    | 'document'
    | 'download'
    | 'music'
    | 'picture'
    | 'video'
    | 'public'
    | 'home';
}

class TauriService {
  private available: boolean = false;

  constructor() {
    this.checkTauriAvailability();
  }

  private async checkTauriAvailability(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        this.available = true;
      }
    } catch (error) {
      console.warn('Tauri not available:', error);
      this.available = false;
    }
  }

  get isAvailable(): boolean {
    return this.available;
  }

  // File Operations
  async readFile(path: string, options?: FileSystemOptions): Promise<string> {
    if (!this.available) {
      throw new Error('Tauri is not available');
    }

    try {
      // Dynamic import of Tauri API
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('read_file', { path, options });
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error;
    }
  }

  async writeFile(
    path: string,
    content: string,
    options?: FileSystemOptions
  ): Promise<void> {
    if (!this.available) {
      throw new Error('Tauri is not available');
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('write_file', { path, content, options });
    } catch (error) {
      console.error('Failed to write file:', error);
      throw error;
    }
  }

  async exists(path: string, options?: FileSystemOptions): Promise<boolean> {
    if (!this.available) {
      return false;
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('exists', { path, options });
    } catch (error) {
      console.error('Failed to check file existence:', error);
      return false;
    }
  }

  // File Dialog Operations
  async openFile(options?: FileDialogOptions): Promise<string | null> {
    if (!this.available) {
      return null;
    }

    try {
      const defaultOptions: FileDialogOptions = {
        title: 'Open File',
        filters: [
          { name: 'Markdown Files', extensions: ['md', 'markdown'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        multiple: false,
      };

      const finalOptions = { ...defaultOptions, ...options };
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('open_file_dialog', { options: finalOptions });
    } catch (error) {
      console.error('Failed to open file dialog:', error);
      return null;
    }
  }

  async saveFile(
    defaultName: string,
    content: string,
    options?: FileDialogOptions
  ): Promise<string | null> {
    if (!this.available) {
      return null;
    }

    try {
      const defaultOptions: FileDialogOptions = {
        title: 'Save File',
        filters: [
          { name: 'Markdown Files', extensions: ['md', 'markdown'] },
          { name: 'Text Files', extensions: ['txt'] },
        ],
      };

      const finalOptions = { ...defaultOptions, ...options };
      const { invoke } = await import('@tauri-apps/api/core');
      const path = await invoke('save_file_dialog', {
        defaultName,
        options: finalOptions,
      });

      if (path && typeof path === 'string') {
        await this.writeFile(path, content);
        return path;
      }

      return null;
    } catch (error) {
      console.error('Failed to save file:', error);
      return null;
    }
  }

  // Window Operations
  async minimizeWindow(): Promise<void> {
    if (!this.available) return;

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('minimize_window');
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  }

  async maximizeWindow(): Promise<void> {
    if (!this.available) return;

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('maximize_window');
    } catch (error) {
      console.error('Failed to maximize window:', error);
    }
  }

  async closeWindow(): Promise<void> {
    if (!this.available) return;

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('close_window');
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  }

  async setWindowTitle(title: string): Promise<void> {
    if (!this.available) return;

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_window_title', { title });
    } catch (error) {
      console.error('Failed to set window title:', error);
    }
  }

  // System Operations
  async showNotification(title: string, body: string): Promise<void> {
    if (!this.available) return;

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('show_notification', { title, body });
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  async openUrl(url: string): Promise<void> {
    if (!this.available) return;

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_url', { url });
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  }

  // App Data Operations
  async getAppDataDir(): Promise<string> {
    if (!this.available) {
      return '';
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('get_app_data_dir');
    } catch (error) {
      console.error('Failed to get app data directory:', error);
      return '';
    }
  }

  async getDocumentsDir(): Promise<string> {
    if (!this.available) {
      return '';
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('get_documents_dir');
    } catch (error) {
      console.error('Failed to get documents directory:', error);
      return '';
    }
  }

  // Utility Methods
  async openInDefaultEditor(path: string): Promise<void> {
    if (!this.available) return;

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_in_default_editor', { path });
    } catch (error) {
      console.error('Failed to open in default editor:', error);
    }
  }

  async showInFileManager(path: string): Promise<void> {
    if (!this.available) return;

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('show_in_file_manager', { path });
    } catch (error) {
      console.error('Failed to show in file manager:', error);
    }
  }
}

export const tauriService = new TauriService();
export default tauriService;
