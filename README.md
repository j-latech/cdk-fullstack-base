
#  AWS CDK Fullstack Base
## TypeScript AWS CDK Full-Stack Base Environment:  
## Objective: 
### The aim of this project is to set up a local AWS cloud environment using AWS CDK, AWS SDK and MiniStacks ( https://ministack.org/ ). MiniStacks is a docker that emulates an AWS cloud enviroment locally.   This repository will serve as the foundational blueprint for future projects, including upcoming full-stack demonstrations.   If interested, I can also setup the same project in both Python and C++.




This repository provides a verified boilerplate configuration to deploy a standard serverless full-stack baseline locally using **TypeScript**, **AWS CDK**, and **MiniStack / LocalStack**. 

The infrastructure maps out an **API Gateway REST API**, an **inline Node.js 20 Backend Lambda**, a **DynamoDB Table** (NoSQL), and an **S3 Assets Bucket**.

**Jody H. - JLatech@pm.me**

# Setup, Deploy and Test:

##  Architecture Components
- **API Gateway Entrypoint:** Proxies incoming requests directly down to your serverless code layer.
- **Compute Layer (Lambda):** Isolated handler configured with basic execution logic.
- **NoSQL Storage Layer (DynamoDB):** Flexible schema database configured with standard `pk`/`sk` key indexing.
- **Static Storage Layer (S3):** Bucket setup to store media assets or serve a frontend web application.

---

##  Prerequisites & Local Setup

Ensure you have **Docker** and the **AWS CLI** binary installed on your local machine before starting.

1. **Install the Local Infrastructure Wrapper Platform Globally:**

   **Bash:**
   ```bash
   npm install -g aws-cdk-local
   ```

2. **Initialize Local Mock AWS Profiles:**
   MiniStack wrapper execution commands expect a profile structure named `miniStacks`. Run these commands to generate your mock system profiles instantly:
   
  **Bash:**
  ```bash
   mkdir -p ~/.aws
   ```
   ```bash
cat <<EOF >> ~/.aws/credentials

[miniStacks]
aws_access_key_id = mock
aws_secret_access_key = mock
EOF
```

```bash
cat <<EOF >> ~/.aws/config

[profile miniStacks]
region = us-east-1
output = json
EOF
```



---

## Environment Initialization & Deployment

1. **Bootstrap the MiniStack Environment:**
   Prepares the internal container storage state so it can accept custom CloudFormation stack payloads.

   **Should only need to be done once:**
   ```bash
   export LSTK_ENDPOINT_URL=http://localhost:4566
   ```

   **Bash: Bootstrap**
   ```bash    
   lstk cdk bootstrap   
   ```
   **Legacy command:**
   ```bash
    
   cdklocal bootstrap
   ```
   

2. **Deploy the Infrastructure Blueprint:**
   Compiles your TypeScript layouts and spins up the serverless layers inside your local Docker setup instantly.   

   **Bash: Deploy**
   ```bash
   lstk cdk deploy --require-approval never
   ```
   **Legacy Command:**
   ```bash
   cdklocal deploy --require-approval never
   ```

On a successful deployment run, the terminal will spit out your stack configuration details:
```text
Outputs:
CdkFullstackBaseStack.ApiUrlOutput = https://4bc1a91d.execute-api.us-east-1.amazonaws.com/prod/
CdkFullstackBaseStack.BucketNameOutput = cdkfullstackbasestack-fullstackassetsbucket6ebab8bdd4bf5574de94
CdkFullstackBaseStack.TableNameOutput = CdkFullstackBaseStack-FullStackDataTable2FBACE6A-ABEBF67C9998E
```

---

##  Integration & Verification Tests

Because these resources run inside a local docker mapping engine, perform these verification steps to prove the entire end-to-end setup is completely healthy.

### Test 1: Verify the Live API Gateway & Lambda Handler
Standard tools like `curl` cannot look up real `amazonaws.com` URLs locally. Route the request through `localhost:4566` using your unique generated REST API hash identifier (`4bc1a91d`):

**Bash:**
```bash
curl http://localhost:4566/restapis/<miniStack Id>/prod/_user_request_
```
Determine miniStack Id:
**Bash:**
```bash
aws --endpoint-url=http://localhost:4566 apigateway get-rest-apis
```
**Reponse:**
```bash
{
    "items": [
        {
            "id": "668d6627",
            "name": "FullStackApi",
            "description": "",
            "createdDate": "2026-11-01T08:10:20-05:00",
            "version": "",
            "binaryMediaTypes": [],
            "apiKeySource": "HEADER",
            "endpointConfiguration": {
                "types": [
                    "REGIONAL"
                ]
            },
            "tags": {
                "aws:cloudformation:stack-name": "CdkFullstackBaseStack",
                "aws:cloudformation:stack-id": "arn:aws:cloudformation:us-east-1:000000000000:stack/CdkFullstackBaseStack/3cb584d3-7eff-445d-997d-31f3d20c6c3a",
                "aws:cloudformation:logical-id": "FullStackApi8B473062"
            },
            "disableExecuteApiEndpoint": false
        }
    ]
}

in this example id is:    "id": "668d6627",
```
**For this Example:**
```bash
curl http://localhost:4566/restapis/668d6627/prod/_user_request_
```

- **Expected Success Response:** `{"message":"Hello from the full-stack backend!"}`

### Test 2: Write Data Test (DynamoDB Ingestion)
Verify the NoSQL database storage layer can successfully ingest and fetch record payloads using your generated table name output string:

**Bash:**
```bash
npx --package=@localstack/lstk lstk aws dynamodb put-item \
  --table-name CdkFullstackBaseStack-FullStackDataTable2FBACE6A-ABEBF67C9998E \
  --item '{"pk": {"S": "USER#100"}, "sk": {"S": "PROFILE"}, "name": {"S": "Clever Galileo"}, "role": {"S": "Developer"}}'
```
*(Note: A blank line return means the write transaction succeeded safely.)*

### Test 3: Read Data Test (DynamoDB Extraction)
Pull your record back out of the database engine to verify indexing, partitions, and storage durability function correctly:

```bash
npx --package=@localstack/lstk lstk aws dynamodb get-item \
  --table-name CdkFullstackBaseStack-FullStackDataTable2FBACE6A-ABEBF67C9998E \
  --key '{"pk": {"S": "USER#100"}, "sk": {"S": "PROFILE"}}'
```

### Test 4: Table Scan Read Test (Database Survey)
To list and review all items currently active inside the local table environment:

**Bash:**
```bash
npx --package=@localstack/lstk lstk aws dynamodb scan \
  --table-name CdkFullstackBaseStack-FullStackDataTable2FBACE6A-ABEBF67C9998E
```

---

## Troubleshooting & Engine Checks

- **Container Reset State:** If you restart your local docker container, the emulated parameter state will clear out. If you receive a `ParameterNotFound` error, simply re-run `cdklocal bootstrap` to restore the base tables.
- **View Container Logs Live:** If a deployment resource feels unresponsive, open an independent terminal window and watch the streaming output directly from your container:
  
  **Bash:**
  ```bash
  docker logs -f clever_galileo
  ```

  **Restart the ministack docker:**
  ```bash
  docker restart clever_galileo
  ```
  Note:   docker name may be different than clever_galileo

  **Get more info on running dockers:**
  ```bash
  docker ps
  ```
  


