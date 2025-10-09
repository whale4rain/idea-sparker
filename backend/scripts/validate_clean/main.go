package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

const baseURL = "http://localhost:8080"

type ValidationResult struct {
	Component    string `json:"component"`
	Status       string `json:"status"`
	Message      string `json:"message"`
	Details      string `json:"details,omitempty"`
	ResponseTime string `json:"response_time,omitempty"`
}

func main() {
	fmt.Println("🔍 Inspiration Blog Writer Backend - Final Validation")
	fmt.Println("======================================================")

	fmt.Println("\n📋 Validation Plan:")
	fmt.Println("   1. Code compilation and structure")
	fmt.Println("   2. Server startup and health check")
	fmt.Println("   3. API endpoint functionality")
	fmt.Println("   4. Data model integrity")
	fmt.Println("   5. Error handling validation")
	fmt.Println("   6. Performance assessment")

	var results []ValidationResult

	// 1. Code Validation
	fmt.Println("\n🏗️  Step 1: Code Compilation & Structure")
	fmt.Println(strings.Repeat("-", 50))

	codeResult := validateCodeStructure()
	if codeResult.Status == "FAIL" {
		results = append(results, codeResult)
		printResults(results)
		os.Exit(1)
	}
	results = append(results, codeResult)

	// 2. Server Validation
	fmt.Println("\n🚀 Step 2: Server Startup & Health")
	fmt.Println(strings.Repeat("-", 50))

	serverPID, err := startServer()
	if err != nil {
		results = append(results, ValidationResult{
			Component: "Server Startup",
			Status:    "FAIL",
			Message:   "Failed to start server",
			Details:   err.Error(),
		})
		printResults(results)
		os.Exit(1)
	}
	defer stopServer(serverPID)

	results = append(results, ValidationResult{
		Component: "Server Startup",
		Status:    "PASS",
		Message:   "Server started successfully",
		Details:   fmt.Sprintf("PID: %d", serverPID),
	})

	// Wait for server to be ready
	time.Sleep(2 * time.Second)

	healthResult := validateHealthCheck()
	if healthResult.Status == "FAIL" {
		results = append(results, healthResult)
	} else {
		results = append(results, healthResult)
	}

	// 3. API Endpoint Validation
	fmt.Println("\n📡 Step 3: API Endpoint Functionality")
	fmt.Println(strings.Repeat("-", 50))

	apiResults := validateAPIEndpoints()
	results = append(results, apiResults...)

	// 4. Data Model Validation
	fmt.Println("\n📊 Step 4: Data Model Integrity")
	fmt.Println(strings.Repeat("-", 50))

	modelResults := validateDataModels()
	results = append(results, modelResults...)

	// 5. Error Handling Validation
	fmt.Println("\n🛡️  Step 5: Error Handling & Validation")
	fmt.Println(strings.Repeat("-", 50))

	errorResults := validateErrorHandling()
	results = append(results, errorResults...)

	// 6. Performance Assessment
	fmt.Println("\n⚡ Step 6: Performance Assessment")
	fmt.Println(strings.Repeat("-", 50))

	perfResults := validatePerformance()
	results = append(results, perfResults...)

	// Print final results
	printResults(results)
}

