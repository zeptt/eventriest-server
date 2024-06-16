package main

import (
	"cache-server/cmd/parse_env"
	"fmt"
	"net/http"

	"github.com/redis/go-redis/v9"
)

// CacheClient represents a redis client and the cache server URL
type CacheClient struct {
	client         *redis.Client
	cacheClientURL string
}

// Creates a new CacheClient instance (redis)
func NewCacheClient(client *redis.Client, cacheClientURL string) *CacheClient {
	return &CacheClient{client: client, cacheClientURL: cacheClientURL}
}

func main() {
	// Parse the environment variables
	env, err := parse_env.ParseEnv()

	if err != nil {
		panic(err)
	}

	// Create a new redis client
	opt, err := redis.ParseURL(env.REDIS_URL)

	if err != nil {
		panic(err)
	}

	// Create a new CacheClient instance (redis)
	client := NewCacheClient(redis.NewClient(opt), env.CACHE_SERVER_URL)

	// Start the server on the specified port
	fmt.Printf("Starting cache server on port %d\n", env.PORT)

	if err := http.ListenAndServe(fmt.Sprintf("0.0.0.0:%d", env.PORT), http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		HandleRequest(w, r, client)
	})); err != nil {
		panic(err)
	}
}
