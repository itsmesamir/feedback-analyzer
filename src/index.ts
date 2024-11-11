import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { analyzeFeedbacks } from "./utils/csvHandler";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/summarize", async (req: Request, res: Response) => {
  try {
    const inputFilePath = "src/data/input.csv";
    const outputFilePath = "src/data/output.csv";

    console.log("Analyzing feedbacks....");

    await analyzeFeedbacks(inputFilePath, outputFilePath);

    res
      .status(200)
      .json({ message: "Feedback analysis complete!", outputFilePath });
  } catch (error) {
    console.error("Error analyzing feedback:", error);
    res.status(500).json({ message: "Error analyzing feedback", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
