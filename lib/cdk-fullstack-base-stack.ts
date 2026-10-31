import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class CdkFullstackBaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   // 1. S3 Bucket for frontend static site or general storage
    const assetsBucket = new s3.Bucket(this, 'FullStackAssetsBucket', {
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change for production
      //autoDeleteObjects: true,                  // Convenient for dev environments
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // 2. DynamoDB Table for application data
    const dataTable = new dynamodb.Table(this, 'FullStackDataTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change for production
    });

    // 3. Backend Lambda Function
    const apiHandler = new lambda.Function(this, 'FullStackApiHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "Hello from the full-stack backend!" }),
          };
        };
      `),
      handler: 'index.handler',
      environment: {
        TABLE_NAME: dataTable.tableName,
      },
    });

    // Grant Lambda read/write access to DynamoDB
    dataTable.grantReadWriteData(apiHandler);

    // 4. API Gateway REST API connected to the Lambda
    const api = new apigateway.LambdaRestApi(this, 'FullStackApi', {
      handler: apiHandler,
      proxy: true,
    });

    // Outputs for your frontend configuration
    new cdk.CfnOutput(this, 'BucketNameOutput', { value: assetsBucket.bucketName });
    new cdk.CfnOutput(this, 'TableNameOutput', { value: dataTable.tableName });
    new cdk.CfnOutput(this, 'ApiUrlOutput', { value: api.url });
  }
}
