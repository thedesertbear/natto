import { Quest as BaseQuest, Task as BaseTask, Limit } from "grimoire-kolmafia";
import {
  fullnessLimit,
  inebrietyLimit,
  Item,
  itemAmount,
  mallPrice,
  myAdventures,
  myClass,
  myDaycount,
  myFamiliar,
  myFullness,
  myInebriety,
  mySpleenUse,
  nowToString,
  numericModifier,
  spleenLimit,
} from "kolmafia";
import { $class, $familiar, $item, Macro as BaseMacro, get, have, set } from "libram";

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

export function setChoice(choice: number, setting: number): void {
  set(`choiceAdventure${choice}`, setting);
}

export function haveAll(its: Item[]): boolean {
  return its.reduce((a, it) => a && have(it), true);
}

export function canDiet(): boolean {
  return (
    myFullness() < fullnessLimit() ||
    mySpleenUse() < spleenLimit() ||
    myInebriety() < inebrietyLimit() ||
    (have($item`distention pill`) && !get("_distentionPillUsed")) ||
    (have($item`synthetic dog hair pill`) && !get("_syntheticDogHairPillUsed")) ||
    (have($item`designer sweatpants`) && get("_sweatOutSomeBoozeUsed") < 3 && get("sweat") >= 25) ||
    (have($item`mime army shotglass`) && !get("_mimeArmyShotglassUsed")) ||
    (get("currentMojoFilters") < 3 &&
      mallPrice($item`mojo filter`) + mallPrice($item`transdermal smoke patch`) <
        2.5 * get("valueOfAdventure"))
  );
}

export function stooperDrunk(): boolean {
  return (
    myInebriety() > inebrietyLimit() ||
    (myInebriety() === inebrietyLimit() && myFamiliar() === $familiar`Stooper`)
  );
}

export function readyForBed(): boolean {
  return (
    !canDiet() &&
    myAdventures() + numericModifier("adventures") + 40 < 140 &&
    get("garboResultsDate", "") === nowToString("YYYYMMdd")
  );
}

export function backstageItemsDone(): boolean {
  return (
    (have($item`giant marshmallow`) ? 1 : 0) +
      (have($item`beer-scented teddy bear`) ? 1 : 0) +
      itemAmount($item`gin-soaked blotter paper`) >=
      2 &&
    (have($item`booze-soaked cherry`) ? 1 : 0) +
      (have($item`comfy pillow`) ? 1 : 0) +
      itemAmount($item`sponge cake`) >=
      2
  );
}
