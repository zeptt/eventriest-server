package main

import (
	"context"
	"emailservice/cmd/email"
	pb "emailservice/proto"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"
	"strconv"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"google.golang.org/grpc"
	"google.golang.org/grpc/peer"
)

var (
	logProducer *kafka.Producer
	kafkaTopic  = "logger"
)

type EmailService struct {
	pb.UnimplementedEmailServiceServer
}

func (e *EmailService) SendEmail(ctx context.Context, in *pb.EmailRequest) (*pb.EmailResponse, error) {
	response, err := email.SendNewEmail(in)

	if err != nil {
		p, _ := peer.FromContext(ctx)

		value, err := json.Marshal(
			map[string]interface{}{
				"level":     "error",
				"message":   fmt.Sprintf("Failed to send email: %v", err),
				"timestamp": time.Now().Format(time.RFC3339),
				"meta": map[string]interface{}{
					"req": map[string]interface{}{
						"method": "SendEmail",
						"url":    "/emailservice.EmailService/SendEmail",
						"ip":     p.Addr.String(),
					},
				},
			},
		)

		if err != nil {
			fmt.Println("Failed to marshal message due to ", err)
		}

		producerErr := logProducer.Produce(&kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &kafkaTopic, Partition: kafka.PartitionAny},
			Value:          []byte(value),
		}, nil)

		if producerErr != nil {
			fmt.Println("Failed to produce message due to ", producerErr)
		}
	}

	return response, err
}

func main() {
	kafkaServer := os.Getenv("KAFKA_SERVER")
	topic := os.Getenv("KAFKA_TOPIC")

	if topic == "" {
		fmt.Println("KAFKA_TOPIC is not set")
		os.Exit(1)
	}

	kafkaTopic = topic

	producer, producerCreateErr := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": kafkaServer})

	if producerCreateErr != nil {
		fmt.Println("Failed to create producer due to ", producerCreateErr)
		os.Exit(1)
	}

	logProducer = producer

	if producerCreateErr != nil || logProducer == nil {
		fmt.Println("Failed to create producer due to ", producerCreateErr)
		os.Exit(1)
	}

	PORT, err := strconv.Atoi(os.Getenv("PORT"))

	if err != nil {
		log.Fatalf("failed to load port: %v", err)
	}

	lis, err := net.Listen("tcp", fmt.Sprintf("0.0.0.0:%d", PORT))

	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()

	pb.RegisterEmailServiceServer(s, &EmailService{})

	log.Printf("server listening at %v", lis.Addr())

	if err := s.Serve(lis); err != nil {
		fmt.Printf("Error: %v", err)
		log.Fatalf("failed to serve: %v", err)
	}
}
