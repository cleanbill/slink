curl 'http://localhost:8000/locals/' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:8000' \
  -H 'Referer: http://localhost:8000/' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' \
  -H 'X-API-KEY: aa-test-token-this-is-very-long-too-long-for-pw' \
  -H 'sec-ch-ua: "Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Linux"' \
  -verbose \
  --data-raw $'{"token":"aa-test-token-this-is-very-long-too-long-for-pw","data":[{"date": "2024-01-10T16:37:58.345Z","guests": [{"eater": {"name": "The Olds"},"meal": {"name": "Baked Potatoes with stuff"}}]}]}'