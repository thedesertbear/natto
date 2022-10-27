import { print, printHtml } from "kolmafia";
import { Args, getTasks } from "grimoire-kolmafia";
import { AftercoreQuest } from "./tasks/aftercore";
import { GyouQuest } from "./tasks/greyyou";
import { ProfitTrackingEngine } from "./engine/engine";
import { $class, get, have, permedSkills } from "libram";
import { defaultPermList, nextClass, nextPerms } from "./tasks/structure";

export const args = Args.create(
  "goorbo",
  "A script for farming barf mountain while half-glooping.",
  {
    actions: Args.number({
      help: "Maximum number of actions to perform, if given. Can be used to execute just a few steps at a time.",
    }),
    pvp: Args.flag({ help: "If true, break hippy stone and do pvp.", default: false }),
    simperms: Args.flag({
      help: "If true, see the current plan for perms this run and return.",
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
    const nPerms = nextPerms();
    const nClass = nextClass();
    if (nPerms.length > 0)
      print(
        `Perm plan: [${nPerms.join(", ")}] - Class: ${nClass}, Karma: ${get("bankedKarma")}`,
        "green"
      );
    else print(`Perm Plan: bank karma - Class: ${nClass}, Karma: ${get("bankedKarma")}`, "green");
    print("~~ Permed Skills ~~");
    permedSkills().forEach((ls, sk) => print(`${sk}: ${ls}`));
    print("~~ Default Perm List ~~", "green");
    printHtml(
      `~ Legend <span color="black">black: permed</span>, <span color="fuchsia">fuchsia: targeted/known</span>, <span color="blue">blue: targeted/unknown</span>, <span color="purple">purple: known</span>, <span color="navy">navy: class skills</span>, <span color="gray">gray: other</span>`
    );
    let tier = 0;
    defaultPermList.forEach((sks) =>
      printHtml(
        `Tier ${tier++}: ${sks
          .map((sk) => {
            if (sk.name in permedSkills()) return spanWrap(sk.name, "black");
            if (nPerms.includes(sk) && have(sk)) return spanWrap(sk.name, "fuchsia");
            if (nPerms.includes(sk)) return spanWrap(sk.name, "blue");
            if (have(sk)) return spanWrap(sk.name, "purple");
            if (nClass && nClass === sk.class && nClass !== $class`none`)
              return spanWrap(sk.name, "navy");
            return spanWrap(sk.name, "gray");
          })
          .join(", ")}`
      )
    );
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
