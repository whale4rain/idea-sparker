package api

import (
	"net/http"

	"inspiration-blog-writer/backend/src/models"
	"inspiration-blog-writer/backend/src/services"

	"github.com/gin-gonic/gin"
)

// ResourceHandlers handles HTTP requests for collected resources
type ResourceHandlers struct {
	resourceService *services.ResourceService
}

// NewResourceHandlers creates new resource handlers
func NewResourceHandlers(resourceService *services.ResourceService) *ResourceHandlers {
	return &ResourceHandlers{
		resourceService: resourceService,
	}
}

// CreateResourceRequest represents the request body for creating a resource
type CreateResourceRequest struct {
	URL         string              `json:"url" binding:"required"`
	Title       string              `json:"title" binding:"required"`
	Description string              `json:"description"`
	Type        models.ResourceType `json:"type"`
	Category    string              `json:"category"`
	Tags        []string            `json:"tags"`
}

// UpdateResourceRequest represents the request body for updating a resource
type UpdateResourceRequest struct {
	Title       string              `json:"title" binding:"required"`
	Description string              `json:"description"`
	Type        models.ResourceType `json:"type"`
	Category    string              `json:"category"`
	Tags        []string            `json:"tags"`
}

// ListResources handles GET /api/resources
func (h *ResourceHandlers) ListResources(c *gin.Context) {
	resources, err := h.resourceService.ListResources()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"resources": resources})
}

// CreateResource handles POST /api/resources
func (h *ResourceHandlers) CreateResource(c *gin.Context) {
	var req CreateResourceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resource, err := h.resourceService.CreateResource(req.URL, req.Title, req.Description, req.Type, req.Category, req.Tags)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"resource": resource})
}

// GetResource handles GET /api/resources/:id
func (h *ResourceHandlers) GetResource(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "resource ID is required"})
		return
	}

	resource, err := h.resourceService.GetResource(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"resource": resource})
}

// UpdateResource handles PUT /api/resources/:id
func (h *ResourceHandlers) UpdateResource(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "resource ID is required"})
		return
	}

	var req UpdateResourceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resource, err := h.resourceService.UpdateResource(id, req.Title, req.Description, req.Type, req.Category, req.Tags)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"resource": resource})
}

// DeleteResource handles DELETE /api/resources/:id
func (h *ResourceHandlers) DeleteResource(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "resource ID is required"})
		return
	}

	err := h.resourceService.DeleteResource(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// GetResourcesByType handles GET /api/resources?type=link
func (h *ResourceHandlers) GetResourcesByType(c *gin.Context) {
	resourceType := c.Query("type")
	if resourceType == "" {
		h.ListResources(c)
		return
	}

	resources, err := h.resourceService.GetResourcesByType(models.ResourceType(resourceType))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"resources": resources})
}

// GetResourcesByCategory handles GET /api/resources?category=research
func (h *ResourceHandlers) GetResourcesByCategory(c *gin.Context) {
	category := c.Query("category")

	resources, err := h.resourceService.GetResourcesByCategory(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"resources": resources})
}
