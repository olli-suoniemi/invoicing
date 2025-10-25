const ENV = process.env.ENV || "local"; // Default to "local" if ENV is undefined

export const apiURL =
  ENV === 'local'
    ? 'http://api:7777'
    : ENV === 'production'
      ? 'https://api.ollicodes.fi'
      : `https://api.staging.ollicodes.fi`;