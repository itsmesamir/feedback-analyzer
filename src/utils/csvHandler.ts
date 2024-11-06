import fs from "fs";
import csv from "csv-parser";
import { parse as json2csv } from "json2csv";
import { analyzeFeedback } from "./analyzeFeedback";

export const readCSV = (filePath: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const feedbacks: string[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => feedbacks.push(row.feedback))
      .on("end", () => resolve(feedbacks))
      .on("error", reject);
  });
};

export const writeCSV = (filePath: string, data: any[]): void => {
  const csvData = json2csv(data);
  fs.writeFileSync(filePath, csvData);
};

export const analyzeFeedbacks = async (
  filePath: string,
  outputFilePath: string
) => {
  const feedbacks = await readCSV(filePath);
  const results = [];

  for (const feedback of feedbacks) {
    const analysis = await analyzeFeedback(feedback);
    results.push({ feedback, analysis });
  }

  writeCSV(outputFilePath, results);
};
