import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';

import { Progress } from './ui/Progress';
import {
  Eye,
  Save,
  FolderOpen,
  Download,
  Bold,
  Italic,
  Link,
  Image,
  Code,
  List,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Fullscreen,
  Minimize2,
  Settings,
  Share2,
  Clock,
  FileText,
  Zap,
} from 'lucide-react';
import {
  parseMarkdown,
  isEmptyContent,
  countWords,
  estimateReadingTime,
  debounce,
} from '@/lib/utils';
import tauriService from '@/services/tauriService';

interface MarkdownEditorProps {
  initialContent?: string;
  initialTitle?: string;
  onSave?: (title: string, content: string) => void;
  onContentChange?: (content: string) => void;
  readonly?: boolean;
}

interface EditorStats {
  words: number;
  characters: number;
  readingTime: number;
  lastSaved?: Date;
  isDirty: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialContent = '',
  initialTitle = '',
  onSave,
  onContentChange,
  readonly = false,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [stats, setStats] = useState<EditorStats>({
    words: 0,
    characters: 0,
    readingTime: 0,
    isDirty: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'saved' | 'saving' | 'error' | 'unsaved'
  >('saved');

  // Auto-save functionality
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const autoSave = useCallback(
    debounce(async (title: string, content: string) => {
      if (!onSave || isEmptyContent(content)) return;

      setIsSaving(true);
      setSaveStatus('saving');

      try {
        await onSave(title, content);
        setSaveStatus('saved');
        setStats((prev) => ({
          ...prev,
          isDirty: false,
          lastSaved: new Date(),
        }));
      } catch (error) {
        setSaveStatus('error');
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [onSave]
  );

  // Update stats when content changes
  useEffect(() => {
    const words = countWords(content);
    const characters = content.length;
    const readingTime = estimateReadingTime(content);

    setStats((prev) => ({
      ...prev,
      words,
      characters,
      readingTime,
      isDirty: content !== initialContent || title !== initialTitle,
    }));
  }, [content, title, initialContent, initialTitle]);

  // Auto-save when content changes
  useEffect(() => {
    if (stats.isDirty && !readonly) {
      setSaveStatus('unsaved');
      autoSave(title, content);
    }
  }, [content, title, stats.isDirty, autoSave, readonly]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      onContentChange?.(newContent);
    },
    [onContentChange]
  );

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      await onSave(title, content);
      setSaveStatus('saved');
      setStats((prev) => ({ ...prev, isDirty: false, lastSaved: new Date() }));

      if (tauriService.isAvailable) {
        await tauriService.showNotification(
          'Draft Saved',
          'Your draft has been saved successfully.'
        );
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, onSave]);

  const handleOpenFile = useCallback(async () => {
    if (!tauriService.isAvailable) return;

    const filePath = await tauriService.openFile({
      title: 'Open Markdown File',
      filters: [
        { name: 'Markdown Files', extensions: ['md', 'markdown'] },
        { name: 'Text Files', extensions: ['txt'] },
      ],
    });

    if (filePath) {
      try {
        const fileContent = await tauriService.readFile(filePath);
        const fileName = filePath.split(/[\\/]/).pop() || 'Untitled';
        const fileTitle = fileName.replace(/\.(md|markdown|txt)$/, '');

        setTitle(fileTitle);
        handleContentChange(fileContent);
      } catch (error) {
        console.error('Failed to open file:', error);
      }
    }
  }, [handleContentChange]);

  const handleSaveFile = useCallback(async () => {
    if (!tauriService.isAvailable) return;

    const fileName = title || 'Untitled';
    const filePath = await tauriService.saveFile(`${fileName}.md`, content, {
      title: 'Save Markdown File',
      filters: [
        { name: 'Markdown Files', extensions: ['md'] },
        { name: 'Text Files', extensions: ['txt'] },
      ],
    });

    if (filePath) {
      console.log('File saved to:', filePath);
      setStats((prev) => ({ ...prev, lastSaved: new Date() }));
    }
  }, [title, content]);

  const handleDownload = useCallback(() => {
    const fileName = title || 'Untitled';
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [title, content]);

  // Toolbar actions
  const insertText = useCallback(
    (before: string, after: string = '') => {
      const textarea = document.querySelector(
        'textarea'
      ) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const newText = before + selectedText + after;

      const newContent =
        content.substring(0, start) + newText + content.substring(end);
      handleContentChange(newContent);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length
        );
      }, 0);
    },
    [content, handleContentChange]
  );

  const toolbarActions = [
    { icon: Bold, label: 'Bold', action: () => insertText('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertText('*', '*') },
    { icon: Heading1, label: 'Heading 1', action: () => insertText('# ') },
    { icon: Heading2, label: 'Heading 2', action: () => insertText('## ') },
    { icon: Heading3, label: 'Heading 3', action: () => insertText('### ') },
    { icon: Link, label: 'Link', action: () => insertText('[', '](url)') },
    { icon: Image, label: 'Image', action: () => insertText('![', '](url)') },
    { icon: Code, label: 'Code', action: () => insertText('`', '`') },
    { icon: List, label: 'List', action: () => insertText('- ') },
    { icon: Quote, label: 'Quote', action: () => insertText('> ') },
  ];

  const renderPreview = () => {
    const htmlContent = parseMarkdown(content);
    return (
      <div
        className="markdown-preview custom-scrollbar"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  const renderEditor = () => (
    <Textarea
      value={content}
      onChange={(e) => handleContentChange(e.target.value)}
      placeholder="Start writing your markdown content here..."
      className="h-full min-h-[400px] resize-none border-0 focus:ring-0 font-mono text-sm leading-relaxed custom-scrollbar"
      disabled={readonly}
      maxLength={100000}
    />
  );

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saved':
        return 'text-green-600';
      case 'saving':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'unsaved':
        return 'text-blue-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saved':
        return <Clock className="h-3 w-3" />;
      case 'saving':
        return (
          <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
        );
      case 'error':
        return <div className="h-3 w-3 rounded-full bg-red-500" />;
      case 'unsaved':
        return <div className="h-3 w-3 rounded-full bg-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`markdown-editor ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}
    >
      <Card className="h-full flex flex-col">
        {/* Header */}
        <CardHeader className="markdown-toolbar">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Title Input */}
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Untitled Document"
                  className="text-xl font-semibold bg-transparent border-none outline-none w-full placeholder-muted-foreground"
                  disabled={readonly}
                />
              </div>

              {/* Save Status */}
              <div
                className={`flex items-center gap-2 text-sm ${getSaveStatusColor()}`}
              >
                {getSaveStatusIcon()}
                <span>
                  {saveStatus === 'saved' && 'Saved'}
                  {saveStatus === 'saving' && 'Saving...'}
                  {saveStatus === 'error' && 'Save failed'}
                  {saveStatus === 'unsaved' && 'Unsaved'}
                </span>
                {stats.lastSaved && (
                  <span className="text-muted-foreground">
                    at {stats.lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={isPreviewMode ? 'ghost' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    setIsPreviewMode(false);
                    setIsSplitView(false);
                  }}
                  className="h-7 px-3 text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={isSplitView ? 'ghost' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    setIsSplitView(true);
                    setIsPreviewMode(false);
                  }}
                  className="h-7 px-3 text-xs"
                >
                  <div className="h-3 w-3 border-r border-current mr-1" />
                  Split
                </Button>
                <Button
                  variant={
                    isPreviewMode && !isSplitView ? 'ghost' : 'secondary'
                  }
                  size="sm"
                  onClick={() => {
                    setIsPreviewMode(true);
                    setIsSplitView(false);
                  }}
                  className="h-7 px-3 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowToolbar(!showToolbar)}
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Fullscreen className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          {showToolbar && !isPreviewMode && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1">
                {toolbarActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={action.action}
                    className="h-8 w-8 p-0"
                    title={action.label}
                  >
                    <action.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('<!-- ', ' -->')}
                >
                  Comment
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('```\n', '\n```')}
                >
                  Code Block
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('- [ ] ')}
                >
                  Task List
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="h-full flex">
            {isSplitView ? (
              <>
                <div className="flex-1 border-r border-border">
                  {renderEditor()}
                </div>
                <div className="flex-1">{renderPreview()}</div>
              </>
            ) : isPreviewMode ? (
              <div className="flex-1">{renderPreview()}</div>
            ) : (
              <div className="flex-1">{renderEditor()}</div>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {stats.words} words
                </span>
                <span>{stats.characters} characters</span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {stats.readingTime} min read
                </span>
              </div>

              {/* Progress */}
              {content.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Content</span>
                  <Progress
                    value={Math.min((content.length / 5000) * 100, 100)}
                    size="sm"
                    className="w-20"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {tauriService.isAvailable ? (
                <>
                  <Button variant="ghost" size="sm" onClick={handleOpenFile}>
                    <FolderOpen className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSaveFile}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleSave}
                disabled={isEmptyContent(content) || isSaving || readonly}
                loading={isSaving}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>

              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MarkdownEditor;
