package models

import (
	"time"
)

// BlogDraft represents a blog draft with metadata
type BlogDraft struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	Title     string    `json:"title" bson:"title"`
	Content   string    `json:"content" bson:"content"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" bson:"updatedAt"`
	Tags      []string  `json:"tags" bson:"tags"`
	Resources []string  `json:"resources" bson:"resources"` // Resource IDs
}

// NewBlogDraft creates a new blog draft with proper timestamps
func NewBlogDraft(title, content string, tags []string) *BlogDraft {
	now := time.Now()
	return &BlogDraft{
		Title:     title,
		Content:   content,
		CreatedAt: now,
		UpdatedAt: now,
		Tags:      tags,
		Resources: []string{},
	}
}

// Update updates the blog draft content and timestamps
func (d *BlogDraft) Update(title, content string, tags []string) {
	d.Title = title
	d.Content = content
	d.Tags = tags
	d.UpdatedAt = time.Now()
}
