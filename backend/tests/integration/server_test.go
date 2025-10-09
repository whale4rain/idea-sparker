package integration

import (
	"net/http/httptest"
	"testing"

	"inspiration-blog-writer/backend/src/api"
	"inspiration-blog-writer/backend/src/services"
	"inspiration-blog-writer/backend/src/storage"

	"github.com/gin-gonic/gin"
)

func TestServerInitialization(t *testing.T) {
	// Test that all server components can be initialized without errors
	store := storage.NewMemoryStorage()
	draftService := services.NewDraftService(store)
	resourceService := services.NewResourceService(store)

	draftHandlers := api.NewDraftHandlers(draftService)
	resourceHandlers := api.NewResourceHandlers(resourceService)

	// Setup router
	gin.SetMode(gin.TestMode)
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
		drafts := api.Group("/drafts")
		{
			drafts.GET("", draftHandlers.ListDrafts)
			drafts.POST("", draftHandlers.CreateDraft)
			drafts.GET("/:id", draftHandlers.GetDraft)
			drafts.PUT("/:id", draftHandlers.UpdateDraft)
			drafts.DELETE("/:id", draftHandlers.DeleteDraft)
		}

		resources := api.Group("/resources")
		{
			resources.GET("", resourceHandlers.ListResources)
			resources.POST("", resourceHandlers.CreateResource)
			resources.GET("/:id", resourceHandlers.GetResource)
			resources.PUT("/:id", resourceHandlers.UpdateResource)
			resources.DELETE("/:id", resourceHandlers.DeleteResource)
		}
	}

	// Test health endpoint
	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	// Test that router has routes
	routes := router.Routes()
	if len(routes) == 0 {
		t.Error("Expected routes to be registered")
	}

	t.Log("Server initialization test completed successfully")
}