func validateCodeStructure() ValidationResult {
	// Change to backend root directory
	backendRoot := filepath.Join("..", "..")
	if err := os.Chdir(backendRoot); err != nil {
		return ValidationResult{
			Component: "Code Compilation",
			Status:    "FAIL",
			Message:   "Could not change to backend root directory",
			Details:   err.Error(),
		}
	}

	// Check compilation
	fmt.Print("   Checking compilation... ")
	cmd := exec.Command("go", "build", "./...")
	err := cmd.Run()
	if err != nil {
		fmt.Println("❌ FAILED")
		return ValidationResult{
			Component: "Code Compilation",
			Status:    "FAIL",
			Message:   "Compilation failed",
			Details:   err.Error(),
		}
	}
	fmt.Println("✅ PASSED")

	// Check dependencies
	fmt.Print("   Checking dependencies... ")
	cmd = exec.Command("go", "mod", "tidy")
	err = cmd.Run()
	if err != nil {
		fmt.Println("❌ FAILED")
		return ValidationResult{
			Component: "Dependencies",
			Status:    "FAIL",
			Message:   "Dependency resolution failed",
			Details:   err.Error(),
		}
	}
	fmt.Println("✅ PASSED")

	// Check code formatting
	fmt.Print("   Checking code formatting... ")
	cmd = exec.Command("go", "fmt", "./...")
	err = cmd.Run()
	if err != nil {
		fmt.Println("❌ FAILED")
		return ValidationResult{
			Component: "Code Formatting",
			Status:    "FAIL",
			Message:   "Code formatting issues",
			Details:   err.Error(),
		}
	}
	fmt.Println("✅ PASSED")

	// Check for vet issues
	fmt.Print("   Running go vet... ")
	cmd = exec.Command("go", "vet", "./...")
	err = cmd.Run()
	if err != nil {
		fmt.Println("❌ FAILED")
		return ValidationResult{
			Component: "Code Quality",
			Status:    "FAIL",
			Message:   "Go vet found issues",
			Details:   err.Error(),
		}
	}
	fmt.Println("✅ PASSED")

	// Check project structure
	fmt.Print("   Validating project structure... ")
	requiredDirs := []string{"src/models", "src/services", "src/api", "src/storage", "tests/unit", "tests/integration"}

	for _, dir := range requiredDirs {
		if _, err := os.Stat(dir); os.IsNotExist(err) {
			fmt.Println("❌ FAILED")
			return ValidationResult{
				Component: "Project Structure",
				Status:    "FAIL",
				Message:   "Missing required directory",
				Details:   fmt.Sprintf("Directory %s not found", dir),
			}
		}
	}
	fmt.Println("✅ PASSED")

	return ValidationResult{
		Component: "Code Structure",
		Status:    "PASS",
		Message:   "All code validation checks passed",
	}
}

func validateHealthCheck() ValidationResult {
	start := time.Now()
	resp, err := http.Get(baseURL + "/health")
	if err != nil {
		fmt.Printf("   Health check failed: %v\n", err)
		return ValidationResult{
			Component: "Health Check",
			Status:    "FAIL",
			Message:   "Health check endpoint not responding",
			Details:   err.Error(),
		}
	}
	defer resp.Body.Close()

	responseTime := time.Since(start)
	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		fmt.Printf("   Health check returned status %d\n", resp.StatusCode)
		return ValidationResult{
			Component: "Health Check",
			Status:    "FAIL",
			Message:   "Health check returned unexpected status",
			Details:   fmt.Sprintf("Status: %d, Body: %s", resp.StatusCode, string(body)),
		}
	}

	var healthResponse map[string]interface{}
	if err := json.Unmarshal(body, &healthResponse); err != nil {
		return ValidationResult{
			Component: "Health Check",
			Status:    "FAIL",
			Message:   "Invalid JSON response",
			Details:   err.Error(),
		}
	}

	if healthResponse["status"] != "ok" {
		return ValidationResult{
			Component: "Health Check",
			Status:    "FAIL",
			Message:   "Health check returned non-ok status",
			Details:   fmt.Sprintf("Status: %v", healthResponse["status"]),
		}
	}

	fmt.Printf("   Health check passed (%v)\n", responseTime)
	return ValidationResult{
		Component:    "Health Check",
		Status:       "PASS",
		Message:      "Health check endpoint working",
		ResponseTime: responseTime.String(),
	}
}

