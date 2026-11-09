import { startGame } from "../../shared/shell.js";
import { mountGrid } from "../../shared/grid-engine.js";
import { meta, concepts, challenges } from "./content.js";

startGame({ root: document.getElementById("game"), ...meta, concepts, challenges, mount: mountGrid });
