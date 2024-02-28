import { readFileSync } from "fs";
import { getApiRequest } from "./api-request";
import { getAccessToken } from "./token";

const migrateWithFileJob = async function() {
    const accessToken = await getAccessToken();
  
    let adjusted = 0;
    let skippedDueToError = 0;
    let skippedDueToAdjusted = 0;
  
    const fileContent = readFileSync('users.csv', 'utf-8').split('\n');
    console.log(`File has ${fileContent.length} rows`);
  
    for (let index = 1; index < fileContent.length; index++) {
      const row = fileContent[index];
  
      const logPrefix = `[${index} / ${fileContent.length - 1}]`;
      const userId = row.split(',')[0].replace(/"/g, '').replace(/'/g, '');
      const user = await getApiRequest(`/api/v2/users/${userId}`, 'GET', null, accessToken);
  
      if (user.app_metadata == null) {
        console.log(`${logPrefix}. User ${user.email} has no app metadata`);
        skippedDueToError++;
  
        await new Promise(f => setTimeout(f, 500));
        continue;
      }
  
      if (user.app_metadata.user_type != null) {
        console.log(`${logPrefix}. ${user.email} already has app metadata UserType: ${user.app_metadata.user_type}`);
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
  
        console.log(`${logPrefix}. User ${user.email} adjusted`, updateResponse);
        adjusted++;
      } catch (e) {
        console.log(`${logPrefix}. Error adjusting user ${user.email}: ${e}`);
        skippedDueToError++;
      }
    }

    return { adjusted, skippedDueToError, skippedDueToAdjusted };
}

migrateWithFileJob()
  .then((r) => {
    console.log(r);
    console.log('done')
  })
  .catch((e) => {
    console.error(e);
  });