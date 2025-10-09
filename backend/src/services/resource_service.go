package services

import (
	"errors"
	"inspiration-blog-writer/backend/src/models"
	"inspiration-blog-writer/backend/src/storage"

	"github.com/google/uuid"
)

// ResourceService handles business logic for collected resources
type ResourceService struct {
	storage storage.Storage
}

// NewResourceService creates a new resource service instance
func NewResourceService(storage storage.Storage) *ResourceService {
	return &ResourceService{
		storage: storage,
	}
}

// CreateResource creates a new collected resource
func (s *ResourceService) CreateResource(url, title, description string, resourceType models.ResourceType, category string, tags []string) (*models.CollectedResource, error) {
	if url == "" {
		return nil, errors.New("URL is required")
	}
	if title == "" {
		return nil, errors.New("title is required")
	}
	if resourceType == "" {
		resourceType = models.ResourceTypeOther
	}

	resource := models.NewCollectedResource(url, title, description, resourceType, category, tags)
	resource.ID = uuid.New().String()

	err := s.storage.CreateResource(resource)
	if err != nil {
		return nil, err
	}

	return resource, nil
}

// GetResource retrieves a collected resource by ID
func (s *ResourceService) GetResource(id string) (*models.CollectedResource, error) {
	if id == "" {
		return nil, errors.New("resource ID is required")
	}

	return s.storage.GetResource(id)
}

// ListResources retrieves all collected resources
func (s *ResourceService) ListResources() ([]*models.CollectedResource, error) {
	return s.storage.ListResources()
}

// UpdateResource updates an existing collected resource
func (s *ResourceService) UpdateResource(id, title, description string, resourceType models.ResourceType, category string, tags []string) (*models.CollectedResource, error) {
	if id == "" {
		return nil, errors.New("resource ID is required")
	}
	if title == "" {
		return nil, errors.New("title is required")
	}
	if resourceType == "" {
		resourceType = models.ResourceTypeOther
	}

	// Get existing resource
	resource, err := s.storage.GetResource(id)
	if err != nil {
		return nil, err
	}

	// Update resource
	resource.Update(title, description, resourceType, category, tags)

	err = s.storage.UpdateResource(resource)
	if err != nil {
		return nil, err
	}

	return resource, nil
}

// DeleteResource deletes a collected resource by ID
func (s *ResourceService) DeleteResource(id string) error {
	if id == "" {
		return errors.New("resource ID is required")
	}

	return s.storage.DeleteResource(id)
}

// GetResourcesByType retrieves resources filtered by type
func (s *ResourceService) GetResourcesByType(resourceType models.ResourceType) ([]*models.CollectedResource, error) {
	resources, err := s.storage.ListResources()
	if err != nil {
		return nil, err
	}

	var filtered []*models.CollectedResource
	for _, resource := range resources {
		if resource.Type == resourceType {
			filtered = append(filtered, resource)
		}
	}

	return filtered, nil
}

// GetResourcesByCategory retrieves resources filtered by category
func (s *ResourceService) GetResourcesByCategory(category string) ([]*models.CollectedResource, error) {
	if category == "" {
		return s.ListResources()
	}

	resources, err := s.storage.ListResources()
	if err != nil {
		return nil, err
	}

	var filtered []*models.CollectedResource
	for _, resource := range resources {
		if resource.Category == category {
			filtered = append(filtered, resource)
		}
	}

	return filtered, nil
}
