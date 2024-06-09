FROM golang:1.21

WORKDIR /email-service

COPY go.mod go.sum ./
RUN go mod download

COPY ./ ./

EXPOSE ${PORT}

RUN go build -o ./email-service-exec ./cmd/main.go

RUN chmod +x ./email-service-exec

ENV EMAIL_ADDRESS=${EMAIL_ADDRESS}
ENV EMAIL_PASSWORD=${EMAIL_PASSWORD}
ENV SMTP_HOST=${SMTP_HOST}
ENV SMTP_PORT=${SMTP_PORT}
ENV PORT=${PORT}

CMD ./email-service-exec