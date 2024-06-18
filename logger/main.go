package main

import (
	"fmt"
	"log"
	"logger/parse_env"
	"os"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cloudwatchlogs"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/google/uuid"
)

var (
	cwl           *cloudwatchlogs.CloudWatchLogs
	logGroupName  = "eventriest-logs"
	logStreamName = ""
	sequenceToken = ""
)

func init() {
	sess, err := session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region:      aws.String("ap-south-1"),
			Credentials: credentials.NewEnvCredentials(),
		},
	})

	if err != nil {
		panic(err)
	}

	cwl = cloudwatchlogs.New(sess)

	err = ensureLogGroupExists(logGroupName)

	if err != nil {
		panic(err)
	}
}

func main() {
	env, err := parse_env.ParseEnv()

	if err != nil {
		panic(err)
	}

	config := kafka.ConfigMap{"bootstrap.servers": env.KAFKA_SERVER_URL, "group.id": env.KAFKA_GROUP_ID, "go.events.channel.enable": true}

	consumer, consumerCreateErr := kafka.NewConsumer(&config)

	if consumerCreateErr != nil {
		fmt.Println("consumer not created ", consumerCreateErr.Error())
		os.Exit(1)
	}

	subscriptionErr := consumer.Subscribe(env.KAFKA_TOPIC, nil)

	if subscriptionErr != nil {
		fmt.Println("Unable to subscribe to topic " + env.KAFKA_TOPIC + " due to error - " + subscriptionErr.Error())
		os.Exit(1)
	} else {
		fmt.Println("subscribed to topic ", env.KAFKA_TOPIC)
	}

	go processQueue(consumer)

	// to stop the code from exiting
	wg := sync.WaitGroup{}
	wg.Add(1)
	wg.Wait()
}

// ensureLogGroupExists first checks if the log group exists,
// if it doesn't it will create one.
func ensureLogGroupExists(name string) error {
	resp, err := cwl.DescribeLogGroups(&cloudwatchlogs.DescribeLogGroupsInput{})
	if err != nil {
		return err
	}

	for _, logGroup := range resp.LogGroups {
		if *logGroup.LogGroupName == name {
			return nil
		}
	}

	_, err = cwl.CreateLogGroup(&cloudwatchlogs.CreateLogGroupInput{
		LogGroupName: &name,
	})
	if err != nil {
		return err
	}

	_, err = cwl.PutRetentionPolicy(&cloudwatchlogs.PutRetentionPolicyInput{
		RetentionInDays: aws.Int64(14),
		LogGroupName:    &name,
	})

	return err
}

// createLogStream will make a new logStream with a random uuid as its name.
func createLogStream() error {
	name := "eventriest-" + uuid.New().String() + "-" + "logStream"

	_, err := cwl.CreateLogStream(&cloudwatchlogs.CreateLogStreamInput{
		LogGroupName:  &logGroupName,
		LogStreamName: &name,
	})

	logStreamName = name

	return err
}

// processQueue will process the log queue
func processQueue(consumer *kafka.Consumer) error {
	var logQueue []*cloudwatchlogs.InputLogEvent

	for {
		fmt.Println("waiting for event...")
		kafkaEvent := <-consumer.Events()
		if kafkaEvent != nil {
			switch event := kafkaEvent.(type) {
			case *kafka.Message:
				log := string(event.Value)
				logQueue = append(logQueue, &cloudwatchlogs.InputLogEvent{
					Message:   &log,
					Timestamp: aws.Int64(time.Now().UnixNano() / int64(time.Millisecond)),
				})
			case kafka.Error:
				fmt.Println("Consumer error ", event.String())
			case kafka.PartitionEOF:
				fmt.Println(kafkaEvent)
			default:
				fmt.Println(kafkaEvent)
			}
		} else {
			fmt.Println("Event was null")
		}

		if len(logQueue) > 0 {
			input := cloudwatchlogs.PutLogEventsInput{
				LogEvents:    logQueue,
				LogGroupName: &logGroupName,
			}

			if sequenceToken == "" {
				err := createLogStream()
				if err != nil {
					panic(err)
				}
			} else {
				input = *input.SetSequenceToken(sequenceToken)
			}

			input = *input.SetLogStreamName(logStreamName)

			resp, err := cwl.PutLogEvents(&input)
			if err != nil {
				log.Println(err)
			}

			if resp != nil {
				sequenceToken = *resp.NextSequenceToken
			}

			logQueue = []*cloudwatchlogs.InputLogEvent{}
		}

		time.Sleep(time.Second * 5)
	}

}
