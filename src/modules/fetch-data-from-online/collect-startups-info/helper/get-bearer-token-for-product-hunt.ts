import axios from "axios";

async function getOAuthToken() {
  try {
    // Send POST request to get OAuth token
    const response = await axios.post(
      "https://api.producthunt.com/v2/oauth/token",
      {
        // Required credentials for OAuth
        client_id: "Your_client_id",
        client_secret: "Your_client_secret",
        grant_type: "client_credentials"
      },
      {
        // Tell server we are sending JSON
        headers: { "Content-Type": "application/json" }
      }
    );

    // Log the token response
    console.log(response.data);

    /*
    You'll get this in terminal
    {
        access_token: 'the_bearer_token',
        token_type: 'Bearer',
        scope: 'public',
        created_at: 1763738344
    }
    */
  } catch (error) {
    console.error("Error:", error);
  }
}

getOAuthToken();
