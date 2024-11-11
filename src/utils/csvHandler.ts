import fs from "fs";
import csv from "csv-parser";
import { parse as json2csv } from "json2csv";

import { analyzeFeedback } from "./analyzeFeedback";
import { batchProcess, handleWithRetry } from "./batchProcess";

export const readCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const feedbacks: string[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => feedbacks.push(row))
      .on("end", () => resolve(feedbacks))
      .on("error", reject);
  });
};

export const writeCSV = (filePath: string, data: any[]): void => {
  const csvData = json2csv(data);
  fs.writeFileSync(filePath, csvData);
};

export const appendCSV = (filePath: string, data: any[]): void => {
  const fields = ["noteId", "feedback", "analyzed_feedback"];

  const csvOptions = {
    fields,
    header: !fs.existsSync(filePath),
  };

  const csvData = json2csv(data, csvOptions);

  fs.appendFileSync(filePath, `${csvData}\n`);
};

export const updateCSV = async (
  filePath: string,
  data: any[]
): Promise<void> => {
  const fields = [
    "noteId",
    "overallSentiment",
    "Mixed",
    "Neutral",
    "Constructive",
    "Appreciative",
    "Negative",
    "Suggestive",
    "Criticism",
    "overallSummary",
  ];

  // Load existing data from CSV
  const existingData: any[] = [];

  if (fs.existsSync(filePath)) {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          existingData.push(row);
        })
        .on("end", resolve)
        .on("error", reject);
    });
  }

  // Update or add new entries based on `noteId`
  data.forEach((newEntry) => {
    const index = existingData.findIndex(
      (row) => row.noteId === newEntry.noteId
    );

    if (index !== -1) {
      // Update existing entry
      existingData[index] = newEntry;
    } else {
      // Add new entry if `noteId` doesn't exist
      existingData.push(newEntry);
    }
  });

  // Convert updated data to CSV
  const csvData = json2csv(existingData, { fields });

  // Write updated data back to the CSV file
  fs.writeFileSync(filePath, csvData, "utf8");
};

export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }

  return result;
};

export const currentDate = () => {
  const currentDate = new Date();
  return `${currentDate.toISOString()} `;
};

async function analyzeChunk(
  chunk: any[],
  outputFilePath: string
): Promise<void> {
  const chunkedId = chunk.map((c) => c.noteId).join(",");

  console.log(`Processing feedback with noteIds ${chunkedId}`);

  try {
    // Process all feedbacks in the chunk and handle errors for each feedback individually
    const analyzedData = await Promise.all(
      chunk.map(async (item) => {
        const { noteId, feedback } = item;

        return handleWithRetry(noteId, () => analyzeFeedback(feedback))
          .then((analyzedFeedback) => {
            const { overallSentiment, overallSummary, sentimentPercentages } =
              analyzedFeedback;

            return {
              noteId,
              overallSentiment,
              ...sentimentPercentages,
              overallSummary,
            };
          })
          .catch((feedbackError) => {
            console.error(`Error processing feedback with noteId ${noteId}.`);
            throw feedbackError;
          });
      })
    );

    // Once all feedbacks are processed, update the CSV with the analyzed data
    await updateCSV(outputFilePath, analyzedData);

    console.log(
      currentDate(),
      `Processed and saved chunk of ${chunkedId} feedbacks to ${outputFilePath}`
    );
  } catch (error: any) {
    console.error(`Error processing chunk with noteIds ${chunkedId}.`);

    throw error;
  }
}

export const analyzeFeedbacks = async (
  filePath: string,
  outputFilePath: string
) => {
  const feedbacks = await readCSV(filePath);

  const chunkSize = 5;

  await batchProcess(
    feedbacks,
    (data) => analyzeChunk(data, outputFilePath),
    chunkSize
  );

  console.log(
    currentDate(),
    `All the data has been processed sucessfully ${outputFilePath}.`
  );
};
