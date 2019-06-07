import axios from 'axios';

export interface HelloResponseData {
  hello: string;
}

class APIManager {
  api = axios.create({
    baseURL: process.env.API_SERVER,
    // Critical for the CORS request to a gLinux-based inference server
    withCredentials: true,
  });

  // Dummy API request to the experimental inference server
  async getHello(name = 'world') {
    const params = { name };
    const response = await this.api.get('/hello', { params });
    return response.data as HelloResponseData;
  }
}

export default new APIManager();
