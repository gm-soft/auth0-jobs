import { getApiRequest } from "./api-request";
import { getAccessToken } from "./token";

const migrationWithSearch = async function() {
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

    return { adjusted, skippedDueToError, skippedDueToAdjusted };
}

migrationWithSearch()
  .then((r) => {
    console.log(r);
    console.log('done')
  })
  .catch((e) => {
    console.error(e);
  });