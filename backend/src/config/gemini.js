const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Model untuk OCR struk (mendukung vision/image input)
 * @returns {import("@google/generative-ai").GenerativeModel}
 */
const getOCRModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

/**
 * Model untuk AI financial chatbot
 * @returns {import("@google/generative-ai").GenerativeModel}
 */
const getChatModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

module.exports = { genAI, getOCRModel, getChatModel };
