import {
	canEat,
	cliExecute,
	hippyStoneBroken,
	myAdventures,
	pvpAttacksLeft,
	runChoice,
	visitUrl,
} from "kolmafia";
import {
	$class,
	$item,
	ascend,
	get,
	Lifestyle,
	Paths,
} from "libram";
import { getCurrentLeg, Leg, Quest, stooperDrunk } from "./structure";

export const AftercoreQuest: Quest = {
	name: "Aftercore",
	completed: () => getCurrentLeg() > Leg.Aftercore,
	tasks: [
		{	name: "Breakfast",
			completed: () => get("breakfastCompleted"),
			do: () => cliExecute("breakfast"),
		},
		{	name: "Daily Dungeon",
			completed: () => get("dailyDungeonDone"),
		 	prepare: (): void => {
				if(itemAmount($item`daily dungeon malware`) > 0)
					putCloset($item`daily dungeon malware`);
				if(!get("_dailyDungeonMalwareUsed") && itemAmount($item`fat loot token`) < 3)
					retrieveItem(1, $item`daily dungeon malware`);
				retrieveItem(1, $item`eleven-foot pole`);
				retrieveItem(1, $item`pick-o-matic lockpicks`);
				retrieveItem(1, $item`ring of detect boring doors`);
			}
			do: $location`The Daily Dungeon`,
			outfit: {
		 		familiar: $familiar`Grey Goose`,
		 		weapon: (have($item`the Jokester's Gun`) && !get("_firedJokestersGun")) ? $item`the Jokester's Gun` : undefined,
		 		acc1: (get("_lastDailyDungeonRoom") % 5 === 4) ? $item`ring of detect boring doors` : undefined,
				modifier: "750 bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, 250 bonus mafia thumb ring, 250 bonus carnivorous potted plant, 100 familiar experience",
			},
			combat: new CombatStrategy().macro(
				new Macro()
				.tryItem($item`daily dungeon malware`)
				.tryItem($item`porquoise-handled sixgun`)
				.trySkill($skill`fire the Jokester's Gun`)
				.attack()
				.repeat()
			),
			limit: { tries: 18 }; //+3 for unaccounted for wanderers, etc.
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
					// eslint-disable-next-line libram/verify-constants
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
