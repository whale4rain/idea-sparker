package unit

import (
	"testing"

	"inspiration-blog-writer/backend/src/models"
	"inspiration-blog-writer/backend/src/services"
	"inspiration-blog-writer/backend/src/storage"

	"github.com/google/uuid"
)

func TestDraftService_CreateDraft(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Test creating a valid draft
	draft, err := service.CreateDraft("Test Title", "Test Content", []string{"test", "draft"})
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if draft.Title != "Test Title" {
		t.Errorf("Expected title 'Test Title', got %s", draft.Title)
	}

	if draft.Content != "Test Content" {
		t.Errorf("Expected content 'Test Content', got %s", draft.Content)
	}

	if len(draft.Tags) != 2 || draft.Tags[0] != "test" || draft.Tags[1] != "draft" {
		t.Errorf("Expected tags [test, draft], got %v", draft.Tags)
	}

	if draft.ID == "" {
		t.Error("Expected draft ID to be set")
	}

	if draft.CreatedAt.IsZero() {
		t.Error("Expected CreatedAt to be set")
	}

	if draft.UpdatedAt.IsZero() {
		t.Error("Expected UpdatedAt to be set")
	}
}

func TestDraftService_CreateDraftWithEmptyTitle(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Test creating a draft with empty title
	_, err := service.CreateDraft("", "Test Content", []string{"test"})
	if err == nil {
		t.Error("Expected error for empty title")
	}

	if err.Error() != "title is required" {
		t.Errorf("Expected 'title is required' error, got %s", err.Error())
	}
}

func TestDraftService_GetDraft(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Create a draft first
	createdDraft, err := service.CreateDraft("Test Title", "Test Content", []string{"test"})
	if err != nil {
		t.Fatalf("Failed to create draft: %v", err)
	}

	// Test getting the draft
	retrievedDraft, err := service.GetDraft(createdDraft.ID)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if retrievedDraft.ID != createdDraft.ID {
		t.Errorf("Expected ID %s, got %s", createdDraft.ID, retrievedDraft.ID)
	}

	if retrievedDraft.Title != createdDraft.Title {
		t.Errorf("Expected title %s, got %s", createdDraft.Title, retrievedDraft.Title)
	}
}

func TestDraftService_GetDraftNotFound(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Test getting a non-existent draft
	_, err := service.GetDraft(uuid.New().String())
	if err == nil {
		t.Error("Expected error for non-existent draft")
	}
}

func TestDraftService_GetDraftWithEmptyID(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Test getting a draft with empty ID
	_, err := service.GetDraft("")
	if err == nil {
		t.Error("Expected error for empty ID")
	}

	if err.Error() != "draft ID is required" {
		t.Errorf("Expected 'draft ID is required' error, got %s", err.Error())
	}
}

func TestDraftService_ListDrafts(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Initially should be empty
	drafts, err := service.ListDrafts()
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if len(drafts) != 0 {
		t.Errorf("Expected 0 drafts, got %d", len(drafts))
	}

	// Create some drafts
	draft1, _ := service.CreateDraft("Title 1", "Content 1", []string{"tag1"})
	draft2, _ := service.CreateDraft("Title 2", "Content 2", []string{"tag2"})

	// List drafts
	drafts, err = service.ListDrafts()
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if len(drafts) != 2 {
		t.Errorf("Expected 2 drafts, got %d", len(drafts))
	}

	// Verify drafts are in the list
	foundDraft1 := false
	foundDraft2 := false
	for _, draft := range drafts {
		if draft.ID == draft1.ID {
			foundDraft1 = true
		}
		if draft.ID == draft2.ID {
			foundDraft2 = true
		}
	}

	if !foundDraft1 {
		t.Error("Expected to find draft1 in list")
	}

	if !foundDraft2 {
		t.Error("Expected to find draft2 in list")
	}
}

func TestDraftService_UpdateDraft(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Create a draft
	draft, _ := service.CreateDraft("Original Title", "Original Content", []string{"original"})

	// Update the draft
	updatedDraft, err := service.UpdateDraft(draft.ID, "Updated Title", "Updated Content", []string{"updated"})
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if updatedDraft.Title != "Updated Title" {
		t.Errorf("Expected title 'Updated Title', got %s", updatedDraft.Title)
	}

	if updatedDraft.Content != "Updated Content" {
		t.Errorf("Expected content 'Updated Content', got %s", updatedDraft.Content)
	}

	if len(updatedDraft.Tags) != 1 || updatedDraft.Tags[0] != "updated" {
		t.Errorf("Expected tags [updated], got %v", updatedDraft.Tags)
	}

	// UpdatedAt should be newer or equal to CreatedAt (same timestamp is possible in fast operations)
	if !updatedDraft.UpdatedAt.After(updatedDraft.CreatedAt) && !updatedDraft.UpdatedAt.Equal(updatedDraft.CreatedAt) {
		t.Error("Expected UpdatedAt to be newer than or equal to CreatedAt")
	}
}

func TestDraftService_UpdateDraftNotFound(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Test updating a non-existent draft
	_, err := service.UpdateDraft(uuid.New().String(), "Updated Title", "Updated Content", []string{"updated"})
	if err == nil {
		t.Error("Expected error for non-existent draft")
	}
}

func TestDraftService_UpdateDraftWithEmptyID(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Test updating with empty ID
	_, err := service.UpdateDraft("", "Updated Title", "Updated Content", []string{"updated"})
	if err == nil {
		t.Error("Expected error for empty ID")
	}

	if err.Error() != "draft ID is required" {
		t.Errorf("Expected 'draft ID is required' error, got %s", err.Error())
	}
}

