import { getApiRequest } from "../api-request";
import { getAccessToken } from "../token";

const downloadUserExportFile = async function(
    accessToken: string,
    connectionId: string): Promise<any> {
  
    const response = await fetch(process.env.AUTH0_API_URL + '/api/v2/jobs/users-exports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        connection_id: connectionId,
        format: "csv",
        limit: 10_000,
        fields: [
          {
            name: "user_id",
            export_as: "user_id"
          },
          {
            name: "email",
            export_as: "email"
          },
        ]
      }),
    });
  
    if (response.status != 200) {
      console.log(await response.text());
      throw new Error(`Failed to fetch: ${response.status} - ${response.statusText}`);
    }
  
    return await response.json();
}

const createUserExportJob = async function(): Promise<any> {
    const accessToken = await getAccessToken();
    const connections = await getApiRequest('/api/v2/connections', 'GET', null, accessToken);
  
    const response = await downloadUserExportFile(accessToken, connections[0].id);
    return response;
}

createUserExportJob()
  .then((r) => {
    console.log(r);
    console.log('done')
  })
  .catch((e) => {
    console.error(e);
  });
