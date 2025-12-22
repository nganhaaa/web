import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const testModels = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-flash',
];

async function testModel(modelName) {
  try {
    console.log(`\n🧪 Testing model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hello');
    const response = await result.response;
    const text = response.text();
    console.log(`✅ SUCCESS: ${modelName}`);
    console.log(`Response: ${text.substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${modelName}`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

async function findWorkingModel() {
  console.log('🔍 Testing Gemini models...\n');
  console.log('API Key:', process.env.GEMINI_API_KEY ? '✅ Found' : '❌ Not found');
  
  for (const modelName of testModels) {
    const works = await testModel(modelName);
    if (works) {
      console.log(`\n\n🎉 WORKING MODEL FOUND: ${modelName}`);
      console.log(`\nUpdate geminiService.js with:\nmodel: '${modelName}'`);
      break;
    }
  }
}

findWorkingModel();
