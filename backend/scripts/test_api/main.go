package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const baseURL = "http://localhost:8080"

type Draft struct {
	ID        string   `json:"id"`
	Title     string   `json:"title"`
	Content   string   `json:"content"`
	Tags      []string `json:"tags"`
	Resources []string `json:"resources"`
	CreatedAt string   `json:"createdAt"`
	UpdatedAt string   `json:"updatedAt"`
}

type Resource struct {
	ID          string   `json:"id"`
	URL         string   `json:"url"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Type        string   `json:"type"`
	Category    string   `json:"category"`
	Tags        []string `json:"tags"`
	CreatedAt   string   `json:"createdAt"`
	UpdatedAt   string   `json:"updatedAt"`
}

func main() {
	fmt.Println("🧪 Manual API Testing Script")
	fmt.Println("==============================")

	// Wait a moment for server to start
	time.Sleep(2 * time.Second)

	// Test health endpoint
	fmt.Println("\n1. Testing Health Check...")
	if err := testHealth(); err != nil {
		fmt.Printf("❌ Health check failed: %v\n", err)
		return
	}
	fmt.Println("✅ Health check passed")

	// Test Draft endpoints
	fmt.Println("\n2. Testing Draft Endpoints...")
	draftID, err := testDraftEndpoints()
	if err != nil {
		fmt.Printf("❌ Draft endpoints failed: %v\n", err)
		return
	}
	fmt.Printf("✅ Draft endpoints passed (Draft ID: %s)\n", draftID)

	// Test Resource endpoints
	fmt.Println("\n3. Testing Resource Endpoints...")
	resourceID, err := testResourceEndpoints()
	if err != nil {
		fmt.Printf("❌ Resource endpoints failed: %v\n", err)
		return
	}
	fmt.Printf("✅ Resource endpoints passed (Resource ID: %s)\n", resourceID)

	// Test Draft-Resource relationship
	fmt.Println("\n4. Testing Draft-Resource Relationship...")
	if err := testDraftResourceRelationship(draftID, resourceID); err != nil {
		fmt.Printf("❌ Draft-Resource relationship failed: %v\n", err)
		return
	}
	fmt.Println("✅ Draft-Resource relationship passed")

	// Test error cases
	fmt.Println("\n5. Testing Error Cases...")
	if err := testErrorCases(); err != nil {
		fmt.Printf("❌ Error cases failed: %v\n", err)
		return
	}
	fmt.Println("✅ Error cases passed")

	fmt.Println("\n🎉 All API tests passed successfully!")
	fmt.Println("\n📋 Test Summary:")
	fmt.Println("   ✅ Health check endpoint")
	fmt.Println("   ✅ Draft CRUD operations")
	fmt.Println("   ✅ Resource CRUD operations")
	fmt.Println("   ✅ Draft-Resource relationships")
	fmt.Println("   ✅ Error handling and validation")
}

func testHealth() error {
	resp, err := http.Get(baseURL + "/health")
	if err != nil {
		return fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("expected status 200, got %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	var response map[string]interface{}
	if err := json.Unmarshal(body, &response); err != nil {
		return fmt.Errorf("failed to parse JSON: %w", err)
	}

	if response["status"] != "ok" {
		return fmt.Errorf("expected status 'ok', got %v", response["status"])
	}

	return nil
}

func testDraftEndpoints() (string, error) {
	// Create a draft
	draftData := map[string]interface{}{
		"title":   "Test Draft API",
		"content": "# Test Content\nThis is a test draft created via API.",
		"tags":    []string{"test", "api", "draft"},
	}

	jsonData, err := json.Marshal(draftData)
	if err != nil {
		return "", fmt.Errorf("failed to marshal draft: %w", err)
	}

	resp, err := http.Post(baseURL+"/api/drafts", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create draft: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 201 {
		return "", fmt.Errorf("expected status 201, got %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	var createResponse map[string]interface{}
	if err := json.Unmarshal(body, &createResponse); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	draftDataResponse := createResponse["draft"].(map[string]interface{})
	draftID := draftDataResponse["id"].(string)

	// Get the draft
	resp, err = http.Get(baseURL + "/api/drafts/" + draftID)
	if err != nil {
		return draftID, fmt.Errorf("failed to get draft: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return draftID, fmt.Errorf("expected status 200, got %d", resp.StatusCode)
	}

	// List drafts
	resp, err = http.Get(baseURL + "/api/drafts")
	if err != nil {
		return draftID, fmt.Errorf("failed to list drafts: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return draftID, fmt.Errorf("expected status 200, got %d", resp.StatusCode)
	}

	// Update the draft
	updateData := map[string]interface{}{
		"title":   "Updated Test Draft",
		"content": "# Updated Content\nThis draft has been updated via API.",
		"tags":    []string{"test", "api", "updated"},
	}

	jsonData, err = json.Marshal(updateData)
	if err != nil {
		return draftID, fmt.Errorf("failed to marshal update: %w", err)
	}

	req, err := http.NewRequest("PUT", baseURL+"/api/drafts/"+draftID, bytes.NewBuffer(jsonData))
	if err != nil {
		return draftID, fmt.Errorf("failed to create update request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err = client.Do(req)
	if err != nil {
		return draftID, fmt.Errorf("failed to update draft: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return draftID, fmt.Errorf("expected status 200, got %d", resp.StatusCode)
	}

	return draftID, nil
}

func testResourceEndpoints() (string, error) {
	// Create a resource
	resourceData := map[string]interface{}{
		"url":         "https://example.com/test-api",
		"title":       "Test Resource API",
		"description": "This is a test resource created via API.",
		"type":        "link",
		"category":    "test",
		"tags":        []string{"test", "api", "resource"},
	}

	jsonData, err := json.Marshal(resourceData)
	if err != nil {
		return "", fmt.Errorf("failed to marshal resource: %w", err)
	}

	resp, err := http.Post(baseURL+"/api/resources", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create resource: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 201 {
		return "", fmt.Errorf("expected status 201, got %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	var createResponse map[string]interface{}
	if err := json.Unmarshal(body, &createResponse); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	resourceDataResponse := createResponse["resource"].(map[string]interface{})
	resourceID := resourceDataResponse["id"].(string)

	// Get the resource
	resp, err = http.Get(baseURL + "/api/resources/" + resourceID)
	if err != nil {
		return resourceID, fmt.Errorf("failed to get resource: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return resourceID, fmt.Errorf("expected status 200, got %d", resp.StatusCode)
	}

	// List resources
	resp, err = http.Get(baseURL + "/api/resources")
	if err != nil {
		return resourceID, fmt.Errorf("failed to list resources: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return resourceID, fmt.Errorf("expected status 200, got %d", resp.StatusCode)
	}

	return resourceID, nil
}

func testDraftResourceRelationship(draftID, resourceID string) error {
	// Add resource to draft
	addData := map[string]string{
		"resourceId": resourceID,
	}

	jsonData, err := json.Marshal(addData)
	if err != nil {
		return fmt.Errorf("failed to marshal add data: %w", err)
	}

	resp, err := http.Post(baseURL+"/api/drafts/"+draftID+"/resources", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to add resource to draft: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("expected status 200, got %d", resp.StatusCode)
	}

	// Remove resource from draft
	req, err := http.NewRequest("DELETE", baseURL+"/api/drafts/"+draftID+"/resources/"+resourceID, nil)
	if err != nil {
		return fmt.Errorf("failed to create delete request: %w", err)
	}

	client := &http.Client{}
	resp, err = client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to remove resource from draft: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("expected status 200, got %d", resp.StatusCode)
	}

	return nil
}

func testErrorCases() error {
	// Test getting non-existent draft
	resp, err := http.Get(baseURL + "/api/drafts/non-existent-id")
	if err != nil {
		return fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 404 {
		return fmt.Errorf("expected status 404 for non-existent draft, got %d", resp.StatusCode)
	}

	// Test creating draft without title
	badDraftData := map[string]interface{}{
		"content": "Bad content without title",
		"tags":    []string{"bad"},
	}

	jsonData, err := json.Marshal(badDraftData)
	if err != nil {
		return fmt.Errorf("failed to marshal bad draft: %w", err)
	}

	resp, err = http.Post(baseURL+"/api/drafts", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to make bad request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 400 {
		return fmt.Errorf("expected status 400 for bad draft, got %d", resp.StatusCode)
	}

	// Test creating resource without URL
	badResourceData := map[string]interface{}{
		"title":       "Bad resource without URL",
		"description": "This should fail",
		"type":        "link",
	}

	jsonData, err = json.Marshal(badResourceData)
	if err != nil {
		return fmt.Errorf("failed to marshal bad resource: %w", err)
	}

	resp, err = http.Post(baseURL+"/api/resources", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to make bad resource request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 400 {
		return fmt.Errorf("expected status 400 for bad resource, got %d", resp.StatusCode)
	}

	return nil
}
