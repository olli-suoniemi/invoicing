const decoder = new TextDecoder("utf-8");

const FORWARD_EMAIL_API_KEY = decoder.decode(Deno.readFileSync("/run/secrets/CRM_FORWARD_EMAIL_API_KEY")) 
