const axios = require('axios');
const { ClientCredentials } = require('simple-oauth2');
const process = require('process'); // Built-in module for environment variables

// Main asynchronous function to handle the logic
async function main() {
  // Read environment variables
  const clientID = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const tokenURL = process.env.TOKEN_URL;
  const baseURL = process.env.BASE_URL;

  // Check if required environment variables are set
  if (!clientID || !clientSecret || !tokenURL || !baseURL) {
    console.error("Error: CLIENT_ID, CLIENT_SECRET, TOKEN_URL, and BASE_URL environment variables must be set.");
    process.exit(1); // Exit with an error code
  }

  // Configure the OAuth2 client credentials client
  const config = {
    client: {
      id: clientID,
      secret: clientSecret,
    },
    auth: {
      tokenHost: new URL(tokenURL).origin, // Extract host from tokenURL
      tokenPath: new URL(tokenURL).pathname, // Extract path from tokenURL
    },
  };

  const client = new ClientCredentials(config);

  let accessToken;
  try {
    // Get the access token
    console.log("Attempting to get OAuth2 token...");
    accessToken = await client.getToken();
    console.log("Token obtained successfully.");
    // console.log("Access Token:", accessToken.token.access_token); // Uncomment to see the token
  } catch (error) {
    console.error('Access Token Error', error.message);
    console.error('Error details:', error.output.body); // Simple-oauth2 provides error details here
    process.exit(1); // Exit with an error code
  }

  // Define the data payload for the POST request
  const postData = {
    phone: "+8562099482222",
    first_name: "jonh",
    last_name: "max",
    gender: "m"
  };

  // Define the API endpoint URL
  const apiUrl = `${baseURL}/api/v1/auth/sso/login`;

  try {
    // Make the POST request using axios
    console.log(`Making POST request to ${apiUrl}...`);
    const res = await axios.post(apiUrl, postData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.token.access_token}`, // Include the access token
      },
    });

    // Read and parse the response body
    console.log("Request successful. Reading response body...");
    const responseBody = res.data; // Axios automatically parses JSON response body

    // Extract the login_url
    const loginUrl = responseBody.login_url;

    // Print the login_url
    if (loginUrl) {
      console.log("Extracted Login URL:");
      console.log(loginUrl);
    } else {
      console.warn("Warning: 'login_url' not found in the response body.");
      console.log("Full response body:", responseBody); // Log the full body for debugging
    }

  } catch (error) {
    // Handle request errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Error during API request: Status ${error.response.status}`);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error during API request: No response received.');
      console.error('Request details:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up API request:', error.message);
    }
    process.exit(1); // Exit with an error code
  }
}

// Execute the main function
main();
