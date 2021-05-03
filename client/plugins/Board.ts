import { Player } from "../Player";
import { PlayerState } from "../.rtag/types";
import { RtagClient } from "../.rtag/client";

const BUFFER_TIME = 140;

export default class BoardComponent extends HTMLElement {
  client: RtagClient | undefined;
  players: Player[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 700;
    canvas.style.display = "block";
    canvas.style.border = "1px solid white";
    canvas.onclick = (e: MouseEvent) => {
      this.client?.updateTarget({ target: { x: e.offsetX, y: e.offsetY } });
    };
    this.shadowRoot!.append(canvas);
    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      const now = Date.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "white";
      this.players.forEach((player) => {
        const { x, y } = player.getCurrPos(now);
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.stroke();
      });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  set state(state: PlayerState) {
    state.board.forEach((player) => {
      const existingPlayer = this.players.find((p) => p.name === player.name);
      if (existingPlayer === undefined) {
        this.players.push(new Player(player.name, player.location));
      } else {
        existingPlayer.updateTarget(player.location, state.updatedAt + BUFFER_TIME);
      }
    });
  }
}
