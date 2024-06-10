package email

import (
	pb "emailservice/proto"
	"errors"
	"fmt"
	"net/smtp"
	"os"
)

type loginAuth struct {
	username, password string
}

func LoginAuth(username, password string) smtp.Auth {
	return &loginAuth{username, password}
}

func (a *loginAuth) Start(server *smtp.ServerInfo) (string, []byte, error) {
	return "LOGIN", []byte(a.username), nil
}

func (a *loginAuth) Next(fromServer []byte, more bool) ([]byte, error) {
	if more {
		switch string(fromServer) {
		case "Username:":
			return []byte(a.username), nil
		case "Password:":
			return []byte(a.password), nil
		default:
			return nil, errors.New("unknown from server")
		}
	}
	return nil, nil
}

func SendNewEmail(in *pb.EmailRequest) (*pb.EmailResponse, error) {
	from := os.Getenv("EMAIL_ADDRESS")
	password := os.Getenv("EMAIL_PASSWORD")

	to := []string{
		in.To,
	}

	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")

	auth := smtp.Auth(LoginAuth(from, password))

	body := ""

	body += "From: " + from + "\n"
	body += "To: " + in.To + "\n"
	body += "Subject: " + in.Subject + "\n"
	body += "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	body += in.Body

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, to, []byte(body))

	if err != nil {
		fmt.Printf("Error sending email: %v", err)
		return nil, err
	}

	fmt.Println("Email Sent!")

	return &pb.EmailResponse{
		Message: "Email sent successfully!",
		Success: true,
		Error:   "",
	}, nil
}
