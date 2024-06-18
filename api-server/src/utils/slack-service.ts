import axios from "axios";

const sendSlackAlarmMessage = async (message: string) => {
  console.log("Sending message to Slack");
  return axios.post(process.env.SLACK_WEBHOOK_URL!, {
    channel: process.env.SLACK_CHANNEL,
    userName: process.env.SLACK_USERNAME,
    text: message,
  });
};

export default sendSlackAlarmMessage;