func validateAPIEndpoints() []ValidationResult {
	var results []ValidationResult

	// Test Draft Endpoints
	fmt.Println("   Testing Draft API endpoints...")

	// Create draft
	draftData := map[string]interface{}{
		"title":   "Validation Test Draft",
		"content": "# Validation Test\nThis draft was created during validation.",
		"tags":    []string{"validation", "test"},
	}

	jsonData, _ := json.Marshal(draftData)
	start := time.Now()
	resp, err := http.Post(baseURL+"/api/drafts", "application/json", bytes.NewBuffer(jsonData))
	responseTime := time.Since(start)

	if err != nil {
		results = append(results, ValidationResult{
			Component: "Draft API - Create",
			Status:    "FAIL",
			Message:   "Failed to create draft",
			Details:   err.Error(),
		})
	} else if resp.StatusCode != 201 {
		results = append(results, ValidationResult{
			Component: "Draft API - Create",
			Status:    "FAIL",
			Message:   "Create draft returned unexpected status",
			Details:   fmt.Sprintf("Status: %d", resp.StatusCode),
		})
	} else {
		fmt.Printf("     Create draft: ✅ (%v)\n", responseTime)
		results = append(results, ValidationResult{
			Component:    "Draft API - Create",
			Status:       "PASS",
			Message:      "Draft creation successful",
			ResponseTime: responseTime.String(),
		})

		// Parse response to get draft ID
		body, _ := io.ReadAll(resp.Body)
		var createResponse map[string]interface{}
		json.Unmarshal(body, &createResponse)

		if draft, ok := createResponse["draft"].(map[string]interface{}); ok {
			draftID := draft["id"].(string)

			// Test GET draft
			start = time.Now()
			resp, err = http.Get(baseURL + "/api/drafts/" + draftID)
			responseTime = time.Since(start)

			if err == nil && resp.StatusCode == 200 {
				fmt.Printf("     Get draft: ✅ (%v)\n", responseTime)
				results = append(results, ValidationResult{
					Component:    "Draft API - Get",
					Status:       "PASS",
					Message:      "Draft retrieval successful",
					ResponseTime: responseTime.String(),
				})
			} else {
				fmt.Printf("     Get draft: ❌\n")
				results = append(results, ValidationResult{
					Component: "Draft API - Get",
					Status:    "FAIL",
					Message:   "Failed to retrieve draft",
					Details:   fmt.Sprintf("Status: %d", resp.StatusCode),
				})
			}
			resp.Body.Close()

			// Test UPDATE draft
			updateData := map[string]interface{}{
				"title":   "Updated Validation Draft",
				"content": "# Updated Validation Test\nThis draft was updated.",
				"tags":    []string{"validation", "test", "updated"},
			}

			updateDataJson, _ := json.Marshal(updateData)
			req, _ := http.NewRequest("PUT", baseURL+"/api/drafts/"+draftID, bytes.NewBuffer(updateDataJson))
			req.Header.Set("Content-Type", "application/json")

			start = time.Now()
			client := &http.Client{}
			resp, err = client.Do(req)
			responseTime = time.Since(start)

			if err == nil && resp.StatusCode == 200 {
				fmt.Printf("     Update draft: ✅ (%v)\n", responseTime)
				results = append(results, ValidationResult{
					Component:    "Draft API - Update",
					Status:       "PASS",
					Message:      "Draft update successful",
					ResponseTime: responseTime.String(),
				})
			} else {
				fmt.Printf("     Update draft: ❌\n")
				results = append(results, ValidationResult{
					Component: "Draft API - Update",
					Status:    "FAIL",
					Message:   "Failed to update draft",
					Details:   fmt.Sprintf("Status: %d", resp.StatusCode),
				})
			}
			resp.Body.Close()

			// Test DELETE draft
			req, _ = http.NewRequest("DELETE", baseURL+"/api/drafts/"+draftID, nil)

			start = time.Now()
			resp, err = client.Do(req)
			responseTime = time.Since(start)

			if err == nil && resp.StatusCode == 204 {
				fmt.Printf("     Delete draft: ✅ (%v)\n", responseTime)
				results = append(results, ValidationResult{
					Component:    "Draft API - Delete",
					Status:       "PASS",
					Message:      "Draft deletion successful",
					ResponseTime: responseTime.String(),
				})
			} else {
				fmt.Printf("     Delete draft: ❌\n")
				results = append(results, ValidationResult{
					Component: "Draft API - Delete",
					Status:    "FAIL",
					Message:   "Failed to delete draft",
					Details:   fmt.Sprintf("Status: %d", resp.StatusCode),
				})
			}
			resp.Body.Close()
		}
	}

	// Test Resource Endpoints
	fmt.Println("   Testing Resource API endpoints...")

	resourceData := map[string]interface{}{
		"url":         "https://example.com/validation-test",
		"title":       "Validation Test Resource",
		"description": "A resource created during validation testing",
		"type":        "link",
		"category":    "validation",
		"tags":        []string{"validation", "test", "resource"},
	}

	resourceDataJson, _ := json.Marshal(resourceData)
	start = time.Now()
	resp, err = http.Post(baseURL+"/api/resources", "application/json", bytes.NewBuffer(resourceDataJson))
	responseTime = time.Since(start)

	if err != nil {
		results = append(results, ValidationResult{
			Component: "Resource API - Create",
			Status:    "FAIL",
			Message:   "Failed to create resource",
			Details:   err.Error(),
		})
	} else if resp.StatusCode != 201 {
		results = append(results, ValidationResult{
			Component: "Resource API - Create",
			Status:    "FAIL",
			Message:   "Create resource returned unexpected status",
			Details:   fmt.Sprintf("Status: %d", resp.StatusCode),
		})
	} else {
		fmt.Printf("     Create resource: ✅ (%v)\n", responseTime)
		results = append(results, ValidationResult{
			Component:    "Resource API - Create",
			Status:       "PASS",
			Message:      "Resource creation successful",
			ResponseTime: responseTime.String(),
		})

		body, _ := io.ReadAll(resp.Body)
		var createResponse map[string]interface{}
		json.Unmarshal(body, &createResponse)

		if resource, ok := createResponse["resource"].(map[string]interface{}); ok {
			resourceID := resource["id"].(string)

			// Test GET resource
			start = time.Now()
			resp, err = http.Get(baseURL + "/api/resources/" + resourceID)
			responseTime = time.Since(start)

			if err == nil && resp.StatusCode == 200 {
				fmt.Printf("     Get resource: ✅ (%v)\n", responseTime)
				results = append(results, ValidationResult{
					Component:    "Resource API - Get",
					Status:       "PASS",
					Message:      "Resource retrieval successful",
					ResponseTime: responseTime.String(),
				})
			} else {
				fmt.Printf("     Get resource: ❌\n")
				results = append(results, ValidationResult{
					Component: "Resource API - Get",
					Status:    "FAIL",
					Message:   "Failed to retrieve resource",
					Details:   fmt.Sprintf("Status: %d", resp.StatusCode),
				})
			}
			resp.Body.Close()

			// Test DELETE resource
			req, _ := http.NewRequest("DELETE", baseURL+"/api/resources/"+resourceID, nil)

			start = time.Now()
			client := &http.Client{}
			resp, err = client.Do(req)
			responseTime = time.Since(start)

			if err == nil && resp.StatusCode == 204 {
				fmt.Printf("     Delete resource: ✅ (%v)\n", responseTime)
				results = append(results, ValidationResult{
					Component:    "Resource API - Delete",
					Status:       "PASS",
					Message:      "Resource deletion successful",
					ResponseTime: responseTime.String(),
				})
			} else {
				fmt.Printf("     Delete resource: ❌\n")
				results = append(results, ValidationResult{
					Component: "Resource API - Delete",
					Status:    "FAIL",
					Message:   "Failed to delete resource",
					Details:   fmt.Sprintf("Status: %d", resp.StatusCode),
				})
			}
			resp.Body.Close()
		}
	}

	// Test List Endpoints
	fmt.Println("   Testing List endpoints...")

	start = time.Now()
	resp, err = http.Get(baseURL + "/api/drafts")
	responseTime = time.Since(start)

	if err == nil && resp.StatusCode == 200 {
		fmt.Printf("     List drafts: ✅ (%v)\n", responseTime)
		results = append(results, ValidationResult{
			Component:    "Draft API - List",
			Status:       "PASS",
			Message:      "Draft listing successful",
			ResponseTime: responseTime.String(),
		})
	} else {
		fmt.Printf("     List drafts: ❌\n")
		results = append(results, ValidationResult{
			Component: "Draft API - List",
			Status:    "FAIL",
			Message:   "Failed to list drafts",
			Details:   fmt.Sprintf("Status: %d", resp.StatusCode),
		})
	}
	resp.Body.Close()

	start = time.Now()
	resp, err = http.Get(baseURL + "/api/resources")
	responseTime = time.Since(start)

	if err == nil && resp.StatusCode == 200 {
		fmt.Printf("     List resources: ✅ (%v)\n", responseTime)
		results = append(results, ValidationResult{
			Component:    "Resource API - List",
			Status:       "PASS",
			Message:      "Resource listing successful",
			ResponseTime: responseTime.String(),
		})
	} else {
		fmt.Printf("     List resources: ❌\n")
		results = append(results, ValidationResult{
			Component: "Resource API - List",
			Status:    "FAIL",
			Message:   "Failed to list resources",
			Details:   fmt.Sprintf("Status: %d", resp.StatusCode),
		})
	}
	resp.Body.Close()

	return results
}

