const GEMINI_API_KEY = "AIzaSyDXbZb5j4PP6aRLNe-iMdmZXMlj7SPFoI8";

async function testUrl(url, name) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] }),
    });
    console.log(`[${name}] Status:`, response.status, response.statusText);
    const data = await response.json();
    if (response.status === 200) {
      console.log(`[${name}] SUCCESS! Response:`, data.candidates?.[0]?.content?.parts?.[0]?.text);
      return true;
    } else {
      console.log(`[${name}] FAILED:`, data.error?.message);
    }
  } catch (error) {
    console.error(`[${name}] Error:`, error.message);
  }
  return false;
}

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
  try {
    const response = await fetch(url);
    console.log("ListModels Status:", response.status);
    const data = await response.json();
    if (data.models) {
      console.log("Available Models:");
      data.models.forEach(m => console.log(` - ${m.name} (supports: ${m.supportedGenerationMethods.join(', ')})`));
    } else {
      console.log("No models returned:", data);
    }
  } catch (error) {
    console.error("ListModels Error:", error);
  }
}

async function run() {
  await listModels();
  
  const urls = {
    "v1beta gemini-2.0-flash": `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    "v1beta gemini-2.5-flash": `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    "v1beta gemini-3.5-flash": `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  };
  
  for (const [name, url] of Object.entries(urls)) {
    console.log(`\nTesting ${name}...`);
    const success = await testUrl(url, name);
    if (success) break;
  }
}

run();
