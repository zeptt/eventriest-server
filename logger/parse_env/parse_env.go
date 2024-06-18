package parse_env

import (
	"fmt"
	"os"
)

type Envs struct {
	KAFKA_SERVER_URL string
	KAFKA_TOPIC      string
	KAFKA_GROUP_ID   string
}

// ParseEnv parses the environment variables and returns the Envs struct
// If any of the required environment variables are missing, it returns an error
func ParseEnv() (*Envs, error) {
	kafkaServer := os.Getenv("KAFKA_SERVER_URL")

	if kafkaServer == "" {
		return nil, fmt.Errorf("KAFKA_SERVER_URL is not set")
	}

	kafkaTopic := os.Getenv("KAFKA_TOPIC")

	if kafkaTopic == "" {
		return nil, fmt.Errorf("KAFKA_TOPIC is not set")
	}

	groupID := os.Getenv("KAFKA_GROUP_ID")

	if groupID == "" {
		return nil, fmt.Errorf("KAFKA_GROUP_ID is not set")
	}

	return &Envs{
		KAFKA_SERVER_URL: kafkaServer,
		KAFKA_TOPIC:      kafkaTopic,
		KAFKA_GROUP_ID:   groupID,
	}, nil
}