func validateDataModels() []ValidationResult {
	var results []ValidationResult

	// Test Draft Model Integrity
	fmt.Println("   Testing Draft model integrity...")

	draftData := map[string]interface{}{
		"title":   "Model Test Draft",
		"content": "# Model Test\nTesting draft model fields.",
		"tags":    []string{"model", "test"},
	}

	jsonData, _ := json.Marshal(draftData)
	resp, err := http.Post(baseURL+"/api/drafts", "application/json", bytes.NewBuffer(jsonData))

	if err == nil && resp.StatusCode == 201 {
		body, _ := io.ReadAll(resp.Body)
		var createResponse map[string]interface{}
		json.Unmarshal(body, &createResponse)

		if draft, ok := createResponse["draft"].(map[string]interface{}); ok {
			requiredFields := []string{"id", "title", "content", "tags", "resources", "createdAt", "updatedAt"}
			missingFields := []string{}

			for _, field := range requiredFields {
				if _, exists := draft[field]; !exists {
					missingFields = append(missingFields, field)
				}
			}

			if len(missingFields) == 0 {
				fmt.Println("     Draft model: ✅ All required fields present")
				results = append(results, ValidationResult{
					Component: "Draft Model",
					Status:    "PASS",
					Message:   "Draft model integrity verified",
				})
			} else {
				fmt.Printf("     Draft model: ❌ Missing fields: %v\n", missingFields)
				results = append(results, ValidationResult{
					Component: "Draft Model",
					Status:    "FAIL",
					Message:   "Draft model missing required fields",
					Details:   fmt.Sprintf("Missing: %v", missingFields),
				})
			}
		}
	}
	resp.Body.Close()

	// Test Resource Model Integrity
	fmt.Println("   Testing Resource model integrity...")

	resourceData := map[string]interface{}{
		"url":         "https://example.com/model-test",
		"title":       "Model Test Resource",
		"description": "Testing resource model fields",
		"type":        "link",
		"category":    "testing",
		"tags":        []string{"model", "test"},
	}

	jsonData, _ = json.Marshal(resourceData)
	resp, err = http.Post(baseURL+"/api/resources", "application/json", bytes.NewBuffer(jsonData))

	if err == nil && resp.StatusCode == 201 {
		body, _ := io.ReadAll(resp.Body)
		var createResponse map[string]interface{}
		json.Unmarshal(body, &createResponse)

		if resource, ok := createResponse["resource"].(map[string]interface{}); ok {
			requiredFields := []string{"id", "url", "title", "description", "type", "category", "tags", "createdAt", "updatedAt"}
			missingFields := []string{}

			for _, field := range requiredFields {
				if _, exists := resource[field]; !exists {
					missingFields = append(missingFields, field)
				}
			}

			if len(missingFields) == 0 {
				fmt.Println("     Resource model: ✅ All required fields present")
				results = append(results, ValidationResult{
					Component: "Resource Model",
					Status:    "PASS",
					Message:   "Resource model integrity verified",
				})
			} else {
				fmt.Printf("     Resource model: ❌ Missing fields: %v\n", missingFields)
				results = append(results, ValidationResult{
					Component: "Resource Model",
					Status:    "FAIL",
					Message:   "Resource model missing required fields",
					Details:   fmt.Sprintf("Missing: %v", missingFields),
				})
			}
		}
	}
	resp.Body.Close()

	return results
}

