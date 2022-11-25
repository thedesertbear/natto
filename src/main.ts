import { Item, print, toClass } from "kolmafia";
import { Args, getTasks } from "grimoire-kolmafia";
import { AftercoreQuest } from "./tasks/aftercore";
import { GyouQuest } from "./tasks/greyyou";
import { ProfitTrackingEngine } from "./engine/engine";
import { checkPerms, checkReqs } from "./tasks/sim";
import { permTiers, printPermPlan } from "./tasks/perm";
import { $class, $item } from "libram";
import { toMoonSign } from "./tasks/utils";

const version = "0.4.10";

export const args = Args.create(
  "goorbo",
  `Written by frazazel (ign: SketchySolid #422389). This is a full-day script for half-glooping. It aims to be a single-press script that will take you through your Aftercore and Grey You legs, collecting fat loot tokens, getting a Steel Liver, and leveling up to level 13 before running garbo. It chooses a classe for you to learn guild skills, and to perm learned skills upon ascension.`,
  {
    version: Args.flag({
      help: "Output script version number and exit.",
    }),
    actions: Args.number({
      help: "Maximum number of actions to perform, if given. Can be used to execute just a few steps at a time.",
    }),
    abort: Args.string({
      help: "If given, abort during the prepare() step for the task with matching name.",
    }),
    sim: Args.flag({
      help: "If set, see the recommended items and skills, then return without taking any actions.",
      default: false,
    }),

    simperms: Args.flag({
      help: "If set, see your current and available perms, as well as the plan for this run, then return without taking any actions.",
      default: false,
    }),
    permtier: Args.number({
      help: `Target perming all skills in the given tier and all better tiers. To disable, choose 0 to only perm non-gnome, non-guild skills that you may have learned, or -1 for not perming any skills under any circumstances \n ${permTiers.join(
        "\n "
      )}`,
      default: 6,
    }),

    pvp: Args.flag({ help: "If true, break hippy stone and do pvp.", default: false }),
    astralpet: Args.custom(
      {
        help: "Choose the astral pet you want to buy in valhalla. Recommended: one of [astral pet sweater, astral mask, astral belt, none]",
        default: $item`astral pet sweater`,
      },
      Item.get,
      "ITEM"
    ),
    moonsign: Args.custom(
      {
        help: "Choose the moonsign you want to ascend into: [mongoose, wallaby, vole, platypus, opossum, marmot, wombat, blender, packrat]",
        default: toMoonSign("vole"),
      },
      toMoonSign,
      "MOONSIGN"
    ),
    defaultclass: Args.custom(
      {
        help: "Choose your default class, if goorbo doesn't have any other goals this run",
        default: $class`Seal Clubber`,
      },
      toClass,
      "CLASS"
    ),
    class: Args.custom(
      {
        help: "Choose the class to choose at prism break. If set, will override any class that might be desired for skill-perming purposes",
        default: $class`none`,
      },
      toClass,
      "CLASS"
    ),
    clan: Args.string({
      help: `Your VIP Clan. Goorbo will whitelist into it at the beginning of your day. Requires clan whitelist.`,
    }),
    targetlevel: Args.number({
      help: `What level to target via adventuring in Uncle Gator's after breaking the prism`,
      default: 13,
    }),

    gyouscript: Args.string({
      help: "The command that will do your Grey You run for you. Include any arguments desired.",
      default: "loopgyou delaytower tune=wombat chargegoose=20",
    }),
    garbo: Args.string({
      help: "The command that will be used to diet and use all your adventures after reaching level 13 in Day 1 aftercore.",
      default: "garbo",
    }),
    garboascend: Args.string({
      help: `The command that will be used to diet and use all your adventures in Day 2 aftercore.`,
      default: "garbo ascend",
    }),
    voatest: Args.boolean({
      help: `If set, will run your d2 garbo turns just like normal, but will separately track the last 100 turns, to give you an estimate of what your real-world valueOfAdventure is. Divide your total "VoA Test" profit by 100 for your VoA estimate. Note that it might show > 100 adventures spent, if garbo equipped the mafia thumb ring, June cleaver, or other adventure gaining equipment. CAUTION: This flag may not be compatible with custom settings of garboascend`,
      default: true,
    }),

    tip: Args.flag({
      help: "Send all your soap knives to the author. Thanks!",
      default: false,
    }),
  }
);

export function main(command?: string): void {
  Args.fill(args, command);
  if (args.help) {
    Args.showHelp(args);
    return;
  }
  if (args.simperms) {
    checkPerms();
    printPermPlan();
    return;
  }
  if (args.sim) {
    checkReqs();
    printPermPlan();
    return;
  }
  if (args.version) {
    print(`goorbo v${version}`);
    return;
  }

  const tasks = getTasks([AftercoreQuest(), GyouQuest()]);

  // Abort during the prepare() step of the specified task
  if (args.abort) {
    const to_abort = tasks.find((task) => task.name === args.abort);
    if (!to_abort) throw `Unable to identify task ${args.abort}`;
    to_abort.prepare = (): void => {
      throw `Abort requested`;
    };
  }

  const engine = new ProfitTrackingEngine(tasks, "loop_profit_tracker");
  try {
    engine.run(args.actions);

    // Print the next task that will be executed, if it exists
    const task = engine.getNextTask();
    if (task) {
      print(`Next: ${task.name}`, "blue");
    }

    // If the engine ran to completion, all tasks should be complete.
    // Print any tasks that are not complete.
    if (args.actions === undefined) {
      const uncompletedTasks = engine.tasks.filter((t) => !t.completed());
      if (uncompletedTasks.length > 0) {
        print("Uncompleted Tasks:");
        for (const t of uncompletedTasks) {
          print(t.name);
        }
      }
    }
  } finally {
    engine.destruct();
  }
}
