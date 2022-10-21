import { CombatStrategy, OutfitSpec } from "grimoire-kolmafia";
import {
	canEat,
	cliExecute,
	hippyStoneBroken,
	itemAmount,
	myAdventures,
	nowToInt,
	putCloset,
	pvpAttacksLeft,
	retrieveItem,
	runChoice,
	visitUrl,
} from "kolmafia";
import {
	$class,
	$familiar,
	$item,
	$location,
	$skill,
	ascend,
	get,
	have,
	Lifestyle,
	Macro,
	Paths,
	set,
} from "libram";
import { getCurrentLeg, Leg, Quest, setChoice, stooperDrunk } from "./structure";

export const AftercoreQuest: Quest = {
	name: "Aftercore",
	completed: () => getCurrentLeg() > Leg.Aftercore,
	tasks: [
		{	name: "Breakfast",
			completed: () => get("breakfastCompleted"),
			do: () => cliExecute("breakfast"),
		},
		{	name: "Set Choices",
		 	completed: () => get("_goorboRunStart", undefined) !== undefined,
			do: (): void => {
				if(get("choiceAdventure692") !== 7) //dd door: PYEC
					setChoice(692, 3); //dd door: lockpicks
				setChoice(689, 1); //dd final chest : open
				setChoice(690, 2); //dd chest 1: boring door
				setChoice(691, 2); //dd chest 2: boring door
				setChoice(693, 2); //dd trap: skip
				set("_goorboRunStart", nowToInt());
			}
		},
		{	name: "Daily Dungeon",
			completed: () => get("dailyDungeonDone"),
		 	prepare: (): void => {
				if(have($item`daily dungeon malware`) && get("_dailyDungeonMalwareUsed"))
					putCloset($item`daily dungeon malware`);
				if(!get("_dailyDungeonMalwareUsed") && itemAmount($item`fat loot token`) < 3)
					retrieveItem(1, $item`daily dungeon malware`);
			},
			do: $location`The Daily Dungeon`,
		 	acquire: $items`eleven-foot pole,Pick-O-Matic lockpicks,ring of Detect Boring Doors`,
			outfit: (): OutfitSpec => { return {
		 		familiar: $familiar`Grey Goose`,
		 		...have($item`The Jokester's gun`) && !get("_firedJokestersGun") ? { weapon: $item`The Jokester's gun` } : {},
		 		...get("_lastDailyDungeonRoom") % 5 === 4 ? { acc1: $item`ring of Detect Boring Doors` } : {},
				modifier: "750 bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, 250 bonus mafia thumb ring, 250 bonus carnivorous potted plant, 100 familiar experience",
			}},
			combat: new CombatStrategy().macro(
				new Macro()
				.tryItem($item`daily dungeon malware`)
				.tryItem($item`porquoise-handled sixgun`)
				.trySkill($skill`Fire the Jokester's Gun`)
				.attack()
				.repeat()
			),
			limit: { tries: 8 }, //+3 for unaccounted for wanderers, etc.
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
		{	name: "Ascend",
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
