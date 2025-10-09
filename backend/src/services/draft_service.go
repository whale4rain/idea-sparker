package services

import (
	"errors"
	"inspiration-blog-writer/backend/src/models"
	"inspiration-blog-writer/backend/src/storage"

	"github.com/google/uuid"
)

// DraftService handles business logic for blog drafts
type DraftService struct {
	storage storage.Storage
}

// NewDraftService creates a new draft service instance
func NewDraftService(storage storage.Storage) *DraftService {
	return &DraftService{
		storage: storage,
	}
}

// CreateDraft creates a new blog draft
func (s *DraftService) CreateDraft(title, content string, tags []string) (*models.BlogDraft, error) {
	if title == "" {
		return nil, errors.New("title is required")
	}

	draft := models.NewBlogDraft(title, content, tags)
	draft.ID = uuid.New().String()

	err := s.storage.CreateDraft(draft)
	if err != nil {
		return nil, err
	}

	return draft, nil
}

// GetDraft retrieves a blog draft by ID
func (s *DraftService) GetDraft(id string) (*models.BlogDraft, error) {
	if id == "" {
		return nil, errors.New("draft ID is required")
	}

	return s.storage.GetDraft(id)
}

// ListDrafts retrieves all blog drafts
func (s *DraftService) ListDrafts() ([]*models.BlogDraft, error) {
	return s.storage.ListDrafts()
}

// UpdateDraft updates an existing blog draft
func (s *DraftService) UpdateDraft(id, title, content string, tags []string) (*models.BlogDraft, error) {
	if id == "" {
		return nil, errors.New("draft ID is required")
	}
	if title == "" {
		return nil, errors.New("title is required")
	}

	// Get existing draft
	draft, err := s.storage.GetDraft(id)
	if err != nil {
		return nil, err
	}

	// Update draft
	draft.Update(title, content, tags)

	err = s.storage.UpdateDraft(draft)
	if err != nil {
		return nil, err
	}

	return draft, nil
}

// DeleteDraft deletes a blog draft by ID
func (s *DraftService) DeleteDraft(id string) error {
	if id == "" {
		return errors.New("draft ID is required")
	}

	return s.storage.DeleteDraft(id)
}

// AddResourceToDraft adds a resource to a draft
func (s *DraftService) AddResourceToDraft(draftID, resourceID string) error {
	if draftID == "" {
		return errors.New("draft ID is required")
	}
	if resourceID == "" {
		return errors.New("resource ID is required")
	}

	// Get draft
	draft, err := s.storage.GetDraft(draftID)
	if err != nil {
		return err
	}

	// Check if resource exists
	_, err = s.storage.GetResource(resourceID)
	if err != nil {
		return err
	}

	// Add resource if not already present
	for _, id := range draft.Resources {
		if id == resourceID {
			return nil // Resource already added
		}
	}

	draft.Resources = append(draft.Resources, resourceID)
	return s.storage.UpdateDraft(draft)
}

// RemoveResourceFromDraft removes a resource from a draft
func (s *DraftService) RemoveResourceFromDraft(draftID, resourceID string) error {
	if draftID == "" {
		return errors.New("draft ID is required")
	}
	if resourceID == "" {
		return errors.New("resource ID is required")
	}

	// Get draft
	draft, err := s.storage.GetDraft(draftID)
	if err != nil {
		return err
	}

	// Remove resource
	for i, id := range draft.Resources {
		if id == resourceID {
			draft.Resources = append(draft.Resources[:i], draft.Resources[i+1:]...)
			return s.storage.UpdateDraft(draft)
		}
	}

	return nil // Resource not found in draft, but that's okay
}
