// netlify/functions/generate-image.js
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { outfitDescription } = JSON.parse(event.body);

    if (!outfitDescription) {
      return { statusCode: 400, body: JSON.stringify({ error: "No outfit description provided" }) };
    }

    // Crear un prompt detallado para DALL-E 3
    const prompt = `A flat-lay photography style image of a complete fashion outfit laid out nicely on a neutral, slightly textured concrete background. The outfit consists of: ${outfitDescription}. The lighting is natural daylight, studio quality, professional fashion lookbook style. Soft shadows. High resolution.`;

    // Llamada a DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    const imageUrl = response.data[0].url;

    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl }),
    };

  } catch (error) {
    console.error("Error generating image:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate image", details: error.message }),
    };
  }
};
