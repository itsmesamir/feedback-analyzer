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
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/BedrockClientSingleton.ts
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const credential_providers_1 = require("@aws-sdk/credential-providers");
class BedrockClientSingleton {
    constructor() { }
    // Initialize and get the singleton instance
    static getInstance() {
        console.log("Getting Bedrock client instance");
        console.log("AWS_REGION:", process.env.AWS_REGION);
        console.log("credentials:", (0, credential_providers_1.fromEnv)());
        if (!BedrockClientSingleton.instance) {
            BedrockClientSingleton.instance = new client_bedrock_runtime_1.BedrockRuntimeClient({
                credentials: (0, credential_providers_1.fromEnv)(),
                region: process.env.AWS_REGION,
            });
        }
        return BedrockClientSingleton.instance;
    }
    // Convenience method to invoke a model
    static invokeModel(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_bedrock_runtime_1.InvokeModelCommand(input);
            try {
                const client = BedrockClientSingleton.getInstance();
                return yield client.send(command);
            }
            catch (error) {
                console.error("Error invoking model:", error);
                throw error;
            }
        });
    }
}
// Exporting as a singleton instance for use
exports.default = BedrockClientSingleton;
