import * as config from "../env.config.json";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const shortenedUrls: Record<string, string> = {};

function getUniqueId(): string {
  return Array.from(Array(5), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
}

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body?.url;

  let shortUrl: string;

  if (!URL.canParse(originalUrl)) {
    return res.status(400).json({ error: "invalid url" });
  } else if (Object.values(shortenedUrls).includes(originalUrl)) {
    shortUrl = Object.keys(shortenedUrls).find(
      (k) => shortenedUrls[k] === originalUrl
    ) as string;
  } else {
    shortUrl = getUniqueId();

    while (Object.keys(shortenedUrls).includes(shortUrl)) {
      shortUrl = getUniqueId();
    }

    shortenedUrls[shortUrl] = originalUrl;
  }

  res.json({
    original_url: originalUrl,
    short_url: shortUrl,
  });
});

app.get("/api/shorturl/:url", (req, res) => {
  if (!Object.keys(shortenedUrls).includes(req.params.url)) {
    return res.status(404).json({ error: "url not found" });
  }

  res.redirect(shortenedUrls[req.params.url]);
});

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
