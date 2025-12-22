import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAvailableModels() {
  try {
    console.log('🔍 Listing available Gemini models...\n');
    console.log('API Key:', process.env.GEMINI_API_KEY ? '✅ Found' : '❌ Not found');
    console.log('API Key (first 10 chars):', process.env.GEMINI_API_KEY?.substring(0, 10) + '...\n');
    
    // Try to list models using REST API directly
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      console.log('✅ Available models:\n');
      data.models.forEach(model => {
        console.log(`  📌 ${model.name}`);
        console.log(`     Display Name: ${model.displayName}`);
        console.log(`     Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });
      
      // Find a model that supports generateContent
      const contentModel = data.models.find(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (contentModel) {
        console.log(`\n🎯 RECOMMENDED MODEL: ${contentModel.name.replace('models/', '')}`);
      }
    } else {
      console.log('❌ No models found. Check your API key.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check API key is valid at: https://aistudio.google.com/app/apikey');
    console.log('2. Make sure API key has no spaces or quotes');
    console.log('3. Try creating a new API key');
  }
}

listAvailableModels();
