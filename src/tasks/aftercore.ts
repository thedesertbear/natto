import { CombatStrategy } from "grimoire-kolmafia";
import {
  availableAmount,
  buy,
  canAdventure,
  cliExecute,
  closetAmount,
  getPermedSkills,
  getWorkshed,
  gnomadsAvailable,
  guildStoreAvailable,
  handlingChoice,
  haveEffect,
  hippyStoneBroken,
  inebrietyLimit,
  itemAmount,
  myAdventures,
  myClass,
  myHp,
  myInebriety,
  myLevel,
  myMaxhp,
  myMeat,
  myPrimestat,
  print,
  putCloset,
  pvpAttacksLeft,
  restoreHp,
  restoreMp,
  retrieveItem,
  runChoice,
  takeCloset,
  toInt,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $coinmaster,
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $path,
  $skill,
  $skills,
  $stat,
  ascend,
  AsdonMartin,
  get,
  have,
  Lifestyle,
  Macro,
  uneffect,
} from "libram";
import { getCurrentLeg, Leg, Quest } from "./structure";
import { bestFam, canDiet, maxBase, noML, stooperDrunk } from "./utils";
import { printPermPlan, setClass, targetClass, targetPerms } from "./perm";
import { args } from "../main";

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
      name: "Drive Observantly",
      completed: () =>
        get("dailyDungeonDone") ||
        getWorkshed() !== $item`Asdon Martin keyfob` ||
        haveEffect($effect`Driving Observantly`) >= 800,
      do: () =>
        AsdonMartin.drive(
          $effect`Driving Observantly`,
          810 - haveEffect($effect`Driving Observantly`),
          false
        ),
    },
    {
      name: "Install CMC",
      completed: () =>
        getWorkshed() === $item`cold medicine cabinet` ||
        !have($item`cold medicine cabinet`) ||
        get("_workshedItemUsed"),
      do: () => use($item`cold medicine cabinet`),
    },
    {
      name: "LGR Seed",
      completed: () =>
        get("_stenchAirportToday") || get("stenchAirportAlways") || !have($item`lucky gold ring`),
      do: () => use($item`one-day ticket to Dinseylandfill`),
    },
    {
      name: "June Cleaver",
      completed: () => !have($item`June cleaver`) || get("_juneCleaverFightsLeft") > 0,
      choices: {
        793: 4, //The Shore -> Gift Shop
        1467: 3, //Poetic Justice
        1468: () => (get("_juneCleaverSkips") < 5 ? 4 : 2), //Aunts not Ants
        1469: 3, //Beware of Aligator
        1470: () => (get("_juneCleaverSkips") < 5 ? 4 : 2), //Teacher's Pet
        1471: 1, //Lost and Found
        1472: () => (get("_juneCleaverSkips") < 5 ? 4 : 1), //Summer Days
        1473: () => (get("_juneCleaverSkips") < 5 ? 4 : 1), //Bath Time
        1474: () => (get("_juneCleaverSkips") < 5 ? 4 : 2), //Delicious Sprouts
        1475: 1, //Hypnotic Master
      },
      prepare: () => {
        if (!canAdventure($location`The Shore, Inc. Travel Agency`))
          retrieveItem($item`bitchin' meatcar`);
      },
      do: $location`The Shore, Inc. Travel Agency`,
      post: () => {
        if (handlingChoice()) visitUrl("main.php");
        if (have($effect`Beaten Up`)) uneffect($effect`Beaten Up`);
      },
      outfit: () => ({ equip: $items`June cleaver` }),
      limit: undefined,
    },
    {
      name: "Implement Glitch",
      ready: () => have($item`[glitch season reward name]`),
      completed: () => get("_glitchItemImplemented"),
      do: () => use($item`[glitch season reward name]`),
    },
    {
      name: "Fight Glitch",
      ready: () => have($item`[glitch season reward name]`),
      completed: () => get("_glitchMonsterFights") > 0,
      acquire: $items`gas can, gas balloon, shard of double-ice`.map((it) => ({
        item: it,
        price: 1000,
      })),
      prepare: () => {
        restoreHp(0.9 * myHp());
        if (have($skill`Blood Bond`)) useSkill($skill`Blood Bond`);
      },
      do: () => visitUrl("inv_eat.php?pwd&whichitem=10207"),
      post: () => {
        if (!get("_lastCombatWon")) throw new Error("Lost Combat - Check to see what went wrong.");
      },
      outfit: () => ({
        familiar: bestFam(),
        modifier: `${myPrimestat()} experience, 5 ${myPrimestat()} experience percent, ${noML()}`,
      }),
      combat: new CombatStrategy().macro(() =>
        Macro.tryItem($item`gas balloon`)
          .externalIf(
            have($skill`Feel Pride`) && get("_feelPrideUsed") < 3,
            Macro.trySkill($skill`Feel Pride`),
            Macro.externalIf(
              $familiar`Grey Goose`.experience >= 400,
              Macro.trySkill(
                myPrimestat() === $stat`Muscle`
                  ? $skill`Convert Matter to Protein`
                  : myPrimestat() === $stat`Mysticality`
                  ? $skill`Convert Matter to Energy`
                  : $skill`Convert Matter to Pomade`
              )
            )
          )
          .tryItem(...$items`shard of double-ice, gas can`)
          .attack()
          .repeat()
      ),
      tracking: "Leveling",
    },
    {
      name: "Daily Dungeon",
      completed: () => get("dailyDungeonDone"),
      prepare: (): void => {
        if (have($item`daily dungeon malware`) && get("_dailyDungeonMalwareUsed"))
          putCloset($item`daily dungeon malware`);
        if (!get("_dailyDungeonMalwareUsed") && itemAmount($item`fat loot token`) < 3)
          retrieveItem(1, $item`daily dungeon malware`);
        restoreHp(0.75 * myMaxhp());
        restoreMp(8);
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
        (it) => ({ item: it, price: 1000 })
      ),
      outfit: () => ({
        familiar: bestFam(),
        ...(have($item`The Jokester's gun`) && !get("_firedJokestersGun")
          ? { weapon: $item`The Jokester's gun` }
          : {}),
        ...(get("_lastDailyDungeonRoom") % 5 === 4
          ? { acc1: $item`ring of Detect Boring Doors` }
          : {}),
        modifier: `${maxBase()}, 250 bonus carnivorous potted plant`,
      }),
      combat: new CombatStrategy().macro(() =>
        Macro.externalIf(
          !get("_dailyDungeonMalwareUsed"),
          Macro.tryItem($item`daily dungeon malware`)
        )
          .tryItem($item`porquoise-handled sixgun`)
          .trySkill($skill`Fire the Jokester's Gun`)
          .trySkill($skill`Saucestorm`)
          .attack()
          .repeat()
      ),
      limit: { tries: 15 },
    },
    {
      name: "Unlock Guild",
      ready: () =>
        //ready if you find a skill in your perm plan that is guild-trainable that you don't know, or if you need to buy seal summoning supplies
        !!targetPerms(false).find((sk) => !have(sk) && sk.level > 0) ||
        (myClass() === $class`Seal Clubber` &&
          Math.min(
            ...$items`figurine of a wretched-looking seal, seal-blubber candle`.map((it) =>
              availableAmount(it)
            )
          ) < 20),
      completed: () => guildStoreAvailable(),
      do: () => cliExecute("guild"),
      choices: {
        //sleazy back alley
        108: 4, //craps: skip
        109: 1, //drunken hobo: fight
        110: 4, //entertainer: skip
        112: 2, //harold's hammer: skip
        21: 2, //under the knife: skip
        //haunted pantry
        115: 1, //drunken hobo: fight
        116: 4, //singing tree: skip
        117: 1, //knob goblin chef: fight
        114: 2, //birthday cake: skip
        //outskirts of cobb's knob
        113: 2, //knob goblin chef: fight
        111: 3, //chain gang: fight
        118: 2, //medicine quest: skip
      },
      outfit: () => ({
        familiar: bestFam(),
        modifier: `${maxBase()}, ${
          myPrimestat() === $stat`Muscle` ? "100 combat rate 20 max" : "-100 combat rate"
        }, 250 bonus carnivorous potted plant`,
      }),
      combat: new CombatStrategy().macro(() =>
        Macro.tryItem($item`porquoise-handled sixgun`)
          .attack()
          .repeat()
      ),
    },
    {
      name: "Guild Skill Training",
      ready: () => guildStoreAvailable(),
      completed: () =>
        //done if you don't find any  skills in your perm plan that are guild-trainable, that you don't have known
        !targetPerms(false).find((sk) => !have(sk) && myLevel() >= sk.level),
      do: () =>
        targetPerms(false)
          .filter((sk) => sk.class === myClass() && !have(sk) && myLevel() >= sk.level)
          .forEach((sk) => {
            print(`Purchasing ${sk} using skillid=${toInt(sk) % 1000}`);
            visitUrl(`guild.php?action=buyskill&skillid=${toInt(sk) % 1000}`, true);
          }),
      limit: { tries: 3 }, //a few tries, in case your level is too low and you level up over the course of the day
    },
    {
      name: "Stock Up on MMJs",
      ready: () =>
        guildStoreAvailable() &&
        (myClass().primestat === $stat`Mysticality` ||
          (myClass() === $class`Accordion Thief` && myLevel() >= 9)),
      completed: () => availableAmount($item`magical mystery juice`) >= 500,
      acquire: [
        {
          item: $item`magical mystery juice`,
          num: 500,
        },
      ],
      do: () => false,
    },
    {
      name: "Buy Seal Summoning Supplies",
      ready: () => myClass() === $class`Seal Clubber` && guildStoreAvailable(),
      completed: () =>
        Math.min(
          ...$items`figurine of a wretched-looking seal, seal-blubber candle`.map((it) =>
            availableAmount(it)
          )
        ) >= 20,
      acquire: $items`figurine of a wretched-looking seal, seal-blubber candle`.map((it) => ({
        item: it,
        num: 500,
      })),
      do: () => false,
    },
    {
      name: "Train Gnome Skills",
      ready: () => myMeat() >= 5000 && gnomadsAvailable(),
      completed: () =>
        !targetPerms(false).find(
          (sk) =>
            !have(sk) &&
            $skills`Torso Awareness, Gnefarious Pickpocketing, Powers of Observatiogn, Gnomish Hardigness, Cosmic Ugnderstanding`.includes(
              sk
            )
        ),
      do: () =>
        targetPerms(false)
          .filter(
            (sk) =>
              !have(sk) &&
              $skills`Torso Awareness, Gnefarious Pickpocketing, Powers of Observatiogn, Gnomish Hardigness, Cosmic Ugnderstanding`.includes(
                sk
              )
          )
          .forEach((sk) => visitUrl(`gnomes.php?action=trainskill&whichskill=${toInt(sk)}`, true)),
      limit: { tries: 5 },
    },
    {
      name: "Garbo",
      completed: () => (!canDiet() && myAdventures() <= (args.voatest ? 100 : 0)) || stooperDrunk(),
      prepare: () => uneffect($effect`Beaten Up`),
      do: () => cliExecute(`${args.garboascend} ${args.voatest && "-100"}`),
      post: () =>
        $effects`Power Ballad of the Arrowsmith, Stevedave's Shanty of Superiority, The Moxious Madrigal, The Magical Mojomuscular Melody, Aloysius' Antiphon of Aptitude, Ur-Kel's Aria of Annoyance`
          .filter((ef) => have(ef))
          .forEach((ef) => uneffect(ef)),
      tracking: "Garbo",
    },
    {
      name: "Garbo VoA",
      completed: () => (!canDiet() && myAdventures() === 0) || stooperDrunk(),
      prepare: () => uneffect($effect`Beaten Up`),
      do: () => cliExecute(`${args.garboascend}`),
      post: () =>
        $effects`Power Ballad of the Arrowsmith, Stevedave's Shanty of Superiority, The Moxious Madrigal, The Magical Mojomuscular Melody, Aloysius' Antiphon of Aptitude, Ur-Kel's Aria of Annoyance`
          .filter((ef) => have(ef))
          .forEach((ef) => uneffect(ef)),
      tracking: "VoA Test",
    },
    {
      name: "Nightcap",
      ready: () => have($item`Drunkula's wineglass`),
      completed: () => stooperDrunk(),
      do: () => {
        if (have($familiar`Stooper`) && have($item`tiny stillsuit`)) {
          useFamiliar($familiar`Stooper`);
          if (myInebriety() < inebrietyLimit() && get("familiarSweat") >= 300)
            cliExecute("drink stillsuit distillate");
        }
        cliExecute(`CONSUME NIGHTCAP VALUE ${get("valueOfAdventure") - 1000}`);
      },
    },
    {
      name: "Garbo (Drunk)",
      ready: () => have($item`Drunkula's wineglass`),
      prepare: () => uneffect($effect`Beaten Up`),
      completed: () => myAdventures() === 0,
      do: () => cliExecute(args.garboascend),
      post: () =>
        $effects`Power Ballad of the Arrowsmith, Stevedave's Shanty of Superiority, The Moxious Madrigal, The Magical Mojomuscular Melody, Aloysius' Antiphon of Aptitude, Ur-Kel's Aria of Annoyance`
          .filter((ef) => have(ef))
          .forEach((ef) => uneffect(ef)),
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
      name: "Summon Soap Knife",
      completed: () => !have($skill`That's Not a Knife`) || get("_discoKnife"),
      prepare: () => putCloset(itemAmount($item`soap knife`), $item`soap knife`),
      do: () => useSkill($skill`That's Not a Knife`),
      post: () => takeCloset(closetAmount($item`soap knife`), $item`soap knife`),
    },
    {
      name: "Ascend Grey You",
      completed: () => getCurrentLeg() >= Leg.GreyYou,
      do: (): void => {
        printPermPlan();
        if (targetPerms(false).find((sk) => !have(sk)))
          throw new Error(
            `Trying to ascend, but don't have the following targeted skills: [${targetPerms(false)
              .filter((sk) => !have(sk))
              .join(", ")}]`
          );
        const nClass = targetClass(true);
        setClass("goorboNextClass", nClass);

        const skillsToPerm = new Map();
        targetPerms(false).forEach((sk) => skillsToPerm.set(sk, Lifestyle.softcore));
        const nPerms = targetPerms(true);

        const moonsign =
          have($item`hewn moon-rune spoon`) ||
          !$skills`Torso Awareness, Gnefarious Pickpocketing, Powers of Observatiogn, Gnomish Hardigness, Cosmic Ugnderstanding`.find(
            (sk) => !(sk.name in getPermedSkills()) //skip checking gnomes if you have a moon spoon or have all gnome skills permed
          )
            ? "vole"
            : nPerms.includes($skill`Torso Awareness`) ||
              !$skills`Gnefarious Pickpocketing, Powers of Observatiogn, Gnomish Hardigness, Cosmic Ugnderstanding`.find(
                (sk) => !nPerms.includes(sk) //plan to perm Torso Awareness or all 4 other gnome skills
              )
            ? "wombat"
            : "vole";
        ascend(
          $path`Grey You`,
          $class`Grey Goo`,
          Lifestyle.softcore,
          moonsign,
          $item`astral six-pack`,
          args.astralpet === $item`none` ? undefined : args.astralpet,
          { permSkills: skillsToPerm, neverAbort: false }
        );
        if (visitUrl("main.php").includes("somewhat-human-shaped mass of grey goo nanites"))
          runChoice(-1);
        cliExecute("refresh all");
      },
    },
  ],
};
