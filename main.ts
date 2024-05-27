import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";

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

// Redirect root URL
app.get("/", (c) => c.redirect("/locals/main"));

// Create a local (POST body is JSON)
app.post("/locals", async (c) => {
  const body = await c.req.json();
  body.dtm = new Date().getTime();
  const result = await kv.set(["locals", body.token], body);
  return c.json(result);
});

// Get a local by title
app.get("/locals/:token", async (c) => {
  const token = c.req.param("token");
  const result = await kv.get(["locals", token]);
  console.log("'", token, '" request got ', result);
  return c.json(result);
});

Deno.serve(app.fetch);
