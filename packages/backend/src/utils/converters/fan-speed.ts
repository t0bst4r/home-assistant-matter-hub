import { FanControl } from "@matter/main/clusters";

export class FanSpeed {
  constructor(
    readonly currentSpeed: number,
    readonly maxSpeed: number,
  ) {}

  step(request: FanControl.StepRequest) {
    const direction =
      request.direction === FanControl.StepDirection.Increase ? 1 : -1;
    let next = this.currentSpeed + direction;
    if (next === 0 && !request.lowestOff) {
      next += direction;
    }
    if (request.wrap) {
      if (next < 0) {
        next = this.maxSpeed;
      } else if (next > this.maxSpeed) {
        next = !request.lowestOff ? 1 : 0;
      }
    }
    if (next < 0 || next > this.maxSpeed) {
      next = this.currentSpeed;
    }
    return new FanSpeed(next, this.maxSpeed);
  }
}
