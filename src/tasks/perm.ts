import {
  Class,
  getPermedSkills,
  gnomadsAvailable,
  inCasual,
  inHardcore,
  myClass,
  printHtml,
  Skill,
  toClass,
} from "kolmafia";
import { $class, $classes, $skills, get, have, set } from "libram";

export function getClass(property: string, _default: Class): Class {
  return toClass(get(property, _default.toString()));
}
export function setClass(property: string, value: Class): void {
  set(property, value.toString());
}

export const baseClasses = $classes`Seal Clubber, Turtle Tamer, Pastamancer, Sauceror, Disco Bandit, Accordion Thief`;
export const gnomeSkills = $skills`Torso Awareness, Gnefarious Pickpocketing, Powers of Observatiogn, Gnomish Hardigness, Cosmic Ugnderstanding`;
const permBlockList = $skills`CLEESH`;

export const defaultPermList = [
  //tier 0 - all permable non-guild, non-gnome skills - never actually target these, but perm them as top priority if you happen to know them
  $skills``.filter(
    (sk) =>
      sk.permable && sk.level === -1 && !permBlockList.includes(sk) && !gnomeSkills.includes(sk)
  ),
  //tier 1 - needed for the script to run at its best
  $skills`Curse of Weaksauce, Itchy Curse Finger, Torso Awareness, Cannelloni Cocoon`,
  //tier 2 - great skills
  $skills`Nimble Fingers, Amphibian Sympathy, Leash of Linguini, Thief Among the Honorable, Expert Panhandling, Disco Leer, Five Finger Discount, Double-Fisted Skull Smashing, Impetuous Sauciness, Tao of the Terrapin, Saucestorm`,
  //tier 3 - good skills
  $skills`Tongue of the Walrus, Mad Looting Skillz, Smooth Movement, Musk of the Moose, The Polka of Plenty, The Sonata of Sneakiness, Carlweather's Cantata of Confrontation, Mariachi Memory`,
  //tier 4 - QoL skills
  $skills`Gnefarious Pickpocketing, Powers of Observatiogn, Gnomish Hardigness, Cosmic Ugnderstanding, Ambidextrous Funkslinging, The Long View, Wisdom of the Elder Tortoises, Inner Sauce, Pulverize, Springy Fusilli, Overdeveloped Sense of Self Preservation`,
  //tier 5 - ascension-relevant skills
  $skills`Pastamastery, Advanced Cocktailcrafting, The Ode to Booze, Advanced Saucecrafting, Saucemaven, The Way of Sauce, Fat Leon's Phat Loot Lyric, Empathy of the Newt, The Moxious Madrigal, Stuffed Mortar Shell, Flavour of Magic, Elemental Saucesphere, Spirit of Ravioli, Lunging Thrust-Smack, Entangling Noodles, Cold-Blooded Fearlessness, Northern Exposure, Diminished Gag Reflex, Tolerance of the Kitchen, Heart of Polyester, Irrepressible Spunk, Saucegeyser, Scarysauce, Disco Fever, Rage of the Reindeer, The Magical Mojomuscular Melody, Testudinal Teachings, Disco Nap, Adventurer of Leisure, Armorcraftiness`,
  //tier 6 - skills with non-zero utility
  $skills`Superhuman Cocktailcrafting, Transcendental Noodlecraft, Super-Advanced Meatsmithing, Patient Smile, Wry Smile, Knowing Smile, Aloysius' Antiphon of Aptitude, Pride of the Puffin, Ur-Kel's Aria of Annoyance, Sensitive Fingers, Master Accordion Master Thief, Skin of the Leatherback, Hide of the Walrus, Astral Shell, Ghostly Shell, Subtle and Quick to Anger, Master Saucier, Hero of the Half-Shell, Shield of the Pastalord, Saucy Salve, The Power Ballad of the Arrowsmith, Jalapeño Saucesphere, Claws of the Walrus, Shell Up, Brawnee's Anthem of Absorption, Reptilian Fortitude, The Psalm of Pointiness, Spiky Shell, Stiff Upper Lip, Blubber Up, Disco Smirk, Blood Sugar Sauce Magic, Cletus's Canticle of Celerity, Suspicious Gaze, Icy Glare, Dirge of Dreadfulness, Snarl of the Timberwolf, Stevedave's Shanty of Superiority, Northern Explosion`,
  //tier 7 - all other guild skills
  $skills``.filter((sk) => sk.permable && sk.level >= 0),
  //tier 8 - otherwise-blocked skills
  permBlockList,
];

