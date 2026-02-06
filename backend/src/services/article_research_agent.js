import { formatNzSqlite } from "../util/time.js";
import { getArticleById } from "./articles.js";
import { upsertArticleResearch } from "./article_research.js";
import { chatCompletion } from "./text_generation.js";
import { extractText, fetchUrl, searchWeb } from "./research_tools.js";

const running = new Set();

const MODE_LIMITS = {
  quick: { searchResults: 5, fetchPages: 3, timeoutMs: 20000, ttlHours: 12 },
  standard: { searchResults: 6, fetchPages: 4, timeoutMs: 30000, ttlHours: 24 },
  deep: { searchResults: 8, fetchPages: 5, timeoutMs: 40000, ttlHours: 24 * 7 },
};

function stripHtml(html) {
  return (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickMode(mode) {
  if (mode && MODE_LIMITS[mode]) return MODE_LIMITS[mode];
  return MODE_LIMITS.standard;
}

async function buildQuery(article) {
  const title = String(article?.title || "").trim();
  const plain = stripHtml(article?.content_html || "");
  const snippet = plain.split(/\s+/).slice(0, 48).join(" ");
  const fallback = `${title} ${snippet}`.trim();

  const systemPrompt =
    "You craft short, precise web search queries. " +
    "Return strict JSON only.";
  const userPrompt =
    "Summarize the article into one concise search phrase. " +
    "Return JSON with key searchQuery. " +
    "Rules:\n" +
    "- 6 to 12 words.\n" +
    "- No quotes or punctuation.\n" +
    "- Include key entities and topic.\n\n" +
    `Title: ${title || "Untitled"}\n` +
    `Content: ${plain.slice(0, 1800)}\n`;

  try {
    const raw = await chatCompletion(userPrompt, systemPrompt);
    const parsed = parseJsonFromText(raw);
    const searchQuery = String(parsed?.searchQuery || "").trim();
    return searchQuery || fallback;
  } catch {
    return fallback;
  }
}

function computeExpiresAt(ttlHours) {
  const date = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  return formatNzSqlite(date);
}

function parseJsonFromText(raw) {
  const text = raw || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("LLM output missing JSON");
  return JSON.parse(match[0]);
}

function normalizeSources(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      title: String(item?.title || "").trim(),
      url: String(item?.url || "").trim(),
      snippet: String(item?.snippet || "").trim(),
      publisher: String(item?.publisher || "").trim(),
      publishedAt: String(item?.publishedAt || "").trim(),
    }))
    .filter((item) => item.url);
}

function normalizeQuestions(list) {
  if (!Array.isArray(list)) return [];
  return list.map((q) => String(q || "").trim()).filter(Boolean);
}

function addInlineCitations(summaryMd, sources) {
  if (!summaryMd) return summaryMd;
  if (!Array.isArray(sources) || sources.length === 0) return summaryMd;
  const urlRegex = /https?:\/\/\S+/i;
  const bullets = summaryMd
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\s*-\s*/, "").trim());
  if (!bullets.length) return summaryMd;
  let idx = 0;
  const cited = bullets.map((bullet) => {
    if (urlRegex.test(bullet)) return bullet;
    const source = sources[idx % sources.length];
    idx += 1;
    const url = source?.url || "";
    return url ? `${bullet} (${url})` : bullet;
  });
  return cited.map((line) => `- ${line}`).join("\n");
}

function buildSummaryPrompt(article, sources, sourceTexts) {
  const articleTitle = article?.title || "Untitled";
  const articlePlain = stripHtml(article?.content_html || "").slice(0, 2000);
  const sourceBlock = sources
    .map((s, idx) => {
      const text = sourceTexts[idx] || "";
      return `Source ${idx + 1}:
Title: ${s.title}
URL: ${s.url}
Snippet: ${s.snippet}
Text: ${text.slice(0, 1800)}`;
    })
    .join("\n\n");

  return (
    "You are a research assistant summarizing external info for a reader.\n" +
    "Return strict JSON with keys: summaryMd (bullet list), sources (array), questions (array).\n" +
    "Rules:\n" +
    "- Keep summary to 3-8 bullet points.\n" +
    "- Cite sources by including the URL in each bullet when possible.\n" +
    "- Use only the provided sources; do not invent URLs.\n" +
    "- If evidence is weak, include questions to verify.\n\n" +
    `Article title: ${articleTitle}\n` +
    `Article content: ${articlePlain}\n\n` +
    `Sources:\n${sourceBlock}\n`
  );
}

async function runResearchJob(articleId, { mode }) {
  const limits = pickMode(mode);
  const article = await getArticleById(articleId);
  if (!article) {
    throw new Error("Article not found");
  }

  const query = await buildQuery(article);
  const results = await searchWeb({ query, limit: limits.searchResults });
  // Debug: log search results for troubleshooting.
  // eslint-disable-next-line no-console
  // console.log("Research search results", {
  //   articleId,
  //   query,
  //   count: results.length,
  //   results,
  // });
  if (!results.length) {
    const expiresAt = computeExpiresAt(limits.ttlHours);
    await upsertArticleResearch(articleId, {
      status: "ready",
      summaryMd: "- No result found!",
      sourcesJson: "[]",
      questionsJson: "[]",
      errorMessage: null,
      expiresAt,
    });
    return;
  }
  const sources = results.filter((r) => r.url).slice(0, limits.fetchPages);

  const sourceTexts = [];
  for (const source of sources) {
    try {
      const html = await fetchUrl({
        url: source.url,
        timeoutMs: 8000,
        maxBytes: 1_500_000,
      });
      const text = extractText(html);
      sourceTexts.push(text);
    } catch {
      sourceTexts.push("");
    }
  }

  const systemPrompt =
    "You produce compact, cited summaries for a reader. " +
    "Always follow the JSON schema exactly and avoid extra text.";
  const userPrompt = buildSummaryPrompt(article, sources, sourceTexts);
  const raw = await chatCompletion(userPrompt, systemPrompt);
  const parsed = parseJsonFromText(raw);
  let summaryMd = String(parsed?.summaryMd || "").trim();
  const questions = normalizeQuestions(parsed?.questions);
  const parsedSources = normalizeSources(parsed?.sources || []);
  const finalSources = parsedSources.length
    ? parsedSources
    : normalizeSources(sources);
  summaryMd = addInlineCitations(summaryMd, finalSources);
  const expiresAt = computeExpiresAt(limits.ttlHours);

  await upsertArticleResearch(articleId, {
    status: "ready",
    summaryMd,
    sourcesJson: JSON.stringify(finalSources),
    questionsJson: JSON.stringify(questions),
    errorMessage: null,
    expiresAt,
  });
}

export async function startArticleResearch(articleId, options = {}) {
  if (!articleId) return null;
  if (running.has(articleId)) {
    return await upsertArticleResearch(articleId, { status: "running" });
  }
  running.add(articleId);

  await upsertArticleResearch(articleId, {
    status: "queued",
    errorMessage: null,
  });

  setImmediate(async () => {
    try {
      await upsertArticleResearch(articleId, {
        status: "running",
        errorMessage: null,
      });
      const limits = pickMode(options?.mode);
      await Promise.race([
        runResearchJob(articleId, options),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Research timed out")),
            limits.timeoutMs
          )
        ),
      ]);
    } catch (e) {
      await upsertArticleResearch(articleId, {
        status: "failed",
        errorMessage: e?.message || "Research failed",
      });
    } finally {
      running.delete(articleId);
    }
  });

  return await upsertArticleResearch(articleId, { status: "queued" });
}
