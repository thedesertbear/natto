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
		{
			name: "Breakfast",
			completed: () => get("breakfastCompleted"),
			do: () => cliExecute("breakfast"),
		},
		{
			name: "Garbo",
			completed: () => (myAdventures() === 0 && !canEat()) || stooperDrunk(),
			do: () => cliExecute("garbo ascend"),
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
