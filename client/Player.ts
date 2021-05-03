import { Point } from "./.rtag/types";

const CLIENT_TICKRATE = 1000 / 60;

export class Player {
  name: string;
  restingLocation: Point;
  buffer: { location: Point; time: number }[] = [];

  constructor(name: string, location: Point) {
    this.name = name;
    this.restingLocation = location;
  }

  updateTarget(target: Point, time: number) {
    if (target.x !== this.restingLocation.x || target.y !== this.restingLocation.y) {
      this.buffer.push({ location: target, time });
      console.log("[updateTarget]");
    }
  }

  getCurrPos(now: number) {
    if (this.buffer.length === 0) {
      console.log("buffer empty");
      return this.restingLocation;
    }

    if (this.buffer[this.buffer.length - 1].time <= now) {
      console.log("buffer emptied");
      this.restingLocation = this.buffer[this.buffer.length - 1].location;
      this.buffer = [];
      return this.restingLocation;
    }

    for (let i = this.buffer.length - 1; i >= 0; i--) {
      if (this.buffer[i].time <= now) {
        console.log("server interpolation");
        const [from, to] = [this.buffer[i], this.buffer[i + 1]];
        this.buffer.splice(0, i);
        return lerp(from.location, to.location, (now - from.time) / (to.time - from.time));
      }
    }

    console.log("client interpolation");
    return lerp(
      this.restingLocation,
      this.buffer[0].location,
      CLIENT_TICKRATE / (this.buffer[0].time - now + CLIENT_TICKRATE)
    );
  }
}

function lerp(a: Point, b: Point, pctElapsed: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return { x: a.x + dx * pctElapsed, y: a.y + dy * pctElapsed };
}
