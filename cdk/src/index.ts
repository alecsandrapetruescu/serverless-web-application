import * as AWSXRay from 'aws-xray-sdk';
import * as AWSSDK from 'aws-sdk';
import { APIGatewayProxyEvent } from "aws-lambda";


const AWS = AWSXRay.captureAWS(AWSSDK);
const docClient = new AWS.DynamoDB.DocumentClient();

const table = process.env.DYNAMODB || "undefined"

let params = {
  TableName : table,
  Item: {
    id: "",
    subject: "test",
    message: ""
  }
}

exports.handler = async (event:APIGatewayProxyEvent) => {
  try {
    console.log(event)
    console.log(table)
    params.Item.id = Math.floor(Math.random() * Math.floor(10000000)).toString();
    params.Item.message = JSON.stringify(event);
    let data = await docClient.put(params).promise();
    return { body: JSON.stringify(data) }
  } catch (err) {
    return { error: err }
  }
}
