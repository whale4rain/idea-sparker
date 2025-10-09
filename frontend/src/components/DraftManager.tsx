import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Plus, Edit, Trash2, Save, X, FileText, Calendar, Eye } from 'lucide-react';
import { formatDate, formatRelativeTime, createExcerpt } from '@/lib/utils';
import { BlogDraft, CreateDraftRequest, UpdateDraftRequest } from '@/services/apiService';
import apiService from '@/services/apiService';

interface DraftManagerProps {
  onDraftSelect?: (draft: BlogDraft) => void;
  onDraftEdit?: (draft: BlogDraft) => void;
  selectedDraftId?: string;
}

export const DraftManager: React.FC<DraftManagerProps> = ({
  onDraftSelect,
  onDraftEdit,
  selectedDraftId
}) => {
  const [drafts, setDrafts] = useState<BlogDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'title'>('updated_at');
  const [formData, setFormData] = useState<CreateDraftRequest>({
    title: '',
    content: ''
  });
  const [editFormData, setEditFormData] = useState<UpdateDraftRequest>({});

  // Load drafts
  const loadDrafts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getDrafts();
      setDrafts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load drafts');
      console.error('Error loading drafts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  // Sort and filter drafts
  const filteredDrafts = drafts
    .filter(draft =>
      draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'updated_at':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      await apiService.createDraft(formData);
      setFormData({ title: '', content: '' });
      setIsCreatingDraft(false);
      await loadDrafts();
      setError(null);
    } catch (err) {
      setError('Failed to create draft');
      console.error('Error creating draft:', err);
    }
  }, [formData, loadDrafts]);

  // Handle edit
  const handleEdit = useCallback((draft: BlogDraft) => {
    setEditingId(draft.id);
    setEditFormData({
      title: draft.title,
      content: draft.content
    });
  }, []);

  // Handle update
  const handleUpdate = useCallback(async (id: string) => {
    try {
      await apiService.updateDraft(id, editFormData);
      setEditingId(null);
      setEditFormData({});
      await loadDrafts();
      setError(null);
    } catch (err) {
      setError('Failed to update draft');
      console.error('Error updating draft:', err);
    }
  }, [editFormData, loadDrafts]);

  // Handle delete
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      await apiService.deleteDraft(id);
      await loadDrafts();
    } catch (err) {
      setError('Failed to delete draft');
      console.error('Error deleting draft:', err);
    }
  }, [loadDrafts]);

  // Handle draft selection
  const handleDraftClick = useCallback((draft: BlogDraft) => {
    if (onDraftSelect) {
      onDraftSelect(draft);
    }
  }, [onDraftSelect]);

  // Handle draft edit
  const handleDraftEditClick = useCallback((draft: BlogDraft) => {
    if (onDraftEdit) {
      onDraftEdit(draft);
    }
  }, [onDraftEdit]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading drafts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Blog Drafts</CardTitle>
          <Button
            size="sm"
            onClick={() => setIsCreatingDraft(true)}
            disabled={isCreatingDraft}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Draft
          </Button>
        </div>

        {/* Search and Sort */}
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Search drafts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-md text-sm"
          >
            <option value="updated_at">Last Modified</option>
            <option value="created_at">Date Created</option>
            <option value="title">Title</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Create Draft Form */}
        {isCreatingDraft && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Create New Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  placeholder="Draft title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Start writing your content..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md text-sm resize-none"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Create Draft
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreatingDraft(false);
                      setFormData({ title: '', content: '' });
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

        {/* Drafts List */}
        <div className="space-y-3">
          {filteredDrafts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? 'No drafts found matching your search.'
                : 'No drafts yet. Create your first draft to get started!'}
            </div>
          ) : (
            filteredDrafts.map(draft => {
              const isSelected = selectedDraftId === draft.id;
              const isEditing = editingId === draft.id;

              return (
                <Card
                  key={draft.id}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'ring-2 ring-primary' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleDraftClick(draft)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input
                              value={editFormData.title || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                              className="font-medium"
                            />
                            <textarea
                              value={editFormData.content || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                              className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleUpdate(draft.id)}>
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <h3 className="font-medium">{draft.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {createExcerpt(draft.content, 150)}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span title={formatDate(draft.updated_at)}>
                                  {formatRelativeTime(draft.updated_at)}
                                </span>
                                {draft.resource_ids.length > 0 && (
                                  <span className="px-2 py-1 bg-secondary rounded-md">
                                    {draft.resource_ids.length} resource{draft.resource_ids.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDraftEditClick(draft);
                                  }}
                                  title="Edit Draft"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(draft);
                                  }}
                                  title="Quick Edit"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(draft.id);
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DraftManager;
