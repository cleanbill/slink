import { assertEquals } from "jsr:@std/assert";
import { app } from "./main.ts";

Deno.test('Post and get back', async () => {
  // const token = "nice-one";
  // const jsonData = { token, "localstuff": "kjkjkj" };

  // const postRequest = new Request("http://localhost:8000/locals", {
  //   method: 'POST',
  //   headers: { "Content-Type": "application/json", "X-API-KEY": token },
  //   body: JSON.stringify(jsonData)
  // });
  // const postResponse = await app.request(postRequest);
  // console.log(postResponse);
  // const postBodyResponse = await postResponse.json();
  // assertEquals(postResponse.status, 200);
  // assertEquals(token, postBodyResponse.token);

  // const getRequest = new Request("http://localhost:8000/locals/" + token, {
  //   method: 'GET',
  //   headers: { "Content-Type": "application/json", "X-API-KEY": token }
  // });
  // const getResponse = await app.request(getRequest);
  // console.log(getResponse);
  // try {
  //   const getResponseBody = await getResponse.json();
  //   assertEquals(getResponse.status, 404);
  //   assertEquals(jsonData.token, getResponseBody.token);
  // } catch (er) {
  //   console.error('cannot get', er);
  // }

});
