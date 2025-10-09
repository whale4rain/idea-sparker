package api

import (
	"net/http"

	"inspiration-blog-writer/backend/src/services"

	"github.com/gin-gonic/gin"
)

// DraftHandlers handles HTTP requests for blog drafts
type DraftHandlers struct {
	draftService *services.DraftService
}

// NewDraftHandlers creates new draft handlers
func NewDraftHandlers(draftService *services.DraftService) *DraftHandlers {
	return &DraftHandlers{
		draftService: draftService,
	}
}

// CreateDraftRequest represents request body for creating a draft
type CreateDraftRequest struct {
	Title   string   `json:"title" binding:"required"`
	Content string   `json:"content"`
	Tags    []string `json:"tags"`
}

// UpdateDraftRequest represents request body for updating a draft
type UpdateDraftRequest struct {
	Title   string   `json:"title" binding:"required"`
	Content string   `json:"content"`
	Tags    []string `json:"tags"`
}

// CreateDraft handles POST /api/drafts
func (h *DraftHandlers) CreateDraft(c *gin.Context) {
	var req CreateDraftRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	draft, err := h.draftService.CreateDraft(req.Title, req.Content, req.Tags)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"draft": draft})
}

// ListDrafts handles GET /api/drafts
func (h *DraftHandlers) ListDrafts(c *gin.Context) {
	drafts, err := h.draftService.ListDrafts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"drafts": drafts})
}

// GetDraft handles GET /api/drafts/:id
func (h *DraftHandlers) GetDraft(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "draft ID is required"})
		return
	}

	draft, err := h.draftService.GetDraft(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "draft not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"draft": draft})
}

// UpdateDraft handles PUT /api/drafts/:id
func (h *DraftHandlers) UpdateDraft(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "draft ID is required"})
		return
	}

	var req UpdateDraftRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	draft, err := h.draftService.UpdateDraft(id, req.Title, req.Content, req.Tags)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "draft not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"draft": draft})
}

// DeleteDraft handles DELETE /api/drafts/:id
func (h *DraftHandlers) DeleteDraft(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "draft ID is required"})
		return
	}

	err := h.draftService.DeleteDraft(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "draft not found"})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// AddResourceToDraft handles POST /api/drafts/:id/resources
func (h *DraftHandlers) AddResourceToDraft(c *gin.Context) {
	draftID := c.Param("id")
	if draftID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "draft ID is required"})
		return
	}

	var req struct {
		ResourceID string `json:"resourceId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.draftService.AddResourceToDraft(draftID, req.ResourceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "resource added to draft"})
}

// RemoveResourceFromDraft handles DELETE /api/drafts/:id/resources/:resourceId
func (h *DraftHandlers) RemoveResourceFromDraft(c *gin.Context) {
	draftID := c.Param("id")
	resourceID := c.Param("resourceId")

	if draftID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "draft ID is required"})
		return
	}
	if resourceID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "resource ID is required"})
		return
	}

	err := h.draftService.RemoveResourceFromDraft(draftID, resourceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "resource removed from draft"})
}
