import { Context, Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();
const key = env["SLINK_API_KEY"];

export const app = new Hono();
let kv;
try {
  kv = await Deno.openKv();
} catch (err) {
  console.error("No Kv ", err);
  const store = new Map<string, any>();
  kv = {
    set: (keys: Array<string>, payload: any) => {
      store.set(JSON.stringify(keys), payload);
      return payload
    },
    get: (keys: Array<string>) => {
      const data = store.get(JSON.stringify(keys))
      return data;
    },
    store
  }
}

app.get("/", (c) => c.redirect("/locals/main"));

const checkApiKey = (c: Context) => {
  const token = c.req.param("token");
  if (key != token) {
    c.status(403);
    return c.body("Bad api key");
  }
  return null;

}

app.post("/locals/:token", async (c: Context) => {
  const apiKeyResponse = checkApiKey(c);
  if (apiKeyResponse) {
    return apiKeyResponse;
  }
  const body = await c.req.json();
  body.dtm = new Date().getTime();
  const result = await kv.set(["locals", body.token], body);
  return c.json(result);
});

app.get("/locals/:token", async (c) => {
  const apiKeyResponse = checkApiKey(c);
  if (apiKeyResponse) {
    return apiKeyResponse;
  }
  const token = c.req.param("token");
  const result = await kv.get(["locals", token]);
  console.log("'", token, '" request got ', result);
  return c.json(result);
});

Deno.serve(app.fetch);
