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

exports.handler = async (event:APIGatewayProxyEvent) => {
  try {
    console.log(event)
    console.log(table)
    if (typeof event.body !== "string") {
      return { statusCode: 400 }
    }
    let requestBody = JSON.parse(event.body);

    params.Item = {
      id: uuid(),
      created: moment(event.requestContext.requestTimeEpoch).format('YYYY-MM-DD hh:mm:ss'),
      ...requestBody
    };

    let data = await docClient.put(params).promise();
    console.log("Created entry", data)
    return {
      statusCode: 201,
      body: JSON.stringify(data)
    }
  } catch (err) {
    console.log(JSON.stringify(err))
    return {
      statusCode: 500
    }
  }
}

