package models

import (
	"time"
)

// ResourceType represents the type of collected resource
type ResourceType string

const (
	ResourceTypeLink     ResourceType = "link"
	ResourceTypeBlog     ResourceType = "blog"
	ResourceTypeDocument ResourceType = "document"
	ResourceTypeVideo    ResourceType = "video"
	ResourceTypeOther    ResourceType = "other"
)

// CollectedResource represents a collected internet resource with metadata
type CollectedResource struct {
	ID          string       `json:"id" bson:"_id,omitempty"`
	URL         string       `json:"url" bson:"url"`
	Title       string       `json:"title" bson:"title"`
	Description string       `json:"description" bson:"description"`
	Type        ResourceType `json:"type" bson:"type"`
	CreatedAt   time.Time    `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time    `json:"updatedAt" bson:"updatedAt"`
	Category    string       `json:"category" bson:"category"`
	Tags        []string     `json:"tags" bson:"tags"`
}

// NewCollectedResource creates a new collected resource with proper timestamps
func NewCollectedResource(url, title, description string, resourceType ResourceType, category string, tags []string) *CollectedResource {
	now := time.Now()
	return &CollectedResource{
		URL:         url,
		Title:       title,
		Description: description,
		Type:        resourceType,
		CreatedAt:   now,
		UpdatedAt:   now,
		Category:    category,
		Tags:        tags,
	}
}

// Update updates the collected resource metadata
func (r *CollectedResource) Update(title, description string, resourceType ResourceType, category string, tags []string) {
	r.Title = title
	r.Description = description
	r.Type = resourceType
	r.Category = category
	r.Tags = tags
	r.UpdatedAt = time.Now()
}
