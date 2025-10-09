package storage

import "inspiration-blog-writer/backend/src/models"

// Storage defines the interface for data storage operations
type Storage interface {
	// Blog Draft operations
	CreateDraft(draft *models.BlogDraft) error
	GetDraft(id string) (*models.BlogDraft, error)
	ListDrafts() ([]*models.BlogDraft, error)
	UpdateDraft(draft *models.BlogDraft) error
	DeleteDraft(id string) error

	// Resource operations
	CreateResource(resource *models.CollectedResource) error
	GetResource(id string) (*models.CollectedResource, error)
	ListResources() ([]*models.CollectedResource, error)
	UpdateResource(resource *models.CollectedResource) error
	DeleteResource(id string) error

	// Idea operations
	CreateIdea(idea *models.InterestIdea) error
	GetIdea(id string) (*models.InterestIdea, error)
	ListIdeas() ([]*models.InterestIdea, error)

	// Chat Session operations
	CreateSession(session *models.ChatSession) error
	GetSession(id string) (*models.ChatSession, error)
	UpdateSession(session *models.ChatSession) error
}
