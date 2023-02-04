import {CfnOutput, RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import {BillingMode, StreamViewType} from 'aws-cdk-lib/aws-dynamodb'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import {DynamoEventSource} from "aws-cdk-lib/aws-lambda-event-sources";

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
            runtime: lambda.Runtime.NODEJS_14_X,
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

        // Lambda Function to read from Stream
        const lambdaReadStream = new lambda.Function(this, "readStream", {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: "handler.handler",
            code: lambda.Code.fromAsset("src/form-table-trigger"),
            tracing: lambda.Tracing.ACTIVE,
            environment: {
                DYNAMODB: dynamodbTable.tableName
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

        // Outputs
        new CfnOutput(this, 'DynamoDbTableName', {value: dynamodbTable.tableName});
        new CfnOutput(this, 'ApiGatewayLambdaFunctionArn', {value: lambdaApiGateway.functionArn});
        new CfnOutput(this, 'LambdaDynamodbFunctionArn', {value: lambdaReadStream.functionArn});
    }
}
