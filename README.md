# Upflowy
AI Engineer Tech Assessment

## 1. About
This is an AWS Lambda implementation of a conversational agent with a vectorstore-powered memory.

**Note**: The conversation history was created using my own Python RAG Agent [Immi Agent](https://francodegio-immigration-agent.hf.space/).

**Note 2**: Since the conversation history format was not specified, for simplicity's sake, I'm assuming that the format is:
```txt
### Human: ...
### AI: ...


### Human: ...
### AI: ...
```

## 2. Running the code
1. Create S3 bucket
```sh
$ sh 0-create-bucket.sh
```
2. Paste bucket name into `template.yaml` file at:
```yaml
Resources:
  function:
    Properties:
      Environment:
        Variables:
          BUCKET: lambda-artifacts-XXXX
```
3. Build layer
```sh
$ sh 1-build-layer.sh
```
4. Build Lambda
```sh
$ sam build
```
5. Modify the environment variables values in file `environment/env.json`
```json
{
    "function": {
        "OPENAI_API_KEY": "your-api-key",
        "BUCKET": "your-bucket-name"
    }
}
```
6. Upload the context file `events/1_context.txt` to the bucket using the AWS Console
7. Invoke the Lambda locally
```sh
$ sam local invoke -e events/event.json --env-vars environment/env.json
```
## 3. To Do
- [x] Install node packages
- [x] Create functions for S3 I/O
- [x] Conversation memory retriever
- [x] Lambda
- [x] SAM template
- [x] Create S3 bucket
- [x] Shell scripts for artefacts
- [ ] Read OPENAI_API_KEY from SecretsManager


## 4. Resources
- [read s3](https://dev.to/superiqbal7/readdownload-s3-files-using-lambda-functions-53k8)
- [vectorstore memory retriever](https://js.langchain.com/docs/modules/memory/types/vectorstore_retriever_memory)
- [blank nodejs lambda](https://github.com/awsdocs/aws-lambda-developer-guide/tree/main/sample-apps/blank-nodejs)

