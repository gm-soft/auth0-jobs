export const getAccessToken = async function(): Promise<any | string> {

    const details = {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: process.env.AUTH0_AUDIENCE,
      grant_type: 'client_credentials'
    };
  
    const response = await fetch(process.env.AUTH0_API_URL + '/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Accept': 'application/json'
      },
      body: `grant_type=client_credentials&client_id=${details.client_id}&client_secret=${details.client_secret}&audience=${details.audience}/api/v2/`
    });
  
    if (response.status != 200) {
      console.log(await response.text());
      throw new Error(`Failed to fetch: ${response.status} - ${response.statusText}`);
    }
  
    const responseObject = await response.json() as { access_token: string };
    return responseObject.access_token || null;
}
