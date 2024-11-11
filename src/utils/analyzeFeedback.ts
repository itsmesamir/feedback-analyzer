import BedrockClientSingleton from "./BedrockClientSingleton";
import { feedbackSummarizer } from "./prompts"; // Importing the feedback summarization prompt

export function parseFeedback(response: ArrayBuffer | SharedArrayBuffer) {
  const decodedResponse = new TextDecoder().decode(response);

  const jsonParsed = JSON.parse(decodedResponse);

  const {
    outputs: [output],
  } = jsonParsed;

  return JSON.parse(output.text);
}

export const analyzeFeedback = async (feedback: string) => {
  const modelId = process.env.LLM_MODEL_ID;

  if (!modelId) {
    throw new Error("LLM_MODEL_ID is not defined");
  }

  const prompt = feedbackSummarizer(feedback);

  const input = {
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      temperature: 0,
      top_p: 1,
      max_tokens: 4050,
      prompt,
    }),
  };

  try {
    const response = await BedrockClientSingleton.invokeModel(input);

    const resultBody = parseFeedback(response.body);

    return resultBody;
  } catch (error) {
    console.error("Error analyzing feedback:", error);
    throw error;
  }
};
