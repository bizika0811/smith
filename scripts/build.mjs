import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const DIST = path.join(ROOT, "dist");
const DATA_DIR = path.join(DIST, "data");
const TARGET_TERMS = [
  "iran",
  "iranian",
  "tehran",
  "persian gulf",
  "hormuz",
  "nuclear deal",
  "jcpoa",
  "islamic revolutionary guard",
  "irgc",
  "middle east",
  "ayatollah",
  "khamenei"
];

const US_TERMS = [
  "united states",
  "u.s.",
  " us ",
  "washington",
  "american",
  "trump",
  "white house",
  "pentagon",
  "state department"
];

const HARD_EXCLUDE_TERMS = [
  "world cup",
  "football",
  "soccer",
  "training session",
  "taiwan",
  "book awards",
  "photo gallery",
  "shakira"
];

const CONFLICT_TERMS = [
  "strike",
  "strikes",
  "air strike",
  "drone",
  "missile",
  "war",
  "attack",
  "attacks",
  "forces",
  "military",
  "hostilities",
  "ceasefire",
  "deal",
  "negotiation",
  "peace",
  "talks",
  "sanction",
  "sanctions",
  "hormuz",
  "shipping",
  "nuclear"
];

const sources = [
  {
    id: "npr-world",
    name: "NPR",
    group: "主流媒体",
    homepage: "https://www.npr.org/sections/world/",
    rss: "https://feeds.npr.org/1004/rss.xml",
    limit: 8
  },
  {
    id: "france24",
    name: "France 24",
    group: "主流媒体",
    homepage: "https://www.france24.com/en/",
    rss: "https://www.france24.com/en/rss",
    limit: 8
  },
  {
    id: "carnegie",
    name: "Carnegie Endowment",
    group: "智库/政策期刊",
    homepage: "https://carnegieendowment.org/",
    rss: "https://carnegieendowment.org/rss/allContent",
    limit: 8
  },
  {
    id: "crisis-group",
    name: "International Crisis Group",
    group: "智库/政策期刊",
    homepage: "https://www.crisisgroup.org/",
    rss: "https://www.crisisgroup.org/rss.xml",
    limit: 8
  },
  {
    id: "responsible-statecraft",
    name: "Responsible Statecraft",
    group: "智库/政策期刊",
    homepage: "https://responsiblestatecraft.org/",
    rss: "https://responsiblestatecraft.org/feed/",
    limit: 8
  },
  {
    id: "ap-direct",
    name: "AP News",
    group: "主流媒体",
    homepage: "https://apnews.com/",
    rss: "https://apnews.com/hub/middle-east/rss.xml",
    limit: 8
  }
];

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function stripTags(input = "") {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXml(input = "") {
  return input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function extractTag(block, tag) {
  const pattern = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(pattern);
  return match ? stripTags(decodeXml(match[1])) : "";
}

function extractLink(block) {
  const atomLink = block.match(/<link[^>]*href="([^"]+)"[^>]*\/?>/i);
  if (atomLink) return atomLink[1].trim();
  const xmlLink = block.match(/<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i);
  return xmlLink ? stripTags(decodeXml(xmlLink[1])) : "";
}

function parseItems(xml) {
  const itemBlocks = [
    ...(xml.match(/<item\b[\s\S]*?<\/item>/gi) || []),
    ...(xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [])
  ];

  return itemBlocks.map((block) => {
    const title = extractTag(block, "title");
    const description =
      extractTag(block, "description") ||
      extractTag(block, "summary") ||
      extractTag(block, "content");
    const link = extractLink(block);
    const published =
      extractTag(block, "pubDate") ||
      extractTag(block, "published") ||
      extractTag(block, "updated");

    return {
      title,
      description,
      link,
      published
    };
  });
}

function isRelevant(item) {
  const haystack = `${item.title} ${item.description}`.toLowerCase();
  if (HARD_EXCLUDE_TERMS.some((term) => haystack.includes(term))) {
    return false;
  }
  const matchesIran = TARGET_TERMS.some((term) => haystack.includes(term));
  const mentionsUS = US_TERMS.some((term) => haystack.includes(term));
  const mentionsConflict = CONFLICT_TERMS.some((term) => haystack.includes(term));
  return matchesIran && mentionsUS && mentionsConflict;
}

function scoreItem(item) {
  const haystack = `${item.title} ${item.description}`.toLowerCase();
  let score = 0;
  if (haystack.includes("iran")) score += 4;
  if (US_TERMS.some((term) => haystack.includes(term))) score += 3;
  if (haystack.includes("hormuz")) score += 2;
  if (haystack.includes("nuclear")) score += 2;
  if (haystack.includes("strike") || haystack.includes("sanction") || haystack.includes("talk")) score += 1;
  if (haystack.includes("world cup") || haystack.includes("football") || haystack.includes("taiwan")) score -= 8;
  return score;
}

function normalizeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function summarize(item) {
  const text = item.description || item.title;
  if (text.length <= 180) return text;
  return `${text.slice(0, 177).trim()}...`;
}

async function fetchSource(source) {
  try {
    const response = await fetch(source.rss, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodexMonitor/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xml = await response.text();
    const items = parseItems(xml)
      .filter((item) => item.title && item.link)
      .filter(isRelevant)
      .sort((a, b) => {
        const scoreDiff = scoreItem(b) - scoreItem(a);
        if (scoreDiff !== 0) return scoreDiff;
        const dateA = normalizeDate(a.published) || "";
        const dateB = normalizeDate(b.published) || "";
        return dateB.localeCompare(dateA);
      })
      .slice(0, source.limit)
      .map((item) => ({
        title: item.title,
        link: item.link,
        summary: summarize(item),
        publishedAt: normalizeDate(item.published),
        source: source.name
      }));

    return {
      ...source,
      status: "ok",
      itemCount: items.length,
      items
    };
  } catch (error) {
    return {
      ...source,
      status: "error",
      error: String(error.message || error),
      itemCount: 0,
      items: []
    };
  }
}

function byGroup(results) {
  const groups = new Map();
  for (const result of results) {
    if (!groups.has(result.group)) {
      groups.set(result.group, []);
    }
    groups.get(result.group).push(result);
  }
  return [...groups.entries()].map(([group, entries]) => ({ group, entries }));
}

function collectItems(results) {
  return results
    .flatMap((result) => result.items.map((item) => ({ ...item, group: result.group })))
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
}

function countMatches(items, patterns) {
  return items.filter((item) => {
    const haystack = `${item.title} ${item.summary}`.toLowerCase();
    return patterns.some((pattern) => haystack.includes(pattern));
  }).length;
}

function detectThemes(items) {
  return {
    military: countMatches(items, ["strike", "strikes", "drone", "missile", "forces", "war", "attack"]),
    diplomacy: countMatches(items, ["deal", "talk", "talks", "negotiation", "peace", "ceasefire"]),
    shipping: countMatches(items, ["hormuz", "shipping", "strait", "commercial ships", "oil"]),
    sanctions: countMatches(items, ["sanction", "sanctions"]),
    domestic: countMatches(items, ["congress", "house", "senate", "lawmakers", "republicans"])
  };
}

function classifyStatus(themes) {
  const escalationScore = themes.military * 2 + themes.shipping + themes.sanctions;
  const deescalationScore = themes.diplomacy * 2;
  const delta = escalationScore - deescalationScore;

  if (delta >= 4) {
    return {
      key: "escalating",
      label: "升级中",
      color: "var(--accent)",
      text: "军事与海上风险信号多于缓和信号，短期内再度失控的概率偏高。"
    };
  }

  if (delta <= -2) {
    return {
      key: "cooling",
      label: "缓和中",
      color: "var(--accent-2)",
      text: "谈判与停火表述暂时占上风，但仍需警惕反复。"
    };
  }

  return {
    key: "standoff",
    label: "僵持中",
    color: "#8a6a19",
    text: "升级与缓和信号同时存在，局势更像高压下的脆弱僵持。"
  };
}

function formatDateCN(isoString) {
  if (!isoString) return "时间未明";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "时间未明";
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getUTCMonth() + 1}月${date.getUTCDate()}日 ${pad(date.getUTCHours() + 8 > 23 ? (date.getUTCHours() + 8) % 24 : date.getUTCHours() + 8)}:${pad(date.getUTCMinutes())}`;
}

function buildAnalysis(results) {
  const items = collectItems(results);
  const themes = detectThemes(items);
  const status = classifyStatus(themes);
  const topItems = items.slice(0, 5);
  const activeSources = results.filter((result) => result.itemCount > 0).map((result) => result.name);

  const bullets = [];
  if (themes.military > 0) {
    bullets.push(`军事信号最强，当前抓取到 ${themes.military} 条与空袭、打击、无人机或直接交火相关的内容。`);
  }
  if (themes.diplomacy > 0) {
    bullets.push(`外交线仍在推进，抓取到 ${themes.diplomacy} 条与谈判、停火、协议或“接近达成”相关的内容。`);
  }
  if (themes.shipping > 0) {
    bullets.push(`霍尔木兹海峡与航运风险仍是关键观察点，相关条目 ${themes.shipping} 条。`);
  }
  if (themes.domestic > 0) {
    bullets.push(`美国国内政治约束在上升，涉及国会、议员或战争授权的条目 ${themes.domestic} 条。`);
  }
  if (bullets.length === 0) {
    bullets.push("本次可用来源中相关条目偏少，暂不足以做更强结论。");
  }

  const overviewParts = [];
  if (topItems.length > 0) {
    overviewParts.push(`最近一轮报道集中在 ${formatDateCN(topItems[0].publishedAt)} 前后。`);
  }
  if (activeSources.length > 0) {
    overviewParts.push(`当前有 ${activeSources.length} 个来源给出相关内容，主要包括 ${activeSources.slice(0, 4).join("、")}。`);
  }
  overviewParts.push(status.text);

  return {
    generatedAt: new Date().toISOString(),
    status,
    themes,
    bullets,
    overview: overviewParts.join(" "),
    brief: buildBrief(status, themes, topItems),
    headlines: topItems.map((item) => ({
      title: item.title,
      link: item.link,
      source: item.source,
      publishedAt: item.publishedAt
    }))
  };
}

function buildBrief(status, themes, topItems) {
  const latest = topItems[0];
  const latestTime = latest ? formatDateCN(latest.publishedAt) : "最新时间未明";
  const conclusions = [
    themes.military > 0
      ? `军事压力仍是主线。最近报道显示，美伊相关打击、无人机或直接交火信息仍在累积，最新高相关报道集中在 ${latestTime} 前后。`
      : "军事升级信号暂时不强，至少在当前抓取到的来源中不是最突出的主线。",
    themes.diplomacy > 0
      ? "外交窗口并未关闭。围绕停火、协议、谈判或“接近达成”的消息仍在出现，说明双方并未完全放弃政治解决。"
      : "外交降温信号偏弱。当前来源中与协议、停火或正式谈判相关的表述不多。",
    themes.shipping > 0
      ? "霍尔木兹海峡与商船安全仍是最值得盯防的外溢风险点，任何航运事件都可能迅速推高油价与地区紧张度。"
      : "短期外溢风险更多来自军事误判，而不是已经明确升级的海峡航运事件。"
  ];

  const risks = [];
  if (themes.military >= themes.diplomacy) {
    risks.push("若再出现美军打击、伊朗无人机/导弹袭扰或代理人攻击，局势可能从脆弱僵持迅速转向新一轮升级。");
  }
  if (themes.shipping > 0) {
    risks.push("霍尔木兹海峡若出现商船受扰、封锁威胁或保险成本飙升，市场层面的连锁反应会先于外交结果体现。");
  }
  if (themes.domestic > 0) {
    risks.push("美国国内政治约束在上升，白宫、国会和鹰派力量之间的分歧可能让政策信号反复摇摆。");
  }
  if (risks.length === 0) {
    risks.push("当前可用样本偏少，最大风险是信息面突然变化而页面尚未聚合到足够多的交叉来源。");
  }

  const watchpoints = [
    "是否出现正式签署或公开确认的停火/协议文本，而不只是“接近达成”的口头表态。",
    "霍尔木兹海峡是否再出现商船遇袭、航线中断、护航升级或油价异常跳升。",
    "美国官方是否宣布新的制裁、增兵、撤侨或国会层面的战争授权动作。"
  ];

  return {
    conclusions,
    risks: risks.slice(0, 3),
    watchpoints
  };
}

function buildHtml(payload) {
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>美国-伊朗局势日报</title>
  <style>
    :root {
      --bg: #f4efe5;
      --panel: rgba(255, 252, 245, 0.9);
      --ink: #182028;
      --muted: #5f6a72;
      --accent: #b33a1b;
      --accent-2: #115e59;
      --border: rgba(24, 32, 40, 0.12);
      --shadow: 0 20px 50px rgba(24, 32, 40, 0.08);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: "Microsoft YaHei", Georgia, "Times New Roman", serif;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, rgba(179, 58, 27, 0.12), transparent 28%),
        radial-gradient(circle at bottom right, rgba(17, 94, 89, 0.16), transparent 32%),
        linear-gradient(180deg, #efe6d6 0%, var(--bg) 48%, #f7f2ea 100%);
      min-height: 100vh;
    }

    .wrap {
      width: min(1180px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 36px 0 56px;
    }

    .hero {
      display: grid;
      grid-template-columns: 1.4fr 0.8fr;
      gap: 20px;
      margin-bottom: 28px;
    }

    .hero-card, .meta-card, .group, .source-card, .analysis-card, .analysis-side {
      background: var(--panel);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      backdrop-filter: blur(6px);
    }

    .hero-card {
      padding: 28px;
      border-radius: 28px;
    }

    .meta-card {
      padding: 24px;
      border-radius: 24px;
      display: grid;
      gap: 14px;
      align-content: start;
    }

    .eyebrow {
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 12px;
      font-weight: 700;
    }

    h1 {
      margin: 10px 0 14px;
      font-size: clamp(34px, 5vw, 60px);
      line-height: 0.96;
      max-width: 10ch;
    }

    .lead {
      margin: 0;
      font-size: 18px;
      line-height: 1.7;
      color: var(--muted);
      max-width: 58ch;
    }

    .meta-line {
      padding: 14px 16px;
      border-radius: 18px;
      background: rgba(24, 32, 40, 0.04);
    }

    .meta-line strong {
      display: block;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 6px;
      color: var(--muted);
    }

    .group {
      border-radius: 30px;
      padding: 24px;
      margin-bottom: 22px;
    }

    .analysis {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 20px;
      margin-bottom: 26px;
    }

    .analysis-card, .analysis-side {
      border-radius: 26px;
      padding: 24px;
    }

    .analysis-card h2, .analysis-side h3 {
      margin: 0 0 12px;
    }

    .brief-block + .brief-block {
      margin-top: 18px;
    }

    .brief-title {
      margin: 0 0 10px;
      font-size: 16px;
      color: var(--accent);
      letter-spacing: 0.04em;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 999px;
      padding: 6px 12px;
      color: white;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 14px;
    }

    .analysis-overview {
      margin: 0 0 16px;
      color: var(--muted);
      font-size: 16px;
      line-height: 1.75;
    }

    .analysis-list {
      list-style: disc;
      padding-left: 20px;
      margin: 0;
      color: var(--ink);
      display: grid;
      gap: 10px;
    }

    .analysis-list li {
      border: 0;
      padding: 0;
    }

    .theme-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }

    .theme-box {
      padding: 14px;
      border-radius: 18px;
      background: rgba(24, 32, 40, 0.05);
    }

    .theme-box strong {
      display: block;
      font-size: 24px;
      margin-bottom: 6px;
    }

    .headlines {
      display: grid;
      gap: 10px;
    }

    .headline-link {
      color: var(--ink);
      text-decoration: none;
      font-weight: 600;
      line-height: 1.5;
    }

    .group-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 16px;
      margin-bottom: 18px;
    }

    .group h2 {
      margin: 0;
      font-size: 28px;
    }

    .group small {
      color: var(--muted);
    }

    .sources {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }

    .source-card {
      border-radius: 22px;
      padding: 18px;
      display: grid;
      gap: 12px;
    }

    .source-top {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
    }

    .source-top a {
      color: var(--ink);
      text-decoration: none;
      font-weight: 700;
      font-size: 19px;
    }

    .badge {
      font-size: 12px;
      color: white;
      padding: 4px 8px;
      border-radius: 999px;
      background: var(--accent-2);
      white-space: nowrap;
    }

    .badge.error {
      background: var(--accent);
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 10px;
    }

    li {
      padding-top: 10px;
      border-top: 1px solid var(--border);
    }

    li:first-child {
      border-top: 0;
      padding-top: 0;
    }

    .item-link {
      color: var(--ink);
      text-decoration: none;
      font-weight: 600;
      line-height: 1.45;
    }

    .summary {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.55;
    }

    .time {
      margin-top: 6px;
      font-size: 12px;
      color: var(--muted);
    }

    .error-text {
      color: var(--accent);
      font-size: 14px;
      line-height: 1.5;
    }

    .footer {
      margin-top: 24px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }

    @media (max-width: 860px) {
      .hero {
        grid-template-columns: 1fr;
      }

      .analysis {
        grid-template-columns: 1fr;
      }

      .wrap {
        width: min(100vw - 18px, 1180px);
        padding-top: 18px;
      }

      .group {
        padding: 18px;
      }
    }
  </style>
</head>
<body>
  <div class="wrap" id="app"></div>
  <script id="payload" type="application/json">${json}</script>
  <script>
    const payload = JSON.parse(document.getElementById("payload").textContent);
    const app = document.getElementById("app");

    const dateFormat = new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Shanghai"
    });

    const humanDate = (value) => value ? dateFormat.format(new Date(value)) : "时间未知";

    const totalItems = payload.results.reduce((sum, source) => sum + source.itemCount, 0);
    const healthy = payload.results.filter((source) => source.status === "ok").length;
    const statusColor = payload.analysis.status.color;

    app.innerHTML = \`
      <section class="hero">
        <article class="hero-card">
          <div class="eyebrow">Daily Situation Watch</div>
          <h1>美国-伊朗局势 每日媒体与智库简报</h1>
          <p class="lead">聚合世界主流媒体与政策研究机构关于美国、伊朗、制裁、军事行动、霍尔木兹海峡与核谈判的最新报道。页面由本地脚本每日自动更新。</p>
        </article>
        <aside class="meta-card">
          <div class="meta-line">
            <strong>最后更新</strong>
            <span>\${humanDate(payload.generatedAt)}</span>
          </div>
          <div class="meta-line">
            <strong>本次抓取</strong>
            <span>\${payload.results.length} 个来源 / \${healthy} 个成功 / \${totalItems} 条相关内容</span>
          </div>
          <div class="meta-line">
            <strong>更新规则</strong>
            <span>每日 10:00 运行抓取脚本并重建页面</span>
          </div>
        </aside>
      </section>
      <section class="analysis">
        <article class="analysis-card">
          <div class="status-pill" style="background:\${statusColor}">局势判断：\${payload.analysis.status.label}</div>
          <h2>中文简报</h2>
          <p class="analysis-overview">\${payload.analysis.overview}</p>
          <section class="brief-block">
            <h3 class="brief-title">今日三点结论</h3>
            <ul class="analysis-list">
              \${payload.analysis.brief.conclusions.map((item) => '<li>' + item + '</li>').join("")}
            </ul>
          </section>
          <section class="brief-block">
            <h3 class="brief-title">风险提示</h3>
            <ul class="analysis-list">
              \${payload.analysis.brief.risks.map((item) => '<li>' + item + '</li>').join("")}
            </ul>
          </section>
          <section class="brief-block">
            <h3 class="brief-title">后续观察点</h3>
            <ul class="analysis-list">
              \${payload.analysis.brief.watchpoints.map((item) => '<li>' + item + '</li>').join("")}
            </ul>
          </section>
        </article>
        <aside class="analysis-side">
          <h3>观察重点</h3>
          <div class="theme-grid">
            <div class="theme-box"><strong>\${payload.analysis.themes.military}</strong><span>军事升级条目</span></div>
            <div class="theme-box"><strong>\${payload.analysis.themes.diplomacy}</strong><span>谈判缓和条目</span></div>
            <div class="theme-box"><strong>\${payload.analysis.themes.shipping}</strong><span>霍尔木兹/航运条目</span></div>
            <div class="theme-box"><strong>\${payload.analysis.themes.domestic}</strong><span>美国国内政治条目</span></div>
          </div>
          <div class="headlines">
            \${payload.analysis.headlines.map((item) => '<div><a class="headline-link" href="' + item.link + '" target="_blank" rel="noreferrer">' + item.title + '</a><div class="time">' + item.source + ' · ' + humanDate(item.publishedAt) + '</div></div>').join("")}
          </div>
        </aside>
      </section>
      \${payload.groups.map((group) => \`
        <section class="group">
          <div class="group-head">
            <h2>\${group.group}</h2>
            <small>\${group.entries.length} 个来源</small>
          </div>
          <div class="sources">
            \${group.entries.map((source) => \`
              <article class="source-card">
                <div class="source-top">
                  <a href="\${source.homepage}" target="_blank" rel="noreferrer">\${source.name}</a>
                  <span class="badge \${source.status === "error" ? "error" : ""}">\${source.status === "ok" ? source.itemCount + " 条" : "抓取失败"}</span>
                </div>
                \${source.status === "ok" ? \`
                  <ul>
                    \${source.items.length ? source.items.map((item) => \`
                      <li>
                        <a class="item-link" href="\${item.link}" target="_blank" rel="noreferrer">\${item.title}</a>
                        <p class="summary">\${item.summary}</p>
                        <div class="time">\${humanDate(item.publishedAt)}</div>
                      </li>
                    \`).join("") : '<li><div class="summary">本次抓取成功，但未筛到与美国-伊朗局势直接相关的条目。</div></li>'}
                  </ul>
                \` : \`<div class="error-text">\${source.error}</div>\`}
              </article>
            \`).join("")}
          </div>
        </section>
      \`).join("")}
      <div class="footer">
        数据来源：各机构公开 RSS/Feed。相关性依据标题与摘要关键词过滤，适合作为每日情报看板，不替代人工核验。
      </div>
    \`;
  </script>
</body>
</html>`;
}

async function main() {
  await ensureDirs();
  const results = await Promise.all(sources.map(fetchSource));
  const payload = {
    generatedAt: new Date().toISOString(),
    results,
    groups: byGroup(results),
    analysis: buildAnalysis(results)
  };

  await fs.writeFile(
    path.join(DATA_DIR, "latest.json"),
    JSON.stringify(payload, null, 2),
    "utf8"
  );
  await fs.writeFile(path.join(DIST, "index.html"), buildHtml(payload), "utf8");
  console.log(`Built monitor page with ${results.length} sources.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
