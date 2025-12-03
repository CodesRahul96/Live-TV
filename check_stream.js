import http from "http";

const url1 = "http://agh2019.xyz:80/SOFIANBENAISSA/X7KJL94/1019420";
const url2 = "http://agh2019.xyz:80/SOFIANBENAISSA/X7KJL94/1019420.m3u8";

const checkUrl = (url) => {
  console.log(`Checking: ${url}`);
  const options = {
    method: "HEAD",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  };
  const req = http.request(url, options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log("Headers:", res.headers);
    if (res.statusCode === 302 || res.statusCode === 301) {
      console.log("Redirect Location:", res.headers.location);
    }
  });

  req.on("error", (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
};

checkUrl(url1);
setTimeout(() => checkUrl(url2), 2000);
