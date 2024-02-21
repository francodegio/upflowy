import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { VectorStoreRetrieverMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { PromptTemplate } from "@langchain/core/prompts";

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});


// Functions //
async function readS3(sessionID)  {
    const bucketName = process.env.BUCKET;
    const objectKey = sessionID + '_context.txt';
    const params = {
        Bucket: bucketName,
        Key: objectKey
    };
    try {
        const s3Object = await s3.getObject(params).promise();
        console.log(s3Object.Body.toString());
        return s3Object.Body.toString();
    } catch (err) {
        console.log(err);
        return ''; //ensure a string is returned
    }
}





exports.handler = async (event, context) => {
    // First, try to read history from s3 bucket
    const sessionID = event.sessionID;
    let rawHistory = '';
    try {
        rawHistory = await readS3(sessionID)
    } catch (err) {
        console.log(err);
        console.log('Continuing without history...')
    }

    // Second, construct vectorstore memory
    const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
    const memory = new VectorStoreRetrieverMemory({
    vectorStoreRetriever: vectorStore.asRetriever(4),
    memoryKey: "history",
    });


};