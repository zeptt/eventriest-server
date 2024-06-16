FROM golang:1.21

WORKDIR /cache-service

COPY go.mod go.sum ./
RUN go mod download

COPY ./ ./

RUN go build -o ./cache-service-exec .

RUN chmod +x ./cache-service-exec

EXPOSE ${PORT}

ENV CACHE_SERVER_URL=${CACHE_SERVER_URL}
ENV REDIS_URL=${REDIS_URL}
ENV PORT=${PORT}

CMD ./cache-service-exec