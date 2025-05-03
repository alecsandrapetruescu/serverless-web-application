## AWS Serverless web application
[![Node.js CI [22.x]](https://github.com/alecsandrapetruescu/serverless-web-application/actions/workflows/node.js.yml/badge.svg)](https://github.com/alecsandrapetruescu/serverless-web-application/actions/workflows/node.js.yml)
[![CodeQL](https://github.com/alecsandrapetruescu/serverless-web-application/actions/workflows/codeql.yml/badge.svg)](https://github.com/alecsandrapetruescu/serverless-web-application/actions/workflows/codeql.yml)
[![Dependency Review](https://github.com/alecsandrapetruescu/serverless-web-application/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/alecsandrapetruescu/serverless-web-application/actions/workflows/dependency-review.yml)
#### A high level overview of the services.

![serverless-web-application-web-form-services.jpg](serverless-web-application-web-form-services.jpg)
### Requirements
- [AWS account](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html)
- [Git](https://gist.github.com/alecsandrapetruescu/5aa99039842186ea8864d9ac10f73553)
- [AWS CLI](https://gist.github.com/alecsandrapetruescu/78a17b5c2e530787fea25814f6ccbc53)
- [Configure AWS CLI](README_AWSCLI_CONFIGURATION.md)
- [Node.js version 22.x](https://gist.github.com/alecsandrapetruescu/9e5d1b02f2a9644b14257c101c8dd332)
- `cdk`: `npm install -g aws-cdk`
- `AWS SES` uses an email address as identity, hardcoded in [env.ts](./cdk/env.ts)
```
export const SES_EMAIL_IDENTITY = "Please fill in your email to be used for creating SES identity!"
```
### Limitations
- [Amazon SES sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)

### Deployment Instructions

1. Clone the GitHub repository:
    ``` 
    git clone https://github.com/alecsandrapetruescu/serverless-web-application.git
    ```
2. Open a terminal access directory `cdk`:
    ```
    cd cdk
    ```
3. Run pre-build steps: installing dependencies and compiling typescript to js:
    ```
    npm run prebuild
    ```
4. Run build steps for React app
    ```
    npm run buildUi
    ```
5. Configure your AWS CLI to point to the AWS account and region where you want to deploy. You can run the following command to verify which AWS account you are currently logged on:
    ```
    aws sts get-caller-identity
    ```
   * Response will look like:
   ```
   {
    "UserId": "...",
    "Account": "...", // <- should be copied for step 6.
    "Arn": "..."
   }
   ```
6. In case CDK is used to deploy to your AWS account, you will have to bootstrap your account for the first deployment.
    ```
    cdk bootstrap <account-number>/<region>
    ```
    or 
    ```
    cdk bootstrap aws://<account-number>/<region>
    ```
7. Deploy the stack
    ```
    cdk deploy
    ```
   Once deployment completes, the REST API endpoint will be seen as an output.
8. You will receive an email from AWS with subject containing `Email Address Verification Request`, you will need to
confirm that you are authorizing the email address.

#### How it works

This CDK application deploys:
* An Amazon API Gateway REST API that uses a Lambda function as the backend integration to 
insert in a Dynamodb table. 
* A Dynamodb table with stream functionality enabled and a trigger to invoke an AWS Lambda function every time an item is changed.
* The Lambda function configured for the Dynamodb table, processes a received event, afterwards sends an email using AWS SES
* The REST API and Lambda functions have X-Ray tracing enabled. 
X-Ray SDK is also integrated in the Lambda function to observe into the API call to the downstream Dynamodb table. 
You can view the X-Ray service map in the Amazon Cloudwatch console.
* React app to S3 configured with CloudFront

#### Testing

1. Retrieve from the `cdk deploy` `Outputs` the API Gateway URL. It should look something like this
    ```
    SwaStack.EndpointOutput = https://8ptakkuv9b.execute-api.eu-central-1.amazonaws.com/prod/contact
    ```
2. To make the POST request to submit to Dynamodb table and SES, run:
    ```
    curl <your-restapi-endpoint>
    # example
    curl -X POST https://8ptakkuv9b.execute-api.eu-central-1.amazonaws.com/prod/contact \
   -H "Content-Type: application/json" \
   -d '{ "emailTo" : "emailTo", "subject" : "your subject", "message": "your message"}'  
    ```
3. You will receive a response as follows:
    ```
   Status code 201
   Response body: no data
    ```
4. An email will be sent to the above `emailTo` 
5. Navigate to the [Amazon Cloudwatch console](https://console.aws.amazon.com/cloudwatch). 
6. Under **X-Ray traces**, you will see the service map that shows the entire journey of the request.
7. Retrieve from the `cdk deploy` `Outputs` the CloudFront URL, It should look something like this:
   ```
   SwaStack.CloudFrontURL = d3vrkgdyt1yawd.cloudfront.net
   ```
8. Go to a browser and access `d3vrkgdyt1yawd.cloudfront.net`, it will display
   ![contact-form.png](contact-form.png)
9. Fill in the `Contact form` and click `Send`, a thank you for contacting us email will be sent to the filled in `Email address`

#### Cleanup

Delete the stack

```
cdk destroy
```

#### Resources
- [Building a Serverless application](https://aws.amazon.com/getting-started/hands-on/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/)
- [Building a serverless contact form with AWS Lambda and AWS SES](https://awstip.com/building-a-serverless-contact-form-with-aws-lambda-and-aws-ses-6c07de5323)
- [Send Emails Serverlessly With Node.js, Lambda, and AWS SES](https://betterprogramming.pub/send-emails-serverlessly-with-node-js-lambda-and-aws-ses-186cba40d695)
- [Serverless patterns](https://serverlessland.com/patterns)
- [Contact form processing with Synchronous Express Workflows](https://github.com/aws-samples/contact-form-processing-with-synchronous-express-workflows)
- [Least deployment privilege with CDK Bootstrap](https://betterdev.blog/cdk-bootstrap-least-deployment-privilege/)
- [How do I send email using Lambda and Amazon SES?](https://aws.amazon.com/premiumsupport/knowledge-center/lambda-send-email-ses/)
- [How to send emails with SES in AWS CDK](https://bobbyhadz.com/blog/aws-ses-send-emails)
- [Deploy a React App with the AWS CDK](https://andrewevans.dev/blog/2023-02-21-deploy-a-react-app-with-the-aws-cdk/)
- [How to Deploy a React App with AWS CDK in S3](https://aws.plainenglish.io/how-to-deploy-a-react-app-with-aws-cdk-in-s3-aa9f8cb0e4a3)
- [Deploy your static React app to AWS CloudFront using CDK](https://paulallies.medium.com/deploy-your-static-react-app-to-aws-cloudfront-using-cdk-e53287e0052e)
#### Serverless Land used patterns
- [API Gateway REST API to Lambda to DynamoDB with X-Ray](https://serverlessland.com/patterns/apigw-lambda-dynamodb-xray-cdk)
- [DynamoDB to Lambda](https://serverlessland.com/patterns/dynamodb-lambda-cdk)


----
Copyright (c) 2025
