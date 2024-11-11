import BedrockClientSingleton from "./BedrockClientSingleton";
import { feedbackSummarizer } from "./prompts";

export function parseFeedback(response: ArrayBuffer | SharedArrayBuffer) {
  const decodedResponse = new TextDecoder().decode(response);

  const jsonParsed = JSON.parse(decodedResponse);

  const {
    outputs: [output],
  } = jsonParsed;

  // Use a regex to extract only the JSON portion from `output.text`
  const jsonMatch = output.text.match(/{(?:[^{}]|{[^{}]*})*}/);

  if (!jsonMatch || jsonMatch.length === 0) {
    throw new Error("Valid JSON object not found in the response text");
  }

  const innerParsed = JSON.parse(jsonMatch[0]);

  return innerParsed;
}

export const analyzeFeedback = async (feedback: string) => {
  const modelId = process.env.LLM_MODEL_ID;

  // const error = new Error("Too many requests") as unknown as any;
  // error.$metadata = { httpStatusCode: 429 };
  // throw error;

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
    throw error;
  }
};
