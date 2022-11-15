import {
  Familiar,
  fullnessLimit,
  inebrietyLimit,
  Item,
  itemAmount,
  mallPrice,
  Monster,
  myAdventures,
  myFamiliar,
  myFullness,
  myInebriety,
  myLevel,
  mySpleenUse,
  nowToString,
  numericModifier,
  spleenLimit,
} from "kolmafia";
import { $familiar, $familiars, $item, $items, $phylum, get, have, Snapper } from "libram";
import { garboAverageValue, garboValue } from "../engine/profits";
import { args } from "../main";

export function haveAll(its: Item[]): boolean {
  return its.reduce((a, it) => a && have(it), true);
}
export function haveAny(its: Item[]): boolean {
  return its.reduce((a, it) => a || have(it), false);
}

type MoonSign =
  | number
  | "mongoose"
  | "wallaby"
  | "vole"
  | "platypus"
  | "opossum"
  | "marmot"
  | "wombat"
  | "blender"
  | "packrat"
  | "gnomads"
  | "knoll"
  | "canadia";
export function toMoonSign(str: string | MoonSign): MoonSign {
  if (
    typeof str === "string" &&
    [
      "mongoose",
      "wallaby",
      "vole",
      "platypus",
      "opossum",
      "marmot",
      "wombat",
      "blender",
      "packrat",
      "gnomads",
      "knoll",
      "canadia",
    ].includes(str)
  )
    return str as MoonSign;
  throw new Error(`${str} is not a valid MoonSign`);
}

const minusMLItems = $items`nasty rat mask, Drowsy Sword, HOA regulation book, pocketwatch on a chain, security flashlight, Space Trip safety headphones, pine cone necklace, red badge, mushroom badge, water wings for babies, white earbuds, discarded bowtie`;
export function noML(): string {
  return `-ml, ${minusMLItems
    .filter((it) => have(it))
    .map((it) => `-equip ${it.name}`)
    .join(", ")}`;
}

export function maxBase(): string {
  return `175 bonus June Cleaver, ${
    garboValue($item`FunFunds™`) / 20 + 5
  } bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, ${
    0.4 * get("valueOfAdventure")
  } bonus mafia thumb ring, 10 bonus tiny stillsuit`;
}

function famValue(fam: Familiar, mob?: Monster) {
  switch (fam) {
    case $familiar`Grey Goose`:
      return myLevel() < args.targetlevel && $familiar`Grey Goose`.experience < 400 ? 6000 : 0;
    case $familiar`Red-Nosed Snapper`:
      if (mob && Snapper.getTrackedPhylum() && mob.phylum === Snapper.getTrackedPhylum())
        return garboValue(
          Snapper.phylumItem.get(Snapper.getTrackedPhylum() || $phylum`none`) || $item`none`
        );
      return 0;
    case $familiar`Cookbookbat`:
      return $items``.find((it) => it.name.indexOf("Recipe of Before Yore") >= 0 && have(it))
        ? garboAverageValue(
            ...$items`Yeast of Boris, Vegetable of Jarlsberg, St. Sneaky Pete's Whey`
          ) *
            (3.0 / 11)
        : 5000;
    case $familiar`Shorter-Order Cook`:
      return (
        garboAverageValue(
          ...$items`short white, short beer, short glass of water, short stack of pancakes, short stick of butter`
        ) / 11
      );
  }
  return 0;
}

export function bestFam(mob?: Monster) {
  const fams = $familiars`Grey Goose, Red-Nosed Snapper, Cookbookbat, Shorter-Order Cook`
    .filter((fam) => have(fam))
    .sort((a, b) => famValue(b, mob) - famValue(a, mob));
  return fams.find((fam) => have(fam));
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
