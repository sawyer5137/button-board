import express from "express";
import { runAction } from "./src/actions.js";
import { readFile } from "node:fs/promises";
import path from "path";
import { getIP, indexButtons } from "./src/utils.js";
import cors from "cors";

const configFile = JSON.parse(
  await readFile(new URL("./configButtons.json", import.meta.url), "utf8"),
);
const __dirname = import.meta.dirname;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let actionByIdMap = new Map();

const PORT = 1234;

//Runs action when request is received based on button id
app.post("/", (req, res) => {
  const id = Number(req.body.buttonId);
  const action = actionByIdMap.get(id);

  console.log(actionByIdMap);

  if (!action)
    return res.status(404).json({ error: "No action for that buttonId" });

  runAction(action);

  res.json({ ok: true });
});

//Endpoint for app to get config file
app.get("/buttonConfig", (req, res) => {
  const indexedConfig = indexButtons(configFile);

  console.log(indexedConfig);

  actionByIdMap = indexedConfig.actionById;

  res.json(indexedConfig.indexedButtons);
});

//Endpoint for app to get images
app.use("/images", express.static(path.join(__dirname, "/images")));

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);

  const ips = getIP();
  if (ips.length === 0) {
    console.log("No LAN IPv4 address found.");
  } else {
    console.log("LAN addresses (use one of these in the app):");
    for (const ip of ips) {
      console.log(`- ${ip.name}: http://${ip.address}:${PORT}`);
    }
  }
});
