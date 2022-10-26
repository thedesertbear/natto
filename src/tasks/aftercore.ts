import { CombatStrategy, OutfitSpec } from "grimoire-kolmafia";
import {
  buy,
  cliExecute,
  getPermedSkills,
  hippyStoneBroken,
  itemAmount,
  myAdventures,
  putCloset,
  pvpAttacksLeft,
  retrieveItem,
  runChoice,
  use,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $coinmaster,
  $item,
  $items,
  $location,
  $path,
  $skill,
  $skills,
  ascend,
  get,
  have,
  Lifestyle,
  Paths,
  prepareAscension,
} from "libram";
import { getCurrentLeg, Leg, Macro, Quest, stooperDrunk } from "./structure";

const defaultPermList = [
  $skills`Natural Born Scrabbler, Thrift and Grift, Abs of Tin, Marginally Insane, Club Earth, Carbohydrate Cudgel, Splattersmash, Grab a Cold One, Song of the North, Turtleini, Sauceshell, Conspiratorial Whispers, Song of Slowness, Spaghetti Breakfast, Shadow Noodles, Song of Starch, Splashdance, Song of Sauce, Song of Bravado, Walberg's Dim Bulb, Singer's Faithful Ocelot, Drescher's Annoying Noise, Deep Dark Visions, Shattering Punch, Snokebomb, Shivering Monkey Technique, Bow-Legged Swagger, Bend Hell, Steely-Eyed Squint, Astute Angler, Lock Picking, Long Winter's Nap, Bowl Full of Jelly, Ashes and Soot, Eye and a Twist, Dimples\, How Merry!, Chubby and Plump, Dead Nostrils, Brain Games, Slimy Sinews, Slimy Synapses, Slimy Shoulders, Tick-skinned, Blood Bubble, Object Quasi-Permanence, Grease Up, 5-D Earning Potential, Hypersane, Refusal to Freeze, Olfactory Burnout, Asbestos Heart, Unoffendable, Gingerbread Mob Hit, Fashionably Late, Ancestral Recall, Giant Growth, Disintegrate, Expert Corner-Cutter, Rapid Prototyping, Executive Narcolepsy, Prevent Scurvy and Sobriety, The Spirit of Taking, Blood Frenzy, `,
  $skills`Curse of Weaksauce, Itchy Curse Finger, Torso Awareness, Canneloni Cocoon`,
  $skills`Nimble Fingers, Amphibian Sympathy, Leash of Linguini, Thief Among the Honorable, Expert Panhandling, Discor Leer, Five Finger Discount, Double-Fisted Skull Smashing, Impetuous Sauciness, Tao of the Terrapin, Saucestorm`,
  $skills`Tongue of the Walrus, Mad Looting Skillz, Smooth Movements, Musk of the Moose, The Polka of Plenty, The Sonata of Sneakiness, Carlweather's Cantata of Confrontation, Mariachi Memory`,
  $skills`Gnefarious Pickpocketing, Powers of Observation, Gnomish Hardigness, Cosmic Ugnderstanding, Ambidextrous Funkslinging, The Long View, Wisdom of the Elder Tortoises, Inner Sauce, Pulverize, Springy Fusilli, Overdeveloped Sense of Self Preservation`,
  $skills`Pastamastery, Advanced Cocktailcrafting, The Ode to Booze, Advanced Saucecrafting, Saucemaven, The Way of Sauce, Fat Leon's Phat Loot Lyric, Empathy of the Newt, Superhuman Cocktailcrafting, Transcendental Noodlecraft, Super-Advanced Meatsmithing, Patient Smite, Wry Smile, Knowing Smile, Aloysius' Antiphon of Aptitude, Pride of the Puffin, Ur-Kel's Aria of Annoyance, Sensitive Fingers, Master Accordion Master Thief, The Moxious Madrigal, Stuffed Mortar Shell, Flavour of Magic, Skin of the Leatherback, Hide of the Walrus, Astral Shell, Ghostly Shell, Elemental Saucesphere, Subtle and Quick to Anger, Master Saucier, Spirit of Ravioli, Lunging Thrust-Smack, Entangling Noodles, Hero of the Half-Shell, Cold-Blooded Fearlessness, Northern Exposure, Diminished Gag Reflex, Tolerance of the Kitchen, Heart of Polyester, Shield of the Pastalord, Saucy Salve, Power Ballad of the Arrowsmith, Jalapeno Saucesphere, Irrepressible Spunk, Saucegeyser, Claws of the Walrus, Shell Up, Scarysauce, Disco Fever, Rage of the Reindeer, Brawnee's Anthem of Absorption, Reptilian Fortitude, The Psalm of Pointiness, Spiky Shell, Stiff Upper Lip, Blubber Up, Disco Smirk, The Magical Mojomuscular Melody, Blood Sugar Sauce Nagic, Cletus's Canticle of Celerity, Suspicious Gaze, Icy Glare, Dirge of Dreadfulness, Snarl of the Timberwolf, Testudinal Teachings, Disco Nap, Adventurer of Leisure, Stevedave's Shanty of Superiority, Northern Explosion, Armorcraftiness`,
  $skills``,
];

