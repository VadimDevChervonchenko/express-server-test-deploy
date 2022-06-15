# Sample Node App

This sample app demonstrates read operations on a GDN Key-Value collection.

## Prerequisites

1. A [Docker Desktop](https://docs.docker.com/get-docker/).
2. A [Docker Hub Account](https://hub.docker.com/) to manage the container images.
3. Node.js `v14.x.x` or above installed. We recommend installing Node with a version manager like [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) or [Volta](https://volta.sh/). Alternatively, you can install using Homebrew with` brew install node@14`.
4. A `Key-Value Collection` in your Macrometa GDN account/tenant.

## Build Docker container

Use the following commands to build and push the container image to the Docker hub. Update `macrometalabs/sample-node-app` with your Docker repository using the following commands:

```bash
$ git clone https://github.com/Macrometacorp/compute-samples.git
$ cd compute-samples/sample-node-app
$ docker build -t macrometalabs/sample-node-app . --platform=linux/amd64 --no-cache
$ docker push macrometalabs/sample-node-app:latest
```
## CLI Configuration

### 1. Install the CLI

The GDNSL CLI can be installed from [npm](https://www.npmjs.com/package/gdnsl).

```
npm install -g gdnsl
```

### Create a Macrometa API Key

Create an API key to deploy serverless microservices and make API calls to Macrometa.

If you already have an existing Macrometa account, you can generate an API key by visiting your dashboard and navigating to `Account` → `API Keys` → `New API Key`. 

If you don't have a Macrometa account, you can create a free developer account [here](https://auth.paas.macrometa.io/signup) to create an API key.

### Initialize the GDNSL CLI

To initialize the GDNSL CLI, navigate the directory you'd like to use and issue the following command:

```bash
$ gdnsl init
```

The CLI prompts you to enter your GDN URL, email address, and API key associated with your Macrometa account. Please use the default `GDN URL` of `https://gdn.paas.macrometa.io` unless you have a specific `GDN URL` that you would like to use.

Next, the CLI prompts you for the region you would like to deploy. When specifying a region, you may use `LOCAL`, `ALL`, or select from the available regions.

> 💡 If you would like to deploy to multiple regions, please use a comma-separated list.

Once you complete the initialization, the CLI saves a `gdnsl.yaml` configuration file in the directory.

![GDNSL CLI Init](https://i.imgur.com/c4bkk5C.png)

## Deploy Serverless Microservices Using the GDNSL CLI

Now that you've initialized the CLI, you can deploy the sample Node app in a Macrometa Compute environment using the following command:


```bash
$ gdnsl service create sample-node-app \
    --env URL_LOCAL_DB=c8db-coord-svc.c8.svc.cluster.local:8529 \
    --env COLLECTION_KV_NAME=<YOUR_KV_COLLECTION_NAME> \
    --env API_KEY=<YOUR_MACROMETA_API_KEY>\
    --image macrometalabs/sample-node-app:latest \
    --scale-min 1 --scale-max 5
```
## Helpful CLI Commands:

> 💡 Further documentation for CLI commands is located [here](https://macrometacorp.github.io/docs-gdnsl/).

### List Available services on Compute

```bash
$ gdnsl service list
```

### Show details for a service

```bash
$ gdnsl service describe sample-node-app
```

### Execute Service Endpoint

To execute the service, get the compute endpoint URL using the list endpoint:

```bash
$ gdnsl service list
```

Then use the compute endpoint URL to issue a cURL command:

```bash
$ curl -X 'GET' "https://<COMPUTE_ENDPOINT_URL>?key=<ADD_KEY_FROM_KV_COLLECTION>" --insecure
```

### Update Service Configuration

```bash
$ gdnsl service update sample-node-app \
    --env URL_LOCAL_DB=c8db-coord-svc.c8.svc.cluster.local:8529 \
    --env COLLECTION_KV_NAME=kv_collection_v2 \
    --env API_KEY=xxxx
```

### Delete the Service.

```bash
$ gdnsl service delete sample-node-app
```

## Resources

- [Macrometa CLI](https://macrometacorp.github.io/docs-gdnsl/)
- [Macrometa CLI Service](https://macrometacorp.github.io/docs-gdnsl/cmd/gdnsl_service)
