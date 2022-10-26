import { CombatStrategy, OutfitSpec, step } from "grimoire-kolmafia";
import {
  buy,
  buyUsingStorage,
  chew,
  Class,
  cliExecute,
  closetAmount,
  drink,
  Effect,
  getCampground,
  getDwelling,
  haveEffect,
  hippyStoneBroken,
  itemAmount,
  maximize,
  myAdventures,
  myBasestat,
  myBuffedstat,
  myClass,
  myLevel,
  myMaxhp,
  myPrimestat,
  mySpleenUse,
  myStorageMeat,
  myTurncount,
  nowToString,
  numericModifier,
  print,
  putCloset,
  pvpAttacksLeft,
  restoreHp,
  restoreMp,
  retrieveItem,
  spleenLimit,
  storageAmount,
  toInt,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
  wait,
} from "kolmafia";
import {
  $class,
  $coinmaster,
  $effect,
  $effects,
  $familiar,
  $familiars,
  $item,
  $items,
  $location,
  $skill,
  $stat,
  ensureEffect,
  get,
  have,
} from "libram";
import { args } from "../main";
import {
  backstageItemsDone,
  baseClasses,
  canDiet,
  getCurrentLeg,
  haveAll,
  Leg,
  Macro,
  nextPerms,
  Quest,
  readyForBed,
  stooperDrunk,
} from "./structure";

const myPulls = $items`lucky gold ring, Mr. Cheeng's spectacles, mafia thumb ring`;
const levelingTurns = 30;
const targetLevel = 13;
let nextClass: Class = $class`none`;

