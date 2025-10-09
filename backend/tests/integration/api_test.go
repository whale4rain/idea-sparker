package integration

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"inspiration-blog-writer/backend/src/api"
	"inspiration-blog-writer/backend/src/services"
	"inspiration-blog-writer/backend/src/storage"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)

	// Initialize test storage and services
	store := storage.NewMemoryStorage()
	draftService := services.NewDraftService(store)
	resourceService := services.NewResourceService(store)

	// Initialize handlers
	draftHandlers := api.NewDraftHandlers(draftService)
	resourceHandlers := api.NewResourceHandlers(resourceService)

	// Setup router
	router := gin.New()

	// Add CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Inspiration Blog Writer Backend API",
		})
	})

	// API routes
	api := router.Group("/api")
	{
		// Draft routes
		drafts := api.Group("/drafts")
		{
			drafts.GET("", draftHandlers.ListDrafts)
			drafts.POST("", draftHandlers.CreateDraft)
			drafts.GET("/:id", draftHandlers.GetDraft)
			drafts.PUT("/:id", draftHandlers.UpdateDraft)
			drafts.DELETE("/:id", draftHandlers.DeleteDraft)
		}

		// Resource routes
		resources := api.Group("/resources")
		{
			resources.GET("", resourceHandlers.ListResources)
			resources.POST("", resourceHandlers.CreateResource)
			resources.GET("/:id", resourceHandlers.GetResource)
			resources.PUT("/:id", resourceHandlers.UpdateResource)
			resources.DELETE("/:id", resourceHandlers.DeleteResource)
		}
	}

	return router
}

func TestHealthCheck(t *testing.T) {
	router := setupTestRouter()

	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("Failed to parse response: %v", err)
	}

	if response["status"] != "ok" {
		t.Errorf("Expected status 'ok', got %v", response["status"])
	}
}

func TestCreateDraft(t *testing.T) {
	router := setupTestRouter()

	payload := map[string]interface{}{
		"title":   "Test Draft",
		"content": "# Test Content\nThis is a test draft.",
		"tags":    []string{"test", "draft"},
	}

	jsonData, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/api/drafts", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 201 {
		t.Errorf("Expected status 201, got %d", w.Code)
	}

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("Failed to parse response: %v", err)
	}

	draft := response["draft"].(map[string]interface{})
	if draft["title"] != "Test Draft" {
		t.Errorf("Expected title 'Test Draft', got %v", draft["title"])
	}

	if draft["id"] == nil {
		t.Error("Expected draft ID to be set")
	}
}

func TestListDrafts(t *testing.T) {
	router := setupTestRouter()

	// First create a draft
	payload := map[string]interface{}{
		"title":   "Test Draft for List",
		"content": "# Test Content",
		"tags":    []string{"test"},
	}

	jsonData, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/api/drafts", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Now list drafts
	req = httptest.NewRequest("GET", "/api/drafts", nil)
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("Failed to parse response: %v", err)
	}

	drafts := response["drafts"].([]interface{})
	if len(drafts) == 0 {
		t.Error("Expected at least one draft in the list")
	}
}

func TestCreateResource(t *testing.T) {
	router := setupTestRouter()

	payload := map[string]interface{}{
		"url":         "https://example.com/test",
		"title":       "Test Resource",
		"description": "This is a test resource",
		"type":        "link",
		"category":    "test",
		"tags":        []string{"test", "resource"},
	}

	jsonData, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/api/resources", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 201 {
		t.Errorf("Expected status 201, got %d", w.Code)
	}

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("Failed to parse response: %v", err)
	}

	resource := response["resource"].(map[string]interface{})
	if resource["title"] != "Test Resource" {
		t.Errorf("Expected title 'Test Resource', got %v", resource["title"])
	}

	if resource["id"] == nil {
		t.Error("Expected resource ID to be set")
	}
}

func TestGetDraftNotFound(t *testing.T) {
	router := setupTestRouter()

	req := httptest.NewRequest("GET", "/api/drafts/"+uuid.New().String(), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 404 {
		t.Errorf("Expected status 404, got %d", w.Code)
	}
}

func TestCreateDraftWithMissingTitle(t *testing.T) {
	router := setupTestRouter()

	payload := map[string]interface{}{
		"content": "# Test Content",
		"tags":    []string{"test"},
	}

	jsonData, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/api/drafts", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestCreateResourceWithMissingURL(t *testing.T) {
	router := setupTestRouter()

	payload := map[string]interface{}{
		"title":       "Test Resource",
		"description": "This is a test resource",
		"type":        "link",
	}

	jsonData, _ := json.Marshal(payload)
	req := httptest.NewRequest("POST", "/api/resources", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

func TestCORSPreflight(t *testing.T) {
	router := setupTestRouter()

	req := httptest.NewRequest("OPTIONS", "/api/drafts", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	req.Header.Set("Access-Control-Request-Method", "POST")
	req.Header.Set("Access-Control-Request-Headers", "Content-Type")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 204 {
		t.Errorf("Expected status 204, got %d", w.Code)
	}

	if w.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("Expected CORS headers to be set")
	}
}
