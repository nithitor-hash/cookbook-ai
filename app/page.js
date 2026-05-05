'use client';
import { useState } from 'react';
import styles from './page.module.css';

const CUISINES = ['Italian', 'Indian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'French', 'Japanese', 'Thai', 'Middle Eastern'];

export default function Home() {
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  function addIngredient() {
    const val = ingredientInput.trim();
    if (val && !ingredients.includes(val)) {
      setIngredients([...ingredients, val]);
      setIngredientInput('');
    }
  }

  function removeIngredient(item) {
    setIngredients(ingredients.filter(i => i !== item));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') addIngredient();
  }

  async function findRecipes() {
    if (!selectedCuisine) { setError('Please select a cuisine type.'); return; }
    if (ingredients.length === 0) { setError('Please add at least one ingredient.'); return; }
    setError('');
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuisine: selectedCuisine, ingredients }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRecipes(data.recipes);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSelectedCuisine('');
    setIngredients([]);
    setIngredientInput('');
    setRecipes([]);
    setHasSearched(false);
    setError('');
  }

  return (
    <main className={styles.main}>
      <div className={styles.bg} />

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>🍳</div>
          <h1 className={styles.title}>Cookbook <span>AI</span></h1>
          <p className={styles.subtitle}>Tell us what's in your kitchen. We'll find what to cook.</p>
        </header>

        {/* Input Section */}
        {!hasSearched && (
          <div className={styles.formSection}>
            <div className={styles.card}>
              <p className={styles.cardLabel}>What cuisine are you craving?</p>
              <div className={styles.cuisineGrid}>
                {CUISINES.map(c => (
                  <button
                    key={c}
                    className={`${styles.chip} ${selectedCuisine === c ? styles.chipSelected : ''}`}
                    onClick={() => setSelectedCuisine(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <p className={styles.cardLabel}>What ingredients do you have?</p>
              <div className={styles.inputRow}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. chicken, garlic, tomatoes..."
                  value={ingredientInput}
                  onChange={e => setIngredientInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className={styles.addBtn} onClick={addIngredient}>+ Add</button>
              </div>
              {ingredients.length > 0 && (
                <div className={styles.tags}>
                  {ingredients.map(ing => (
                    <span key={ing} className={styles.tag}>
                      {ing}
                      <button className={styles.tagRemove} onClick={() => removeIngredient(ing)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.submitBtn} onClick={findRecipes} disabled={loading}>
              {loading ? (
                <span className={styles.loadingRow}><span className={styles.spinner} /> Finding recipes...</span>
              ) : 'Find My Recipes →'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingCard}>
            <div className={styles.spinnerLg} />
            <p>Cooking up your top 5 recipes...</p>
          </div>
        )}

        {/* Results */}
        {!loading && recipes.length > 0 && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <div>
                <h2 className={styles.resultsTitle}>Your Top 5 Recipes</h2>
                <p className={styles.resultsMeta}>{selectedCuisine} cuisine · {ingredients.length} ingredients</p>
              </div>
              <button className={styles.resetBtn} onClick={reset}>← Start over</button>
            </div>

            <div className={styles.recipeList}>
              {recipes.map((recipe, i) => (
                <div key={i} className={styles.recipeCard}>
                  <div className={styles.recipeRank}>{i + 1}</div>
                  <div className={styles.recipeBody}>
                    <h3 className={styles.recipeName}>{recipe.name}</h3>
                    <p className={styles.recipeDesc}>{recipe.description}</p>
                    <div className={styles.recipeMeta}>
                      {recipe.cookTime && <span className={styles.pill}>⏱ {recipe.cookTime}</span>}
                      {recipe.difficulty && <span className={styles.pill}>{recipe.difficulty}</span>}
                      {recipe.matchCount && (
                        <span className={styles.pillGreen}>✓ {recipe.matchCount} ingredients matched</span>
                      )}
                    </div>
                    {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                      <p className={styles.missing}>
                        <span>Also needs: </span>{recipe.missingIngredients.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.resetBtn2} onClick={reset}>Search again</button>
          </div>
        )}
      </div>
    </main>
  );
}
