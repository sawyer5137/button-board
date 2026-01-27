import express from "express";
import { runAction } from "./src/actions.js";
import { readFile } from "node:fs/promises";
import path from "path";
import { getIP, indexButtons } from "./src/utils.js";
import cors from "cors";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 1234;

// ----- paths -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, "configButtons.json");

// ------ server side cached state -----
let currentVersion = 0;
let cachedButtons = [];
let actionByIdMap = new Map();

// ----- load + index config into cache -----
function loadAndIndexConfig() {
  const stat = fs.statSync(CONFIG_PATH);
  const version = stat.mtimeMs;

  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  const parsed = JSON.parse(raw);

  const indexedConfig = indexButtons(parsed);
  currentVersion = version;
  cachedButtons = indexedConfig.indexedButtons;
  actionByIdMap = indexedConfig.actionById;

  console.log(
    `[config] loaded version=${currentVersion} buttons=${cachedButtons.length} actions=${actionByIdMap.size}`,
  );
}

// ----- watch file and reload cache on change -----
// fs.watch can fire multiple events; debounce prevents double reloads.
let reloadTimer = null;
fs.watch(CONFIG_PATH, { persistent: true }, (eventType) => {
  if (eventType !== "change" && eventType !== "rename") return;

  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    try {
      loadAndIndexConfig();
    } catch (err) {
      console.error("[config] reload failed:", err);
    }
  }, 100);
});

//initial load
loadAndIndexConfig();

//run action if client version matches
app.post("/", (req, res) => {
  const id = Number(req.body.buttonId);
  const clientVersion = Number(req.body.version);

  if (clientVersion !== currentVersion) {
    return res.status(409).json({
      error: "Old config",
      serverVersion: currentVersion,
    });
  }

  const action = actionByIdMap.get(id);
  runAction(action);

  res.json({ ok: true });
});

//client fetches config file + version
app.get("/buttonConfig", (req, res) => {
  res.json({
    version: currentVersion,
    buttons: cachedButtons,
  });
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
