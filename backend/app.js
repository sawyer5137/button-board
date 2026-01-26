import express from "express";
import {
  toggleProgram,
  openURL,
  pasteText,
  toggleSteamGame,
} from "./src/actions.js";
import configFile from "./configButtons.json" assert { type: "json" };
import fs from "fs";
import path from "path";
import { getIP } from "./src/utils.js";
import cors from "cors";

const __dirname = import.meta.dirname;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const buttons = JSON.parse(fs.readFileSync("configButtons.json", "utf8"));

const PORT = 1234;

app.post("/", (req, res) => {
  const buttonObj = buttons[req.body.buttonId];
  const action = buttonObj.action;
  console.log(buttonObj);

  if (action.type == "launch") toggleProgram(action.program);
  if (action.type == "steam") toggleSteamGame(action.game, action.gameId);
  if (action.type == "url") openURL(action.url, action.program);
  if (action.type == "paste") pasteText(action.text);

  res.json({});
});

app.get("/buttonConfig", (req, res) => {
  res.json(configFile);
});

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
