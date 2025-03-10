import axios from 'axios';

export async function callApi(endpoint, data) {

  const domainName = import.meta.env.VITE_SERVER_DOMAIN_NAME
  const port = import.meta.env.VITE_SERVER_PORT

  const baseUrl = `https://${domainName}`; 
  // console.log(baseUrl);
  
  try {
    const response = await axios.post(`${baseUrl}${endpoint}`, data);
    // console.log('API Response:', response.data);
    return response.data; 
  } catch (error) {
    console.error('API Error:', error);
    if (error) {


      let errorMessage = "Failed to do something exceptional";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
    
    } 
    return null; 
  }
}
