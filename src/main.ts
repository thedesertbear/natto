import { getPermedSkills, print, printHtml } from "kolmafia";
import { Args, getTasks } from "grimoire-kolmafia";
import { AftercoreQuest } from "./tasks/aftercore";
import { GyouQuest } from "./tasks/greyyou";
import { ProfitTrackingEngine } from "./engine/engine";
import { $class, have } from "libram";
import { checkReqs } from "./tasks/sim";
import { defaultPermList, printPermPlan, targetClass, targetPerms } from "./tasks/perm";

export const args = Args.create(
  "goorbo",
  "A script for farming barf mountain while half-glooping.",
  {
    actions: Args.number({
      help: "Maximum number of actions to perform, if given. Can be used to execute just a few steps at a time.",
    }),
    pvp: Args.flag({ help: "If true, break hippy stone and do pvp.", default: false }),
    simperms: Args.flag({
      help: "If set, see your current and available perms, as well as the plan for this run, then return without taking any actions.",
      default: false,
    }),
    sim: Args.flag({
      help: "If set, see the recommended items and skills, then return without taking any actions.",
      default: false,
    }),
    abort: Args.string({
      help: "If given, abort during the prepare() step for the task with matching name.",
    }),
  }
);

function spanWrap(text: string, color: string): string {
  return `<span color="${color}">${text}</span>`;
}

export function main(command?: string): void {
  Args.fill(args, command);
  if (args.help) {
    Args.showHelp(args);
    return;
  }
  if (args.simperms) {
    const nPerms = targetPerms(false);
    const nClass = targetClass(false);
    printHtml("~~ Default Perm List ~~", false);
    printHtml(
      `Legend: <span color="black">[permed]</span>, <span color="fuchsia">[targeted/known]</span>, <span color="blue">[targeted/unknown]</span>, <span color="purple">[known]</span>, <span color="navy">[class skills]</span>, <span color="gray">[other]</span>`,
      false
    );
    let count = 0;
    defaultPermList.forEach((sks) =>
      printHtml(
        `~ Tier ${count++} ~<br> ${sks
          .map((sk) =>
            sk.name in getPermedSkills()
              ? spanWrap(sk.name, "black")
              : nPerms.includes(sk) && have(sk)
              ? spanWrap(sk.name, "fuchsia")
              : nPerms.includes(sk)
              ? spanWrap(sk.name, "blue")
              : have(sk)
              ? spanWrap(sk.name, "purple")
              : nClass && nClass === sk.class && nClass !== $class`none`
              ? spanWrap(sk.name, "navy")
              : spanWrap(sk.name, "gray")
          )
          .join(", ")}`,
        false
      )
    );
    printPermPlan();
    return;
  }
  if (args.sim) {
    checkReqs();
    printPermPlan();
    return;
  }

  const tasks = getTasks([AftercoreQuest, GyouQuest]);

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
