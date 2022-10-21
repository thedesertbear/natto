import { Quest as BaseQuest, Task as BaseTask, Limit } from "grimoire-kolmafia";
import { fullnessLimit, inebrietyLimit, Item, itemAmount, myClass, myDaycount, myFamiliar, myFullness, myInebriety, mySpleenUse, spleenLimit } from "kolmafia";
import { $class, $familiar, $item, get, have, set } from "libram";

export type Task = BaseTask & {
	tracking?: string;
	limit?: Limit;
};
export type Quest = BaseQuest<Task>;

export enum Leg {
	Aftercore = 0,
	GreyYou = 1,
	last = 1,
}

export function getCurrentLeg(): number {
	if (myClass() === $class`Grey Goo` || myDaycount() === 1) return Leg.GreyYou;
	return Leg.Aftercore;
}

export function setChoice(choice: number, setting: number): void {
	set(`choiceAdventure${choice}`, setting);
}

export function haveAll(its: Item[]): boolean {
	for(const it of its)
		if(!have(it))
			return false;
	return true;
}

export function canEat(): boolean {
	return (
		myFullness() < fullnessLimit() ||
		mySpleenUse() < spleenLimit() ||
		myInebriety() < inebrietyLimit() ||
		get("currentMojoFilters") < 3
	);
}

export function stooperDrunk(): boolean {
	return (
		myInebriety() > inebrietyLimit() ||
		(myInebriety() === inebrietyLimit() && myFamiliar() === $familiar`Stooper`)
	);
}

export function backstageItemsDone(): boolean {
	return (
		(have($item`giant marshmallow`)?1:0)
		+ (have($item`beer-scented teddy bear`)?1:0)
		+ itemAmount($item`gin-soaked blotter paper`)
		   >= 2 &&
		(have($item`booze-soaked cherry`)?1:0)
		+ (have($item`comfy pillow`)?1:0)
		+ itemAmount($item`sponge cake`) >= 2
	);
}
