const BASE = 'https://www.themealdb.com/api/json/v1/1';

const mealApi = {
  getCategories: async () => {
    const res = await fetch(`${BASE}/categories.php`);
    const data = await res.json();
    return data.categories || [];
  },

  getByCategory: async (category) => {
    const res = await fetch(`${BASE}/filter.php?c=${category}`);
    const data = await res.json();
    return data.meals || [];
  },

  search: async (query) => {
    const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.meals || [];
  },

  getDetail: async (id) => {
    const res = await fetch(`${BASE}/lookup.php?i=${id}`);
    const data = await res.json();
    return data.meals?.[0] || null;
  },

  getRandom: async () => {
    const res = await fetch(`${BASE}/random.php`);
    const data = await res.json();
    return data.meals?.[0] || null;
  },
};

export default mealApi;
