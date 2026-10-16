// netlify/functions/scan-item.js
const { OpenAI } = require("openai");

// ¡IMPORTANTE! NUNCA pongas la clave API aquí directamente.
// Se configurará en el panel de control de Netlify como Variable de Entorno.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event, context) => {
  // Solo permitir peticiones POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { imageBase64 } = JSON.parse(event.body);

    if (!imageBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: "No image data provided" }) };
    }

    // Llamada a GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analiza esta imagen de una prenda de ropa. Describe la prenda de forma concisa (ej: 'Sudadera con capucha lila', 'Pantalón vaquero negro'). Luego, clasifícala ÚNICAMENTE en una de estas categorías: 'superior', 'sudadera', 'jersey', 'chaqueta', 'inferior', 'calzado', 'accesorio'. Responde en formato JSON puro: { \"name\": \"...\", \"category\": \"...\" }",
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64, // La imagen llega como Data URI (Base64)
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0].message.content;
    // Intentar parsear el JSON de la respuesta
    const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const itemData = JSON.parse(cleanJson);

    return {
      statusCode: 200,
      body: JSON.stringify(itemData),
    };

  } catch (error) {
    console.error("Error scanning item:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to scan item", details: error.message }),
    };
  }
};
