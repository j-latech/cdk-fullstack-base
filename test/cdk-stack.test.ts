import { expect, test, describe } from 'vitest';
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { CdkFullstackBaseStack } from '../lib/cdk-fullstack-base-stack'; 



describe('MiniStack Local Infrastructure Complete Test Suite', () => {

  // ==========================================
  // 1. S3 BUCKET TESTS
  // ==========================================
  test('S3 Bucket exists with correct configurations', () => {
    const app = new cdk.App();
    const stack = new CdkFullstackBaseStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      VersioningConfiguration: Match.absent(),
    });

    template.hasResource('AWS::S3::Bucket', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
    });

    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  // ==========================================
  // 2. DYNAMODB TESTS
  // ==========================================
  test('DynamoDB Table has correct primary keys and billing configuration', () => {
    const app = new cdk.App();
    const stack = new CdkFullstackBaseStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    });

    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete'
    });

    template.resourceCountIs('AWS::DynamoDB::Table', 1);
  });

  // ==========================================
  // 3. LAMBDA FUNCTION TESTS
  // ==========================================
  test('Lambda Function is initialized with correct runtime, handler, and inline code', () => {
    const app = new cdk.App();
    const stack = new CdkFullstackBaseStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs20.x',
      Handler: 'index.handler',
      Code: {
        ZipFile: Match.stringLikeRegexp('Hello from the full-stack backend!')
      },
      Environment: {
        Variables: {
          TABLE_NAME: {
            Ref: Match.stringLikeRegexp('FullStackDataTable')
          }
        }
      }
    });

    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  // ==========================================
  // 4. IAM PERMISSIONS TEST
  // ==========================================
  test('Lambda has been granted Read/Write data actions to DynamoDB', () => {
    const app = new cdk.App();
    const stack = new CdkFullstackBaseStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith([
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem'
            ]),
            Effect: 'Allow'
          })
        ])
      }
    });
  });

  // ==========================================
  // 5. API GATEWAY ROUTING TEST
  // ==========================================
  test('API Gateway REST API is proxy-configured and targets the Lambda Function', () => {
    const app = new cdk.App();
    const stack = new CdkFullstackBaseStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'ANY',
      AuthorizationType: 'NONE',
      Integration: {
        IntegrationHttpMethod: 'POST',
        Type: 'AWS_PROXY'
      }
    });
  });

  // ==========================================
  // 6. DEPLOYMENT OUTPUT CONFIGURATIONS TEST
  // ==========================================
  test('Stack returns the required frontend deployment output configurations', () => {
    const app = new cdk.App();
    const stack = new CdkFullstackBaseStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.hasOutput('BucketNameOutput', {
      Value: { 'Ref': Match.stringLikeRegexp('FullStackAssetsBucket') }
    });

    template.hasOutput('TableNameOutput', {
      Value: { 'Ref': Match.stringLikeRegexp('FullStackDataTable') }
    });

    // Validates that the Value object itself looks like a structural Fn::Join template
    template.hasOutput('ApiUrlOutput', {
      Value: {
        'Fn::Join': Match.arrayWith([
          '',
          Match.arrayWith([
            'https://',
            { 'Ref': Match.stringLikeRegexp('FullStackApi') }
          ])
        ])
      }
    });
  });

});
