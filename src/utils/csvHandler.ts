import fs from "fs";
import csv from "csv-parser";
import { parse as json2csv } from "json2csv";
import { analyzeFeedback } from "./analyzeFeedback";

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
    "feedback",
    "overallSentiment",
    "overallSummary",
    "sentimentPercentages",
    "suggestions",
    "sentimentQualitativeAssessment",
    "summary",
    "analyzed_feedback",
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

const currentDate = () => {
  const currentDate = new Date();
  return `${currentDate.toISOString()} `;
};

export const analyzeFeedbacks = async (
  filePath: string,
  outputFilePath: string
) => {
  const feedbacks = await readCSV(filePath);

  // Split feedbacks into chunks of 5
  const chunks = chunkArray(feedbacks, 10);

  for (const chunk of chunks) {
    try {
      // Analyze each feedback in the chunk concurrently
      const chunkedId = chunk.map((c) => c.noteId).join(",");

      console.log(`Processing feedback with noteIds ${chunkedId}`);

      const analyzedData = await Promise.all(
        chunk.map(async (feedbackEntry) => {
          const analyzed_feedback = await analyzeFeedback(
            feedbackEntry.feedback
          );

          return { ...feedbackEntry, ...analyzed_feedback, analyzed_feedback };
        })
      );

      // Append each processed chunk to the CSV file
      updateCSV(outputFilePath, analyzedData);

      console.log(
        currentDate(),
        `Processed and saved chunk of 5 feedbacks to ${outputFilePath}`
      );
    } catch (error) {
      console.error("Error processing chunk:", error);
    }
  }

  console.log(
    currentDate(),
    `All the data has been processed sucessfully ${outputFilePath}.`
  );
};
