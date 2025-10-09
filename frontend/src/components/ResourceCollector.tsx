import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Badge } from './ui/Badge';
import {
  Plus,
  ExternalLink,
  Trash2,
  Edit,
  Save,
  X,
  Link,
  BookOpen,
  Lightbulb,
  Archive,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Star,
  StarOff,
  Copy,
  Clock,
  Globe,
  FileText,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { isValidUrl, formatRelativeTime } from '@/lib/utils';
import {
  CollectedResource,
  CreateResourceRequest,
  UpdateResourceRequest,
} from '@/services/apiService';
import apiService from '@/services/apiService';
import tauriService from '@/services/tauriService';

interface ResourceCollectorProps {
  onResourceSelect?: (resource: CollectedResource) => void;
  selectedResourceIds?: string[];
  multiSelect?: boolean;
}

const CATEGORIES = [
  { value: 'reference', label: 'Reference', icon: BookOpen, color: 'blue' },
  {
    value: 'inspiration',
    label: 'Inspiration',
    icon: Lightbulb,
    color: 'yellow',
  },
  { value: 'tool', label: 'Tool', icon: Link, color: 'green' },
  { value: 'archive', label: 'Archive', icon: Archive, color: 'gray' },
  { value: 'research', label: 'Research', icon: FileText, color: 'purple' },
  { value: 'tutorial', label: 'Tutorial', icon: Globe, color: 'indigo' },
];

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Newest First', icon: SortDesc },
  { value: 'created_asc', label: 'Oldest First', icon: SortAsc },
  { value: 'title_asc', label: 'Title (A-Z)', icon: SortAsc },
  { value: 'title_desc', label: 'Title (Z-A)', icon: SortDesc },
  { value: 'updated_desc', label: 'Recently Updated', icon: Clock },
];

const VIEW_MODES = [
  { value: 'grid', label: 'Grid View', icon: Grid3X3 },
  { value: 'list', label: 'List View', icon: List },
];

