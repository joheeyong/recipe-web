import apiClient from '../../../core/api/apiClient';

const recipeApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.cuisine) query.set('cuisine', params.cuisine);
    if (params.query) query.set('query', params.query);
    if (params.userRecipe !== undefined && params.userRecipe !== null) query.set('userRecipe', params.userRecipe);
    if (params.page !== undefined) query.set('page', params.page);
    if (params.size) query.set('size', params.size);
    const qs = query.toString();
    return apiClient.get(`/api/recipes${qs ? '?' + qs : ''}`);
  },

  detail: (id) => apiClient.get(`/api/recipes/${id}`),

  search: (query) => apiClient.get(`/api/recipes?query=${encodeURIComponent(query)}&size=30`),

  recommendations: (size = 10) => apiClient.get(`/api/recommendations?size=${size}`),
};

export default recipeApi;
