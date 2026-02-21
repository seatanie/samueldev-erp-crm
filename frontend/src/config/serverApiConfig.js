export const API_BASE_URL =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE == 'remote'
    ? import.meta.env.VITE_BACKEND_SERVER + 'api/'
    : 'http://localhost:8889/api/';
export const BASE_URL =
  import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE
    ? import.meta.env.VITE_BACKEND_SERVER
    : 'http://localhost:8889/';

export const WEBSITE_URL = import.meta.env.PROD
  ? 'http://cloud.samueldev.com/'
  : 'http://localhost:3001/';
export const DOWNLOAD_BASE_URL = 'http://localhost:8889/download/';
export const ACCESS_TOKEN_NAME = 'x-auth-token';

export const FILE_BASE_URL = 'http://localhost:8889/';


