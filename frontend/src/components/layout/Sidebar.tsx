import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  FileText,
  Link,
  Lightbulb,
  Settings,
  HelpCircle,
  Plus,
  Archive,
  Star,
  Clock,
  TrendingUp,
  BarChart3,
  Zap,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  BookOpen,
  Search,
  Filter,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: number;
  active?: boolean;
  children?: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
  stats?: {
    drafts: number;
    resources: number;
    words: number;
    readingTime: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentView,
  onViewChange,
  stats = {
    drafts: 0,
    resources: 0,
    words: 0,
    readingTime: 0,
  },
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['main'])
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const navigation: NavItem[] = [
    {
      id: 'editor',
      label: 'Editor',
      icon: FileText,
      description: 'Write and edit content',
      active: currentView === 'editor',
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: Link,
      description: 'Manage references',
      active: currentView === 'resources',
      badge: stats.resources,
    },
    {
      id: 'drafts',
      label: 'Drafts',
      icon: FileText,
      description: 'View all drafts',
      active: currentView === 'drafts',
      badge: stats.drafts,
    },
    {
      id: 'ideas',
      label: 'AI Ideas',
      icon: Lightbulb,
      description: 'Generate creative ideas',
      active: currentView === 'ideas',
    },
  ];

  const secondaryNavigation: NavItem[] = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View writing statistics',
    },
    {
      id: 'recent',
      label: 'Recent',
      icon: Clock,
      description: 'Recently edited items',
    },
    {
      id: 'starred',
      label: 'Starred',
      icon: Star,
      description: 'Favorite items',
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      description: 'Archived content',
    },
  ];

  const toolsNavigation: NavItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Application settings',
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      description: 'Get help and support',
    },
  ];

  const filteredNavigation = navigation.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const Icon = item.icon;
    const isExpanded = expandedFolders.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <div
          className={`nav-item ${item.active ? 'nav-item-active' : ''}`}
          style={{ paddingLeft: `${level * 16 + 16}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleFolder(item.id);
            } else {
              onViewChange(item.id);
              if (window.innerWidth < 1024) {
                onClose();
              }
            }
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.badge && item.badge > 0 && (
                <Badge
                  variant="default"
                  size="sm"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </div>

            {isOpen && (
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {item.description}
                </div>
              </div>
            )}

            {isOpen && hasChildren && (
              <div className="ml-auto">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1">
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar-expanded' : 'sidebar-collapsed'} transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          {isOpen && (
            <h2 className="font-semibold text-foreground">Navigation</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 lg:hidden"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        {/* Search */}
        {isOpen && (
          <div className="relative">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="search-input pr-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {isOpen && (
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => onViewChange('editor')}
            >
              <Plus className="h-3 w-3" />
              New
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 gap-1">
              <Filter className="h-3 w-3" />
              Filter
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Main Navigation */}
        {isOpen && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Main
              </span>
            </div>
            <nav className="space-y-1">
              {filteredNavigation.map((item) => renderNavItem(item))}
            </nav>
          </div>
        )}

        {/* Secondary Navigation */}
        {isOpen && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Library
              </span>
            </div>
            <nav className="space-y-1">
              {secondaryNavigation.map((item) => renderNavItem(item))}
            </nav>
          </div>
        )}

        {/* Collapsed State Icons */}
        {!isOpen && (
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={item.active ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full h-10 p-0 justify-center"
                  onClick={() => onViewChange(item.id)}
                  title={`${item.label} - ${item.description}`}
                >
                  <div className="relative">
                    <Icon className="h-4 w-4" />
                    {item.badge && item.badge > 0 && (
                      <Badge
                        variant="default"
                        size="sm"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </Badge>
                    )}
                  </div>
                </Button>
              );
            })}
          </nav>
        )}

        {/* Tools */}
        {isOpen && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Tools
              </span>
            </div>
            <nav className="space-y-1">
              {toolsNavigation.map((item) => renderNavItem(item))}
            </nav>
          </div>
        )}
      </div>

      {/* Footer with Stats */}
      {isOpen && (
        <div className="p-4 border-t border-border space-y-4">
          {/* Stats Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                Activity
              </span>
              <TrendingUp className="h-3 w-3 text-green-500" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="stat-item">
                <div className="stat-value text-lg">{stats.drafts}</div>
                <div className="stat-label text-xs">Drafts</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-lg">{stats.resources}</div>
                <div className="stat-label text-xs">Resources</div>
              </div>
            </div>

            {/* Writing Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Today's writing</span>
                <span className="font-medium">{stats.words} words</span>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.min((stats.words / 1000) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {stats.readingTime} min read
              </span>
              <span>Version 0.1.0</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1">
              <Plus className="h-3 w-3" />
              Quick Add
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 gap-1">
              <Archive className="h-3 w-3" />
              Archive
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};
