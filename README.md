# Upflowy
AI Engineer Tech Assessment

## About
This is an AWS Lambda implementation of a conversational agent with a vectorstore-powered memory.

**Note**: for simplicity's sake, I'm assuming that the conversation history format is:
```txt
### Human: ...
### AI: ...


### Human: ...
### AI: ...
```

## To Do
- [x] Install node packages
- [x] Create functions for S3 I/O
- [x] Conversation memory retriever
- [x] Lambda
- [x] SAM template
- [x] Create S3 bucket
- [x] Shell scripts for artefacts


## Resources
- [read s3](https://dev.to/superiqbal7/readdownload-s3-files-using-lambda-functions-53k8)
- [vectorstore memory retriever](https://js.langchain.com/docs/modules/memory/types/vectorstore_retriever_memory)
- [blank nodejs lambda](https://github.com/awsdocs/aws-lambda-developer-guide/tree/main/sample-apps/blank-nodejs)

