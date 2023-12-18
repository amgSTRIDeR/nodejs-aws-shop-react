import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as deployment from 'aws-cdk-lib/aws-s3-deployment';


const app = new cdk.App();

const stack = new cdk.Stack(app, 'S3ReactStack', {});

const originAccessIdentity = new cloudfront.OriginAccessIdentity(
  stack,
  'S3-React-OAI'
);

const siteBucket = new s3.Bucket(stack, 'S3ReactBucket', {
  bucketName: 'task3-frontend-bucket-st',
  autoDeleteObjects: true,
  publicReadAccess: false,
  websiteIndexDocument: 'index.hml',
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

siteBucket.addToResourcePolicy(
  new iam.PolicyStatement({
    actions: ['S3:GetObject'],
    resources: [siteBucket.arnForObjects('*')],
    principals: [
      new iam.CanonicalUserPrincipal(
        originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
      ),
    ],
  })
);

const clFr = new cloudfront.CloudFrontWebDistribution(
  stack,
  'clFr-distribution',
  {
    originConfigs: [
      {
        s3OriginSource: {
          s3BucketSource: siteBucket,
          originAccessIdentity: originAccessIdentity,
        },
        behaviors: [
          {
            isDefaultBehavior: true,
          },
        ],
      },
    ],
  }
);

new deployment.BucketDeployment(stack, 'clFrDeploymebt', {
  sources: [deployment.Source.asset('./dist')],
  destinationBucket: siteBucket,
  distribution: clFr,
  distributionPaths: ['/*'],
});
