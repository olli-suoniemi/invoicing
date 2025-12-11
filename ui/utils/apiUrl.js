// ui/utils/apiUrl.js
const ENV = process.env.ENV || "local";

export const apiURL =
  ENV === "local"
    // docker-compose service "api" for local dev
    ? "http://api:7777"
    // everything else (swarm prod, staging, etc.) talks to the swarm service name
    : "http://crm-api:7777";
