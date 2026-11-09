import { startGame } from "../../shared/shell.js";
import { mountQuiz } from "../../shared/quiz-engine.js";
import { meta, concepts, challenges } from "./content.js";

startGame({ root: document.getElementById("game"), ...meta, concepts, challenges, mount: mountQuiz });
