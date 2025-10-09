package models

import (
	"time"
)

// InterestIdea represents an AI-generated interest idea with metadata
type InterestIdea struct {
	ID          string    `json:"id" bson:"_id,omitempty"`
	Title       string    `json:"title" bson:"title"`
	Description string    `json:"description" bson:"description"`
	Content     string    `json:"content" bson:"content"`
	Confidence  float64   `json:"confidence" bson:"confidence"`
	Sources     []string  `json:"sources" bson:"sources"` // Resource IDs that inspired this idea
	CreatedAt   time.Time `json:"createdAt" bson:"createdAt"`
	Tags        []string  `json:"tags" bson:"tags"`
}

// NewInterestIdea creates a new interest idea with proper timestamps
func NewInterestIdea(title, description, content string, confidence float64, sources []string, tags []string) *InterestIdea {
	return &InterestIdea{
		Title:       title,
		Description: description,
		Content:     content,
		Confidence:  confidence,
		Sources:     sources,
		CreatedAt:   time.Now(),
		Tags:        tags,
	}
}

// IsValid checks if the interest idea has valid confidence score
func (i *InterestIdea) IsValid() bool {
	return i.Confidence >= 0.0 && i.Confidence <= 1.0
}
