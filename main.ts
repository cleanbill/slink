import { Context, Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const BASE = 'locals'
const BASE_URL = '/' + BASE + '/';
const ENV_TOKEN = "SLINK_API_KEY";
const SYNC_MAX = 33;

const env = await load();


// KV and test KV setup

const testKV = () => {
  const store = new Map<string, any>();
  const testKV = {
    set: (keys: Array<string>, payload: any) => {
      const key = JSON.stringify(keys);
      console.log("Stored " + key, ' => ', payload);
      store.set(key, payload);
      return payload
    },
    get: (keys: Array<string>) => {
      const key = JSON.stringify(keys);
      console.log("getting " + key);
      const data = store.get(key);
      return data;
    },
    store
  }
  return testKV;
}

let kv;
try {
  kv = await Deno.openKv();
} catch (err) {
  console.error("No Kv ", err);
  console.log(kv);
  kv = testKV();
}


// Server Tokens setup for environment variables

const getKey = (number = -1) => {
  const token = (number < 1) ? ENV_TOKEN : "SLINK_API_KEY" + "_" + number;
  const key = env[token] || Deno.env.get(token);
  if (key) {
    console.log(number + ". STARTING UP, API KEY IS " + key.length + " Characters long");
  } else {
    return false;
  }
  return key;
}
const tokens = [...Array(SYNC_MAX).keys()].map((n) => getKey(n)).filter((v) => v);

const validToken = (token: string) => (tokens.indexOf(token) > -1);



//  Helper functions....

const getBody = async (c: Context) => {
  try {
    const body = await c.req.json();
    return body;
  } catch (er) {
    console.error("Can't parse body", er);
  }

  return false;
}

const checkQueryParamToken = (c: Context) => {
  const token = c.req.param("token");
  const apiKeyResponse = checkApiKey(c, token);
  return { apiKeyResponse, token };
}

// const getToken = async (c: Context) => {
//   let body;
//   try {
//     body = await c.req.json();
//     const token = body.token;
//     return token;
//   } catch (er) {
//     console.error("Can't parse body to get token", body, er);
//   }

//   return false;
// }

const checkApiKey = (c: Context, token: string) => {
  if (!token) {
    c.status(400);
    return c.body("Missing token ");
  }
  if (!validToken) {
    c.status(403);
    return c.body(token.length + ". Bad api key " + token);
  }
  return null;
}



// Server functions

export const app = new Hono();

app.get("/", (c) => c.redirect(BASE_URL + '/notoken'));

app.post(BASE_URL + ":token", async (c: Context) => {
  console.info('POST');
  const body = await getBody(c);
  const apiKeyResponse = checkApiKey(c, body?.token);
  if (apiKeyResponse) {
    console.error('Bad token for post');
    return apiKeyResponse;
  }
  console.info('Token OK');
  body.dtm = new Date().getTime();
  const result = await kv.set([BASE, body.token], body);
  console.log('SAVED');
  console.info('');
  return c.json(result);
});

app.get(BASE_URL + ":token", async (c) => {
  console.info('GET');
  const checkResult = checkQueryParamToken(c);
  if (checkResult.apiKeyResponse) {
    console.error('Bad token for get');
    return checkResult.apiKeyResponse;
  }
  console.info('Token OK');
  const result = await kv.get([BASE, checkResult.token]);
  console.info("'" + checkResult.token + '" request got ', result);
  console.info('SENT');
  console.info('');
  return c.json(result);
});

Deno.serve(app.fetch);