export const GyouQuest: Quest = {
  name: "Grey You",
  completed: () => getCurrentLeg() > Leg.GreyYou,
  tasks: [
    {
      name: "Choose Class",
      completed: () => myClass() !== $class`Grey Goo` || baseClasses.includes(nextClass),
      do: () =>
        (nextClass = (nextPerms().find((sk) => baseClasses.includes(sk.class)) || $skill`Clobber`)
          .class),
      post: () =>
        print(
          `Skill perming plan for this run - Class: [${nextClass}], Skills: [${nextPerms(
            nextClass
          ).join(", ")}]`,
          "green"
        ),
    },
    {
      name: "Farming Pulls",
      completed: () => myPulls.reduce((b, it) => b && (have(it) || storageAmount(it) === 0), true), //for each, you either pulled it, or you don't own it
      do: () =>
        myPulls.forEach((it) => {
          if (storageAmount(it) !== 0 && !have(it)) cliExecute(`pull ${it}`);
        }),
    },
    {
      name: "LGR Seed",
      completed: () =>
        get("_stenchAirportToday") || get("stenchAirportAlways") || !have($item`lucky gold ring`),
      do: (): void => {
        if (!have($item`one-day ticket to Dinseylandfill`)) {
          if (storageAmount($item`one-day ticket to Dinseylandfill`) === 0)
            buyUsingStorage($item`one-day ticket to Dinseylandfill`);
          cliExecute(`pull ${$item`one-day ticket to Dinseylandfill`}`);
        }
        use($item`one-day ticket to Dinseylandfill`);
      },
    },
    {
      name: "Break Stone",
      completed: () => hippyStoneBroken() || !args.pvp,
      do: (): void => {
        visitUrl("peevpee.php?action=smashstone&pwd&confirm=on", true);
        visitUrl("peevpee.php?place=fight");
      },
    },
    {
      name: "Run",
      completed: () =>
        step("questL13Final") !== -1 && get("gooseReprocessed").split(",").length >= 69, //There are 73 total targets
      do: () => cliExecute("loopgyou delaytower tune=wombat chargegoose=20"),
      tracking: "Run",
    },
    {
      name: "In-Run Farm Initial",
      completed: () => myTurncount() >= 1000,
      do: $location`Barf Mountain`,
      prepare: (): void => {
        if (have($item`How to Avoid Scams`)) ensureEffect($effect`How to Scam Tourists`);
        retrieveItem($item`seal tooth`);
        if (have($item`SongBoom™ BoomBox`) && get("boomBoxSong") !== "Total Eclipse of Your Meat")
          cliExecute("boombox meat");
      },
      outfit: {
        familiar: $familiars`Robortender, Space Jellyfish, Hobo Monkey, Leprechaun`.find((f) =>
          have(f)
        ),
        modifier:
          "2.5 meat, 0.6 items, 750 bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, 250 bonus mafia thumb ring",
      },
      combat: new CombatStrategy().macro(
        Macro.step(`if pastround 2; abort Macro did not complete; endif;`)
          .trySkill($skill`Bowl Straight Up`)
          .trySkill($skill`Sing Along`)
          .trySkill($skill`Extract Jelly`)
          .tryItem($item`porquoise-handled sixgun`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .trySkill($skill`Double Nanovision`)
          .attack()
          .repeat()
          .setAutoAttack()
      ),
      limit: { tries: 550 },
      tracking: "GooFarming",
    },
    {
      name: "Pull All",
      completed: () => myStorageMeat() === 0 && storageAmount($item`old sweatpants`) === 0, // arbitrary item
      do: (): void => {
        cliExecute("pull all");
        cliExecute("refresh all");
      },
      tracking: "Run",
    },
    {
      name: "Tower",
      completed: () => step("questL13Final") > 11,
      do: () => cliExecute("loopgyou delaytower chargegoose=20"),
      tracking: "Run",
    },
    {
      name: "Daily Dungeon",
      ready: () =>
        (myClass() === $class`Grey Goo` && myAdventures() > 40) ||
        (myClass() !== $class`Grey Goo` && myLevel() >= targetLevel),
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
          familiar: $familiar`Grey Goose`,
          ...(have($item`The Jokester's gun`) && !get("_firedJokestersGun")
            ? { weapon: $item`The Jokester's gun` }
            : {}),
          ...(get("_lastDailyDungeonRoom") % 5 === 4
            ? { acc1: $item`ring of Detect Boring Doors` }
            : {}),
          modifier:
            "750 bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, 250 bonus mafia thumb ring, 250 bonus carnivorous potted plant, 100 familiar experience",
        };
      },
      combat: new CombatStrategy().macro(() =>
        Macro.step(`if pastround 2; abort Macro did not complete; endif;`)
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
      name: "Laugh Floor",
      ready: () =>
        (myClass() === $class`Grey Goo` && myAdventures() > 40) ||
        (myClass() !== $class`Grey Goo` && myLevel() >= targetLevel),
      completed: () =>
        have($skill`Liver of Steel`) ||
        have($item`steel margarita`) ||
        have($item`Azazel's lollipop`) ||
        have($item`observational glasses`),
      prepare: (): void => {
        //add casting of +com skills here. Also request buffs from buffy?
        if (!have($effect`Carlweather's Cantata of Confrontation`)) {
          cliExecute("kmail to Buffy || 10 Cantata of Confrontation");
          wait(15);
          cliExecute("refresh effects");
        }
        if (have($skill`Piezoelectric Honk`) && !have($effect`Hooooooooonk!`))
          useSkill($skill`Piezoelectric Honk`);
        $effects`The Sonata of Sneakiness, Darkened Photons, Shifted Phase`.forEach((ef: Effect) =>
          cliExecute(`uneffect ${ef}`)
        );
      },
      do: $location`The Laugh Floor`,
      outfit: {
        familiar: $familiar`Grey Goose`,
        modifier:
          "+100 combat rate, 3 item, 750 bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, 250 bonus mafia thumb ring, 250 bonus carnivorous potted plant, 100 familiar experience",
      },
      combat: new CombatStrategy().macro(
        Macro.step(`if pastround 2; abort Macro did not complete; endif;`)
          .tryItem($item`porquoise-handled sixgun`)
          .skill($skill`Double Nanovision`)
          .repeat()
          .setAutoAttack()
      ),
      limit: { tries: 15 },
    },
    {
      name: "Infernal Rackets Backstage",
      ready: () =>
        (myClass() === $class`Grey Goo` && myAdventures() > 40) ||
        (myClass() !== $class`Grey Goo` && myLevel() >= targetLevel),
      completed: () =>
        have($skill`Liver of Steel`) ||
        have($item`steel margarita`) ||
        have($item`Azazel's unicorn`) ||
        backstageItemsDone(),
      prepare: (): void => {
        //add casting of -com skills here. Also request buffs from buffy?
        if (!have($effect`The Sonata of Sneakiness`)) {
          cliExecute("kmail to Buffy || 10 Sonata of Sneakiness");
          wait(15);
          cliExecute("refresh effects");
        }
        if (have($skill`Photonic Shroud`) && !have($effect`Darkened Photons`))
          useSkill($skill`Photonic Shroud`);
        if (have($skill`Phase Shift`) && !have($effect`Shifted Phase`))
          useSkill($skill`Phase Shift`);
        $effects`Carlweather's Cantata of Confrontation, Hooooooooonk!`.forEach((ef: Effect) =>
          cliExecute(`uneffect ${ef}`)
        );
      },
      do: $location`Infernal Rackets Backstage`,
      outfit: {
        familiar: $familiar`Grey Goose`,
        modifier:
          "-100 combat rate, 3 item, 750 bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, 250 bonus mafia thumb ring, 250 bonus carnivorous potted plant, 100 familiar experience",
      },
      combat: new CombatStrategy().macro(
        Macro.step(`if pastround 2; abort Macro did not complete; endif;`)
          .tryItem($item`porquoise-handled sixgun`)
          .skill($skill`Double Nanovision`)
          .repeat()
          .setAutoAttack()
      ),
      limit: { tries: 15 },
    },
    {
      name: "Mourn",
      ready: () => have($item`observational glasses`),
      completed: () =>
        have($skill`Liver of Steel`) ||
        have($item`steel margarita`) ||
        have($item`Azazel's lollipop`),
      outfit: {
        equip: $items`observational glasses, Victor\, the Insult Comic Hellhound Puppet`,
      },
      do: () => cliExecute("panda comedy insult; panda comedy observe"),
    },
    {
      name: "Sven Golly",
      ready: () => backstageItemsDone(),
      completed: () =>
        have($skill`Liver of Steel`) ||
        have($item`steel margarita`) ||
        have($item`Azazel's unicorn`),
      do: (): void => {
        cliExecute(
          `panda arena Bognort ${$items`giant marshmallow, gin-soaked blotter paper`.find((a) =>
            have(a)
          )}`
        );
        cliExecute(
          `panda arena Stinkface ${$items`beer-scented teddy bear, gin-soaked blotter paper`.find(
            (a) => have(a)
          )}`
        );
        cliExecute(
          `panda arena Flargwurm ${$items`booze-soaked cherry, sponge cake`.find((a) => have(a))}`
        );
        cliExecute(`panda arena Jim ${$items`comfy pillow, sponge cake`.find((a) => have(a))}`);
      },
    },
    {
      name: "Moaning Panda",
      ready: () => haveAll($items`Azazel's lollipop, Azazel's unicorn`),
      completed: () =>
        have($skill`Liver of Steel`) || have($item`steel margarita`) || have($item`Azazel's tutu`),
      acquire: $items`bus pass, imp air`.map((it) => ({ item: it, num: 5 })),
      do: () => cliExecute("panda moan"),
      limit: { tries: 3 },
    },
    {
      name: "In-Run Farm Final",
      completed: () => myAdventures() <= 40 || myClass() !== $class`Grey Goo`,
      do: $location`Barf Mountain`,
      prepare: (): void => {
        if (have($item`How to Avoid Scams`)) ensureEffect($effect`How to Scam Tourists`);
        retrieveItem($item`seal tooth`);
        if (have($item`SongBoom™ BoomBox`) && get("boomBoxSong") !== "Total Eclipse of Your Meat")
          cliExecute("boombox meat");
      },
      outfit: {
        familiar: $familiars`Robortender, Space Jellyfish, Hobo Monkey, Leprechaun`.find((f) =>
          have(f)
        ),
        modifier:
          "2.5 meat, 0.6 items, 750 bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, 250 bonus mafia thumb ring",
      },
      combat: new CombatStrategy().macro(
        Macro.step(`if pastround 2; abort Macro did not complete; endif;`)
          .trySkill($skill`Bowl Straight Up`)
          .trySkill($skill`Sing Along`)
          .trySkill($skill`Extract Jelly`)
          .tryItem($item`porquoise-handled sixgun`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .tryItem($item`seal tooth`)
          .trySkill($skill`Double Nanovision`)
          .attack()
          .repeat()
          .setAutoAttack()
      ),
      limit: { tries: 150 },
      tracking: "GooFarming",
    },
    {
      name: "Hatter Buff",
      completed: () => get("_madTeaParty"),
      acquire: () => $items`oil cap, "DRINK ME" potion`.map((it) => ({ item: it })),
      do: () => cliExecute(`hatter ${$item`oil cap`}`),
    },
    {
      name: "Free King",
      completed: () => myClass() !== $class`Grey Goo`,
      acquire: [
        { item: $item`teacher's pen`, num: 3 },
        ...(nextClass.primestat === $stat`Muscle`
          ? $items`discarded swimming trunks, battered hubcap`.map((it) => ({ item: it }))
          : []),
        ...(nextClass.primestat === $stat`Mysticality` ? $items``.map((it) => ({ item: it })) : []),
        ...(nextClass.primestat === $stat`Moxie`
          ? $items`noir fedora, KoL Con 13 T-shirt`.map((it) => ({ item: it }))
          : []),
      ],
      outfit: (): OutfitSpec => ({
        familiar: $familiar`Grey Goose`,
        hat: $item`giant yellow hat`,
        weapon: $item`yule hatchet`,
        acc1: $item`teacher's pen`,
        acc2: $item`teacher's pen`,
        acc3: $item`teacher's pen`,
        famequip: $item`grey down vest`,
      }),
      prepare: () => {
        cliExecute("mcd 1");
        maximize(
          `${nextClass.primestat} experience, 5 ${nextClass.primestat} experience percent, 10 familiar experience, -10 ml 1 min`,
          false
        );
      },
      do: (): void => {
        cliExecute(`loopgyou class=${toInt(nextClass)}`);
        cliExecute("pull all; refresh all"); //if we somehow didn't already pull everything.
        if (closetAmount($item`Special Seasoning`) > 0)
          cliExecute("closet take * special seasoning");
        print(`Grey Goose exp at prism break: ${$familiar`Grey Goose`.experience}/400`);
      },
    },
    {
      name: "Call Buffy",
      completed: () => 0 !== haveEffect($effect`Ghostly Shell`) || myLevel() >= targetLevel,
      prepare: () =>
        $effects`Carlweather's Cantata of Confrontation, The Sonata of Sneakiness, Polka of Plenty, Fat Leon's Phat Loot Lyric`.forEach(
          (ef) => cliExecute(`uneffect ${ef}`)
        ),
      do: (): void => {
        cliExecute(
          `kmail to buffy || ${levelingTurns} Ghostly Shell, Reptilian Fortitude, Empathy of the Newt, Tenacity of the Snapper, Astral Shell, Elemental Saucesphere, Stevedave's Shanty of Superiority, Power Ballad of the Arrowsmith, Aloysius's Antiphon of Aptitude`
        );
        wait(15);
        cliExecute("refresh effects");
      },
    },
    {
      name: "Snapper Spleen Exp %",
      completed: () =>
        myLevel() >= targetLevel ||
        $effects`HGH-charged, Different Way of Seeing Things, Thou Shant Not Sing`.reduce(
          (a, ef) => a || have(ef),
          false
        ) ||
        mySpleenUse() >= spleenLimit() + 3 - get("currentMojoFilters"),
      do: (): void => {
        if (mySpleenUse() === spleenLimit()) use(1, $item`mojo filter`);
        chew(
          1,
          myClass().primestat === $stat`Muscle`
            ? $item`vial of humanoid growth hormone`
            : myClass().primestat === $stat`Mysticality`
            ? $item`non-Euclidean angle`
            : $item`Shantix™`
        );
      },
      limit: { tries: Math.ceil(levelingTurns / 30) },
      tracking: "Leveling",
    },
    {
      name: "Inscrutable Gaze",
      completed: () =>
        myLevel() >= targetLevel ||
        myClass().primestat !== $stat`Mysticality` ||
        have($effect`Inscrutable Gaze`) ||
        !have($skill`Inscrutable Gaze`),
      do: () => useSkill($skill`Inscrutable Gaze`),
      limit: { tries: Math.ceil(levelingTurns / 10) },
      tracking: "Leveling",
    },
    {
      name: "Abstraction",
      completed: () =>
        myLevel() >= targetLevel ||
        $effects`Purpose, Category, Perception`.reduce((a, ef) => a || have(ef), false) ||
        mySpleenUse() >= spleenLimit() + 3 - get("currentMojoFilters"),
      do: (): void => {
        if (mySpleenUse() === spleenLimit()) use(1, $item`mojo filter`);
        chew(
          1,
          myClass().primestat === $stat`Muscle`
            ? $item`abstraction: purpose`
            : myClass().primestat === $stat`Mysticality`
            ? $item`abstraction: category`
            : $item`abstraction: perception`
        );
      },
      limit: { tries: Math.ceil(levelingTurns / 50) },
      tracking: "Leveling",
    },
    {
      name: "Strange Leaflet",
      completed: () => get("leafletCompleted"),
      do: () => cliExecute("leaflet"),
    },
    {
      name: "Frobozz",
      completed: () => getDwelling() === $item`Frobozz Real-Estate Company Instant House (TM)`,
      do: () => use($item`Frobozz Real-Estate Company Instant House (TM)`),
    },
    {
      name: "Bonerdagon Chest",
      completed: () => !have($item`chest of the Bonerdagon`),
      do: () => use($item`chest of the Bonerdagon`),
    },
    {
      name: "Steel Margarita",
      ready: () => haveAll($items`Azazel's tutu, Azazel's lollipop, Azazel's unicorn`),
      completed: () => have($skill`Liver of Steel`) || have($item`steel margarita`),
      do: () => cliExecute("panda temple"),
    },
    {
      name: "Liver of Steel",
      completed: () => have($skill`Liver of Steel`),
      ready: () => myClass() !== $class`Grey Goo` && have($item`steel margarita`),
      do: () => drink(1, $item`steel margarita`),
    },
    {
      name: "Taffy Effects",
      completed: () =>
        myLevel() >= targetLevel ||
        $effects`Orange Crusher, Purple Reign, Cinnamon Challenger`.reduce(
          (a, ef) => a || haveEffect(ef) >= 50,
          false
        ),
      do: () => {
        if (myPrimestat() === $stat`Muscle`)
          use(
            Math.ceil((50 - haveEffect($effect`Orange Crusher`)) / 10),
            $item`pulled orange taffy`
          ); //lasts for 10 turns each
        if (myPrimestat() === $stat`Mysticality`)
          use(Math.ceil((50 - haveEffect($effect`Purple Reign`)) / 10), $item`pulled violet taffy`); //lasts for 10 turns each
        if (myPrimestat() === $stat`Moxie`)
          use(
            Math.ceil((50 - haveEffect($effect`Cinnamon Challenger`)) / 10),
            $item`pulled red taffy`
          ); //lasts for 10 turns each
      },
      limit: { tries: Math.ceil(levelingTurns / 10) },
      tracking: "Leveling",
    },
    {
      name: "Buff Mainstat",
      completed: () =>
        myLevel() >= targetLevel || myBuffedstat(myPrimestat()) >= 11 * myBasestat(myPrimestat()),
      effects: $effects`Trivia Master`,
      do: () => cliExecute(`gain ${11 * myBasestat(myPrimestat())} ${myPrimestat()}`),
      limit: { tries: levelingTurns },
      tracking: "Leveling",
    },
    {
      name: "Ghost Dog Chow",
      completed: () => myLevel() >= 8 || $familiar`Grey Goose`.experience > 380,
      prepare: () => useFamiliar($familiar`Grey Goose`),
      do: () =>
        use(Math.floor((400 - $familiar`Grey Goose`.experience) / 20), $item`Ghost Dog Chow`),
      tracking: "Leveling",
    },
    {
      name: "Gators",
      completed: () => myClass() !== $class`Grey Goo` && myLevel() >= targetLevel,
      effects: $effects`Heart of White, Expert Vacationer`,
      prepare: (): void => {
        restoreHp(0.75 * myMaxhp());
        restoreMp(8);
      },
      do: $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`,
      outfit: {
        familiar: $familiar`Grey Goose`,
        modifier: `0.125 ${myPrimestat()}, ${myPrimestat()} experience, 5 ${myPrimestat()} experience percent, 10 familiar experience, -10 ml 1 min`,
      },
      combat: new CombatStrategy().macro(() =>
        Macro.step(`if pastround 2; abort Macro did not complete; endif;`)
          .trySkill($skill`Curse of Weaksauce`)
          .externalIf(
            $familiar`Grey Goose`.experience >= 400,
            Macro.trySkill(
              myPrimestat() === $stat`Muscle`
                ? $skill`Convert Matter to Protein`
                : myPrimestat() === $stat`Mysticality`
                ? $skill`Convert Matter to Energy`
                : $skill`Convert Matter to Pomade`
            )
          )
          .tryItem($item`porquoise-handled sixgun`)
          .trySkill($skill`Sing Along`)
          .attack()
          .repeat()
          .setAutoAttack()
      ),
      limit: { tries: levelingTurns + 3 }, //+3 for unaccounted for wanderers, etc.
      tracking: "Leveling",
    },
    {
      name: "Breakfast",
      completed: () => get("breakfastCompleted"),
      do: () => cliExecute("breakfast"),
    },
    {
      name: "Garbo",
      ready: () => get("_stenchAirportToday") || get("stenchAirportAlways"),
      completed: () => (myAdventures() === 0 && !canDiet()) || stooperDrunk(),
      do: () => cliExecute("garbo"),
      tracking: "Garbo",
    },
    {
      name: "Garbo Nobarf",
      ready: () => !(get("_stenchAirportToday") || get("stenchAirportAlways")),
      completed: () =>
        (myAdventures() === 0 && !canDiet()) ||
        stooperDrunk() ||
        get("garboResultsDate", "") === nowToString("YYYYMMdd"),
      do: () => cliExecute("garbo nobarf"),
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
      ready: () => readyForBed(),
      completed: () => pvpAttacksLeft() === 0 || !hippyStoneBroken(),
      do: (): void => {
        cliExecute("unequip");
        cliExecute("UberPvPOptimizer");
        cliExecute("swagger");
      },
    },
    {
      name: "Pajamas",
      completed: () => getCampground()[$item`clockwork maid`.name] === 1,
      do: (): void => {
        if (args.pvp) maximize("adventures, 0.3 fites", false);
        else maximize("adventures", false);
        use($item`clockwork maid`);
      },
    },
    {
      name: "Nightcap",
      ready: () => readyForBed(),
      completed: () => stooperDrunk(),
      do: () => cliExecute("CONSUME NIGHTCAP"),
    },
    {
      name: "Alert",
      ready: () => !readyForBed(),
      completed: () => stooperDrunk(),
      do: (): void => {
        const targetAdvs = 100 - numericModifier("adventures");
        print("goorbo completed, but did not overdrink.", "red");
        if (targetAdvs < myAdventures() && targetAdvs > 0)
          print(
            `Rerun with fewer than ${targetAdvs} adventures for goorbo to handle your diet`,
            "red"
          );
        else print("Something went wrong.", "red");
      },
    },
  ],
};
