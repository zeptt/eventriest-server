package parse_env

import (
	"errors"
	"os"
	"strconv"
)

type Envs struct {
	PORT             int
	REDIS_URL        string
	CACHE_SERVER_URL string
}

// ParseEnv parses the environment variables and returns the Envs struct
// If any of the required environment variables are missing, it returns an error
func ParseEnv() (*Envs, error) {
	p := os.Getenv("PORT")

	if p == "" {
		panic("PORT is required")
	}

	PORT, err := strconv.Atoi(p)

	if err != nil {
		return nil, err
	}

	REDIS_URL := os.Getenv("REDIS_URL")

	if REDIS_URL == "" {
		return nil, errors.New("REDIS_URL is required")
	}

	CACHE_SERVER_URL := os.Getenv("CACHE_SERVER_URL")

	if CACHE_SERVER_URL == "" {
		return nil, errors.New("CACHE_SERVER_URL is required")
	}

	return &Envs{
		PORT:             PORT,
		REDIS_URL:        REDIS_URL,
		CACHE_SERVER_URL: CACHE_SERVER_URL,
	}, nil
}
