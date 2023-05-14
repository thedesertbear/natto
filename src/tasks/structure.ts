import { Quest as BaseQuest, Task as BaseTask, Limit } from "grimoire-kolmafia";
import { myClass, myDaycount, myPath } from "kolmafia";
import { $class, $path, get } from "libram";

export type Task = BaseTask & {
  tracking?: string;
  limit?: Limit;
  clear?: "all" | "outfit" | "macro" | ("outfit" | "macro")[];
};
export type Quest = BaseQuest<Task>;

export enum Leg {
  Aftercore = 0,
  GreyYou = 1,
  CommunityService = 1,
  last = 1,
}

export function getCurrentLeg(): number {
  // if (myClass() === $class`Grey Goo` || myDaycount() === 1 || get("_freshOutOfGreyYou", false)) {
  //   return Leg.GreyYou;
  // }
  if (myPath() === $path`Community Service` || myDaycount() === 1) {
    return Leg.CommunityService;
  }
  return Leg.Aftercore;
}
