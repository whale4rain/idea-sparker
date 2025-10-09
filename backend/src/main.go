package main

import (
	"log"

	"inspiration-blog-writer/backend/src/api"
	"inspiration-blog-writer/backend/src/services"
	"inspiration-blog-writer/backend/src/storage"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize storage
	store := storage.NewMemoryStorage()

	// Initialize services
	draftService := services.NewDraftService(store)
	resourceService := services.NewResourceService(store)

	// Initialize handlers
	draftHandlers := api.NewDraftHandlers(draftService)
	resourceHandlers := api.NewResourceHandlers(resourceService)

	// Create Gin router
	r := gin.Default()

	// Enable CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Inspiration Blog Writer Backend API",
		})
	})

	// API routes
	api := r.Group("/api")
	{
		// Blog drafts routes
		drafts := api.Group("/drafts")
		{
			drafts.GET("", draftHandlers.ListDrafts)
			drafts.POST("", draftHandlers.CreateDraft)
			drafts.GET("/:id", draftHandlers.GetDraft)
			drafts.PUT("/:id", draftHandlers.UpdateDraft)
			drafts.DELETE("/:id", draftHandlers.DeleteDraft)
			drafts.POST("/:id/resources", draftHandlers.AddResourceToDraft)
			drafts.DELETE("/:id/resources/:resourceId", draftHandlers.RemoveResourceFromDraft)
		}

		// Resources routes
		resources := api.Group("/resources")
		{
			resources.GET("", resourceHandlers.ListResources)
			resources.POST("", resourceHandlers.CreateResource)
			resources.GET("/:id", resourceHandlers.GetResource)
			resources.PUT("/:id", resourceHandlers.UpdateResource)
			resources.DELETE("/:id", resourceHandlers.DeleteResource)
		}

		// Ideas routes - placeholder handlers
		ideas := api.Group("/ideas")
		{
			ideas.GET("", listIdeas)
			ideas.POST("", createIdea)
			ideas.GET("/:id", getIdea)
		}

		// Chat routes - placeholder handlers
		chat := api.Group("/chat")
		{
			chat.POST("/sessions", createChatSession)
			chat.GET("/sessions/:id", getChatSession)
			chat.POST("/sessions/:id/messages", addChatMessage)
		}

		// AI analysis route - placeholder handler
		api.POST("/analyze", analyzeContent)
	}

	// Start server
	port := ":8080"
	log.Printf("Starting server on port %s", port)
	log.Fatal(r.Run(port))
}

// Placeholder handlers for ideas, chat, and AI analysis - will be implemented later
func listIdeas(c *gin.Context) {
	c.JSON(200, []gin.H{})
}

func createIdea(c *gin.Context) {
	c.JSON(201, gin.H{"message": "idea creation not implemented yet"})
}

func getIdea(c *gin.Context) {
	c.JSON(200, gin.H{"message": "idea retrieval not implemented yet"})
}

func createChatSession(c *gin.Context) {
	c.JSON(201, gin.H{"message": "chat session creation not implemented yet"})
}

func getChatSession(c *gin.Context) {
	c.JSON(200, gin.H{"message": "chat session retrieval not implemented yet"})
}

func addChatMessage(c *gin.Context) {
	c.JSON(201, gin.H{"message": "chat message addition not implemented yet"})
}

func analyzeContent(c *gin.Context) {
	c.JSON(200, gin.H{"message": "content analysis not implemented yet"})
}
