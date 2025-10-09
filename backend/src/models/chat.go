package models

import (
	"time"
)

// MessageType represents the type of chat message
type MessageType string

const (
	MessageTypeUser      MessageType = "user"
	MessageTypeAssistant MessageType = "assistant"
	MessageTypeError     MessageType = "error"
)

// ChatMessage represents a single message in a chat session
type ChatMessage struct {
	ID        string      `json:"id" bson:"_id,omitempty"`
	Type      MessageType `json:"type" bson:"type"`
	Content   string      `json:"content" bson:"content"`
	CreatedAt time.Time   `json:"createdAt" bson:"createdAt"`
}

// ChatSession represents a conversation session between user and AI agent
type ChatSession struct {
	ID        string        `json:"id" bson:"_id,omitempty"`
	DraftID   string        `json:"draftId" bson:"draftId"`
	Messages  []ChatMessage `json:"messages" bson:"messages"`
	CreatedAt time.Time     `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time     `json:"updatedAt" bson:"updatedAt"`
	Active    bool          `json:"active" bson:"active"`
}

// NewChatSession creates a new chat session for a specific draft
func NewChatSession(draftID string) *ChatSession {
	now := time.Now()
	return &ChatSession{
		DraftID:   draftID,
		Messages:  []ChatMessage{},
		CreatedAt: now,
		UpdatedAt: now,
		Active:    true,
	}
}

// AddMessage adds a new message to the chat session
func (s *ChatSession) AddMessage(messageType MessageType, content string) {
	s.Messages = append(s.Messages, ChatMessage{
		Type:      messageType,
		Content:   content,
		CreatedAt: time.Now(),
	})
	s.UpdatedAt = time.Now()
}

// IsActive checks if the chat session is still active
func (s *ChatSession) IsActive() bool {
	return s.Active
}

// Deactivate marks the chat session as inactive
func (s *ChatSession) Deactivate() {
	s.Active = false
	s.UpdatedAt = time.Now()
}
