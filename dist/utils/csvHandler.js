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
exports.analyzeFeedbacks = exports.writeCSV = exports.readCSV = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const json2csv_1 = require("json2csv");
const analyzeFeedback_1 = require("./analyzeFeedback");
// Function to read feedback from CSV
const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const feedbacks = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on("data", (row) => feedbacks.push(row.feedback))
            .on("end", () => resolve(feedbacks))
            .on("error", reject);
    });
};
exports.readCSV = readCSV;
// Function to write analysis results to CSV
const writeCSV = (filePath, data) => {
    const csvData = (0, json2csv_1.parse)(data);
    fs_1.default.writeFileSync(filePath, csvData);
};
exports.writeCSV = writeCSV;
// Function to analyze all feedbacks
const analyzeFeedbacks = (filePath, outputFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const feedbacks = yield (0, exports.readCSV)(filePath);
    const results = [];
    for (const feedback of feedbacks) {
        const analysis = yield (0, analyzeFeedback_1.analyzeFeedback)(feedback);
        results.push({ feedback, analysis });
    }
    (0, exports.writeCSV)(outputFilePath, results);
});
exports.analyzeFeedbacks = analyzeFeedbacks;
