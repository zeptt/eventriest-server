package utils

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
)

const MAX_CACHE_SIZE = 60

// Copies the headers from the source to the destination
func CopyHeader(dst, src http.Header) {
	for k, vv := range src {
		for _, v := range vv {
			dst.Add(k, v)
		}
	}
}

// Joining slashes between two strings
// Example: SingleJoiningSlash("a", "b") -> "a/b"
func SingleJoiningSlash(a, b string) string {
	aslash := strings.HasSuffix(a, "/")
	bslash := strings.HasPrefix(b, "/")
	switch {
	case aslash && bslash:
		return a + b[1:]
	case !aslash && !bslash:
		return a + "/" + b
	}
	return a + b
}

// Builds the cache key for the request based on the request path and session ID
// <path>-:-<session_id>
// Example: /api/v1/user-:-1234
// TODO: Make the session ID name configurable
func BuildCacheKey(r *http.Request) string {
	ck, _ := r.Cookie("connect.sid")

	if ck == nil {
		ck = &http.Cookie{
			Name:  "connect.sid",
			Value: "",
		}
	}

	cacheKey := fmt.Sprintf("%s-:-%s", r.URL.Path, ck.Value)

	return cacheKey
}

// Gets the TTL time for the cache
// If the X-Cache header is not set, the default value is 20 seconds
// The maximum TTL time is 60 seconds
// TODO: Make it configurable
func GetTTLTimeForCache(r *http.Request) int {
	cacheTTLString := r.Header.Get("X-Cache")

	cacheTTL, err := strconv.Atoi(cacheTTLString)

	if err != nil {
		cacheTTL = 20
	}

	cacheTTL = min(cacheTTL, MAX_CACHE_SIZE)

	return cacheTTL
}
