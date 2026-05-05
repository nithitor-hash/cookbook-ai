export async function POST(request) {
  try {
    const { cuisine, ingredients } = await request.json();

    if (!cuisine || !ingredients || ingredients.length === 0) {
      return Response.json({ error: 'Missing cuisine or ingredients' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if API key is loaded
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const prompt = `You are a helpful cookbook assistant. A user wants to cook ${cuisine} cuisine and has these ingredients: ${ingredients.join(', ')}.

Suggest exactly 5 recipes they can make (or mostly make) with these ingredients.

Return ONLY a valid JSON array with exactly 5 objects. No extra text, no markdown fences. Each object must have:
- "name": string (recipe name)
- "description": string (1-2 sentence description, appetizing and specific)
- "cookTime": string (e.g. "25 min")
- "difficulty": string (one of: "Easy", "Medium", "Hard")
- "matchCount": string (e.g. "4 of my ingredients")
- "missingIngredients": array of strings (ingredients needed that the user doesn't have, max 3, empty array if none)

Return ONLY the JSON array.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
        }),
      }
    );

    const data = await response.json();

    // Log the full Gemini response so we can see what's coming back
    console.log('Gemini response status:', response.status);
    console.log('Gemini response body:', JSON.stringify(data));

    // Check for API errors from Gemini
    if (data.error) {
      console.error('Gemini API error:', data.error);
      return Response.json({ error: `Gemini error: ${data.error.message}` }, { status: 500 });
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in Gemini response:', data);
      return Response.json({ error: 'No response from Gemini' }, { status: 500 });
    }

    const raw = data.candidates[0].content.parts[0].text.trim().replace(/```json|```/g, '').trim();
    const recipes = JSON.parse(raw);

    return Response.json({ recipes });
  } catch (err) {
    console.error('Recipe API error:', err);
    return Response.json({ error: 'Failed to generate recipes. Please try again.' }, { status: 500 });
  }
}