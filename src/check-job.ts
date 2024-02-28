import { getApiRequest } from "./api-request";
import { SettingsFile } from "./settings-file";
import { getAccessToken } from "./token";

const checkJobResult = async function() {
    const accessToken = await getAccessToken();
  
    const settings = new SettingsFile();
    const jobData = await getApiRequest(`/api/v2/jobs/${settings.getExportJobId()}`, 'GET', null, accessToken);
    return jobData;
}

checkJobResult()
  .then((r) => {
    console.log(r);
    console.log('done')
  })
  .catch((e) => {
    console.error(e);
  });
