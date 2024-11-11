import { currentDate } from "./csvHandler";

type CallbackFunction<T> = (chunk: T[]) => Promise<void>;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const handleWithRetry = async <T>(
  identifier: number,
  fn: () => Promise<T>,
  maxRetries: number = 5,
  delaySec: number = 60,
  attempt: number = 1
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (
      error.$metadata &&
      error.$metadata.httpStatusCode === 429 &&
      attempt < maxRetries
    ) {
      console.error(
        `Rate limit hit while analyzing feedback with noteId: ${identifier}. Retrying in ${delaySec}s (Attempt ${attempt} of ${maxRetries})...`
      );
      await delay(delaySec * 1000);
      return handleWithRetry(identifier, fn, maxRetries, delaySec, attempt + 1);
    } else {
      console.error("Max retries reached Error occured:", error);
      throw error;
    }
  }
};

export async function batchProcess<T>(
  data: T[],
  callback: CallbackFunction<T>,
  batchSize: number = 10,
  retries: number = 100
): Promise<void> {
  // Helper function to split the data into chunks
  const chunkArray = (array: T[], size: number): T[][] =>
    array.reduce(
      (acc: T[][], _, i) =>
        i % size ? acc : [...acc, array.slice(i, i + size)],
      []
    );

  const processChunkWithRetry = async (
    chunk: T[],
    attempt: number = 1
  ): Promise<void> => {
    try {
      await callback(chunk);
    } catch (error: any) {
      throw error;

      // Not required as we are using the handleWithRetry with analyzeFeedback
      if (
        error.$metadata &&
        error.$metadata.httpStatusCode === 429 &&
        attempt < retries
      ) {
        console.error(
          currentDate(),
          `Rate limit hit. Retrying chunk in 1 minute (Attempt ${attempt} of ${retries})...`
        );
        await delay(60000); // Wait for 1 minute before retrying
        return processChunkWithRetry(chunk, attempt + 1); // Retry the chunk
      } else {
        throw error; // Re-throw if it's another error or retry limit reached
      }
    }
  };

  const chunks = chunkArray(data, batchSize);
  for (const chunk of chunks) {
    await processChunkWithRetry(chunk);
  }
}
