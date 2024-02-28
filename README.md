# Auth0 migration jobs

This repository contains code that migrates user_type from user_metadata to app_metadata in Auth0.

Steps to execute:

0. Install dependencies: `npm install`

1. Run users export:

```bash
npm run trigger-export-job
```

2. Check job status:

```bash
npm run check-export-job
```

3. Download file from Auth0 and save it in root folder of the project.

4. Run migration:

```bash
npm run migration
```