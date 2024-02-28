export const getApiRequest = async function(
    url: string, method: string, body: any, accessToken: string): Promise<any> {

    url = url.startsWith('/') ? url : `/${url}`;
    const response = await fetch(process.env.AUTH0_API_URL + url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: body != null ? JSON.stringify(body) : null
    });
  
    if (response.status != 200) {
      console.log(await response.text());
      throw new Error(`Failed to fetch: ${response.status} - ${response.statusText}`);
    }
  
    return await response.json();
}
