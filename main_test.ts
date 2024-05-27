import { assertEquals } from "jsr:@std/assert";
import { app } from "./main.ts";

Deno.test('Post and get back', async () => {
  const token = "nice-one";
  const jsonData = { token, "localstuff": "kjkjkj" };

  const postRequest = new Request("http://localhost:8000/locals", {
    method: 'POST',
    body: JSON.stringify(jsonData)
  });
  const postResponse = await app.request(postRequest);
  const postBodyResponse = await postResponse.json();
  assertEquals(postResponse.status, 200);
  assertEquals(token, postBodyResponse.token);

  const getRequest = new Request("http://localhost:8000/locals/" + token, {
    method: 'GET'
  });
  const getResponse = await app.request(getRequest);
  const getResponseBody = await getResponse.json();
  assertEquals(getResponse.status, 200);
  assertEquals(jsonData.token, getResponseBody.token);


});
