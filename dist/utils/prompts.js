"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackSummarizer = void 0;
// src/utils/prompts.ts
const feedbackSummarizer = (feedback) => {
    return `
  [INST]You are a feedback summarizer specializing in summarizing and classifying feedback into sentiments.
  Summarize multiple similar comments into one. Write your summary in the third person perspective.
  Classify the summary points into the following sentiments and don't make your own:
  Mixed, Neutral, Constructive, Appreciative, Negative, Suggestive, Criticism
  
  Determine the overall sentiment of the feedback based on the weight of each sentiment category.
  
  [/INST]
  <s>Feedback to evaluate: ${feedback}</s>
  [INST]Format your analysis as the following JSON object:
  {
    "overallSentiment": "[INST]Determine and provide the overall sentiment of the feedback.[/INST]",
    "suggestions": "[INST]Provide suggestions for improvement on the provided feedback to increase the quality of the feedback.[/INST]",
    "overallSummary": "[INST]Provide a concise summary of the entire feedback, capturing the main points and overall tone.[/INST]",
    "sentimentPercentages": {
      "Mixed": "[INST]Calculate the raw percentage of Mixed sentiment based on summary points. Normalize percentages to ensure they sum up to 100%.[/INST]",
      "Neutral": "[INST]Calculate the raw percentage of Neutral sentiment based on summary points. Normalize percentages to ensure they sum up to 100%.[/INST]",
      "Constructive": "[INST]Calculate the raw percentage of Constructive sentiment based on summary points. Normalize percentages to ensure they sum up to 100%.[/INST]",
      "Appreciative": "[INST]Calculate the raw percentage of Appreciative sentiment based on summary points. Normalize percentages to ensure they sum up to 100%.[/INST]",
      "Negative": "[INST]Calculate the raw percentage of Negative sentiment based on summary points. Normalize percentages to ensure they sum up to 100%.[/INST]",
      "Suggestive": "[INST]Calculate the raw percentage of Suggestive sentiment based on summary points. Normalize percentages to ensure they sum up to 100%.[/INST]",
      "Criticism": "[INST]Calculate the raw percentage of Criticism sentiment based on summary points. Normalize percentages to ensure they sum up to 100%.[/INST]"
    },
    "sentimentQualitativeAssessment": "[INST]Provide a qualitative assessment of the overall sentiment distribution, considering the calculated percentages and overall tone of the feedback.[/INST]",
    "summary": [
      {
        "sentiment": "[INST]One of<Mixed/Neutral/Constructive/Appreciative/Negative/Suggestive/Criticism>[/INST]",
        "summaryPoints": "[[INST]Summarize the feedback for the said sentiment in the third person perspective and create a list.[/INST]]"
      }
    ]
  }
  [/INST]
  [INST]The response will be parsed, so ensure it is a JSON object only, following the given format with no extra context.[/INST]
  `;
};
exports.feedbackSummarizer = feedbackSummarizer;
