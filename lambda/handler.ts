import { runIngest } from "../src/bin/ingestAll";

export const handler = async () => {
  const res = await runIngest();
  const allOk = res.results.every(r => r.ok);

  return {
    statusCode: allOk ? 200 : 500,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: allOk, ...res }),
  };
};
