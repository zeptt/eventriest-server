FROM golang:1.22.2

WORKDIR /logger

COPY go.mod go.sum ./
RUN go mod download

COPY ./ ./

RUN go build -o ./logger-exec .

RUN chmod +x ./logger-exec

ENV KAFKA_SERVER_URL=${KAFKA_SERVER_URL}
ENV KAFKA_TOPIC=${KAFKA_TOPIC}
ENV KAFKA_GROUP_ID=${KAFKA_GROUP_ID}

CMD ./logger-exec