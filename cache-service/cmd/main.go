package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

type CacheClient struct {
	client         *redis.Client
	cacheClientURL string
}

func NewCacheClient(client *redis.Client, cacheClientURL string) *CacheClient {
	return &CacheClient{client: client, cacheClientURL: cacheClientURL}
}

const MAX_CACHE_SIZE = 60

func main() {
	p := os.Getenv("PORT")

	if p == "" {
		panic("PORT is required")
	}

	PORT, err := strconv.Atoi(p)

	if err != nil {
		panic(err)
	}

	REDIS_URL := os.Getenv("REDIS_URL")

	if REDIS_URL == "" {
		panic("REDIS_URL is required")
	}

	CACHE_SERVER_URL := os.Getenv("CACHE_SERVER_URL")

	if CACHE_SERVER_URL == "" {
		panic("CACHE_SERVER_URL is required")
	}

	opt, err := redis.ParseURL(REDIS_URL)
	if err != nil {
		panic(err)
	}

	client := NewCacheClient(redis.NewClient(opt), CACHE_SERVER_URL)

	fmt.Printf("Starting server on port %d\n", PORT)

	http.ListenAndServe(fmt.Sprintf("0.0.0.0:%d", PORT),
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			ck, _ := r.Cookie("connect.sid")
			if ck == nil {
				ck = &http.Cookie{
					Name:  "connect.sid",
					Value: "",
				}
			}

			cacheKey := fmt.Sprintf("%s-:-%s", r.URL.Path, ck.Value)

			cacheHeader := r.Header.Get("X-Cache")
			if cacheHeader == "" {
				handler(w, r, client)
				return
			}

			cachedResponse, err := client.client.Get(r.Context(), cacheKey).Result()

			fmt.Println("Cache Key: ", cacheKey, "Cache Header: ", cacheHeader)

			if err == redis.Nil {
				fmt.Println("Cache miss")
				handler(w, r, client)
			} else {
				fmt.Println("Cache hit")
				w.Header().Set("Content-Type", "application/json")
				w.Write([]byte(cachedResponse))
			}
		}),
	)
}

func handler(w http.ResponseWriter, r *http.Request, c *CacheClient) {
	URL, _ := url.Parse(c.cacheClientURL)
	r.URL.Scheme = URL.Scheme
	r.URL.Host = URL.Host
	r.URL.Path = singleJoiningSlash(URL.Path, r.URL.Path)
	r.RequestURI = ""

	r.Header.Set("X-Forwarded-For", r.RemoteAddr)

	httpClient := &http.Client{}

	resp, err := httpClient.Do(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	resp.Body.Close()

	copyHeader(w.Header(), resp.Header)
	w.WriteHeader(resp.StatusCode)
	w.Write(body)

	ck, _ := r.Cookie("connect.sid")

	if ck == nil {
		ck = &http.Cookie{
			Name:  "connect.sid",
			Value: "",
		}
	}

	cacheKey := fmt.Sprintf("%s-:-%s", r.URL.Path, ck.Value)

	fmt.Println("Caching response for key: ", cacheKey)

	cacheTTLString := r.Header.Get("X-Cache")

	cacheTTL, err := strconv.Atoi(cacheTTLString)

	if err != nil {
		cacheTTL = 20
	}

	cacheTTL = min(cacheTTL, MAX_CACHE_SIZE)

	c.client.Set(r.Context(), cacheKey, string(body), time.Second*time.Duration(cacheTTL))
}

func copyHeader(dst, src http.Header) {
	for k, vv := range src {
		for _, v := range vv {
			dst.Add(k, v)
		}
	}
}

func singleJoiningSlash(a, b string) string {
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
