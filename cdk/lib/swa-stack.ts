import {CfnOutput, RemovalPolicy, Size, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import {BillingMode, StreamViewType} from 'aws-cdk-lib/aws-dynamodb'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import {DynamoEventSource} from "aws-cdk-lib/aws-lambda-event-sources";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ses from 'aws-cdk-lib/aws-ses';
import { SES_EMAIL_IDENTITY } from '../env';
import {BlockPublicAccess, Bucket} from "aws-cdk-lib/aws-s3";
import {Distribution, S3OriginAccessControl, Signing, ViewerProtocolPolicy} from "aws-cdk-lib/aws-cloudfront";
import {S3BucketOrigin} from "aws-cdk-lib/aws-cloudfront-origins";
import {BucketDeployment, Source} from "aws-cdk-lib/aws-s3-deployment";
import path = require("path");

export class SwaStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const dynamodbTable = new dynamodb.Table(this, "Table", {
                partitionKey: {name: "id", type: dynamodb.AttributeType.STRING},
                removalPolicy: RemovalPolicy.DESTROY,
                billingMode: BillingMode.PAY_PER_REQUEST,
                stream: StreamViewType.NEW_IMAGE
            }
        )

        const lambdaApiGateway = new lambda.Function(this, "lambdaFunction", {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset("src/form-endpoint"),
            tracing: lambda.Tracing.ACTIVE,
            environment: {
                DYNAMODB: dynamodbTable.tableName
            },
        })

        // Write permissions for Lambda
        dynamodbTable.grantWriteData(lambdaApiGateway)

        const api = new apigateway.RestApi(this, "RestAPI", {
            deployOptions: {
                dataTraceEnabled: true,
                tracingEnabled: true
            },
        })

        const endpoint = api.root.addResource("contact")
        const endpointMethod = endpoint.addMethod("POST", new apigateway.LambdaIntegration(lambdaApiGateway))

        const identity = new ses.EmailIdentity(this, 'Identity', {
            identity: ses.Identity.email(SES_EMAIL_IDENTITY)
        });

        // Lambda Function to read from Stream
        const lambdaReadStream = new lambda.Function(this, "readStream", {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: "handler.handler",
            code: lambda.Code.fromAsset("src/form-table-trigger"),
            tracing: lambda.Tracing.ACTIVE,
            environment: {
                DYNAMODB: dynamodbTable.tableName,
                VERIFIED_EMAIL: SES_EMAIL_IDENTITY,
                REGION: identity.env.region
            },
        })

        // Write permissions for Lambda
        dynamodbTable.grantReadWriteData(lambdaReadStream);

        // Event Source Mapping DynamoDB -> Lambda
        lambdaReadStream.addEventSource(new DynamoEventSource(dynamodbTable, {
            startingPosition: lambda.StartingPosition.TRIM_HORIZON,
            batchSize: 10,
            retryAttempts: 0
        }))

        lambdaReadStream.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['ses:SendEmail', 'ses:SendRawEmail', 'ses:SendTemplatedEmail'],
            resources: ['*']
        }))

        const frontendBucket = new Bucket(this, 'FrontendBucket', {
            publicReadAccess: true, // Allows public access for static website
            blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, // Allow public access through bucket policies
            removalPolicy: RemovalPolicy.DESTROY, // Use RemovalPolicy.RETAIN in production
            autoDeleteObjects: true, // Remove this in production
        });

        // Create the Origin Access Control (OAC)
        const originAccessControl = new S3OriginAccessControl(this, 'MyOAC', {
            signing: Signing.SIGV4_NO_OVERRIDE
        });

        // Get the S3 bucket and OAC from the S3 Bucket stack
        const s3Origin = S3BucketOrigin.withOriginAccessControl(frontendBucket, {
            originAccessControl
        });

        const distribution = new Distribution(this, 'CloudfrontDistribution', {
            defaultBehavior: {
                origin: s3Origin,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
            ],
        });

        const bucketDeployment = new BucketDeployment(this, 'BucketDeployment', {
            sources: [Source.asset(path.join(__dirname, '..','/src/ui/dist'), { exclude: ["appSettings.json"]})],
            destinationBucket: frontendBucket,
            distribution,
            distributionPaths: ['/*'],
            memoryLimit: 2048,
            ephemeralStorageSize: Size.gibibytes(2),
            retainOnDelete: false // Ensure the files are deleted with the bucket
        });

        const appSettings = { API : api.url }
        bucketDeployment.addSource(Source.jsonData("appSettings.json", appSettings))

        // Outputs
        new CfnOutput(this, 'SESEmailIdentity', {value: identity.emailIdentityName});
        new CfnOutput(this, 'DynamoDbTableName', {value: dynamodbTable.tableName});
        new CfnOutput(this, 'ApiGatewayLambdaFunctionArn', {value: lambdaApiGateway.functionArn});
        new CfnOutput(this, 'LambdaDynamodbFunctionArn', {value: lambdaReadStream.functionArn});
        new CfnOutput(this, "ApiUrlOutput", {value: api.url});
        new CfnOutput(this, "EndpointOutput", {value: api.url + endpoint.path.replace("/", "")});
        new CfnOutput(this, 'CloudFrontURL', {
            value: distribution.domainName,
            description: 'The distribution URL',
            exportName: 'CloudfrontURL',
        });
        new CfnOutput(this, 'BucketName', {
            value: frontendBucket.bucketName,
            description: 'The name of the S3 bucket',
            exportName: 'BucketName',
        });
    }
}
