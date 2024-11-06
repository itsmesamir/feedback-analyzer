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
exports.analyzeFeedback = void 0;
const BedrockClientSingleton_1 = __importDefault(require("./BedrockClientSingleton"));
const prompts_1 = require("./prompts"); // Importing the feedback summarization prompt
const analyzeFeedback = (feedback) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const modelId = process.env.LLM_MODEL_ID;
    if (!modelId) {
        throw new Error("LLM_MODEL_ID is not defined");
    }
    // Construct the prompt for the feedback analysis
    const prompt = (0, prompts_1.feedbackSummarizer)(feedback);
    // Define the input parameters for the model invocation
    const input = {
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            temperature: 0,
            top_p: 1,
            max_tokens: 4050,
            prompt,
        }),
    };
    try {
        // Invoke the model using the Bedrock client singleton instance
        const response = yield BedrockClientSingleton_1.default.invokeModel(input);
        const resultBody = yield ((_a = response.body) === null || _a === void 0 ? void 0 : _a.transformToString());
        console.log("Response from Bedrock:", resultBody);
        // Parse the JSON response
        return JSON.parse(resultBody || "{}");
    }
    catch (error) {
        console.error("Error analyzing feedback:", error);
        throw error;
    }
});
exports.analyzeFeedback = analyzeFeedback;
