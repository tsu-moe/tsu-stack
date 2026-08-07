import { execa } from "execa";

import { type CommandRunner } from "./types";

export const commandRunner: CommandRunner = {
  async capture(command, args, cwd) {
    const result = await execa(command, args, { cwd, stderr: "inherit" });
    return result.stdout;
  },
  async run(command, args, cwd) {
    await execa(command, args, { cwd, stdio: "inherit" });
  },
  async succeeds(command, args, cwd) {
    const result = await execa(command, args, { cwd, reject: false, stdio: "ignore" });
    return result.exitCode === 0;
  }
};
