import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { VectorStoreRetrieverMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { PromptTemplate } from "@langchain/core/prompts";
import AWS from "aws-sdk";

const bucketName = process.env.BUCKET;


// Functions //
function readFromS3(sessionID)  {
    const s3 = new AWS.S3();
    const objectKey = sessionID + '_context.txt';
    const params = {
        Bucket: bucketName,
        Key: objectKey
    };
    const s3Object = s3.getObject(params).promise();
    console.log(s3Object.Body.toString());
    return s3Object.Body.toString();
}

function writeToS3(sessionID, data){
    const s3 = new AWS.S3();
    const objectKey = sessionID + '_context.txt';
    let params = {
        Bucket : bucketName,
        Key : objectKey,
        Body : data
    };
    s3.putObject(params);
    return
}

function parseString (conversationSnippet) {
    const regex = /### (Human|AI): (.+?)(?=\n### |$)/gs;
    let match;
    const partialResult = {};
  
    while ((match = regex.exec(conversationSnippet)) !== null) {
      const [, role, text] = match;
      partialResult[role] = text.trim();
    }
    
    return [
        {input: partialResult['Human']},
        {output: partialResult['AI']}
    ];
}

function historyConstructor (rawHistory) {
    const splittedHistory = rawHistory.split('\n\n\n');
    const formattedObjects = splittedHistory.map(parseString);
    const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
    const memory = new VectorStoreRetrieverMemory({
        vectorStoreRetriever: vectorStore.asRetriever(4),
        memoryKey: "history",
    });

    for (const [input, output] of formattedObjects) {
        memory.saveContext(input, output)
    };
    return memory
}


// Main Lambda function
exports.handler = async (event, context) => {
    // First, try to read history from s3 bucket
    const sessionID = event.sessionID;
    const prompt = event.prompt;
    let newInteraction = '\n\n\n' + prompt + '\n\n';
    let rawHistory = '';
    try {
        rawHistory = await readFromS3(sessionID)
    } catch (err) {
        console.log(err);
        console.log('Continuing without history...');
    }

    // Second, construct memory vectorstore if necessary
    let memory
    if (rawHistory =! ''){
        memory = historyConstructor(rawHistory);
    }

    const basePrompt = PromptTemplate.fromTemplate(
        `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.
        
        Relevant pieces of previous conversation:
        {history}
        
        (You do not need to use these pieces of information if not relevant)
        
        Current conversation:
        Human: {input}
        AI:`);
        

    // Third, instanciate model
    const model = new OpenAI({ temperature: 0.9 });
    const chain = new LLMChain({ llm: model, basePrompt, memory });

    // Fourth, retrieve results
    const response = await chain.call({ input: prompt });
    newInteraction += response; //concatenate to new interaction to store
    rawHistory += newInteraction;

    // Fifth, attempt to write to S3
    try {
        writeToS3(sessionID, rawHistory);
        console.log("Successfully wrote history for sessionID: " + sessionID)
    } catch (err) {
        console.log(err);
        console.log('Could not store chat history to S3.');
    }

    return response
};