export const ResourceCollector: React.FC<ResourceCollectorProps> = ({
  onResourceSelect,
  selectedResourceIds = [],
}) => {
  const [resources, setResources] = useState<CollectedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [starredOnly, setStarredOnly] = useState(false);
  const [formData, setFormData] = useState<CreateResourceRequest>({
    title: '',
    url: '',
    description: '',
    category: 'reference',
  });
  const [editFormData, setEditFormData] = useState<UpdateResourceRequest>({});

  // Load resources
  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getResources();
      setResources(data);
      setError(null);
    } catch (err) {
      setError('Failed to load resources');
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Filter and sort resources
  const filteredAndSortedResources = resources
    .filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || resource.category === selectedCategory;
      const matchesStarred = !starredOnly || resource.id.includes('starred'); // Simulated starred

      return matchesSearch && matchesCategory && matchesStarred;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created_desc':
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case 'created_asc':
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'updated_desc':
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
        default:
          return 0;
      }
    });

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.title.trim() || !formData.url.trim()) {
        setError('Title and URL are required');
        return;
      }

      if (!isValidUrl(formData.url)) {
        setError('Please enter a valid URL');
        return;
      }

      try {
        await apiService.createResource(formData);
        setFormData({
          title: '',
          url: '',
          description: '',
          category: 'reference',
        });
        setIsAddingResource(false);
        await loadResources();
        setError(null);
      } catch (err) {
        setError('Failed to create resource');
        console.error('Error creating resource:', err);
      }
    },
    [formData, loadResources]
  );

  // Handle edit
  const handleEdit = useCallback((resource: CollectedResource) => {
    setEditingId(resource.id);
    setEditFormData({
      title: resource.title,
      url: resource.url,
      description: resource.description,
      category: resource.category,
    });
  }, []);

  // Handle update
  const handleUpdate = useCallback(
    async (id: string) => {
      try {
        if (editFormData.url && !isValidUrl(editFormData.url)) {
          setError('Please enter a valid URL');
          return;
        }

        await apiService.updateResource(id, editFormData);
        setEditingId(null);
        setEditFormData({});
        await loadResources();
        setError(null);
      } catch (err) {
        setError('Failed to update resource');
        console.error('Error updating resource:', err);
      }
    },
    [editFormData, loadResources]
  );

  // Handle delete
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this resource?')) {
        return;
      }

      try {
        await apiService.deleteResource(id);
        await loadResources();
      } catch (err) {
        setError('Failed to delete resource');
        console.error('Error deleting resource:', err);
      }
    },
    [loadResources]
  );

  // Handle star toggle
  const handleStarToggle = useCallback(async (resource: CollectedResource) => {
    // Simulate starring functionality
    console.log('Toggle star for:', resource.id);
  }, []);

  // Handle open URL
  const handleOpenUrl = useCallback(async (url: string) => {
    if (tauriService.isAvailable) {
      await tauriService.openUrl(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  // Handle copy URL
  const handleCopyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // Show success feedback
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  }, []);

  // Handle resource selection
  const handleResourceSelect = useCallback(
    (resource: CollectedResource) => {
      if (onResourceSelect) {
        onResourceSelect(resource);
      }
    },
    [onResourceSelect]
  );

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find((cat) => cat.value === category) || CATEGORIES[0];
  };

  const renderResourceCard = (resource: CollectedResource) => {
    const categoryInfo = getCategoryInfo(resource.category);
    const Icon = categoryInfo.icon;
    const isEditing = editingId === resource.id;
    const isSelected = selectedResourceIds.includes(resource.id);
    const isStarred = resource.id.includes('starred'); // Simulated

    return (
      <Card
        key={resource.id}
        className={`resource-card group cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'resource-card-selected ring-2 ring-primary ring-offset-2'
            : ''
        }`}
        onClick={() => handleResourceSelect(resource)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={`p-2 rounded-lg bg-${categoryInfo.color}-100 text-${categoryInfo.color}-600`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {resource.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {resource.url}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStarToggle(resource);
                }}
              >
                {isStarred ? (
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(resource);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={editFormData.title || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                className="text-sm"
                placeholder="Resource title"
              />
              <Input
                value={editFormData.url || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, url: e.target.value })
                }
                className="text-sm"
                placeholder="URL"
              />
              <Textarea
                value={editFormData.description || ''}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
                className="text-sm"
                rows={2}
                placeholder="Description"
              />
              <select
                value={editFormData.category || resource.category}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdate(resource.id);
                  }}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(null);
                    setEditFormData({});
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {resource.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {resource.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    size="sm"
                    className={`bg-${categoryInfo.color}-100 text-${categoryInfo.color}-700 border-0`}
                  >
                    <Icon className="h-2 w-2 mr-1" />
                    {categoryInfo.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(resource.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenUrl(resource.url);
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(resource.url);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(resource.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderResourceListItem = (resource: CollectedResource) => {
    const categoryInfo = getCategoryInfo(resource.category);
    const Icon = categoryInfo.icon;
    const isSelected = selectedResourceIds.includes(resource.id);

    return (
      <div
        key={resource.id}
        className={`border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
          isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
        onClick={() => handleResourceSelect(resource)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg bg-${categoryInfo.color}-100 text-${categoryInfo.color}-600`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">
              {resource.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {resource.url}
            </p>
            {resource.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {resource.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" size="sm">
              {categoryInfo.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(resource.created_at)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-lg mb-4">
          <div className="h-8 w-8 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Loading Resources
        </h3>
        <p className="text-muted-foreground">
          Please wait while we fetch your resources...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Resource Collector
            </h2>
            <Badge variant="secondary">
              {filteredAndSortedResources.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAddingResource(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="search-container flex-1">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search resources..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {showFilters && (
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm bg-background"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm bg-background"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <Button
                variant={starredOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStarredOnly(!starredOnly)}
                className="gap-2"
              >
                <Star className="h-4 w-4" />
                Starred
              </Button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {VIEW_MODES.map((mode) => (
              <Button
                key={mode.value}
                variant={viewMode === mode.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode.value as 'grid' | 'list')}
                className="h-7 px-3"
              >
                <mode.icon className="h-3 w-3" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Add Resource Form */}
        {isAddingResource && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Add New Resource</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Resource title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="URL"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  required
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Add Resource
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingResource(false);
                      setFormData({
                        title: '',
                        url: '',
                        description: '',
                        category: 'reference',
                      });
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Resources Grid/List */}
        {filteredAndSortedResources.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <Link className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No resources found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first resource to get started'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button
                onClick={() => setIsAddingResource(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Resource
              </Button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'
                : 'space-y-3'
            }
          >
            {filteredAndSortedResources.map((resource) =>
              viewMode === 'grid'
                ? renderResourceCard(resource)
                : renderResourceListItem(resource)
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredAndSortedResources.length} of {resources.length}{' '}
            resources
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadResources}
            className="gap-2"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCollector;
