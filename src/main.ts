import { Game } from "./core/Game";
import { mountVersionTag } from "./ui/VersionTag";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

const game = new Game(canvas);
game.start();

mountVersionTag();
