import { readFileSync } from 'fs';

// Define the API URL
const auth0Api = process.env.AUTH0_API_URL;

const getAccessToken = async function(): Promise<any | string> {

  const details = {
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: process.env.AUTH0_AUDIENCE,
    grant_type: 'client_credentials'
  };

  const response = await fetch(auth0Api + '/oauth/token', {
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

const getApiRequest = async function(url: string, method: string, body: any, accessToken: string): Promise<any> {

  url = url.startsWith('/') ? url : `/${url}`;
  const response = await fetch(auth0Api + url, {
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

const downloadUserExportFile = async function(accessToken: string, connectionId: string): Promise<any> {

  const response = await fetch(auth0Api + '/api/v2/jobs/users-exports', {
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
        {
          name: "app_metadata",
          export_as: "app_metadata"
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

// Start function
const execution = async function() {
  const accessToken = await getAccessToken();

  const pageSize = 100;

  let totalPages = 0;
  let page = 0;
  let adjusted = 0;
  let skippedDueToError = 0;
  let skippedDueToAdjusted = 0;

  do {
    console.log(`Fetching page ${page + 1}`);
    const response = await getApiRequest(`/api/v2/users?include_totals=true&page=${page}&per_page=${pageSize}`, 'GET', null, accessToken);
    totalPages = response.total;

    for (const user of response.users) {
      if (user.user_metadata == null || user.user_metadata.user_type == null) {
        console.log(`User ${user.email} has no user type`);
        skippedDueToError++;
        continue;
      }

      if (user.app_metadata == null) {
        console.log(`User ${user.email} has no app metadata`);
        skippedDueToError++;
        continue;
      }

      if (user.app_metadata.user_type != null) {
        console.log(`User ${user.email} already has app metadata UserType: ${user.app_metadata.user_type}`);
        skippedDueToAdjusted++;
        continue;
      }

      const userType = user.user_metadata.user_type;
      user.app_metadata = user.app_metadata || {};
      user.app_metadata.user_type = userType || 'Dashboard';

      await new Promise(f => setTimeout(f, 2_000));

      try {
        const updateResponse = await getApiRequest(
          `/api/v2/users/${user.user_id}`,
          'PATCH',
          {
            app_metadata: user.app_metadata
          },
          accessToken);

        console.log(`User ${user.email} adjusted`, updateResponse);
        adjusted++;
      } catch (e) {
        console.log(`Error adjusting user ${user.email}: ${e}`);
        skippedDueToError++;
      }
    }

    page++;
    console.log('----------------');

  } while (page < totalPages);
}

const downloadFile = async function() {
  const accessToken = await getAccessToken();
  const connections = await getApiRequest('/api/v2/connections', 'GET', null, accessToken);

  const response = await downloadUserExportFile(accessToken, connections[0].id);
  console.log(response);
}

const checkJobResult = async function() {
  const accessToken = await getAccessToken();

  const jobId = 'job_H4YWfbs2YYvwtK0q';
  const jobData = await getApiRequest(`/api/v2/jobs/${jobId}`, 'GET', null, accessToken);
  console.log(jobData);
}

const migrateWithFile = async function() {
  const accessToken = await getAccessToken();

  let adjusted = 0;
  let skippedDueToError = 0;
  let skippedDueToAdjusted = 0;

  const fileContent = readFileSync('users.csv', 'utf-8').split('\n');
  console.log(fileContent);

  for (let index = 1; index < fileContent.length; index++) {
    const row = fileContent[index];

    const userId = row.split(',')[0].replace(/"/g, '').replace(/'/g, '');
    const user = await getApiRequest(`/api/v2/users/${userId}`, 'GET', null, accessToken);

    if (user.app_metadata == null) {
      console.log(`User ${user.email} has no app metadata`);
      skippedDueToError++;

      await new Promise(f => setTimeout(f, 500));
      continue;
    }

    if (user.app_metadata.user_type != null) {
      console.log(`User ${user.email} already has app metadata UserType: ${user.app_metadata.user_type}`);
      skippedDueToAdjusted++;

      await new Promise(f => setTimeout(f, 500));
      continue;
    }

    const userType = user.user_metadata?.user_type || 'Dashboard';
    user.app_metadata = user.app_metadata || {};
    user.app_metadata.user_type = userType;
    if (user.app_metadata.permissions == null) {
      user.app_metadata.permissions = '';
    } else if (Array.isArray(user.app_metadata.permissions) && user.app_metadata.permissions.length === 0) {
      user.app_metadata.permissions = '';
    }

    await new Promise(f => setTimeout(f, 1_000));

    try {
      const updateResponse = await getApiRequest(
        `/api/v2/users/${user.user_id}`,
        'PATCH',
        {
          app_metadata: user.app_metadata
        },
        accessToken);

      console.log(`User ${user.email} adjusted`, updateResponse);
      adjusted++;
    } catch (e) {
      console.log(`Error adjusting user ${user.email}: ${e}`);
      skippedDueToError++;
    }
  }
}

// Call start
migrateWithFile()
  .then(() => console.log('done'));