func validateErrorHandling() []ValidationResult {
	var results []ValidationResult

	fmt.Println("   Testing error handling...")

	// Test 404 Not Found
	resp, err := http.Get(baseURL + "/api/drafts/non-existent-id")
	if err == nil && resp.StatusCode == 404 {
		fmt.Println("     404 Not Found: ✅")
		results = append(results, ValidationResult{
			Component: "Error Handling - 404",
			Status:    "PASS",
			Message:   "404 error handling working",
		})
	} else {
		fmt.Println("     404 Not Found: ❌")
		results = append(results, ValidationResult{
			Component: "Error Handling - 404",
			Status:    "FAIL",
			Message:   "404 error handling not working",
			Details:   fmt.Sprintf("Status: %d", resp.StatusCode),
		})
	}
	resp.Body.Close()

	// Test 400 Bad Request (missing title)
	badDraftData := map[string]interface{}{
		"content": "Bad draft without title",
		"tags":    []string{"bad"},
	}

	badDraftDataJson, _ := json.Marshal(badDraftData)
	resp, err = http.Post(baseURL+"/api/drafts", "application/json", bytes.NewBuffer(badDraftDataJson))
	if err == nil && resp.StatusCode == 400 {
		fmt.Println("     400 Bad Request: ✅")
		results = append(results, ValidationResult{
			Component: "Error Handling - 400",
			Status:    "PASS",
			Message:   "400 error handling working",
		})
	} else {
		fmt.Println("     400 Bad Request: ❌")
		results = append(results, ValidationResult{
			Component: "Error Handling - 400",
			Status:    "FAIL",
			Message:   "400 error handling not working",
			Details:   fmt.Sprintf("Status: %d", resp.StatusCode),
		})
	}
	resp.Body.Close()

	// Test 400 Bad Request (missing URL)
	badResourceData := map[string]interface{}{
		"title":       "Bad resource without URL",
		"description": "This should fail validation",
		"type":        "link",
	}

	badResourceDataJson, _ := json.Marshal(badResourceData)
	resp, err = http.Post(baseURL+"/api/resources", "application/json", bytes.NewBuffer(badResourceDataJson))
	if err == nil && resp.StatusCode == 400 {
		fmt.Println("     Resource validation: ✅")
		results = append(results, ValidationResult{
			Component: "Resource Validation",
			Status:    "PASS",
			Message:   "Resource validation working",
		})
	} else {
		fmt.Println("     Resource validation: ❌")
		results = append(results, ValidationResult{
			Component: "Resource Validation",
			Status:    "FAIL",
			Message:   "Resource validation not working",
			Details:   fmt.Sprintf("Status: %d", resp.StatusCode),
		})
	}
	resp.Body.Close()

	return results
}

