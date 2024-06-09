package main

import (
	"context"
	"emailservice/cmd/email"
	pb "emailservice/proto"
	"fmt"
	"log"
	"net"
	"os"
	"strconv"

	"google.golang.org/grpc"
)

type EmailService struct {
	pb.UnimplementedEmailServiceServer
}

func (e *EmailService) SendEmail(ctx context.Context, in *pb.EmailRequest) (*pb.EmailResponse, error) {
	return email.SendNewEmail(in)
}

func main() {
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