export function permOptions(planning: boolean): Skill[][] {
  //planning = true: next run, false: this run
  const classChoices = planning
    ? baseClasses
    : baseClasses.includes(myClass())
    ? [myClass()]
    : [getClass("goorboNextClass", getClass("goorboDefaultClass", $class`Seal Clubber`))];
  const ctPerms = planning ? targetPerms(false) : [];
  return !planning //current run
    ? defaultPermList.map((sks) =>
        sks.filter(
          (sk) =>
            !(sk.name in getPermedSkills()) &&
            (have(sk) ||
              (gnomeSkills.includes(sk) && gnomadsAvailable()) ||
              (classChoices.includes(sk.class) && sk.level > 0))
        )
      ) //for current run, include skills that we know or that we can train in this run.
    : defaultPermList.map((sks) =>
        sks.filter(
          (sk) =>
            !(sk.name in getPermedSkills() || ctPerms.includes(sk)) &&
            (gnomeSkills.includes(sk) || (classChoices.includes(sk.class) && sk.level >= 0))
        )
      ); //for next run, exclude all skills that we are planning to perm this run, and allow all guild and gnome skills.
}

export function permTier(planning: boolean) {
  // the highest tier of unpermed skills available. Returns 0 if no non-tier 0 skills are available
  return (
    permOptions(planning)
      .slice(1)
      .findIndex((sks) => sks.length !== 0) + 1
  );
}

export function expectedKarma(planning: boolean): number {
  return !planning
    ? get("bankedKarma") + (inHardcore() ? 200 : inCasual() ? 0 : 100)
    : expectedKarma(false) -
        targetPerms(false).length * 100 +
        (inHardcore() ? 200 : inCasual() ? 0 : 100);
}

export function targetClass(planning: boolean): Class {
  if (myClass() === $class`Grey Goo`)
    return getClass("goorboNextClass", getClass("goorboDefaultClass", $class`Seal Clubber`));
  //can't access permed skill status in grey goo

  const sk = permOptions(planning)
    .flat()
    .find((sk) => baseClasses.includes(sk.class));
  return sk ? sk.class : getClass("goorboDefaultClass", $class`Seal Clubber`);
}

export function targetPerms(planning: boolean): Skill[] {
  const pOptions = permOptions(planning);
  const tier = permTier(planning);
  if (tier > expectedKarma(planning) / 100 || tier === 0)
    //don't perm anything (bank karma), but do perm high-tier skills you happen to already know (probably due to Big Book or manually used skillbooks)
    return !planning
      ? pOptions
          .slice(0, tier + 1) //skills in tiers <= your current best perm target
          .flat()
          .filter((sk) => have(sk))
          .slice(0, Math.floor(expectedKarma(false) / 100)) //don't plan to perm more than we have karma for
      : []; //don't plan to perm anything next run if we plan to bank karma

  const qty = tier + Math.ceil(Math.sqrt(Math.max(0, expectedKarma(planning) / 100 - tier)));
  const tClass = planning ? targetClass(true) : $class`none`;
  return (
    !planning
      ? pOptions.flat() //return first X perm ptions
      : pOptions.flat().filter((sk) => sk.class === tClass || gnomeSkills.includes(sk))
  ).slice(0, qty);
}

function planHelper(perms: Skill[], cls: Class, karma: number) {
  if (perms.length > 0)
    return `Perm plan: [${perms.join(
      ", "
    )}] - Class: <span color="blue">${cls}</span>, Expected Karma: ${karma}`;
  else
    return `Perm Plan: bank karma - Class: <span color="blue">${cls}</span>, Expected Karma: ${karma}`;
}

export function printPermPlan() {
  printHtml(
    `Current ${planHelper(targetPerms(false), targetClass(false), expectedKarma(false))}`,
    true
  );
  printHtml(`Next ${planHelper(targetPerms(true), targetClass(true), expectedKarma(true))}`, true);
}
