import { Request, Response } from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { analyzeFeedback } from "../utils/analyzeFeedback";
import { createObjectCsvWriter } from "csv-writer";

const upload = multer({ dest: "uploads/" });

export const uploadFeedback = [
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.resolve(req.file.path);
    const results: any[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        console.log(`Total feedbacks to analyze: ${results.length}`);

        const analyzedResults: any[] = [];

        const CONCURRENT_LIMIT = 5;
        let index = 0;

        const processBatch = async () => {
          const promises = [];
          for (
            let i = index;
            i < index + CONCURRENT_LIMIT && i < results.length;
            i++
          ) {
            const feedback = results[i].feedback;
            promises.push(
              analyzeFeedback(feedback)
                .then((analysis) => ({
                  ...results[i],
                  ...analysis,
                }))
                .catch((error) => ({
                  ...results[i],
                  error: error.message,
                }))
            );
          }
          const batchResults = await Promise.all(promises);
          analyzedResults.push(...batchResults);
          index += CONCURRENT_LIMIT;
          if (index < results.length) {
            await processBatch();
          }
        };

        try {
          await processBatch();

          const outputPath = path.resolve("analyzed_results.csv");
          const headers = Object.keys(analyzedResults[0]).map((key) => ({
            id: key,
            title: key,
          }));

          const csvWriter = createObjectCsvWriter({
            path: outputPath,
            header: headers,
          });

          await csvWriter.writeRecords(analyzedResults);
          fs.unlinkSync(filePath);

          res.download(outputPath, "analyzed_results.csv", (err) => {
            if (err) {
              console.error("Error sending file:", err);
            }
            fs.unlinkSync(outputPath);
          });
        } catch (error) {
          console.error("Error processing feedbacks:", error);
          res.status(500).json({ error: "Error processing feedbacks" });
        }
      });
  },
];