export const AftercoreQuest: Quest = {
  name: "Aftercore",
  completed: () => getCurrentLeg() > Leg.Aftercore,
  tasks: [
    {
      name: "Breakfast",
      completed: () => get("breakfastCompleted"),
      do: () => cliExecute("breakfast"),
    },
    {
      name: "LGR Seed",
      completed: () =>
        get("_stenchAirportToday") || get("stenchAirportAlways") || !have($item`lucky gold ring`),
      do: () => use($item`one-day ticket to Dinseylandfill`),
    },
    {
      name: "Daily Dungeon",
      completed: () => get("dailyDungeonDone"),
      prepare: (): void => {
        if (have($item`daily dungeon malware`) && get("_dailyDungeonMalwareUsed"))
          putCloset($item`daily dungeon malware`);
        if (!get("_dailyDungeonMalwareUsed") && itemAmount($item`fat loot token`) < 3)
          retrieveItem(1, $item`daily dungeon malware`);
      },
      do: $location`The Daily Dungeon`,
      choices: {
        692: 3, //dd door: lockpicks
        689: 1, //dd final chest : open
        690: 2, //dd chest 1: boring door
        691: 2, //dd chest 2: boring door
        693: 2, //dd trap: skip
      },
      acquire: $items`eleven-foot pole, Pick-O-Matic lockpicks, ring of Detect Boring Doors`.map(
        (it) => ({ item: it })
      ),
      outfit: (): OutfitSpec => {
        return {
          ...(have($item`The Jokester's gun`) && !get("_firedJokestersGun")
            ? { weapon: $item`The Jokester's gun` }
            : {}),
          ...(get("_lastDailyDungeonRoom") % 5 === 4
            ? { acc1: $item`ring of Detect Boring Doors` }
            : {}),
          modifier:
            "750 bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, 250 bonus mafia thumb ring, 250 bonus carnivorous potted plant",
        };
      },
      combat: new CombatStrategy().macro(() =>
        Macro.step(`if pastround 2; abort Macro did not complete; endif; `)
          .externalIf(!get("_dailyDungeonMalwareUsed"), Macro.tryItem($item`daily dungeon malware`))
          .tryItem($item`porquoise-handled sixgun`)
          .trySkill($skill`Fire the Jokester's Gun`)
          .attack()
          .repeat()
          .setAutoAttack()
      ),
      limit: { tries: 15 },
    },
    {
      name: "Garbo",
      completed: () => myAdventures() === 0 || stooperDrunk(),
      do: () => cliExecute("garbo ascend"),
      tracking: "Garbo",
    },
    {
      name: "Turn in FunFunds",
      ready: () => get("_stenchAirportToday") && itemAmount($item`FunFunds™`) >= 20,
      completed: () => have($item`one-day ticket to Dinseylandfill`),
      do: () =>
        buy($coinmaster`The Dinsey Company Store`, 1, $item`one-day ticket to Dinseylandfill`),
      tracking: "Garbo",
    },
    {
      name: "PvP",
      completed: () => pvpAttacksLeft() === 0 || !hippyStoneBroken(),
      do: (): void => {
        cliExecute("unequip");
        cliExecute("UberPvPOptimizer");
        cliExecute("swagger");
      },
    },
    {
      name: "AscendGyou",
      completed: () => getCurrentLeg() >= Leg.GreyYou,
      do: (): void => {
        const skillsToPerm = new Map();
        defaultPermList
          .flat()
          .filter((sk) => have(sk) && sk.permable && !(sk.name in getPermedSkills()))
          .slice(0, Math.floor((get("bankedKarma") + 100) / 100))
          .forEach((sk) => skillsToPerm.set(sk, Lifestyle.softcore));
        ascend(
          $path`Grey You`,
          $class`Grey Goo`,
          Lifestyle.softcore,
          "vole",
          $item`astral six-pack`,
          $item`astral pet sweater`,
          { permSkills: skillsToPerm, neverAbort: false }
        );
        if (visitUrl("main.php").includes("somewhat-human-shaped mass of grey goo nanites"))
          runChoice(-1);
        cliExecute("refresh all");
      },
    },
  ],
};
