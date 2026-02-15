import { Context, Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

import { encrypt, decipher } from "./crypto.ts";

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

const checkApiKey = (c: Context, token: string | undefined) => {
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

app.get("/", (c: { redirect: (arg0: string) => any; }) => c.redirect(BASE_URL + '/notoken'));

app.post(BASE_URL, async (c: Context) => {
  console.info('POST');
  const body = await getBody(c);
  const token = c.req.header('X-API-KEY') || "";
  const apiKeyResponse = checkApiKey(c, token);
  if (apiKeyResponse) {
    console.error('Bad token for post');
    return apiKeyResponse;
  }
  console.info('Token OK');
  body.dtm = new Date().getTime();
  const data = { ...body.data };
  if (!data.versionstamp) {
    data.versionstamp = '00000000000000000000';
  }
  body.inTheClear = true;
  console.warn('Encyption disabled');
  // try {
  //   body.data = encrypt(token, JSON.stringify(data));
  //   body.inTheClear = false;
  // } catch (er) {
  //   console.error('Cannot encrypt', er);
  // }
  try {
    console.log("About to store " + JSON.stringify(body).length + " JSON");
  } catch (er) {
    console.error("Logging failed for ", body, er);
  }
  await kv.set([BASE, body.token], body);
  const message = body.inTheClear ? 'CLEAR SAVE' : 'SAVE';
  console.log(message);
  console.info('');
  return c.json(data);
});

app.get(BASE_URL, async (c) => {
  console.info('GET');
  const token = c.req.header('X-API-KEY') || "";
  const apiKeyResponse = checkApiKey(c, token);
  if (apiKeyResponse) {
    console.error('Bad token for get');
    return apiKeyResponse;
  }
  console.info('Token OK');
  const result = await kv.get([BASE, token]) || {};
  if (Object.keys(result).length > 0) {
    console.info("'" + token + '" request got data back');
  } else {
    console.warn("'" + token + '" request got nothing back!?');
  }

  if (!result.versionstamp) {
    result.versionstamp = '00000000000000000000';
  }

  try {
    // if (result.inTheClear) {
    console.info('CLEAR SENT');
    return c.json(result);
    // }
  } catch (er) {
    console.error(er);
  }
  let data = { ...result.data }
  try {
    data = decipher(token, data);
  } catch (er) {
    console.error('cannot decipher ', er);
  }
  console.info('SENT');
  return c.json(data);

});

Deno.serve(app.fetch);
