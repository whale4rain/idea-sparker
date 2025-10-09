import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/Button';
import MarkdownEditor from './components/MarkdownEditor';
import ResourceCollector from './components/ResourceCollector';
import DraftManager from './components/DraftManager';
import IdeaGenerator from './components/IdeaGenerator';
import {
  BlogDraft,
  CollectedResource,
  InterestIdea,
} from './services/apiService';
import apiService from './services/apiService';
import tauriService from './services/tauriService';
import {
  FileText,
  Link,
  Lightbulb,
  Menu,
  X,
  Maximize2,
  Minimize2,
  Search,
  Settings,
  HelpCircle,
  Plus,
  Save,
  Bell,
  User,
  Sparkles,
} from 'lucide-react';

type View = 'editor' | 'resources' | 'drafts' | 'ideas';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('editor');
  const [currentDraft, setCurrentDraft] = useState<BlogDraft | null>(null);
  const [resources, setResources] = useState<CollectedResource[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [resourcesData, draftsData] = await Promise.all([
          apiService.getResources(),
          apiService.getDrafts(),
        ]);
        setResources(resourcesData);

        // Set the most recent draft as current if available
        if (draftsData.length > 0) {
          const mostRecent = draftsData.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          )[0];
          setCurrentDraft(mostRecent);
        }

        setError(null);
      } catch (err) {
        setError('Failed to load initial data');
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Window controls
  const handleMinimize = async () => {
    if (tauriService.isAvailable) {
      await tauriService.minimizeWindow();
    }
  };

  const handleMaximize = async () => {
    if (tauriService.isAvailable) {
      if (isMaximized) {
        await tauriService.maximizeWindow(); // This will unmaximize
      } else {
        await tauriService.maximizeWindow();
      }
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = async () => {
    if (tauriService.isAvailable) {
      await tauriService.closeWindow();
    }
  };

  // Draft management
  const handleDraftSelect = (draft: BlogDraft) => {
    setCurrentDraft(draft);
    setCurrentView('editor');
  };

  const handleDraftSave = async (title: string, content: string) => {
    try {
      if (currentDraft) {
        // Update existing draft
        const updatedDraft = await apiService.updateDraft(currentDraft.id, {
          title,
          content,
        });
        setCurrentDraft(updatedDraft);
      } else {
        // Create new draft
        const newDraft = await apiService.createDraft({ title, content });
        setCurrentDraft(newDraft);
      }

      // Show success notification
      if (tauriService.isAvailable) {
        await tauriService.showNotification(
          'Draft Saved',
          'Your draft has been saved successfully.'
        );
      }
    } catch (err) {
      setError('Failed to save draft');
      console.error('Error saving draft:', err);
    }
  };

  // Resource management
  const handleResourceSelect = (resource: CollectedResource) => {
    setSelectedResourceIds((prev) =>
      prev.includes(resource.id)
        ? prev.filter((id) => id !== resource.id)
        : [...prev, resource.id]
    );
  };

  // Idea management
  const handleIdeaSelect = (idea: InterestIdea) => {
    // Create a new draft from the idea
    const newDraft = {
      title: idea.title,
      content: `# ${idea.title}\n\n${idea.description}\n\n---\n\n*Generated from AI analysis on ${new Date().toLocaleDateString()}*`,
    };

    handleDraftSave(newDraft.title, newDraft.content);
    setCurrentView('editor');
  };

  const navigation = [
    {
      id: 'editor' as View,
      label: 'Editor',
      icon: FileText,
      description: 'Write and edit your content',
    },
    {
      id: 'resources' as View,
      label: 'Resources',
      icon: Link,
      description: 'Manage your references',
    },
    {
      id: 'drafts' as View,
      label: 'Drafts',
      icon: FileText,
      description: 'View all drafts',
    },
    {
      id: 'ideas' as View,
      label: 'AI Ideas',
      icon: Lightbulb,
      description: 'Generate creative ideas',
    },
  ];

  const stats = {
    drafts: currentDraft ? 1 : 0,
    resources: resources.length,
    selectedResources: selectedResourceIds.length,
    words: currentDraft ? currentDraft.content.split(/\s+/).length : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="loading-spinner h-8 w-8 border-2 border-muted border-t-primary"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Loading Inspiration Blog Writer
            </h2>
            <p className="text-sm text-muted-foreground">
              Preparing your creative workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Title Bar */}
      {tauriService.isAvailable && (
        <div className="toolbar bg-background border-b border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-8 w-8 p-0"
            >
              {isSidebarOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-2 px-2">
              <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-sm">
                Inspiration Blog Writer
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMinimize}
              className="h-8 w-8 p-0"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMaximize}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`sidebar ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'} transition-all duration-300 ease-in-out`}
        >
          <div className="flex-1 p-4">
            {/* Navigation Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">
                  {isSidebarOpen ? 'Navigation' : ''}
                </h2>
                {isSidebarOpen && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Settings className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Quick Stats */}
              {isSidebarOpen && (
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="stat-item">
                    <div className="stat-value text-lg">{stats.drafts}</div>
                    <div className="stat-label text-xs">Drafts</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value text-lg">{stats.resources}</div>
                    <div className="stat-label text-xs">Resources</div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <div
                    key={item.id}
                    className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                    onClick={() => setCurrentView(item.id)}
                    title={
                      !isSidebarOpen
                        ? `${item.label} - ${item.description}`
                        : undefined
                    }
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {isSidebarOpen && (
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          {isSidebarOpen && (
            <div className="p-4 border-t border-border">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Support
                </Button>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Version 0.1.0</span>
                  <span>© 2024</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="toolbar bg-muted/30 border-b border-border">
            <div className="flex-1 flex items-center gap-4">
              {/* Search Bar */}
              <div className="search-container flex-1 max-w-md">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search drafts, resources, or ideas..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Draft
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 p-0"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-destructive rounded-full"></div>
                  <span className="text-sm text-destructive">{error}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="content-area">
            {currentView === 'editor' && (
              <div className="h-full">
                <MarkdownEditor
                  initialTitle={currentDraft?.title || ''}
                  initialContent={currentDraft?.content || ''}
                  onSave={handleDraftSave}
                />
              </div>
            )}

            {currentView === 'resources' && (
              <div className="h-full">
                <ResourceCollector
                  onResourceSelect={handleResourceSelect}
                  selectedResourceIds={selectedResourceIds}
                  multiSelect={true}
                />
              </div>
            )}

            {currentView === 'drafts' && (
              <div className="h-full">
                <DraftManager
                  onDraftSelect={handleDraftSelect}
                  selectedDraftId={currentDraft?.id}
                />
              </div>
            )}

            {currentView === 'ideas' && (
              <div className="h-full">
                <IdeaGenerator
                  resources={resources.filter((r) =>
                    selectedResourceIds.includes(r.id)
                  )}
                  currentDraft={currentDraft}
                  onIdeaSelect={handleIdeaSelect}
                />
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="status-bar">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="status-dot status-online"></div>
                Connected
              </span>
              <span>{stats.words} words</span>
              <span>{stats.selectedResources} resources selected</span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                Last saved:{' '}
                {currentDraft
                  ? new Date(currentDraft.updated_at).toLocaleTimeString()
                  : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
