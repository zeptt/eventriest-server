import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const PROTO_PATH = path.resolve(__dirname, "../../protos/email-service.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const email_service =
  grpc.loadPackageDefinition(packageDefinition).email_service;

const client = new (email_service as any).EmailService(
  process.env.EMAIL_SERVICE_ADDRESS,
  grpc.credentials.createInsecure()
);

export const SendEmail = (emailPayload: {
  to: string;
  subject: string;
  body: string;
  name: string;
  cc: string;
  bcc: string;
}) =>
  new Promise<{
    message: string;
    success: boolean;
    error: string;
  }>((resolve, reject) => {
    client.SendEmail(
      {
        to: emailPayload.to,
        subject: emailPayload.subject,
        body: emailPayload.body,
        name: emailPayload.name,
        cc: emailPayload.cc,
        bcc: emailPayload.bcc,
      },
      (
        err: any,
        response: {
          message: string;
          success: boolean;
          error: string;
        }
      ) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(response);
      }
    );
  });

export default client;
