export async function POST(request) {
  try {
    const { cuisine, ingredients } = await request.json();

    if (!cuisine || !ingredients || ingredients.length === 0) {
      return Response.json({ error: 'Missing cuisine or ingredients' }, { status: 400 });
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    const raw = data.candidates[0].content.parts[0].text.trim().replace(/```json|```/g, '').trim();
    const recipes = JSON.parse(raw);

    return Response.json({ recipes });
  } catch (err) {
    console.error('Recipe API error:', err);
    return Response.json({ error: 'Failed to generate recipes. Please try again.' }, { status: 500 });
  }
}
