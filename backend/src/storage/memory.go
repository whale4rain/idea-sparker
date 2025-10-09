package storage

import (
	"errors"
	"sync"

	"inspiration-blog-writer/backend/src/models"
)

// MemoryStorage provides an in-memory storage implementation
type MemoryStorage struct {
	drafts    map[string]*models.BlogDraft
	resources map[string]*models.CollectedResource
	ideas     map[string]*models.InterestIdea
	sessions  map[string]*models.ChatSession
	mu        sync.RWMutex
}

// NewMemoryStorage creates a new in-memory storage instance
func NewMemoryStorage() *MemoryStorage {
	return &MemoryStorage{
		drafts:    make(map[string]*models.BlogDraft),
		resources: make(map[string]*models.CollectedResource),
		ideas:     make(map[string]*models.InterestIdea),
		sessions:  make(map[string]*models.ChatSession),
	}
}

// Draft operations
func (m *MemoryStorage) CreateDraft(draft *models.BlogDraft) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.drafts[draft.ID]; exists {
		return errors.New("draft already exists")
	}

	m.drafts[draft.ID] = draft
	return nil
}

func (m *MemoryStorage) GetDraft(id string) (*models.BlogDraft, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	draft, exists := m.drafts[id]
	if !exists {
		return nil, errors.New("draft not found")
	}

	return draft, nil
}

func (m *MemoryStorage) ListDrafts() ([]*models.BlogDraft, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	drafts := make([]*models.BlogDraft, 0, len(m.drafts))
	for _, draft := range m.drafts {
		drafts = append(drafts, draft)
	}

	return drafts, nil
}

func (m *MemoryStorage) UpdateDraft(draft *models.BlogDraft) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.drafts[draft.ID]; !exists {
		return errors.New("draft not found")
	}

	m.drafts[draft.ID] = draft
	return nil
}

func (m *MemoryStorage) DeleteDraft(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.drafts[id]; !exists {
		return errors.New("draft not found")
	}

	delete(m.drafts, id)
	return nil
}

// Resource operations
func (m *MemoryStorage) CreateResource(resource *models.CollectedResource) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.resources[resource.ID]; exists {
		return errors.New("resource already exists")
	}

	m.resources[resource.ID] = resource
	return nil
}

func (m *MemoryStorage) GetResource(id string) (*models.CollectedResource, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	resource, exists := m.resources[id]
	if !exists {
		return nil, errors.New("resource not found")
	}

	return resource, nil
}

func (m *MemoryStorage) ListResources() ([]*models.CollectedResource, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	resources := make([]*models.CollectedResource, 0, len(m.resources))
	for _, resource := range m.resources {
		resources = append(resources, resource)
	}

	return resources, nil
}

func (m *MemoryStorage) UpdateResource(resource *models.CollectedResource) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.resources[resource.ID]; !exists {
		return errors.New("resource not found")
	}

	m.resources[resource.ID] = resource
	return nil
}

func (m *MemoryStorage) DeleteResource(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.resources[id]; !exists {
		return errors.New("resource not found")
	}

	delete(m.resources, id)
	return nil
}

// Idea operations
func (m *MemoryStorage) CreateIdea(idea *models.InterestIdea) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.ideas[idea.ID]; exists {
		return errors.New("idea already exists")
	}

	m.ideas[idea.ID] = idea
	return nil
}

func (m *MemoryStorage) GetIdea(id string) (*models.InterestIdea, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	idea, exists := m.ideas[id]
	if !exists {
		return nil, errors.New("idea not found")
	}

	return idea, nil
}

func (m *MemoryStorage) ListIdeas() ([]*models.InterestIdea, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	ideas := make([]*models.InterestIdea, 0, len(m.ideas))
	for _, idea := range m.ideas {
		ideas = append(ideas, idea)
	}

	return ideas, nil
}

// Chat session operations
func (m *MemoryStorage) CreateSession(session *models.ChatSession) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.sessions[session.ID]; exists {
		return errors.New("session already exists")
	}

	m.sessions[session.ID] = session
	return nil
}

func (m *MemoryStorage) GetSession(id string) (*models.ChatSession, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	session, exists := m.sessions[id]
	if !exists {
		return nil, errors.New("session not found")
	}

	return session, nil
}

func (m *MemoryStorage) UpdateSession(session *models.ChatSession) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.sessions[session.ID]; !exists {
		return errors.New("session not found")
	}

	m.sessions[session.ID] = session
	return nil
}
