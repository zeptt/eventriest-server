package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/redis/go-redis/v9"

	utils "cache-server/cmd/utils"
)

// Handles the request and caches the response if the X-Cache header is set
// If the X-Cache header is not set, it forwards the request to the cache server
func HandleRequest(w http.ResponseWriter, r *http.Request, client *CacheClient) {
	// Get the X-Cache header from the request
	cacheHeader := r.Header.Get("X-Cache")

	// Checkout early if the X-Cache header is not set
	if cacheHeader == "" {
		handler(w, r, client)
		return
	}

	// Get the cache key for the request
	cacheKey := utils.BuildCacheKey(r)

	// Check if the response is in the cache
	cachedResponse, err := client.client.Get(r.Context(), cacheKey).Result()

	fmt.Println("Cache Key: ", cacheKey, "Cache Header: ", cacheHeader)

	if err == redis.Nil {
		// CACHE HIT
		fmt.Println("Cache miss")
		handler(w, r, client)
	} else {
		// CACHE MISS
		fmt.Println("Cache hit")
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cachedResponse))
	}
}

// Handles the request by forwarding it to the cache server and caching the response
// If the X-Cache header is not set, it forwards the request to the cache server and doesn't cache the response
// The response is cached in Redis with the cache key and TTL
// The cache key is built using the request path and session ID
func handler(w http.ResponseWriter, r *http.Request, c *CacheClient) {
	// Build the URL to the cache server
	URL, _ := url.Parse(c.cacheClientURL)
	r.URL.Scheme = URL.Scheme
	r.URL.Host = URL.Host
	r.URL.Path = utils.SingleJoiningSlash(URL.Path, r.URL.Path)
	r.RequestURI = ""

	// Set the X-Forwarded-For header to the client's IP address
	r.Header.Set("X-Forwarded-For", r.RemoteAddr)

	// Create a new HTTP client
	httpClient := &http.Client{}

	// Execute the request
	resp, err := httpClient.Do(r)

	// Handle any errors
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Read the response body
	body, err := io.ReadAll(resp.Body)

	// Handle any errors
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Close the response body
	resp.Body.Close()

	// Copy the response headers and status code to the client's response
	utils.CopyHeader(w.Header(), resp.Header)
	w.WriteHeader(resp.StatusCode)
	w.Write(body)

	// If the response is not cacheable, return early
	if r.Header.Get("X-Cache") == "" {
		return
	}

	// Build the cache key
	cacheKey := utils.BuildCacheKey(r)

	fmt.Println("Caching response for key: ", cacheKey)

	// Get the cache TTL
	cacheTTL := utils.GetTTLTimeForCache(r)

	// Set the response in the cache (Redis)
	c.client.Set(r.Context(), cacheKey, string(body), time.Second*time.Duration(cacheTTL))
}
