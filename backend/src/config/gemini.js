const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getOCRModel = () => genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const getChatModel = () => genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

module.exports = { getOCRModel, getChatModel };