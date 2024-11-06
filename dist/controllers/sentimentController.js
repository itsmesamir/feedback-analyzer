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
exports.uploadFeedback = void 0;
const multer_1 = __importDefault(require("multer"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const analyzeFeedback_1 = require("../utils/analyzeFeedback");
const csv_writer_1 = require("csv-writer");
const upload = (0, multer_1.default)({ dest: "uploads/" });
exports.uploadFeedback = [
    upload.single("file"),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const filePath = path_1.default.resolve(req.file.path);
        const results = [];
        // Stream to read CSV
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on("data", (data) => results.push(data))
            .on("end", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`Total feedbacks to analyze: ${results.length}`);
            const analyzedResults = [];
            // Process feedbacks with controlled concurrency
            const CONCURRENT_LIMIT = 5; // Adjust based on your system's capability
            let index = 0;
            const processBatch = () => __awaiter(void 0, void 0, void 0, function* () {
                const promises = [];
                for (let i = index; i < index + CONCURRENT_LIMIT && i < results.length; i++) {
                    const feedback = results[i].feedback; // Assuming CSV has a 'feedback' column
                    promises.push((0, analyzeFeedback_1.analyzeFeedback)(feedback)
                        .then((analysis) => (Object.assign(Object.assign({}, results[i]), analysis)))
                        .catch((error) => (Object.assign(Object.assign({}, results[i]), { error: error.message }))));
                }
                const batchResults = yield Promise.all(promises);
                analyzedResults.push(...batchResults);
                index += CONCURRENT_LIMIT;
                if (index < results.length) {
                    yield processBatch();
                }
            });
            try {
                yield processBatch();
                // Write to new CSV
                const outputPath = path_1.default.resolve("analyzed_results.csv");
                const headers = Object.keys(analyzedResults[0]).map((key) => ({
                    id: key,
                    title: key,
                }));
                const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
                    path: outputPath,
                    header: headers,
                });
                yield csvWriter.writeRecords(analyzedResults);
                // Delete the uploaded file
                fs_1.default.unlinkSync(filePath);
                res.download(outputPath, "analyzed_results.csv", (err) => {
                    if (err) {
                        console.error("Error sending file:", err);
                    }
                    // Optionally, delete the output file after download
                    fs_1.default.unlinkSync(outputPath);
                });
            }
            catch (error) {
                console.error("Error processing feedbacks:", error);
                res.status(500).json({ error: "Error processing feedbacks" });
            }
        }));
    }),
];
