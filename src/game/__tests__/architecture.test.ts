import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
const srcRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}
describe("architecture boundaries", () => {
  it("keeps application and game layers independent of React presentation", () => {
    const protectedRoots = [join(srcRoot, "application"), join(srcRoot, "game")];
    const violations = protectedRoots.flatMap(sourceFiles).flatMap((file) => {
      const text = readFileSync(file, "utf8");
      const importsPresentation = /from\s+["'][^"']*components(?:\/|["'])/.test(text);
      return importsPresentation ? [relative(srcRoot, file)] : [];
    });
    expect(violations).toEqual([]);
  });
});
