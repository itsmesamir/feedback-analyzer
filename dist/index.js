"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const csvHandler_1 = require("./utils/csvHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Endpoint to trigger feedback analysis
app.get("/summarize", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inputFilePath = "src/data/input.csv";
        const outputFilePath = "src/data/output.csv";
        console.log("Analyzing feedbacks...");
        yield (0, csvHandler_1.analyzeFeedbacks)(inputFilePath, outputFilePath);
        res
            .status(200)
            .json({ message: "Feedback analysis complete!", outputFilePath });
    }
    catch (error) {
        console.error("Error analyzing feedback:", error);
        res.status(500).json({ message: "Error analyzing feedback", error });
    }
}));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
