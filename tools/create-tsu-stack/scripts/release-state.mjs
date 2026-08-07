export function parsePorcelainV1Z(output) {
  const fields = output.split("\0");
  const paths = [];

  for (let index = 0; index < fields.length; index += 1) {
    const entry = fields[index];
    if (!entry) continue;
    if (entry.length < 4 || entry[2] !== " ") {
      throw new Error(`Unexpected git status entry: ${JSON.stringify(entry)}.`);
    }

    const status = entry.slice(0, 2);
    paths.push(entry.slice(3));

    if (status.includes("R") || status.includes("C")) {
      const originalPath = fields[index + 1];
      if (!originalPath) throw new Error("Git status omitted the original rename/copy path.");
      paths.push(originalPath);
      index += 1;
    }
  }

  return paths;
}
