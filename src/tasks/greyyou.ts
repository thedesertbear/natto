import { CombatStrategy, step } from "grimoire-kolmafia";
import {
	buyUsingStorage,
	canEat,
	cliExecute,
	equip,
	getCampground,
	getDwelling,
	hippyStoneBroken,
	Item,
	maximize,
	myAdventures,
	myClass,
	myLevel,
	myStorageMeat,
	myTurncount,
	pvpAttacksLeft,
	retrieveItem,
	storageAmount,
	use,
	useFamiliar,
	visitUrl,
} from "kolmafia";
import {
	$class,
	$effect,
	$familiar,
	$item,
	$items,
	$location,
	$skill,
	$slot,
	ensureEffect,
	get,
	have,
	Macro,
} from "libram";
import { args } from "../main";
import { getCurrentLeg, haveAll, Leg, Quest, stooperDrunk } from "./structure";

const myPulls = $items`lucky gold ring, Mr. Cheeng's spectacles`;

export const GyouQuest: Quest = {
	name: "Grey You",
	completed: () => getCurrentLeg() > Leg.GreyYou,
	tasks: [
		{	name: "Farming Pulls",
			completed: () => haveAll(myPulls),
			do: () => myPulls.forEach((it: Item) => {
				if(storageAmount(it) !== 0 && !have(it))
					cliExecute(`pull ${it}`);
			}),
		},
		{	name: "LGR Seed",
			completed: () => get("_stenchAirportToday") || !have($item`lucky gold ring`),
			do: (): void => {
				if(!have($item`one-day ticket to Dinseylandfill`)) {
					if(storageAmount($item`one-day ticket to Dinseylandfill`) === 0)
						buyUsingStorage($item`one-day ticket to Dinseylandfill`);
					cliExecute(`pull ${$item`one-day ticket to Dinseylandfill`}`);
				}
				use($item`one-day ticket to Dinseylandfill`);
			},
		},
		{	name: "Break Stone",
			completed: () => hippyStoneBroken() || !args.pvp,
			do: (): void => {
			  visitUrl("peevpee.php?action=smashstone&pwd&confirm=on", true);
			  visitUrl("peevpee.php?place=fight");
			},
		},
		{	name: "Run",
			completed: () =>
				step("questL13Final") !== -1 && get("gooseReprocessed").split(",").length === 73,
			do: () => cliExecute("loopgyou delaytower tune=wombat chargegoose=20"),
			tracking: "Run",
		},
		{	name: "In-Run Farm Initial",
			completed: () => myTurncount() >= 1000,
			do: $location`Barf Mountain`,
			prepare: (): void => {
				if (have($item`How to Avoid Scams`))
					ensureEffect($effect`How to Scam Tourists`);
				retrieveItem($item`seal tooth`);
			},
			outfit: {
				familiar: $familiar`Hobo Monkey`,
				modifier: "2.5 meat, 0.6 items, 175 bonus June Cleaver, 750 bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, 250 bonus mafia thumb ring",
			},
			combat: new CombatStrategy().macro(
				new Macro()
				.trySkill($skill`Bowl Straight Up`)
				.trySkill($skill`Sing Along`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.skill($skill`Double Nanovision`)
				.repeat()
			),
			limit: { tries: 550 },
			tracking: "GooFarming",
		},
		{	name: "Pull All",
			completed: () => myStorageMeat() === 0 && storageAmount($item`old sweatpants`) === 0, // arbitrary item
			do: (): void => {
				cliExecute("pull all");
				cliExecute("refresh all");
			},
			tracking: "Run",
		},
		{	name: "Tower",
			completed: () => step("questL13Final") > 11,
			do: () => cliExecute("loopgyou delaytower chargegoose=20"),
			tracking: "Run",
		},
		{	name: "In-Run Farm Final",
			completed: () => myAdventures() <= 40 || myClass() !== $class`Grey Goo`,
			do: $location`Barf Mountain`,
			prepare: (): void => {
				if (have($item`How to Avoid Scams`))
					ensureEffect($effect`How to Scam Tourists`);
				retrieveItem($item`seal tooth`);
			},
			outfit: {
				familiar: $familiar`Hobo Monkey`,
				modifier: "2.5 meat, 0.6 items, 175 bonus June Cleaver, 750 bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, 250 bonus mafia thumb ring",
			},
			combat: new CombatStrategy().macro(
				new Macro()
				.trySkill($skill`Bowl Straight Up`)
				.trySkill($skill`Sing Along`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.tryItem($item`seal tooth`)
				.skill($skill`Double Nanovision`)
				.repeat()
			),
			limit: { tries: 150 },
			tracking: "GooFarming",
		},
		{	name: "Free King",
			completed: () => myClass() !== $class`Grey Goo`,
			prepare: (): void => {
				retrieveItem(3, $item`teacher's pen`);
				cliExecute("mcd 1");
				useFamiliar($familiar`Grey Goose`);
				equip($item`giant yellow hat`);
				equip($item`yule hatchet`);
				equip($item`battered hubcap`);
				equip($item`discarded swimming trunks`);
				equip($slot`acc1`, $item`teacher's pen`);
				equip($slot`acc2`, $item`teacher's pen`);
				equip($slot`acc3`, $item`teacher's pen`);
				equip($item`grey down vest`);
				maximize("muscle experience, 5 muscle experience percent, 10 familiar experience, -10 ml 1 min", false);
			},
			do: () => cliExecute("loopgyou class=1; refresh all"),
		},
		{	name: "Buff Up",
			completed: () => false,
			do: (): void => {
				false;
			},
		},
		{	name: "Strange Leaflet",
			completed: () => get("leafletCompleted"),
			do: () => cliExecute("leaflet"),
		},
		{	name: "Frobozz",
			completed: () => getDwelling() !== $item`Frobozz Real-Estate Company Instant House (TM)`,
			do: () => use($item`Frobozz Real-Estate Company Instant House (TM)`),
		},
		{	name: "Bonerdagon Chest",
			completed: () => !have($item`chest of the Bonerdagon`),
			do: () => use($item`chest of the Bonerdagon`),
		},
		{	name: "Gators",
			completed: () => myClass() !== $class`Grey Goo` && myLevel() >= 13,
			do: () => $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`,
			outfit: {
				familiar: $familiar`Grey Goose`,
				modifier: "0.125 muscle, muscle experience, 5 muscle experience percent, 10 familiar experience, -10 ml 1 min",
			},
			combat: new CombatStrategy().macro(
				new Macro()
				.trySkill($skill`Curse of Weaksauce`)
				.externalIf($familiar`Grey Goose`.experience >= 400, "skill convert matter to protein; ")
				.attack()
				.repeat()
			),
			limit: { tries: 30 },
		},
		{	name: "Breakfast",
			completed: () => get("breakfastCompleted"),
			do: () => cliExecute("breakfast"),
		},
		{	name: "Garbo",
			completed: () => (myAdventures() === 0 && !canEat()) || stooperDrunk(),
			do: () => cliExecute("garbo ascend"),
			tracking: "Garbo",
		},
		{	name: "PvP",
			completed: () => pvpAttacksLeft() === 0 || !hippyStoneBroken(),
			do: (): void => {
				cliExecute("unequip");
				cliExecute("UberPvPOptimizer");
				cliExecute("swagger");
			},
		},
		{	name: "Nightcap",
			completed: () => stooperDrunk(),
			do: () => cliExecute("CONSUME NIGHTCAP"),
		},
		{	name: "Pajamas",
			completed: () => getCampground()[$item`clockwork maid`.name] === 1,
			do: (): void => {
				if(args.pvp)
					maximize("adventures, 0.3 fites", false);
				else
					maximize("adventures", false);
				use($item`clockwork maid`);
			},
		},
	],
};
