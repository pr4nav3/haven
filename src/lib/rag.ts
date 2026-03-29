import OpenAI from 'openai';
import { supabase } from './supabase';
import { env } from '../config/env';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

type RagDocInsert = {
  doc_id?: string;
  source: string;
  url?: string | null;
  published_at?: string | null;
  last_seen_at?: string | null;
  jurisdiction?: string | null;
  hazard_type?: string | null;
  lat?: number | null;
  lon?: number | null;
  summary: string;  
  raw: any;
};

export async function upsertRagWithEmbedding(doc: RagDocInsert) {
  // Check if this doc_id already exists (skip duplicate embedding)
  if (doc.doc_id) {
    const { data } = await supabase.from('rag_docs').select('summary').eq('doc_id', doc.doc_id).maybeSingle();
    
    if (data) {
      // If the summary hasn’t changed → just bump last_seen_at
      if (data.summary === doc.summary) {
        const { error: updErr } = await supabase
          .from('rag_docs')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('doc_id', doc.doc_id);

        if (updErr) throw updErr;
        return;
      }
      // else → summary changed → fall through and re-embed
    }
  }
  const embedding = await embed(doc.summary);   // <--- only runs if new
  const payload = { ...doc, embedding };
  const { error } = await supabase.from('rag_docs').insert([payload]);
  if (error) throw error;
}


// Optional: prune rag_docs (time + count)
export async function pruneRag(days = 90, keepLatest = 40000) {
  // Count cap: fetch rows after top N and delete
  const { data, error: listErr } = await supabase
    .from('rag_docs')
    .select('doc_id, published_at')
    .order('published_at', { ascending: false })
    .range(keepLatest, keepLatest + 100000);
  if (listErr) throw listErr;

  if (data && data.length) {
    const ids = data.map((d) => d.doc_id);
    const { error: delErr } = await supabase.from('rag_docs').delete().in('doc_id', ids as string[]);
    if (delErr) throw delErr;
  }

  // Time window prune
  const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
  const { error: timeErr } = await supabase
    .from('rag_docs')
    .delete()
    .lt('published_at', cutoff);
  if (timeErr) throw timeErr;
}
