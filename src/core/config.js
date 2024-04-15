// config.js

// global configuration options for the smile app
// fields import.meta.env.XXXX are string replaced by vite

function parse_w_h(value) {
  // receives configuration option as WIDTHxHEIGHT
  // split based on 'x' and assign to objects
  const w_h = value.split('x')
  return { width: parseInt(w_h[0]), height: parseInt(w_h[1]) }
}
export default {
  mode: import.meta.env.MODE,
  project_name: import.meta.env.VITE_PROJECT_NAME, // autocompute this on intitialization
  project_ref: import.meta.env.VITE_DEPLOY_BASE_PATH.slice(1, -1).replace(/\//g, '-'),
  code_name: import.meta.env.VITE_CODE_NAME,
  code_name_url: import.meta.env.VITE_CODE_NAME_DEPLOY_URL,
  local_storage_key: `smilestore-${import.meta.env.VITE_CODE_NAME}`,
  dev_local_storage_key: `smilestore-${import.meta.env.VITE_CODE_NAME}_dev`,
  github: {
    repo_name: import.meta.env.VITE_GIT_REPO_NAME,
    owner: import.meta.env.VITE_GIT_OWNER,
    branch: import.meta.env.VITE_GIT_BRANCH_NAME,
    last_commit_msg: import.meta.env.VITE_GIT_LAST_MSG,
    last_commit_hash: import.meta.env.VITE_GIT_HASH, // autocompute this all the time
    commit_url: `https://github.com/${import.meta.env.VITE_GIT_OWNER}/${import.meta.env.VITE_GIT_REPO_NAME}/commit/${
      import.meta.env.VITE_GIT_HASH
    }`,
  },
  browser_exclude: import.meta.env.VITE_BROWSER_EXCLUDE,
  allow_repeats: import.meta.env.VITE_ALLOW_REPEATS,
  auto_save: import.meta.env.VITE_AUTO_SAVE_DATA,
  max_writes: import.meta.env.VITE_MAX_WRITES,
  max_doc_size_mb: import.meta.env.VITE_MAX_DOC_SIZE_MB,
  buffer_interval: import.meta.env.VITE_BUFFER_INTERVAL,
  min_write_interval: import.meta.env.VITE_MIN_WRITE_INTERVAL,
  show_progress_bar: import.meta.env.VITE_SHOW_PROGRESS_BAR,
  bug_reports: import.meta.env.VITE_BUG_REPORTS,
  random_seed: import.meta.env.VITE_RANDOM_SEED,
  deploy_url: import.meta.env.VITE_DEPLOY_URL, // auto compute this
  estimated_time: import.meta.env.VITE_ESTIMATED_TIME,
  payrate: import.meta.env.VITE_PAYRATE,
  google_analytics_id: import.meta.env.VITE_GOOGLE_ANALYTICS,
  windowsizer_request: parse_w_h(import.meta.env.VITE_WINDOWSIZER_REQUEST),
  windowsizer_aggressive: import.meta.env.VITE_WINDOWSIZER_AGGRESSIVE,
  firebaseConfig: {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_FIREBASE_APPID,
  },
}
