import {
  Familiar,
  getPermedSkills,
  Item,
  Monster,
  print,
  printHtml,
  Skill,
  storageAmount,
} from "kolmafia";
import { $class, $familiar, $familiars, $item, $skill, CombatLoversLocket, have } from "libram";
import { defaultPermList, targetClass, targetPerms } from "./perm";

type SpecialThing = {
  have: () => boolean;
  name: string;
};

type Thing = Item | Familiar | Skill | Monster | SpecialThing;
interface Requirement {
  thing: Thing | Thing[];
  why: string;
  optional?: boolean;
}

/**
 * Return: a list of all things required to run the script.
 */
const generalList: Requirement[] = [
  { thing: $familiar`Grey Goose`, why: "Running Grey You Path" },
  { thing: $skill`Curse of Weaksauce`, why: "aftercore combat" },
  {
    thing: $familiars`Robortender, Space Jellyfish, Hobo Monkey, Leprechaun`,
    why: "in-run farming familiar",
  },
  { thing: $skill`Torso Awareness`, why: "general purpose", optional: true },
  {
    thing: $item`porquoise-handled sixgun`,
    why: "mp maintenance (20-30 free mp / combat)",
    optional: true,
  },
];
const levelList: Requirement[] = [
  { thing: $item`January's Garbage Tote`, why: "aftercore leveling (all)", optional: true },
  { thing: $item`familiar scrapbook`, why: "aftercore leveling (all)", optional: true },
  { thing: $item`trench lighter`, why: "aftercore leveling (all)", optional: true },
  // { thing: $skill`Feel Pride`, why: "aftercore leveling (all)", optional: true },
  // { thing: $item`[glitch season reward name]`, why: "aftercore leveling (all)", optional: true },
  // { thing: $item`cosmic bowling ball`, why: "aftercore leveling (all)", optional: true },
  { thing: $item`fake washboard`, why: "aftercore leveling (mus)", optional: true },
  { thing: $skill`Inscrutable Gaze`, why: "aftercore leveling (mys)", optional: true },
  { thing: $item`basaltamander buckler`, why: "aftercore leveling (mys)", optional: true },
];
const profitList: Requirement[] = [
  { thing: $item`lucky gold ring`, why: "in-run farming profits", optional: true },
  { thing: $item`Mr. Cheeng's spectacles`, why: "in-run farming profits", optional: true },
  { thing: $item`mafia thumb ring`, why: "in-run farming profits", optional: true },
  { thing: $item`SongBoom™ BoomBox`, why: "in-run farming profits", optional: true },
  { thing: $item`carnivorous potted plant`, why: "minor turnsave", optional: true },
  {
    thing: $item`infinite BACON machine`,
    why: "source of renewable Fat Loot Tokens",
    optional: true,
  },
];
const marginalList: Requirement[] = [
  { thing: $item`The Jokester's gun`, why: "turnsave", optional: true },
  { thing: $item`hewn moon-rune spoon`, why: "easier perming of gnome skills", optional: true },
];

function checkThing(thing: Thing): [boolean, string] {
  if ("have" in thing && "name" in thing && thing.have instanceof Function)
    return [thing.have(), thing.name]; //if this is a SpecialThing
  if (thing instanceof Familiar) return [have(thing), thing.hatchling.name];
  if (thing instanceof Skill) return [thing.name in getPermedSkills(), thing.name];
  if (thing instanceof Monster)
    return [new Set(CombatLoversLocket.unlockedLocketMonsters()).has(thing), thing.name];
  if (thing instanceof Item) return [have(thing) || storageAmount(thing) > 0, thing.name];
  return [false, thing.name];
}

function check(req: Requirement): [boolean, string, Requirement] {
  if (Array.isArray(req.thing)) {
    const checks = req.thing.map(checkThing);

    return [
      checks.find((res) => res[0]) !== undefined,
      checks.map((res) => res[1]).join(" OR "),
      req,
    ];
  } else {
    const res = checkThing(req.thing);
    return [res[0], res[1], req];
  }
}

export function checkReqs(): void {
  let missing_optional = 0;
  let missing = 0;

  const categories: [string, Requirement[]][] = [
    ["Required", generalList.filter((req) => !req.optional)],
    ["General", generalList.filter((req) => req.optional)],
    ["Leveling", levelList],
    ["Profits", profitList],
    ["Marginal", marginalList],
  ];
  printHtml(
    "Checking your character... Legend: <font color='#888888'>✓ Have</font> / <font color='red'>X Missing & Required</font> / <font color='black'>X Missing & Optional"
  );
  for (const [name, requirements] of categories) {
    if (requirements.length === 0) continue;

    const requirements_info: [boolean, string, Requirement][] = requirements.map(check);
    print(name, "blue");
    for (const [have_it, name, req] of requirements_info.sort((a, b) => a[1].localeCompare(b[1]))) {
      const color = have_it ? "#888888" : req.optional ? "black" : "red";
      const symbol = have_it ? "✓" : "X";
      if (!have_it && req.optional) missing_optional++;
      if (!have_it && !req.optional) missing++;
      print(`${symbol} ${name} - ${req.why}`, color);
    }
    print("");
  }

  // Print the count of missing things
  if (missing > 0) {
    print(
      `You are missing ${missing} required things. This script will not yet work for you.`,
      "red"
    );
    if (missing_optional > 0) print(`You are also missing ${missing_optional} optional things.`);
  } else {
    if (missing_optional > 0) {
      print(
        `You are missing ${missing_optional} optional things. This script should work, but it could do better.`
      );
    } else {
      print(`You have everything! You are the shiniest star. This script should work great.`);
    }
  }
}

function spanWrap(text: string, color: string): string {
  return `<span color="${color}">${text}</span>`;
}
export function checkPerms() {
  const nPerms = targetPerms(false);
  const nClass = targetClass(false);
  printHtml("~~ Default Perm List ~~", false);
  printHtml(
    `Legend: <span color="black">[permed]</span>, <span color="fuchsia">[targeted/known]</span>, <span color="blue">[targeted/unknown]</span>, <span color="purple">[known]</span>, <span color="navy">[class skills]</span>, <span color="gray">[other]</span>`,
    false
  );
  let count = 0;
  defaultPermList.forEach((sks) =>
    printHtml(
      `~ Tier ${count++} ~<br> ${sks
        .map((sk) =>
          sk.name in getPermedSkills()
            ? spanWrap(sk.name, "black")
            : nPerms.includes(sk) && have(sk)
            ? spanWrap(sk.name, "fuchsia")
            : nPerms.includes(sk)
            ? spanWrap(sk.name, "blue")
            : have(sk)
            ? spanWrap(sk.name, "purple")
            : nClass && nClass === sk.class && nClass !== $class`none`
            ? spanWrap(sk.name, "navy")
            : spanWrap(sk.name, "gray")
        )
        .join(", ")}`,
      false
    )
  );
}
