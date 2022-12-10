import { CombatStrategy, step } from "grimoire-kolmafia";
import {
  availableAmount,
  buy,
  buyUsingStorage,
  chew,
  cliExecute,
  closetAmount,
  drink,
  Effect,
  equip,
  getCampground,
  getClanName,
  getDwelling,
  getWorkshed,
  gnomadsAvailable,
  handlingChoice,
  haveEffect,
  haveEquipped,
  hippyStoneBroken,
  inebrietyLimit,
  isBanished,
  Item,
  itemAmount,
  maximize,
  myAdventures,
  myAscensions,
  myBasestat,
  myBuffedstat,
  myClass,
  myFamiliar,
  myHp,
  myInebriety,
  myLevel,
  myMaxhp,
  myMeat,
  myPrimestat,
  mySpleenUse,
  myStorageMeat,
  myTurncount,
  numericModifier,
  print,
  putCloset,
  pvpAttacksLeft,
  restoreHp,
  restoreMp,
  retrieveItem,
  runChoice,
  runCombat,
  spleenLimit,
  storageAmount,
  takeCloset,
  toInt,
  totalFreeRests,
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
  $locations,
  $monster,
  $monsters,
  $phylum,
  $skill,
  $stat,
  AsdonMartin,
  AutumnAton,
  DNALab,
  ensureEffect,
  get,
  getBanishedMonsters,
  getTodaysHolidayWanderers,
  have,
  Macro,
  Robortender,
  set,
  Snapper,
  SongBoom,
  uneffect,
} from "libram";
import { args } from "../args";
import { getCurrentLeg, Leg, Quest } from "./structure";
import {
  backstageItemsDone,
  bestFam,
  canDiet,
  chewOrWish,
  doneAdventuring,
  getGarden,
  haveAll,
  maxBase,
  meatFam,
  nextUnusedBanishItem,
  noML,
  stooperDrunk,
  totallyDrunk,
} from "./utils";
import { targetClass } from "./perm";

const myPulls: Item[] = [
  ...$items`lucky gold ring, Mr. Cheeng's spectacles, mafia thumb ring`,
  // eslint-disable-next-line libram/verify-constants
  ...$items`model train set, Asdon Martin keyfob, Little Geneticist DNA-Splicing Lab`
    .filter((it) => have(it) || getWorkshed() === it || storageAmount(it) > 0)
    .slice(0, 1),
];
const levelingTurns = 30;
function altWorkshed() {
  return (
    // eslint-disable-next-line libram/verify-constants
    $items`model train set, Asdon Martin keyfob, Little Geneticist DNA-Splicing Lab, portable Mayo Clinic, warbear induction oven, snow machine`.find(
      (it) => have(it) || getWorkshed() === it || storageAmount(it) > 0
    ) || $item`none`
  );
}

