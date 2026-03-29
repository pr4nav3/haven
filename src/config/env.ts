import dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "production" ? ".env/.env.prod" : ".env/.env.dev";

dotenv.config({ path: envFile });


function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  SUPABASE_URL: req('SUPABASE_URL'),
  SUPABASE_SERVICE_KEY: req('SUPABASE_SERVICE_KEY'),
  
  OPENAI_API_KEY: req('OPENAI_API_KEY'),
  
  SKIP_EMBEDDINGS: process.env.SKIP_EMBEDDINGS ?? "0",
  //W511_API_KEY: req('W511_API_KEY'),

};