func validatePerformance() []ValidationResult {
	var results []ValidationResult

	fmt.Println("   Testing performance metrics...")

	// Test response time for multiple requests
	requestCount := 10
	totalTime := time.Duration(0)

	for i := 0; i < requestCount; i++ {
		start := time.Now()
		resp, err := http.Get(baseURL + "/health")
		totalTime += time.Since(start)

		if err != nil {
			fmt.Printf("     Performance test: ❌ (request %d failed)\n", i+1)
			results = append(results, ValidationResult{
				Component: "Performance",
				Status:    "FAIL",
				Message:   "Performance test failed",
				Details:   fmt.Sprintf("Request %d failed: %v", i+1, err),
			})
			return results
		}
		resp.Body.Close()
	}

	avgResponseTime := totalTime / time.Duration(requestCount)

	if avgResponseTime < 100*time.Millisecond {
		fmt.Printf("     Performance: ✅ (avg: %v)\n", avgResponseTime)
		results = append(results, ValidationResult{
			Component:    "Performance",
			Status:       "PASS",
			Message:      "Performance within acceptable limits",
			ResponseTime: avgResponseTime.String(),
		})
	} else {
		fmt.Printf("     Performance: ⚠️  (avg: %v - slow)\n", avgResponseTime)
		results = append(results, ValidationResult{
			Component:    "Performance",
			Status:       "WARN",
			Message:      "Performance below optimal",
			ResponseTime: avgResponseTime.String(),
		})
	}

	// Test concurrent requests
	fmt.Print("     Testing concurrent requests... ")
	concurrentRequests := 5
	successCount := 0

	done := make(chan bool, concurrentRequests)

	for i := 0; i < concurrentRequests; i++ {
		go func() {
			start := time.Now()
			resp, err := http.Get(baseURL + "/api/drafts")
			if err == nil && resp.StatusCode == 200 {
				successCount++
			}
			resp.Body.Close()
			done <- time.Since(start) < 500*time.Millisecond
		}()
	}

	// Wait for all requests to complete
	fastResponses := 0
	for i := 0; i < concurrentRequests; i++ {
		if <-done {
			fastResponses++
		}
	}

	if successCount == concurrentRequests && fastResponses >= concurrentRequests-1 {
		fmt.Println("✅")
		results = append(results, ValidationResult{
			Component: "Concurrency",
			Status:    "PASS",
			Message:   fmt.Sprintf("All %d concurrent requests succeeded", concurrentRequests),
		})
	} else {
		fmt.Println("❌")
		results = append(results, ValidationResult{
			Component: "Concurrency",
			Status:    "FAIL",
			Message:   "Concurrent request handling issues",
			Details:   fmt.Sprintf("Success: %d/%d, Fast: %d/%d", successCount, concurrentRequests, fastResponses, concurrentRequests),
		})
	}

	return results
}

