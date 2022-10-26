import { Quest as BaseQuest, Task as BaseTask, Limit } from "grimoire-kolmafia";
import {
  Class,
  fullnessLimit,
  getPermedSkills,
  inCasual,
  inebrietyLimit,
  inHardcore,
  Item,
  itemAmount,
  myAdventures,
  myClass,
  myDaycount,
  myFamiliar,
  myFullness,
  myInebriety,
  mySpleenUse,
  nowToString,
  numericModifier,
  Skill,
  spleenLimit,
} from "kolmafia";
import {
  $class,
  $classes,
  $familiar,
  $item,
  $skill,
  $skills,
  Macro as BaseMacro,
  get,
  have,
  set,
} from "libram";
import { garboValue } from "../engine/profits";

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
  if (myClass() === $class`Grey Goo` || myDaycount() === 1) return Leg.GreyYou;
  return Leg.Aftercore;
}

export const baseClasses = $classes`Seal Clubber, Turtle Tamer, Pastamancer, Sauceror, Disco Bandit, Accordion Thief`;

export const defaultPermList = [
  $skills`Natural Born Scrabbler, Thrift and Grift, Abs of Tin, Marginally Insane, Club Earth, Carbohydrate Cudgel, Splattersmash, Grab a Cold One, Song of the North, Turtleini, Sauceshell, Conspiratorial Whispers, Song of Slowness, Spaghetti Breakfast, Shadow Noodles, Song of Starch, Splashdance, Song of Sauce, Song of Bravado, Walberg's Dim Bulb, Singer's Faithful Ocelot, Drescher's Annoying Noise, Deep Dark Visions, Shattering Punch, Snokebomb, Shivering Monkey Technique, Bow-Legged Swagger, Bend Hell, Steely-Eyed Squint, Astute Angler, Lock Picking, Long Winter's Nap, Bowl Full of Jelly, Ashes and Soot, Eye and a Twist, Dimples\, How Merry!, Chubby and Plump, Dead Nostrils, Brain Games, Slimy Sinews, Slimy Synapses, Slimy Shoulders, Thick-Skinned, Blood Bubble, Object Quasi-Permanence, Grease Up, 5-D Earning Potential, Hypersane, Refusal to Freeze, Olfactory Burnout, Asbestos Heart, Unoffendable, Gingerbread Mob Hit, Fashionably Late, Ancestral Recall, Giant Growth, Disintegrate, Expert Corner-Cutter, Rapid Prototyping, Executive Narcolepsy, Prevent Scurvy and Sobriety, The Spirit of Taking, Blood Frenzy`,
  $skills`Curse of Weaksauce, Itchy Curse Finger, Torso Awareness, Cannelloni Cocoon`,
  $skills`Nimble Fingers, Amphibian Sympathy, Leash of Linguini, Thief Among the Honorable, Expert Panhandling, Disco Leer, Five Finger Discount, Double-Fisted Skull Smashing, Impetuous Sauciness, Tao of the Terrapin, Saucestorm`,
  $skills`Tongue of the Walrus, Mad Looting Skillz, Smooth Movement, Musk of the Moose, The Polka of Plenty, The Sonata of Sneakiness, Carlweather's Cantata of Confrontation, Mariachi Memory`,
  $skills`Gnefarious Pickpocketing, Powers of Observatiogn, Gnomish Hardigness, Cosmic Ugnderstanding, Ambidextrous Funkslinging, The Long View, Wisdom of the Elder Tortoises, Inner Sauce, Pulverize, Springy Fusilli, Overdeveloped Sense of Self Preservation`,
  $skills`Pastamastery, Advanced Cocktailcrafting, The Ode to Booze, Advanced Saucecrafting, Saucemaven, The Way of Sauce, Fat Leon's Phat Loot Lyric, Empathy of the Newt, The Moxious Madrigal, Stuffed Mortar Shell, Flavour of Magic, Elemental Saucesphere, Spirit of Ravioli, Lunging Thrust-Smack, Entangling Noodles, Cold-Blooded Fearlessness, Northern Exposure, Diminished Gag Reflex, Tolerance of the Kitchen, Heart of Polyester, Irrepressible Spunk, Saucegeyser, Scarysauce, Disco Fever, Rage of the Reindeer, The Magical Mojomuscular Melody, Testudinal Teachings, Disco Nap, Adventurer of Leisure, Armorcraftiness`,
  $skills`Superhuman Cocktailcrafting, Transcendental Noodlecraft, Super-Advanced Meatsmithing, Patient Smile, Wry Smile, Knowing Smile, Aloysius' Antiphon of Aptitude, Pride of the Puffin, Ur-Kel's Aria of Annoyance, Sensitive Fingers, Master Accordion Master Thief, Skin of the Leatherback, Hide of the Walrus, Astral Shell, Ghostly Shell, Subtle and Quick to Anger, Master Saucier, Hero of the Half-Shell, Shield of the Pastalord, Saucy Salve, The Power Ballad of the Arrowsmith, Jalapeño Saucesphere, Claws of the Walrus, Shell Up, Brawnee's Anthem of Absorption, Reptilian Fortitude, The Psalm of Pointiness, Spiky Shell, Stiff Upper Lip, Blubber Up, Disco Smirk, Blood Sugar Sauce Magic, Cletus's Canticle of Celerity, Suspicious Gaze, Icy Glare, Dirge of Dreadfulness, Snarl of the Timberwolf, Stevedave's Shanty of Superiority, Northern Explosion`,
];

export function expectedKarma(): number {
  return get("bankedKarma") + (inHardcore() ? 200 : inCasual() ? 0 : 100);
}

export function nextPerms(nextClass?: Class): Skill[] {
  const classChoices = baseClasses.includes(myClass())
    ? [myClass()]
    : nextClass && nextClass !== $class`none`
    ? [nextClass]
    : baseClasses;
  const permOptions = defaultPermList
    .slice(1) //remove skillbook perms
    .map((sks) =>
      sks.filter(
        (sk) =>
          sk.permable &&
          !(sk.name in getPermedSkills()) &&
          (have(sk) ||
            ((classChoices.includes(sk.class) || sk === $skill`Torso Awareness`) && //remove non-core-class skills (add gnome skills back sometime)
              sk.level > 0)) //only include guild-learnable skills (and starting class skills)
      )
    );
  const qty = permOptions.findIndex((sks) => sks.length !== 0) + 1;
  if (qty > expectedKarma() / 100 || qty === 0) return []; //don't perm anything (bank karma)

  const topSkill = permOptions.flat().find((sk) => classChoices.includes(sk.class)) || $skill`none`; //top skill will define our class choice.
  return permOptions
    .flat()
    .filter((sk) => sk === $skill`Torso Awareness` || sk.class === topSkill.class)
    .slice(0, qty + Math.ceil(Math.sqrt(expectedKarma() / 100 - qty))); //select 1 or more skills from the same class to perm
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
      garboValue($item`mojo filter`) + garboValue($item`transdermal smoke patch`) <
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
