import { agents, resourceRegistry } from "../lib/catalog/resources";

const urls = [
  ...Object.values(resourceRegistry).flatMap((resource) => [resource.url, resource.setupUrl]),
  ...Object.values(agents).flatMap((agent) => "url" in agent ? [agent.url] : []),
];
const pending = [...new Set(urls.filter((url): url is string => Boolean(url)))];
const failures: string[] = [];
const total = pending.length;

async function check(url: string) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(25_000),
      headers: { "User-Agent": "SkillWhisk source verification" },
    });
    await response.body?.cancel();
    console.log(`${response.status} ${url}`);
    if (!response.ok) failures.push(url);
  } catch (error) {
    console.error(url, error instanceof Error ? error.message : error);
    failures.push(url);
  }
}

await Promise.all(Array.from({ length: 6 }, async () => {
  let url = pending.pop();
  while (url) {
    await check(url);
    url = pending.pop();
  }
}));

console.log(`Verified ${total - failures.length}/${total} source and setup URLs.`);
if (failures.length) process.exitCode = 1;
