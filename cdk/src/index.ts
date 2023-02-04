import * as AWSXRay from 'aws-xray-sdk';
import * as AWSSDK from 'aws-sdk';
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";

const moment = require('moment');
const AWS = AWSXRay.captureAWS(AWSSDK);
const docClient = new AWS.DynamoDB.DocumentClient();

const table = process.env.DYNAMODB || "undefined"

let params = {
  TableName : table,
  Item: {}
}
let requestBody = {}
exports.handler = async (event:APIGatewayProxyEvent) => {
  try {
    if (typeof event.body !== "string") {
      return { statusCode: 400 }
    }
    requestBody = JSON.parse(event.body);

    params.Item = {
      id: uuid(),
      created: moment(event.requestContext.requestTimeEpoch).format('YYYY-MM-DD hh:mm:ss'),
      ...requestBody
    };

    const data = await docClient.put(params).promise();
    const headers = {
      "Access-Control-Allow-Origin": "*",
    };
    return { statusCode: 201, headers: headers }
  } catch (err) {
    console.log(JSON.stringify(err))
    return { statusCode: 500 }
  }
}
