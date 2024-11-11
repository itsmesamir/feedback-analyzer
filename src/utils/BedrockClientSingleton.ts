import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";
import { fromEnv } from "@aws-sdk/credential-providers";

class BedrockClientSingleton {
  private static instance: BedrockRuntimeClient;

  private constructor() {}

  public static getInstance(): BedrockRuntimeClient {
    // console.log("Getting Bedrock client instance");
    // console.log("AWS_REGION:", process.env.AWS_REGION);
    // console.log("credentials:", fromEnv());
    if (!BedrockClientSingleton.instance) {
      BedrockClientSingleton.instance = new BedrockRuntimeClient({
        credentials: fromEnv(),
        region: process.env.AWS_REGION,
      });
    }
    return BedrockClientSingleton.instance;
  }

  public static async invokeModel(input: InvokeModelCommandInput) {
    const command = new InvokeModelCommand(input);
    try {
      const client = BedrockClientSingleton.getInstance();
      return await client.send(command);
    } catch (error) {
      console.error("Error invoking model:", error);
      throw error;
    }
  }
}

export default BedrockClientSingleton;