func TestDraftService_UpdateDraftWithEmptyTitle(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Create a draft
	draft, _ := service.CreateDraft("Original Title", "Original Content", []string{"original"})

	// Test updating with empty title
	_, err := service.UpdateDraft(draft.ID, "", "Updated Content", []string{"updated"})
	if err == nil {
		t.Error("Expected error for empty title")
	}

	if err.Error() != "title is required" {
		t.Errorf("Expected 'title is required' error, got %s", err.Error())
	}
}

func TestDraftService_DeleteDraft(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Create a draft
	draft, _ := service.CreateDraft("Test Title", "Test Content", []string{"test"})

	// Delete the draft
	err := service.DeleteDraft(draft.ID)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	// Verify draft is deleted
	_, err = service.GetDraft(draft.ID)
	if err == nil {
		t.Error("Expected error when getting deleted draft")
	}
}

func TestDraftService_DeleteDraftNotFound(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Test deleting a non-existent draft
	err := service.DeleteDraft(uuid.New().String())
	if err == nil {
		t.Error("Expected error for non-existent draft")
	}
}

func TestDraftService_DeleteDraftWithEmptyID(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	service := services.NewDraftService(store)

	// Test deleting with empty ID
	err := service.DeleteDraft("")
	if err == nil {
		t.Error("Expected error for empty ID")
	}

	if err.Error() != "draft ID is required" {
		t.Errorf("Expected 'draft ID is required' error, got %s", err.Error())
	}
}

func TestDraftService_AddResourceToDraft(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	draftService := services.NewDraftService(store)
	resourceService := services.NewResourceService(store)

	// Create a draft and a resource
	draft, _ := draftService.CreateDraft("Test Draft", "Test Content", []string{"test"})
	resource, _ := resourceService.CreateResource("https://example.com", "Test Resource", "Test Description", models.ResourceTypeLink, "test", []string{"test"})

	// Add resource to draft
	err := draftService.AddResourceToDraft(draft.ID, resource.ID)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	// Verify resource was added
	updatedDraft, err := draftService.GetDraft(draft.ID)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if len(updatedDraft.Resources) != 1 {
		t.Errorf("Expected 1 resource, got %d", len(updatedDraft.Resources))
	}

	if updatedDraft.Resources[0] != resource.ID {
		t.Errorf("Expected resource ID %s, got %s", resource.ID, updatedDraft.Resources[0])
	}
}

func TestDraftService_AddResourceToDraftNotFound(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	draftService := services.NewDraftService(store)
	resourceService := services.NewResourceService(store)

	// Create a resource
	resource, _ := resourceService.CreateResource("https://example.com", "Test Resource", "Test Description", models.ResourceTypeLink, "test", []string{"test"})

	// Try to add resource to non-existent draft
	err := draftService.AddResourceToDraft(uuid.New().String(), resource.ID)
	if err == nil {
		t.Error("Expected error for non-existent draft")
	}
}

func TestDraftService_AddResourceToDraftWithNonExistentResource(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	draftService := services.NewDraftService(store)

	// Create a draft
	draft, _ := draftService.CreateDraft("Test Draft", "Test Content", []string{"test"})

	// Try to add non-existent resource to draft
	err := draftService.AddResourceToDraft(draft.ID, uuid.New().String())
	if err == nil {
		t.Error("Expected error for non-existent resource")
	}
}

func TestDraftService_RemoveResourceFromDraft(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	draftService := services.NewDraftService(store)
	resourceService := services.NewResourceService(store)

	// Create a draft and a resource
	draft, _ := draftService.CreateDraft("Test Draft", "Test Content", []string{"test"})
	resource, _ := resourceService.CreateResource("https://example.com", "Test Resource", "Test Description", models.ResourceTypeLink, "test", []string{"test"})

	// Add resource to draft
	draftService.AddResourceToDraft(draft.ID, resource.ID)

	// Remove resource from draft
	err := draftService.RemoveResourceFromDraft(draft.ID, resource.ID)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	// Verify resource was removed
	updatedDraft, err := draftService.GetDraft(draft.ID)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if len(updatedDraft.Resources) != 0 {
		t.Errorf("Expected 0 resources, got %d", len(updatedDraft.Resources))
	}
}

func TestDraftService_RemoveResourceFromDraftNotFound(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	draftService := services.NewDraftService(store)
	resourceService := services.NewResourceService(store)

	// Create a resource
	resource, _ := resourceService.CreateResource("https://example.com", "Test Resource", "Test Description", models.ResourceTypeLink, "test", []string{"test"})

	// Try to remove resource from non-existent draft
	err := draftService.RemoveResourceFromDraft(uuid.New().String(), resource.ID)
	if err == nil {
		t.Error("Expected error for non-existent draft")
	}
}

func TestDraftService_AddDuplicateResourceToDraft(t *testing.T) {
	// Setup
	store := storage.NewMemoryStorage()
	draftService := services.NewDraftService(store)
	resourceService := services.NewResourceService(store)

	// Create a draft and a resource
	draft, _ := draftService.CreateDraft("Test Draft", "Test Content", []string{"test"})
	resource, _ := resourceService.CreateResource("https://example.com", "Test Resource", "Test Description", models.ResourceTypeLink, "test", []string{"test"})

	// Add resource to draft twice
	err1 := draftService.AddResourceToDraft(draft.ID, resource.ID)
	err2 := draftService.AddResourceToDraft(draft.ID, resource.ID)

	if err1 != nil {
		t.Errorf("Expected no error for first addition, got %v", err1)
	}

	if err2 != nil {
		t.Errorf("Expected no error for duplicate addition, got %v", err2)
	}

	// Verify resource was only added once
	updatedDraft, err := draftService.GetDraft(draft.ID)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if len(updatedDraft.Resources) != 1 {
		t.Errorf("Expected 1 resource, got %d", len(updatedDraft.Resources))
	}
}
