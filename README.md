## AWS Serverless web application

#### A high level overview of the services.

![serverless-web-application-web-form-services.jpg](serverless-web-application-web-form-services.jpg)
### Requirements
- [AWS account](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html)
- [Git](https://gist.github.com/alecsandrapetruescu/5aa99039842186ea8864d9ac10f73553)
- [AWS CLI](https://gist.github.com/alecsandrapetruescu/78a17b5c2e530787fea25814f6ccbc53)
- [Node.js version 18.x](https://gist.github.com/alecsandrapetruescu/9e5d1b02f2a9644b14257c101c8dd332)
- `cdk`: `npm install -g aws-cdk-lib`

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
4. Configure your AWS CLI to point to the AWS account and region where you want to deploy. You can run the following command to verify which AWS account you are currently logged on:
    ```
    aws sts get-caller-identity
    ```
5. In case CDK is used to deploy to your AWS account, you will have to bootstrap your account for the first deployment.
    ```
    cdk bootstrap <account-number>/<region>
    ```
    or 
    ```
    cdk bootstrap aws://<account-number>/<region>
    ```
6. Deploy the stack
    ```
    cdk deploy
    ```
   Once deployment completes, the REST API endpoint will be seen as an output. 
You will use this URL for testing/ making GET request.


#### How it works

This CDK application deploys an Amazon API Gateway REST API that uses a Lambda function as the backend integration to scan a Dynamodb table. 
The REST API and Lambda function both have X-Ray tracing enabled. 
X-Ray SDK is also integrated in the Lambda function to observe into the API call to the downstream Dynamodb table. 
You can view the X-Ray service map in the Amazon Cloudwatch console.


#### Testing

1. Retrieve the API Gateway URL from the `cdk deploy` output. It should look something like this
    ```
    SwaStack.RestAPIEndpointB14C3C54 = https://oi0pfit8c5.execute-api.eu-central-1.amazonaws.com/prod/
    ```
2. To make the GET request to scan your Dynamodb table, run:
    ```
    curl <your-restapi-endpoint-url>/contact
    # example
    curl -X POST https://oi0pfit8c5.execute-api.eu-central-1.amazonaws.com/prod/contact \
   -H "Content-Type: application/json" \
   -d '{"message": "your message"}'  
    ```
3. You will receive a response as follows:
    ```
    {}
    ```
4. Now, you can navigate to the [Amazon Cloudwatch console](https://console.aws.amazon.com/cloudwatch). 
5. Under **X-Ray traces**, you will see the service map that shows the entire journey of the POST request.

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

#### Serverless Land used patterns
- [API Gateway REST API to Lambda to DynamoDB with X-Ray](https://serverlessland.com/patterns/apigw-lambda-dynamodb-xray-cdk)
- [DynamoDB to Lambda](https://serverlessland.com/patterns/dynamodb-lambda-cdk)


----
Copyright (c) 2023
