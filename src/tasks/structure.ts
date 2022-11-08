import { Quest as BaseQuest, Task as BaseTask, Limit } from "grimoire-kolmafia";
import { myClass, myDaycount } from "kolmafia";
import { $class, Macro as BaseMacro, get } from "libram";

export type Task = BaseTask & {
  tracking?: string;
  limit?: Limit;
};
export type Quest = BaseQuest<Task>;

export class Macro extends BaseMacro {
  public setAutoAttack(): Macro {
    super.setAutoAttack();
    return this;
  }
}

export enum Leg {
  Aftercore = 0,
  GreyYou = 1,
  last = 1,
}

export function getCurrentLeg(): number {
  if (myClass() === $class`Grey Goo` || myDaycount() === 1 || get("_freshOutOfGreyYou", false))
    return Leg.GreyYou;
  return Leg.Aftercore;
}