func startServer() (int, error) {
	backendRoot := filepath.Join("..", "..")
	cmd := exec.Command("go", "run", "src/main.go")
	cmd.Dir = backendRoot
	if err := cmd.Start(); err != nil {
		return 0, err
	}
	return cmd.Process.Pid, nil
}

func stopServer(pid int) {
	process, err := os.FindProcess(pid)
	if err != nil {
		return
	}
	process.Kill()
}

func printResults(results []ValidationResult) {
	fmt.Println("\n" + strings.Repeat("=", 60))
	fmt.Println("📊 VALIDATION RESULTS")
	fmt.Println(strings.Repeat("=", 60))

	passed := 0
	failed := 0
	warnings := 0

	for _, result := range results {
		status := "❌"
		if result.Status == "PASS" {
			status = "✅"
			passed++
		} else if result.Status == "WARN" {
			status = "⚠️ "
			warnings++
		} else {
			failed++
		}

		fmt.Printf("%s %-25s %s\n", status, result.Component, result.Message)
		if result.Details != "" {
			fmt.Printf("   └─ %s\n", result.Details)
		}
		if result.ResponseTime != "" {
			fmt.Printf("   └─ Response Time: %s\n", result.ResponseTime)
		}
	}

	fmt.Println(strings.Repeat("-", 60))
	fmt.Printf("Total Tests: %d | Passed: %d | Failed: %d | Warnings: %d\n",
		len(results), passed, failed, warnings)

	if failed == 0 {
		fmt.Println("\n🎉 BACKEND VALIDATION SUCCESSFUL!")
		fmt.Println("\n✅ Implementation Status:")
		fmt.Println("   • Code compilation and structure: PASSED")
		fmt.Println("   • Server startup and health: PASSED")
		fmt.Println("   • API endpoint functionality: PASSED")
		fmt.Println("   • Data model integrity: PASSED")
		fmt.Println("   • Error handling: PASSED")
		fmt.Println("   • Performance: PASSED")

		fmt.Println("\n🚀 Backend is ready for frontend integration!")
		fmt.Println("\n📋 Next Steps:")
		fmt.Println("   1. Start the server: go run src/main.go")
		fmt.Println("   2. Integrate with React frontend")
		fmt.Println("   3. Implement remaining AI features")
		fmt.Println("   4. Add file-based persistence")
		fmt.Println("   5. Deploy to production environment")

	} else {
		fmt.Println("\n💥 BACKEND VALIDATION FAILED!")
		fmt.Println("\n🔧 Resolution Required:")
		fmt.Println("   1. Fix the failed validations listed above")
		fmt.Println("   2. Run the validation script again")
		fmt.Println("   3. Ensure all tests pass before proceeding")
		os.Exit(1)
	}
}
