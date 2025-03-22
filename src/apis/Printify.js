import axios from 'axios';

const API_KEY = process.env.REACT_APP_PRINTIFY_KEY;
const BASE_URL = 'https://api.printify.com/v1';

export default {
  getTrendingDesigns: async (limit = 20) => {
    const response = await axios.get(`${BASE_URL}/trending/designs`, {
      params: { limit },
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    return response.data.data;
  },

  getTemplates: async (designIds) => {
    const response = await axios.post(`${BASE_URL}/templates/batch`, {
      design_ids: designIds
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    return response.data.templates;
  }
};