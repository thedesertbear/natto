import { CombatStrategy, OutfitSpec } from "grimoire-kolmafia";
import {
  availableAmount,
  buy,
  cliExecute,
  getPermedSkills,
  guildStoreAvailable,
  hippyStoneBroken,
  itemAmount,
  myAdventures,
  myClass,
  myLevel,
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
  $stat,
  ascend,
  get,
  have,
  Lifestyle,
} from "libram";
import {
  defaultPermList,
  getCurrentLeg,
  Leg,
  Macro,
  nextPerms,
  Quest,
  stooperDrunk,
} from "./structure";

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
      name: "Unlock Guild",
      ready: () =>
        nextPerms().reduce((a, sk) => a || sk.class === myClass(), false) ||
        (myClass() === $class`Seal Clubber` &&
          Math.min(
            ...$items`figurine of a wretched-looking seal, seal-blubber candle`.map((it) =>
              availableAmount(it)
            )
          ) < 20),
      completed: () => guildStoreAvailable(),
      do: () => cliExecute("guild"),
      outfit: (): OutfitSpec => ({
        modifier:
          "750 bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, 250 bonus mafia thumb ring, 250 bonus carnivorous potted plant",
      }),
      combat: new CombatStrategy().macro(() =>
        Macro.step(`if pastround 2; abort Macro did not complete; endif; `)
          .tryItem($item`porquoise-handled sixgun`)
          .attack()
          .repeat()
          .setAutoAttack()
      ),
    },
    {
      name: "Guild Skill Training",
      ready: () => guildStoreAvailable() && false,
      completed: () => !nextPerms().find((sk) => !have(sk) || sk.level > myLevel()),
      do: () => nextPerms().forEach((sk) => sk),
    },
    {
      name: "Stock Up on MMJs",
      ready: () =>
        (myClass().primestat === $stat`Mysticality` && guildStoreAvailable()) ||
        (myClass() === $class`Accordion Thief` && myLevel() >= 9),
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
