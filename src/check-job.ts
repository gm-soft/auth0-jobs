import { getApiRequest } from "./api-request";
import { getAccessToken } from "./token";

const checkJobResult = async function() {
    const accessToken = await getAccessToken();
  
    const jobId = 'job_H4YWfbs2YYvwtK0q';
    const jobData = await getApiRequest(`/api/v2/jobs/${jobId}`, 'GET', null, accessToken);
    console.log(jobData);
}

checkJobResult()
  .then((r) => {
    console.log(r);
    console.log('done')
  })
  .catch((e) => {
    console.error(e);
  });
