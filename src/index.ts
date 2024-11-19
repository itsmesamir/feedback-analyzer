import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { analyzeFeedbacks } from "./utils/csvHandler";
import { analyzeFeedback } from "./utils/analyzeFeedback";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

app.post("/feedback", async (req: Request, res: Response) => {
  try {
    const feedback = req.body?.feedback;
    console.log(req.body);

    if (!feedback) {
      console.log("Feedback is required.");
      res.status(500).json({ message: "Feedback is required" });
    }

    const analayzedFeedback = await analyzeFeedback(feedback);

    res.status(200).json({
      message: "Feedback analysis complete!",
      feedback,
      analayzedFeedback,
    });
  } catch (error) {
    console.error("Error analyzing feedback:", error);
    res.status(500).json({ message: "Error analyzing feedback", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