export function GyouQuest(): Quest {
  return {
    name: "Grey You",
    completed: () => getCurrentLeg() !== Leg.GreyYou,
    tasks: [
      {
        name: "Whitelist VIP Clan",
        completed: () => !args.clan || getClanName().toLowerCase() === args.clan.toLowerCase(),
        do: () => cliExecute(`/whitelist ${args.clan}`),
      },
      {
        name: "Prep Fireworks Shop",
        completed: () => !have($item`Clan VIP Lounge key`) || get("_goorboFireworksPrepped", false),
        do: () => {
          visitUrl("clan_viplounge.php?action=fwshop&whichfloor=2");
          set("_goorboFireworksPrepped", true);
        },
      },
      {
        name: "Farming Pulls",
        completed: () =>
          myPulls.reduce((b, it) => b && (have(it) || storageAmount(it) === 0), true), //for each, you either pulled it, or you don't own it
        do: () =>
          myPulls.forEach((it) => {
            if (storageAmount(it) !== 0 && !have(it)) cliExecute(`pull ${it}`);
          }),
      },
      {
        name: "LGR Seed",
        completed: () => args.noticket || get("_stenchAirportToday") || get("stenchAirportAlways"),
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
        name: "Stillsuit Prep",
        completed: () => itemAmount($item`tiny stillsuit`) === 0,
        do: () =>
          equip(
            $item`tiny stillsuit`,
            get(
              "stillsuitFamiliar",
              $familiars`Gelatinous Cubeling, Levitating Potato, Mosquito`.find((fam) =>
                have(fam)
              ) || $familiar`none`
            )
          ),
      },
      {
        name: "Run",
        completed: () =>
          step("questL13Final") !== -1 && get("gooseReprocessed").split(",").length >= 69, //There are 73 total targets
        do: () => cliExecute(args.gyouscript),
        clear: "all",
        tracking: "Run",
      },
      {
        name: "Uncloset Special Seasoning",
        completed: () => myTurncount() >= 1000 || closetAmount($item`Special Seasoning`) === 0,
        do: () => takeCloset(closetAmount($item`Special Seasoning`), $item`Special Seasoning`),
        tracking: "Run",
      },
      {
        name: "Train Gnome Skills",
        ready: () => myMeat() >= 5000 && gnomadsAvailable(),
        completed: () => have($skill`Torso Awareness`),
        do: () =>
          visitUrl(`gnomes.php?action=trainskill&whichskill=${toInt($skill`Torso Awareness`)}`),
      },
      {
        name: "June Cleaver",
        completed: () =>
          !have($item`June cleaver`) || get("_juneCleaverFightsLeft") > 0 || myAdventures() === 0,
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
        do: $location`The Shore, Inc. Travel Agency`,
        post: () => {
          if (handlingChoice()) visitUrl("main.php");
          if (have($effect`Beaten Up`)) {
            if (have($skill`Tongue of the Walrus`)) useSkill($skill`Tongue of the Walrus`);
            else if (get("_hotTubSoaks") < 5) cliExecute("hottub");
            else if (get("timesRested") < totalFreeRests()) cliExecute("campground rest");
            else if (
              !use($items`tiny house, Space Tours Tripple`.find((it) => have(it)) || $item`none`)
            )
              uneffect($effect`Beaten Up`);
          }
        },
        outfit: () => ({ equip: $items`June cleaver` }),
        limit: undefined,
      },
      {
        name: "Autumnaton",
        completed: () =>
          !have($item`autumn-aton`) || AutumnAton.turnsForQuest() >= myAdventures() + 10,
        do: () => {
          if (
            itemAmount($item`imp air`) < 5 &&
            !have($skill`Liver of Steel`) &&
            !have($item`steel margarita`) &&
            !have($item`Azazel's tutu`)
          ) {
            AutumnAton.sendTo($location`The Laugh Floor`);
          }
          if (
            itemAmount($item`bus pass`) < 5 &&
            !have($skill`Liver of Steel`) &&
            !have($item`steel margarita`) &&
            !have($item`Azazel's tutu`)
          ) {
            AutumnAton.sendTo($location`Infernal Rackets Backstage`);
          }
          const autumnAtonZones = $locations`The Toxic Teacups, The Oasis, The Deep Dark Jungle, The Bubblin' Caldera, The Sleazy Back Alley`;
          if (AutumnAton.turnsForQuest() < myAdventures() + 10) {
            AutumnAton.sendTo(autumnAtonZones);
          }
        },
      },
      {
        name: "Meat Boombox",
        completed: () =>
          !have($item`SongBoom™ BoomBox`) ||
          get("boomBoxSong") === "Total Eclipse of Your Meat" ||
          get("_boomBoxSongsLeft") === 0,
        do: () => SongBoom.setSong("Total Eclipse of Your Meat"),
      },
      {
        name: "Install Alternate Workshed",
        ready: () => have(altWorkshed()),
        completed: () =>
          altWorkshed() === $item`none` ||
          get("_workshedItemUsed") ||
          getWorkshed() === altWorkshed(),
        do: () => use(altWorkshed()),
      },
      {
        name: "Make Soda Bread",
        completed: () =>
          myTurncount() >= 1000 ||
          getWorkshed() !== $item`Asdon Martin keyfob` ||
          have($effect`Driving Observantly`) ||
          availableAmount($item`loaf of soda bread`) >= 10,
        do: () => {
          if (availableAmount($item`wad of dough`) < 10) {
            buy($item`all-purpose flower`);
            use($item`all-purpose flower`);
          }
          retrieveItem(10, $item`loaf of soda bread`);
        },
      },
      {
        name: "Drive Observantly",
        completed: () =>
          getWorkshed() !== $item`Asdon Martin keyfob` || have($effect`Driving Observantly`),
        do: () => AsdonMartin.drive($effect`Driving Observantly`, 30, false),
      },
      {
        name: "Sample Constellation DNA",
        ready: () => have($item`DNA extraction syringe`),
        completed: () =>
          !DNALab.installed() ||
          DNALab.isHybridized($phylum`Constellation`) ||
          get("dnaSyringe") === $phylum`Constellation`,
        outfit: {
          familiar: bestFam(),
          modifier: `${maxBase()}`,
        },
        do: $location`The Hole in the Sky`,
        combat: new CombatStrategy()
          .macro(Macro.skill($skill`Infinite Loop`), getTodaysHolidayWanderers())
          .macro(Macro.tryItem($item`DNA extraction syringe`))
          .macro(
            Macro.tryItem($item`porquoise-handled sixgun`)
              .trySkill($skill`Sing Along`)
              .attack()
              .repeat()
          ),
      },
      {
        name: "Hybridize Constellation",
        ready: () => get("dnaSyringe") === $phylum`Constellation`,
        completed: () => !DNALab.installed() || DNALab.isHybridized($phylum`Constellation`),
        do: () => {
          DNALab.makeTonic(3);
          DNALab.hybridize();
        },
      },
      {
        name: "Robort Collect Fish Head",
        ready: () => have($item`boxed wine`) && meatFam() === $familiar`Robortender`,
        completed: () =>
          !have($item`miniature crystal ball`) ||
          !have($familiar`Robortender`) ||
          Robortender.currentDrinks().includes($item`drive-by shooting`) ||
          have($item`fish head`) ||
          have($item`piscatini`) ||
          have($item`drive-by shooting`),
        outfit: {
          familiar: get("crystalBallPredictions").includes(":The Copperhead Club:Mob Penguin Capo")
            ? $familiar`Robortender`
            : have($familiar`Red-Nosed Snapper`)
            ? $familiar`Red-Nosed Snapper`
            : bestFam(),
          famequip: $item`miniature crystal ball`,
          // ...(have($item`latte lovers member's mug`) &&
          // !get("_latteCopyUsed") &&
          // get("crystalBallPredictions").includes(":The Copperhead Club:Mob Penguin Capo")
          //   ? { offhand: $item`latte lovers member's mug` }
          //   : {}),
          modifier: `${maxBase()}`,
        },
        prepare: (): void => {
          if (
            myFamiliar() === $familiar`Red-Nosed Snapper` &&
            Snapper.getTrackedPhylum() !== $phylum`penguin`
          )
            Snapper.trackPhylum($phylum`penguin`);
          restoreHp(0.75 * myMaxhp());
          restoreMp(20);
        },
        do: $location`The Copperhead Club`,
        combat: new CombatStrategy()
          .macro(Macro.skill($skill`Infinite Loop`), getTodaysHolidayWanderers())
          // .macro(Macro.trySkill($skill`Offer Latte to Opponent`), $monster`Mob Penguin Capo`)
          .macro(
            () =>
              Macro.externalIf(
                !$monsters`Copperhead Club bartender, fan dancer, ninja dressed as a waiter, waiter dressed as a ninja`.find(
                  (mob) => mob === getBanishedMonsters().get($skill`System Sweep`) //get("banishedMonsters").includes(`${mob.name}:System Sweep`)
                ),
                Macro.trySkill($skill`System Sweep`)
              ),
            $monsters`Copperhead Club bartender, fan dancer, ninja dressed as a waiter, waiter dressed as a ninja`
          )
          .macro(
            Macro.tryItem($item`porquoise-handled sixgun`)
              .trySkill($skill`Sing Along`)
              .attack()
              .repeat()
          ),
        limit: { tries: 10 },
      },
      {
        name: "Feed Robortender",
        ready: () =>
          (have($item`boxed wine`) && have($item`fish head`)) ||
          have($item`piscatini`) ||
          have($item`drive-by shooting`),
        completed: () =>
          !have($familiar`Robortender`) ||
          Robortender.currentDrinks().includes($item`drive-by shooting`),
        do: () => {
          retrieveItem($item`drive-by shooting`);
          useFamiliar($familiar`Robortender`);
          Robortender.feed($item`drive-by shooting`);
        },
      },
      {
        name: "Custom Ronin Farm",
        completed: () =>
          !args.roninfarm || args.roninfarm === "" || get("_goorbo_roninfarmComplete", false),
        do: () => {
          if (args.roninfarm) cliExecute(args.roninfarm);
          set("_goorbo_roninfarmComplete", true);
        },
        tracking: "GooFarming",
      },
      {
        name: "In-Run Farm Initial",
        completed: () => myTurncount() >= 1000,
        acquire: [{ item: $item`seal tooth` }],
        outfit: () => ({
          familiar: meatFam(),
          modifier: `${maxBase()}, 2.5 meat, 0.6 items`,
        }),
        prepare: (): void => {
          if (have($item`How to Avoid Scams`)) ensureEffect($effect`How to Scam Tourists`);
          restoreHp(0.75 * myMaxhp());
          restoreMp(20);
        },
        do: $location`Barf Mountain`,
        combat: new CombatStrategy()
          .macro(Macro.skill($skill`Infinite Loop`), getTodaysHolidayWanderers())
          .macro(() =>
            Macro.trySkill($skill`Bowl Straight Up`)
              .trySkill($skill`Sing Along`)
              .trySkill($skill`Extract Jelly`)
              .tryItem($item`porquoise-handled sixgun`)
              .externalIf(
                myFamiliar() === $familiar`Hobo Monkey`,
                Macro.while_(
                  `!match "shoulder, and hands you some Meat." && !pastround 20 && !hppercentbelow 25`,
                  Macro.item($item`seal tooth`)
                )
              )
              .trySkill($skill`Double Nanovision`)
              .attack()
              .repeat()
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
      },
      {
        name: "Get Amulet Coin",
        ready: () => have($familiar`Cornbeefadon`),
        completed: () => have($item`amulet coin`),
        acquire: [{ item: $item`box of Familiar Jacks`, price: 20000 }],
        do: (): void => {
          useFamiliar($familiar`Cornbeefadon`);
          use($item`box of Familiar Jacks`);
        },
      },
      {
        name: "Tower",
        completed: () => step("questL13Final") > 11,
        do: () => cliExecute("loopgyou delaytower chargegoose=20"),
        clear: "all",
        tracking: "Run",
      },
      {
        name: "Daily Dungeon",
        ready: () =>
          (myClass() === $class`Grey Goo` && myAdventures() > 40) ||
          (myClass() !== $class`Grey Goo` && myLevel() >= args.targetlevel),
        completed: () => get("dailyDungeonDone"),
        acquire: $items`eleven-foot pole, Pick-O-Matic lockpicks, ring of Detect Boring Doors`.map(
          (it) => ({ item: it, price: 1000 })
        ),
        outfit: () => {
          return {
            familiar: bestFam(),
            ...(get("_lastDailyDungeonRoom") % 5 === 4
              ? { acc1: $item`ring of Detect Boring Doors` }
              : {}),
            modifier: `${maxBase()}, 250 bonus carnivorous potted plant, 100 familiar experience`,
          };
        },
        prepare: (): void => {
          if (
            !get("_dailyDungeonMalwareUsed") &&
            itemAmount($item`fat loot token`) < 3 &&
            itemAmount($item`daily dungeon malware`) === 0
          ) {
            if (availableAmount($item`BACON`) >= 150)
              buy($coinmaster`internet meme shop`, 1, $item`daily dungeon malware`);
            else retrieveItem(1, $item`daily dungeon malware`);
          }
          restoreHp(0.75 * myMaxhp());
          restoreMp(20);
        },
        do: $location`The Daily Dungeon`,
        choices: {
          692: 3, //dd door: lockpicks
          689: 1, //dd final chest : open
          690: 2, //dd chest 1: boring door
          691: 2, //dd chest 2: boring door
          693: 2, //dd trap: skip
        },
        combat: new CombatStrategy()
          .macro(Macro.skill($skill`Infinite Loop`), getTodaysHolidayWanderers())
          .macro(() =>
            Macro.externalIf(
              !get("_dailyDungeonMalwareUsed"),
              Macro.tryItem($item`daily dungeon malware`)
            )
              .tryItem($item`porquoise-handled sixgun`)
              .attack()
              .repeat()
          ),
        limit: { tries: 15 },
      },
      {
        name: "Laugh Floor",
        ready: () =>
          (myClass() === $class`Grey Goo` && myAdventures() > 40) ||
          (myClass() !== $class`Grey Goo` && myLevel() >= args.targetlevel),
        completed: () =>
          args.ascend ||
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
            restoreHp(0.75 * myMaxhp());
            restoreMp(20);
          }
          if (have($skill`Piezoelectric Honk`) && !have($effect`Hooooooooonk!`))
            useSkill($skill`Piezoelectric Honk`);
          $effects`The Sonata of Sneakiness, Darkened Photons, Shifted Phase`.forEach(
            (ef: Effect) => cliExecute(`uneffect ${ef}`)
          );
        },
        do: $location`The Laugh Floor`,
        outfit: () => ({
          familiar: bestFam(),
          modifier: `${maxBase()}, 100 combat rate, 3 item, 250 bonus carnivorous potted plant, 100 familiar experience`,
        }),
        combat: new CombatStrategy()
          .macro(Macro.skill($skill`Infinite Loop`), getTodaysHolidayWanderers())
          .macro(
            Macro.tryItem($item`porquoise-handled sixgun`)
              .trySkill($skill`Double Nanovision`)
              .attack()
              .repeat()
          ),
        limit: { tries: 15 },
      },
      {
        name: "Infernal Rackets Backstage",
        ready: () =>
          (myClass() === $class`Grey Goo` && myAdventures() > 40) ||
          (myClass() !== $class`Grey Goo` && myLevel() >= args.targetlevel),
        completed: () =>
          args.ascend ||
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
            restoreHp(0.75 * myMaxhp());
            restoreMp(20);
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
        outfit: () => ({
          familiar: bestFam(),
          modifier: `${maxBase()}, -100 combat rate, 3 item, 250 bonus carnivorous potted plant, 100 familiar experience`,
        }),
        combat: new CombatStrategy()
          .macro(Macro.skill($skill`Infinite Loop`), getTodaysHolidayWanderers())
          .macro(
            Macro.tryItem($item`porquoise-handled sixgun`)
              .trySkill($skill`Double Nanovision`)
              .repeat()
          ),
        limit: { tries: 15 },
      },
      {
        name: "Mourn",
        ready: () => have($item`observational glasses`),
        completed: () =>
          args.ascend ||
          have($skill`Liver of Steel`) ||
          have($item`steel margarita`) ||
          have($item`Azazel's lollipop`),
        outfit: {
          equip: $items`hilarious comedy prop, observational glasses, Victor\, the Insult Comic Hellhound Puppet`,
        },
        do: () => cliExecute("panda comedy insult; panda comedy observe"),
      },
      {
        name: "Sven Golly",
        ready: () => backstageItemsDone(),
        completed: () =>
          args.ascend ||
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
          args.ascend ||
          have($skill`Liver of Steel`) ||
          have($item`steel margarita`) ||
          have($item`Azazel's tutu`),
        acquire: () =>
          $items`bus pass, imp air`.map((it) => ({
            item: it,
            num: 5,
            price: get("valueOfAdventure"),
          })),
        do: () => cliExecute("panda moan"),
        limit: { tries: 3 },
      },
      {
        name: "Custom Post-Ronin Farm",
        completed: () =>
          !args.postroninfarm ||
          args.postroninfarm === "" ||
          get("_goorbo_postroninfarmComplete", false),
        do: () => {
          if (args.postroninfarm) cliExecute(args.postroninfarm);
          set("_goorbo_postroninfarmComplete", true);
        },
        tracking: "GooFarming",
      },
      {
        name: "In-Run Farm Final",
        completed: () => myAdventures() <= 40 || myClass() !== $class`Grey Goo`,
        acquire: [{ item: $item`seal tooth` }],
        outfit: () => ({
          familiar: meatFam(),
          modifier: `${maxBase()}, 2.5 meat, 0.6 items`,
        }),
        prepare: (): void => {
          if (have($item`How to Avoid Scams`)) ensureEffect($effect`How to Scam Tourists`);
          restoreHp(0.75 * myMaxhp());
          restoreMp(20);
        },
        do: $location`Barf Mountain`,
        combat: new CombatStrategy()
          .macro(Macro.skill($skill`Infinite Loop`), getTodaysHolidayWanderers())
          .macro(() =>
            Macro.trySkill($skill`Bowl Straight Up`)
              .trySkill($skill`Sing Along`)
              .trySkill($skill`Extract Jelly`)
              .tryItem($item`porquoise-handled sixgun`)
              .externalIf(
                myFamiliar() === $familiar`Hobo Monkey`,
                Macro.while_(
                  `!match "shoulder, and hands you some Meat." && !pastround 20 && !hppercentbelow 25`,
                  Macro.item($item`seal tooth`)
                )
              )
              .trySkill($skill`Double Nanovision`)
              .attack()
              .repeat()
          ),
        limit: { tries: 150 },
        tracking: "GooFarming",
      },
      {
        name: "Hatter Buff",
        completed: () => get("_madTeaParty"),
        acquire: $items`oil cap, "DRINK ME" potion`.map((it) => ({ item: it, price: 1000 })),
        do: () => cliExecute(`hatter ${$item`oil cap`}`),
      },
      {
        name: "Free King",
        completed: () => myClass() !== $class`Grey Goo`,
        acquire: () => [
          { item: $item`teacher's pen`, num: 3, price: 500 },
          ...(targetClass(false).primestat === $stat`Muscle`
            ? $items`discarded swimming trunks, battered hubcap, trench coat`.map((it) => ({
                item: it,
              }))
            : []),
          ...(targetClass(false).primestat === $stat`Mysticality`
            ? [] //$items``.map((it) => ({ item: it }))
            : []),
          ...(targetClass(false).primestat === $stat`Moxie`
            ? $items`noir fedora`.map((it) => ({ item: it }))
            : []),
        ],
        outfit: () => ({
          familiar: $familiar`Grey Goose`,
          hat: $item`giant yellow hat`,
          weapon: $item`yule hatchet`,
          acc1: $item`teacher's pen`,
          acc2: $item`teacher's pen`,
          acc3: $item`teacher's pen`,
          famequip: $item`grey down vest`,
        }),
        prepare: () => {
          cliExecute("mcd 0");
          maximize(
            `${targetClass(false).primestat} experience, 5 ${
              targetClass(false).primestat
            } experience percent, 10 familiar experience, ${noML()}`,
            false
          );
        },
        do: (): void => {
          cliExecute(`loopgyou class=${toInt(targetClass(false))}`);
          set("_freshOutOfGreyYou", true);
          set("goorboNextClass", "");
          cliExecute("pull all; refresh all"); //if we somehow didn't already pull everything.
          print(`Grey Goose exp at prism break: ${$familiar`Grey Goose`.experience}/400`);
        },
        clear: "all",
      },
      {
        name: "Call Buffy",
        completed: () => 0 !== haveEffect($effect`Ghostly Shell`) || myLevel() >= args.targetlevel,
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
        name: "April Shower",
        completed: () => !have($item`Clan VIP Lounge key`) || get("_aprilShower"),
        do: () => cliExecute(`shower ${myPrimestat()}`),
      },
      {
        name: "Game Grid Token",
        completed: () => !have($item`defective Game Grid token`) || get("_defectiveTokenUsed"),
        do: () => use($item`defective Game Grid token`),
      },
      {
        name: "Campaway",
        completed: () =>
          !get("getawayCampsiteUnlocked") ||
          (get("_campAwayCloudBuffs") >= 1 && get("_campAwaySmileBuffs") >= 3),
        do: () => visitUrl("place.php?whichplace=campaway&action=campaway_sky"),
        limit: { tries: 4 },
      },
      {
        name: "NEP Reject Quest",
        ready: () => get("neverendingPartyAlways") && get("_questPartyFair") === "unstarted",
        completed: () => get("_questPartyFair") === "",
        choices: {
          1322: 2,
        },
        do: $location`The Neverending Party`,
      },
      {
        name: "NEP Exp Buff",
        ready: () =>
          get("neverendingPartyAlways") &&
          get("_questPartyFair") !== "unstarted" &&
          have($item`Clara's bell`),
        completed: () => get("_claraBellUsed"),
        choices: {
          1324: () =>
            myPrimestat() === $stat`Muscle` ? 2 : myPrimestat() === $stat`Mysticality` ? 1 : 4,
          1325: 2, // Myst Exp %
          1326: 2, // Mus Exp %
          1328: 2, // Mox Exp %
        },
        prepare: () => use($item`Clara's bell`),
        do: $location`The Neverending Party`,
      },
      {
        name: "Snapper Spleen Exp %",
        completed: () =>
          myLevel() >= args.targetlevel ||
          $effects`HGH-charged, Different Way of Seeing Things, Thou Shant Not Sing`.reduce(
            (a, ef) => a || have(ef),
            false
          ) ||
          mySpleenUse() >= spleenLimit() + 3 - get("currentMojoFilters"),
        do: (): void => {
          switch (myPrimestat()) {
            case $stat`Muscle`:
              chewOrWish($item`vial of humanoid growth hormone`, $effect`HGH-charged`);
              break;
            case $stat`Mysticality`:
              chewOrWish($item`non-Euclidean angle`, $effect`Different Way of Seeing Things`);
              break;
            case $stat`Moxie`:
              chewOrWish($item`Shantix™`, $effect`Thou Shant Not Sing`);
          }
        },
        limit: { tries: Math.ceil(levelingTurns / 20) },
        tracking: "Leveling",
      },
      {
        name: "Inscrutable Gaze",
        completed: () =>
          myLevel() >= args.targetlevel ||
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
          myLevel() >= args.targetlevel ||
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
        name: "Bastille Battalion",
        ready: () => have($item`Bastille Battalion control rig`),
        completed: () => get("_bastilleGames") !== 0,
        do: () => cliExecute("bastille mainstat draftsman gesture"),
      },
      {
        name: "Steel Margarita",
        ready: () => haveAll($items`Azazel's tutu, Azazel's lollipop, Azazel's unicorn`),
        completed: () =>
          args.ascend || have($skill`Liver of Steel`) || have($item`steel margarita`),
        do: () => cliExecute("panda temple"),
      },
      {
        name: "Liver of Steel",
        ready: () =>
          myClass() !== $class`Grey Goo` && have($item`steel margarita`) && myLevel() >= 5,
        completed: () => args.ascend || have($skill`Liver of Steel`),
        do: () => drink(1, $item`steel margarita`),
      },
      {
        name: "Taffy Effects",
        completed: () =>
          myLevel() >= args.targetlevel ||
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
            use(
              Math.ceil((50 - haveEffect($effect`Purple Reign`)) / 10),
              $item`pulled violet taffy`
            ); //lasts for 10 turns each
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
        name: "Curiosity",
        completed: () =>
          myLevel() >= args.targetlevel ||
          have($effect`Curiosity of Br'er Tarrypin`) ||
          !have($skill`Curiosity of Br'er Tarrypin`),
        do: () => useSkill($skill`Curiosity of Br'er Tarrypin`),
        limit: { tries: Math.ceil(levelingTurns / 10) },
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
        name: "Restore HP",
        completed: () => myHp() > 0.5 * myMaxhp(),
        do: () => restoreHp(0.95 * myMaxhp()),
        tracking: "Leveling",
      },
      {
        name: "Cast Blood Bubble",
        completed: () =>
          !have($skill`Blood Bubble`) ||
          have($effect`Blood Bubble`) ||
          myLevel() >= args.targetlevel,
        do: () => useSkill($skill`Blood Bubble`),
        tracking: "Leveling",
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
        acquire: [
          ...$items`gas can, gas balloon, shard of double-ice`.map((it) => ({
            item: it,
            price: 1000,
          })),
          ...(have($item`January's Garbage Tote`)
            ? [{ item: $item`makeshift garbage shirt` }]
            : []),
        ],
        prepare: () => restoreHp(0.9 * myHp()),
        do: () => visitUrl("inv_eat.php?pwd&whichitem=10207"),
        post: () => {
          if (!get("_lastCombatWon"))
            throw new Error("Lost Combat - Check to see what went wrong.");
        },
        outfit: () => ({
          familiar: bestFam(),
          ...(have($item`January's Garbage Tote`) && have($skill`Torso Awareness`)
            ? { shirt: $item`makeshift garbage shirt` }
            : {}),
          modifier: `${myPrimestat()} experience, 5 ${myPrimestat()} experience percent, 10 familiar experience, ${noML()}`,
        }),
        combat: new CombatStrategy().macro(() =>
          Macro.tryItem($item`gas balloon`)
            .trySkill($skill`Feel Pride`)
            .tryItem(...$items`shard of double-ice, gas can`)
            .attack()
            .repeat()
        ),
        tracking: "Leveling",
      },
      {
        name: "Drunk Pygmies",
        ready: () =>
          !!$effects`HGH-charged, Different Way of Seeing Things, Thou Shant Not Sing`.find((ef) =>
            have(ef)
          ),
        completed: () =>
          myLevel() >= args.targetlevel ||
          (get("_drunkPygmyBanishes") >= 11 &&
            !get("crystalBallPredictions").includes($monster`drunk pygmy`.name)),
        acquire: [
          { item: $item`Bowl of Scorpions`, price: 1000 },
          ...($monsters`pygmy orderlies, pygmy bowler`.find((mob) => !isBanished(mob))
            ? [{ item: nextUnusedBanishItem(), price: 20000 }]
            : []),
        ],
        effects: $effects`Heart of White`,
        outfit: () => ({
          familiar: $familiar`Grey Goose`,
          ...(have($item`cursed magnifying glass`) && $familiar`Grey Goose`.experience < 400
            ? { offhand: $item`cursed magnifying glass` }
            : {}),
          ...(have($item`miniature crystal ball`) && get("_drunkPygmyBanishes") >= 10
            ? { famequip: $item`miniature crystal ball` }
            : {}),
          ...(have($item`mafia middle finger ring`) &&
          myBasestat($stat`Muscle`) >= 45 &&
          !get("_mafiaMiddleFingerRingUsed")
            ? { equip: [$item`mafia middle finger ring`] }
            : {}),
          modifier: `${myPrimestat()} experience, 5 ${myPrimestat()} experience percent, 10 familiar experience`,
        }),
        prepare: (): void => {
          restoreMp(50);
          if (itemAmount($item`bowling ball`) > 0)
            putCloset(itemAmount($item`bowling ball`), $item`bowling ball`);
        },
        do: $location`The Hidden Bowling Alley`,
        combat: new CombatStrategy()
          .macro(
            () =>
              Macro.externalIf(
                $familiar`Grey Goose`.experience >= 400,
                Macro.trySkill(
                  myPrimestat() === $stat`Muscle`
                    ? $skill`Convert Matter to Protein`
                    : myPrimestat() === $stat`Mysticality`
                    ? $skill`Convert Matter to Energy`
                    : $skill`Convert Matter to Pomade`
                )
              ),
            $monsters`void slab, void guy, void spider, drunk pygmy`
          )
          .macro(
            () =>
              Macro.trySkill($skill`Show them your ring`)
                .externalIf(
                  have($skill`Snokebomb`) && !getBanishedMonsters().get($skill`Snokebomb`),
                  Macro.trySkill($skill`Snokebomb`)
                )
                .externalIf(
                  have($skill`Feel Hatred`) && !getBanishedMonsters().get($skill`Feel Hatred`),
                  Macro.trySkill($skill`Feel Hatred`)
                )
                .tryItem(nextUnusedBanishItem()),
            $monsters`pygmy bowler, pygmy orderlies, pygmy janitor`
          )
          .macro(
            Macro.tryItem($item`porquoise-handled sixgun`)
              .tryItem($item`spectre scepter`)
              .attack()
              .repeat()
          ),
        limit: { tries: 15 },
        tracking: "Leveling",
      },
      {
        name: "Ball Pit",
        completed: () => !have($item`Clan VIP Lounge key`) || get("_ballpit"),
        do: () => cliExecute(`ballpit`),
        tracking: "Leveling",
      },
      {
        name: "Get Lyle Favored",
        completed: () => get("_lyleFavored"),
        do: () => cliExecute("monorail"),
        tracking: "Leveling",
      },
      {
        name: "Telescope Buff",
        completed: () =>
          !($item`Discount Telescope Warehouse gift certificate`.name in getCampground()) ||
          get("telescopeLookedHigh"),
        do: () => cliExecute("telescope high"),
        tracking: "Leveling",
      },
      {
        name: "Fight Seals",
        ready: () =>
          have($item`figurine of a wretched-looking seal`) && have($item`seal-blubber candle`),
        completed: () =>
          myClass() !== $class`Seal Clubber` ||
          get("_sealsSummoned") >= 10 ||
          (!have($item`Claw of the Infernal Seal`) && get("_sealsSummoned") >= 5),
        outfit: () => ({
          familiar: $familiar`Grey Goose`,
          modifier: `club, 0.125 ${myPrimestat()}, ${myPrimestat()} experience, 5 ${myPrimestat()} experience percent, 10 familiar experience`,
        }),
        do: () => visitUrl("inv_use.php?pwd&checked=1&whichitem=3902"),
        combat: new CombatStrategy().macro(() =>
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
            .trySkill($skill`Sing Along`)
            .tryItem($item`porquoise-handled sixgun`)
            .attack()
            .repeat()
        ),
        limit: { tries: 10 },
        tracking: "Leveling",
      },
      {
        name: "Oliver's Place",
        ready: () => get("ownsSpeakeasy", false),
        completed: () => get("_speakeasyFreeFights", 0) >= 3,
        outfit: () => ({
          familiar: $familiar`Grey Goose`,
          modifier: `${myPrimestat()} experience, 5 ${myPrimestat()} experience percent, 10 familiar experience`,
        }),
        prepare: () => {
          restoreHp(0.9 * myHp());
          restoreMp(12);
        },
        // eslint-disable-next-line libram/verify-constants
        do: $location`An Unusually Quiet Barroom Brawl`,
        post: () => {
          if (!get("_lastCombatWon"))
            throw new Error("Lost Combat - Check to see what went wrong.");
        },
        combat: new CombatStrategy().macro(() =>
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
            .trySkill($skill`Sing Along`)
            .tryItem($item`porquoise-handled sixgun`)
            .trySkill($skill`Saucestorm`)
            .trySkill($skill`Saucestorm`)
            .attack()
            .repeat()
        ),
        tracking: "Leveling",
        limit: { tries: 3 },
      },
      {
        name: "Buff Mainstat",
        completed: () =>
          myLevel() >= args.targetlevel ||
          myBuffedstat(myPrimestat()) >= 11 * myBasestat(myPrimestat()),
        effects: $effects`Trivia Master`,
        do: () => cliExecute(`gain ${11 * myBasestat(myPrimestat())} ${myPrimestat()}`),
        limit: { tries: levelingTurns },
        tracking: "Leveling",
      },
      {
        name: "Fight Tentacle",
        completed: () => get("_eldritchTentacleFought"),
        acquire: () => [
          ...(have($skill`Curse of Weaksauce`)
            ? []
            : [{ item: $item`electronics kit`, price: 500 }]),
        ],
        outfit: () => ({
          familiar: $familiar`Grey Goose`,
          modifier: `effective, 0.125 ${myPrimestat()} 400 max, ${myPrimestat()} experience, 5 ${myPrimestat()} experience percent, 10 familiar experience, ${noML()}`,
        }),
        prepare: () => {
          restoreHp(0.9 * myHp());
          if (itemAmount($item`eldritch essence`) > 0)
            putCloset(itemAmount($item`eldritch essence`), $item`eldritch essence`);
        },
        do: () => {
          visitUrl("place.php?whichplace=forestvillage&action=fv_scientist");
          runChoice(1);
        },
        combat: new CombatStrategy().macro(() =>
          Macro.externalIf(
            have($skill`Curse of Weaksauce`),
            Macro.trySkill($skill`Curse of Weaksauce`),
            Macro.tryItem($item`electronics kit`)
          )
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
        ),
        tracking: "Leveling",
      },
      {
        name: "God Lobster",
        ready: () =>
          myLevel() >= args.targetlevel - 1 &&
          !!$effects`HGH-charged, Different Way of Seeing Things, Thou Shant Not Sing`.find((ef) =>
            have(ef)
          ),
        completed: () => get("_godLobsterFights") >= 3,
        effects: $effects`Heart of White`,
        acquire: () => [
          ...(have($skill`Curse of Weaksauce`)
            ? []
            : [{ item: $item`electronics kit`, price: 500 }]),
          ...(have($familiar`God Lobster`)
            ? []
            : [{ item: $item`Dish of Clarified Butter`, price: get("valueOfAdventure") / 2 }]),
          ...(have($item`January's Garbage Tote`)
            ? [{ item: $item`makeshift garbage shirt` }]
            : []),
        ],
        outfit: () => ({
          ...(have($familiar`God Lobster`) ? { familiar: $familiar`God Lobster` } : {}),
          ...(have($item`makeshift garbage shirt`)
            ? { shirt: $item`makeshift garbage shirt` }
            : {}),
          modifier: `effective, 0.125 ${myPrimestat()}, ${myPrimestat()} experience, 5 ${myPrimestat()} experience percent, ${noML()}`,
        }),
        choices: {
          1310: 3,
        },
        prepare: (): void => {
          restoreHp(0.75 * myMaxhp());
          restoreMp(8);
        },
        do: () => {
          if (have($familiar`God Lobster`)) visitUrl("main.php?fightgodlobster=1");
          else use($item`Dish of Clarified Butter`);
          runCombat();
          visitUrl("choice.php");
          if (handlingChoice()) runChoice(-1);
        },
        post: () => {
          if (!get("_lastCombatWon"))
            throw new Error("Lost Combat - Check to see what went wrong.");
        },
        combat: new CombatStrategy().macro(() =>
          Macro.step("pickpocket")
            .externalIf(
              have($skill`Curse of Weaksauce`),
              Macro.trySkill($skill`Curse of Weaksauce`),
              Macro.tryItem($item`electronics kit`)
            )
            .tryItem($item`porquoise-handled sixgun`)
            .trySkill($skill`Sing Along`)
            .trySkill($skill`Feel Pride`)
            .attack()
            .repeat()
        ),
        limit: { tries: 3 },
        tracking: "Leveling",
      },
      {
        name: "NEP Free Fights",
        ready: () =>
          get("neverendingPartyAlways") &&
          !!$effects`HGH-charged, Different Way of Seeing Things, Thou Shant Not Sing`.find((ef) =>
            have(ef)
          ),
        completed: () =>
          get("_neverendingPartyFreeTurns") >= 10 ||
          (myClass() !== $class`Grey Goo` && myLevel() >= args.targetlevel),
        effects: $effects`Heart of White`,
        acquire: () => [
          ...(have($skill`Curse of Weaksauce`)
            ? []
            : [{ item: $item`electronics kit`, price: 500 }]),
          ...(have($item`January's Garbage Tote`)
            ? [{ item: $item`makeshift garbage shirt` }]
            : []),
        ],
        outfit: () => ({
          familiar: $familiar`Grey Goose`,
          ...(have($item`makeshift garbage shirt`)
            ? { shirt: $item`makeshift garbage shirt` }
            : {}),
          modifier: `effective, 0.125 ${myPrimestat()}, ${myPrimestat()} experience, 5 ${myPrimestat()} experience percent, 10 familiar experience, ${noML()}`,
        }),
        prepare: (): void => {
          restoreHp(0.75 * myMaxhp());
          restoreMp(8);
        },
        do: $location`The Neverending Party`,
        post: () => {
          if (!get("_lastCombatWon"))
            throw new Error("Lost Combat - Check to see what went wrong.");
        },
        choices: {
          1322: 2, //don't take NEP quest
          1324: 5, //fight a partier
        },
        combat: new CombatStrategy().macro(() =>
          Macro.step("pickpocket")
            .externalIf(
              have($skill`Curse of Weaksauce`),
              Macro.trySkill($skill`Curse of Weaksauce`),
              Macro.tryItem($item`electronics kit`)
            )
            .trySkill($skill`Bowl Sideways`)
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
            .tryItem(...$items`porquoise-handled sixgun, HOA citation pad`)
            .trySkill($skill`Sing Along`)
            .externalIf(myLevel() >= args.targetlevel - 2, Macro.trySkill($skill`Feel Pride`))
            .attack()
            .repeat()
        ),
        limit: { tries: 13 }, //+3 for unaccounted for wanderers, etc.
        tracking: "Leveling",
      },
      {
        name: "Gators",
        ready: () =>
          !!$effects`HGH-charged, Different Way of Seeing Things, Thou Shant Not Sing`.find((ef) =>
            have(ef)
          ),
        completed: () => myClass() !== $class`Grey Goo` && myLevel() >= args.targetlevel,
        effects: $effects`Heart of White, Expert Vacationer`,
        acquire: () => [
          ...(have($skill`Curse of Weaksauce`)
            ? []
            : [{ item: $item`electronics kit`, price: 500 }]),
          ...(have($item`January's Garbage Tote`)
            ? [{ item: $item`makeshift garbage shirt` }]
            : []),
        ],
        outfit: () => ({
          familiar: $familiar`Grey Goose`,
          ...(have($item`The Jokester's gun`) &&
          myBasestat($stat`Moxie`) >= 50 &&
          !get("_firedJokestersGun")
            ? { weapon: $item`The Jokester's gun` }
            : have($item`Lil' Doctor™ bag`) && get("_chestXRayUsed") < 3
            ? { equip: [$item`Lil' Doctor™ bag`] }
            : {}),
          ...(have($item`makeshift garbage shirt`)
            ? { shirt: $item`makeshift garbage shirt` }
            : {}),
          modifier: `effective, 0.125 ${myPrimestat()}, ${myPrimestat()} experience, 5 ${myPrimestat()} experience percent, 10 familiar experience, ${noML()}`,
        }),
        prepare: (): void => {
          restoreHp(0.75 * myMaxhp());
          restoreMp(8);
        },
        do: $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`,
        post: () => {
          if (!get("_lastCombatWon"))
            throw new Error("Lost Combat - Check to see what went wrong.");
        },
        combat: new CombatStrategy().macro(() =>
          Macro.step("pickpocket")
            .externalIf(
              have($skill`Curse of Weaksauce`),
              Macro.trySkill($skill`Curse of Weaksauce`),
              Macro.tryItem($item`electronics kit`)
            )
            .trySkill($skill`Bowl Sideways`)
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
            .externalIf(myLevel() >= args.targetlevel - 2, Macro.trySkill($skill`Feel Pride`))
            .trySkill($skill`Fire the Jokester's Gun`)
            .trySkill($skill`Chest X-Ray`)
            .trySkill($skill`Gingerbread Mob Hit`)
            .trySkill($skill`Shattering Punch`)
            .attack()
            .repeat()
        ),
        limit: { tries: levelingTurns + 3 }, //+3 for unaccounted for wanderers, etc.
        tracking: "Leveling",
      },
      {
        name: "Alert-Leveling Failed",
        completed: () => myLevel() >= args.targetlevel,
        do: (): void => {
          throw new Error(
            `Finished Leveling Tasks, but only reached level ${myLevel()}/${args.targetlevel}`
          );
        },
      },
      {
        name: "Gold Wedding Ring",
        completed: () =>
          !have($skill`Comprehensive Cartography`) ||
          myAscensions() === get("lastCartographyBooPeak"),
        choices: { 1430: 3, 606: 4, 610: 1, 1056: 1 },
        do: $location`A-Boo Peak`,
        outfit: { modifier: "initiative 40 min 40 max, -tie" },
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
        prepare: () => uneffect($effect`Beaten Up`),
        do: () => cliExecute(args.garbo),
        post: () =>
          $effects`Power Ballad of the Arrowsmith, Stevedave's Shanty of Superiority, The Moxious Madrigal, The Magical Mojomuscular Melody, Aloysius' Antiphon of Aptitude, Ur-Kel's Aria of Annoyance`
            .filter((ef) => have(ef))
            .forEach((ef) => uneffect(ef)),
        clear: "all",
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
        ready: () => doneAdventuring(),
        completed: () => pvpAttacksLeft() === 0 || !hippyStoneBroken(),
        do: (): void => {
          cliExecute("unequip");
          cliExecute("UberPvPOptimizer");
          cliExecute("swagger");
        },
      },
      {
        name: "Stooper",
        ready: () =>
          myInebriety() === inebrietyLimit() &&
          have($item`tiny stillsuit`) &&
          get("familiarSweat") >= 300,
        completed: () => !have($familiar`Stooper`) || stooperDrunk(),
        do: () => {
          useFamiliar($familiar`Stooper`);
          cliExecute("drink stillsuit distillate");
        },
      },
      {
        name: "Nightcap",
        ready: () => doneAdventuring(),
        completed: () => args.ascend || totallyDrunk(),
        do: () => cliExecute("CONSUME NIGHTCAP"),
      },
      {
        name: "Barfing Drunk with Stooper",
        ready: () =>
          stooperDrunk() && have($familiar`Stooper`) && !have($item`Drunkula's wineglass`),
        completed: () => !args.ascend || myAdventures() === 0 || totallyDrunk(),
        acquire: [{ item: $item`seal tooth` }],
        outfit: () => ({
          familiar: $familiar`Stooper`,
          modifier: `${maxBase()}, 2.5 meat, 0.6 items`,
        }),
        effects: $effects`How to Scam Tourists`, //need to add meat buffs that we can cast
        prepare: (): void => {
          restoreHp(0.75 * myMaxhp());
          restoreMp(20);
        },
        do: $location`Barf Mountain`,
        combat: new CombatStrategy()
          .macro(Macro.trySkill($skill`Curse of Weaksauce`), getTodaysHolidayWanderers())
          .macro(() =>
            Macro.step("pickpocket")
              .trySkill($skill`Bowl Straight Up`)
              .trySkill($skill`Sing Along`)
              .tryItem($item`porquoise-handled sixgun`)
              .externalIf(
                haveEquipped($item`mafia pointer finger ring`),
                Macro.trySkill($skill`Furious Wallop`)
                  .trySkill($skill`Summer Siesta`)
                  .trySkill($skill`Throw Shield`)
                  .trySkill($skill`Precision Shot`)
              )
              .attack()
              .repeat()
          ),
        limit: { tries: 30 },
      },
      {
        name: "Nightcap (Wine Glass)",
        ready: () => have($item`Drunkula's wineglass`),
        completed: () => !args.ascend || totallyDrunk(),
        do: () => cliExecute(`CONSUME NIGHTCAP VALUE ${get("valueOfAdventure") - 1000}`),
      },
      {
        name: "Nightcap (Marginal)",
        ready: () => have($item`Beach Comb`) || have($item`Map to Safety Shelter Grimace Prime`),
        completed: () => !args.ascend || totallyDrunk(),
        do: () => cliExecute(`CONSUME NIGHTCAP VALUE 500`),
      },
      {
        name: "Grimace Maps",
        completed: () =>
          !args.ascend || myAdventures() === 0 || !have($item`Map to Safety Shelter Grimace Prime`),
        effects: $effects`Transpondent`,
        choices: {
          536: () =>
            availableAmount($item`distention pill`) <
            availableAmount($item`synthetic dog hair pill`) +
              availableAmount($item`Map to Safety Shelter Grimace Prime`)
              ? 1
              : 2,
        },
        do: () => use($item`Map to Safety Shelter Grimace Prime`),
        limit: { tries: 30 },
      },
      {
        name: "Garbo (Drunk)",
        ready: () => have($item`Drunkula's wineglass`),
        prepare: () => uneffect($effect`Beaten Up`),
        completed: () => !args.ascend || myAdventures() === 0,
        do: () => cliExecute(args.garboascend),
        post: () =>
          $effects`Power Ballad of the Arrowsmith, Stevedave's Shanty of Superiority, The Moxious Madrigal, The Magical Mojomuscular Melody, Aloysius' Antiphon of Aptitude, Ur-Kel's Aria of Annoyance`
            .filter((ef) => have(ef))
            .forEach((ef) => uneffect(ef)),
        clear: "all",
        tracking: "Garbo",
      },
      {
        name: "Comb Beach",
        ready: () => have($item`Beach Comb`),
        completed: () => !args.ascend || myAdventures() === 0,
        do: () => cliExecute(`combo ${11 - get("_freeBeachWalksUsed") + myAdventures()}`),
      },
      {
        name: "Plant Garden",
        ready: () =>
          doneAdventuring() &&
          !!$items`packet of thanksgarden seeds, Peppermint Pip Packet, packet of winter seeds, packet of beer seeds, packet of pumpkin seeds, packet of dragon's teeth`.find(
            (it) => have(it)
          ),
        completed: () => getGarden() !== $item`packet of tall grass seeds`,
        do: () => {
          use(
            $items`packet of thanksgarden seeds, Peppermint Pip Packet, packet of winter seeds, packet of beer seeds, packet of pumpkin seeds, packet of dragon's teeth`.find(
              (it) => have(it)
            ) || $item`none`
          );
          if (args.ascend) cliExecute("garden pick");
        },
      },
      {
        name: "Pajamas",
        completed: () => args.ascend || getCampground()[$item`clockwork maid`.name] === 1,
        acquire: [
          { item: $item`clockwork maid`, price: 7 * get("valueOfAdventure") },
          { item: $item`burning cape` },
        ],
        do: () => use($item`clockwork maid`),
        outfit: () => ({
          familiar:
            $familiars`Trick-or-Treating Tot, Left-Hand Man, Disembodied Hand, Grey Goose`.find(
              (fam) => have(fam)
            ),
          modifier: `adventures${args.pvp ? ", 0.3 fites" : ""}`,
        }),
      },
      {
        name: "Summon Soap Knife",
        completed: () => !have($skill`That's Not a Knife`) || get("_discoKnife"),
        prepare: () => putCloset(itemAmount($item`soap knife`), $item`soap knife`),
        do: () => useSkill($skill`That's Not a Knife`),
        post: () => takeCloset(closetAmount($item`soap knife`), $item`soap knife`),
      },
      {
        name: "Tip the Author", //disabled by default - must manually discover and enable the flag
        ready: () => args.tip,
        completed: () => !have($item`soap knife`),
        do: () => cliExecute(`csend * soap knife to sketchysolid || Thanks for the script!`),
      },
      {
        name: "Alert-No Nightcap",
        ready: () => !doneAdventuring(),
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
}
