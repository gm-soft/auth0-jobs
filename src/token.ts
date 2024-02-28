import { Environment } from "./Environment";

export const getAccessToken = async function(): Promise<any | string> {

    const env = new Environment();
    const details = {
      client_id: env.auth0ClientId(),
      client_secret: env.auth0ClientSecret(),
      audience: env.auth0Audience(),
      grant_type: 'client_credentials'
    };

    console.log(`Details`, details);
  
    const response = await fetch(env.auth0ApiUrl() + '/oauth/token', {
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
