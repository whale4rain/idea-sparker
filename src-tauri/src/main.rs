// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::Value;
use std::fs;
use std::path::PathBuf;
use tauri::api::dialog::FileDialogBuilder;
use tauri::api::notification::Notification;
use tauri::api::shell::open;
use tauri::Manager;

#[tauri::command]
async fn read_file(path: String, options: Option<Value>) -> Result<String, String> {
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

#[tauri::command]
async fn write_file(path: String, content: String, options: Option<Value>) -> Result<(), String> {
    match fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write file: {}", e)),
    }
}

#[tauri::command]
async fn exists(path: String, options: Option<Value>) -> Result<bool, String> {
    Ok(PathBuf::from(&path).exists())
}

#[tauri::command]
async fn open_file_dialog(options: Option<Value>) -> Result<Option<String>, String> {
    let mut dialog = FileDialogBuilder::new();

    if let Some(opts) = options {
        if let Some(title) = opts.get("title").and_then(|v| v.as_str()) {
            dialog = dialog.set_title(title);
        }

        if let Some(filters) = opts.get("filters").and_then(|v| v.as_array()) {
            for filter in filters {
                if let Some(obj) = filter.as_object() {
                    if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                        if let Some(extensions) = obj.get("extensions").and_then(|v| v.as_array()) {
                            let exts: Vec<&str> = extensions
                                .iter()
                                .filter_map(|v| v.as_str())
                                .collect();
                            dialog = dialog.add_filter(name, &exts);
                        }
                    }
                }
            }
        }

        if let Some(multiple) = opts.get("multiple").and_then(|v| v.as_bool()) {
            // Tauri dialog API doesn't expose multiple selection directly in the builder
        }
    }

    match dialog.pick_file() {
        Some(path) => Ok(Some(path.to_string_lossy().to_string())),
        None => Ok(None),
    }
}

#[tauri::command]
async fn save_file_dialog(
    default_name: String,
    content: String,
    options: Option<Value>,
) -> Result<Option<String>, String> {
    let mut dialog = FileDialogBuilder::new().set_file_name(&default_name);

    if let Some(opts) = options {
        if let Some(title) = opts.get("title").and_then(|v| v.as_str()) {
            dialog = dialog.set_title(title);
        }

        if let Some(filters) = opts.get("filters").and_then(|v| v.as_array()) {
            for filter in filters {
                if let Some(obj) = filter.as_object() {
                    if let Some(name) = obj.get("name").and_then(|v| v.as_str()) {
                        if let Some(extensions) = obj.get("extensions").and_then(|v| v.as_array()) {
                            let exts: Vec<&str> = extensions
                                .iter()
                                .filter_map(|v| v.as_str())
                                .collect();
                            dialog = dialog.add_filter(name, &exts);
                        }
                    }
                }
            }
        }
    }

    match dialog.save_file() {
        Some(path) => {
            match fs::write(&path, content) {
                Ok(_) => Ok(Some(path.to_string_lossy().to_string())),
                Err(e) => Err(format!("Failed to save file: {}", e)),
            }
        }
        None => Ok(None),
    }
}

#[tauri::command]
async fn minimize_window(window: tauri::Window) -> Result<(), String> {
    match window.minimize() {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to minimize window: {}", e)),
    }
}

#[tauri::command]
async fn maximize_window(window: tauri::Window) -> Result<(), String> {
    match window.is_maximized() {
        Ok(true) => {
            match window.unmaximize() {
                Ok(_) => Ok(()),
                Err(e) => Err(format!("Failed to unmaximize window: {}", e)),
            }
        }
        Ok(false) => {
            match window.maximize() {
                Ok(_) => Ok(()),
                Err(e) => Err(format!("Failed to maximize window: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to check window state: {}", e)),
    }
}

#[tauri::command]
async fn close_window(window: tauri::Window) -> Result<(), String> {
    match window.close() {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to close window: {}", e)),
    }
}

#[tauri::command]
async fn set_window_title(window: tauri::Window, title: String) -> Result<(), String> {
    match window.set_title(&title) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to set window title: {}", e)),
    }
}

#[tauri::command]
async fn show_notification(title: String, body: String) -> Result<(), String> {
    match Notification::new("com.inspiration-blog-writer.app")
        .title(&title)
        .body(&body)
        .show()
    {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to show notification: {}", e)),
    }
}

#[tauri::command]
async fn open_url(url: String) -> Result<(), String> {
    match open(&tauri::api::shell::Shell::new(), Some(&url), None) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to open URL: {}", e)),
    }
}

#[tauri::command]
async fn get_app_data_dir() -> Result<String, String> {
    match tauri::api::path::app_data_dir(&tauri::Config::default()) {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err("Failed to get app data directory".to_string()),
    }
}

#[tauri::command]
async fn get_documents_dir() -> Result<String, String> {
    match tauri::api::path::document_dir() {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err("Failed to get documents directory".to_string()),
    }
}

#[tauri::command]
async fn open_in_default_editor(path: String) -> Result<(), String> {
    match open(&tauri::api::shell::Shell::new(), Some(&format!("file://{}", path)), None) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to open in default editor: {}", e)),
    }
}

#[tauri::command]
async fn show_in_file_manager(path: String) -> Result<(), String> {
    match open(&tauri::api::shell::Shell::new(), Some(&format!("file://{}", path)), None) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to show in file manager: {}", e)),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            exists,
            open_file_dialog,
            save_file_dialog,
            minimize_window,
            maximize_window,
            close_window,
            set_window_title,
            show_notification,
            open_url,
            get_app_data_dir,
            get_documents_dir,
            open_in_default_editor,
            show_in_file_manager
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
