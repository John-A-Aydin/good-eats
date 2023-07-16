import aws from "aws-sdk";
import { env } from "~/env.mjs";
import { createId } from "@paralleldrive/cuid2";
// TODO In aws settings change CORS config to only allow my url
const region = "us-east-1";
const bucketName = "good-eats-recipe-pics";
const accessKeyId = env.AWS_ACCESS_KEY_ID;
const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4'
});

export async function generateUploadUrl() {
  const imageName = createId();

  const params = ({
    Bucket: bucketName,
    Key: imageName,
    Expires: 1800 // 30 minutes (may need to change)
  });

  const uploadURL = await s3.getSignedUrlPromise('putObject', params);
  return { uploadURL, imageName };
};