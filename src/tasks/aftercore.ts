import { CombatStrategy, OutfitSpec } from "grimoire-kolmafia";
import {
  buy,
  cliExecute,
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
  $skill,
  ascend,
  get,
  have,
  Lifestyle,
  Macro,
  Paths,
} from "libram";
import { getCurrentLeg, Leg, Quest, stooperDrunk } from "./structure";

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
        Macro.externalIf(
          !get("_dailyDungeonMalwareUsed"),
          Macro.tryItem($item`daily dungeon malware`)
        )
          .tryItem($item`porquoise-handled sixgun`)
          .trySkill($skill`Fire the Jokester's Gun`)
          .attack()
          .repeat()
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
      name: "Ascend",
      completed: () => getCurrentLeg() >= Leg.GreyYou,
      do: (): void => {
        ascend(
          Paths.GreyYou,
          $class`Grey Goo`,
          Lifestyle.softcore,
          "vole",
          $item`astral six-pack`,
          $item`astral pet sweater`
        );
        if (visitUrl("main.php").includes("somewhat-human-shaped mass of grey goo nanites"))
          runChoice(-1);
        cliExecute("refresh all");
      },
    },
  ],
};
