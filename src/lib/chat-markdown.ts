/**
 * Render Vale chat markdown to a small set of safe HTML tags.
 * Input is escaped before any tag is introduced, so model text cannot inject markup.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(raw: string): string | null {
  const href = raw.replace(/&amp;/g, "&").trim();
  if (/^(https?:\/\/|\/)/i.test(href) && !/^\/\//.test(href)) return href;
  return null;
}

function inline(escaped: string): string {
  let out = escaped.replace(/`([^`]+)`/g, '<code class="rounded bg-black/5 px-1">$1</code>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text: string, href: string) => {
    const safe = safeHref(href);
    if (!safe) return text;
    const external = /^https?:/i.test(safe);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${escapeHtml(safe)}"${attrs} class="text-indigo-600 underline hover:text-indigo-800">${text}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  out = out.replace(/(^|[\s(])(https?:\/\/[^\s<]+)/g, (_m, pre: string, url: string) => {
    const clean = url.replace(/[),.;]+$/, "");
    const trail = url.slice(clean.length);
    return `${pre}<a href="${escapeHtml(clean)}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline">${clean}</a>${trail}`;
  });
  out = out.replace(
    /(^|[\s(])gardenstate\.ai\/([\w./-]+)/g,
    '$1<a href="/$2" class="text-indigo-600 underline">gardenstate.ai/$2</a>',
  );
  return out;
}

export function renderChatMarkdown(raw: string): string {
  const text = raw
    .replace(/\[ID:[a-f0-9-]+\]/gi, "")
    .replace(/\r\n/g, "\n")
    .trim();
  if (!text) return "";

  const lines = text.split("\n");
  const html: string[] = [];
  let i = 0;
  let para: string[] = [];

  const flushPara = () => {
    if (!para.length) return;
    html.push(`<p class="my-1">${para.map((line) => inline(escapeHtml(line))).join("<br>")}</p>`);
    para = [];
  };

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      flushPara();
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushPara();
      html.push('<hr class="my-2 border-gray-300" />');
      i++;
      continue;
    }
    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushPara();
      const tag = heading[1].length >= 4 ? "h4" : "h3";
      html.push(
        `<${tag} class="mt-2 mb-1 font-bold leading-snug">${inline(escapeHtml(heading[2]))}</${tag}>`,
      );
      i++;
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(inline(escapeHtml(lines[i].trim().replace(/^[-*]\s+/, ""))));
        i++;
      }
      html.push(`<ul class="my-1 list-disc space-y-0.5 pl-5">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`);
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(inline(escapeHtml(lines[i].trim().replace(/^\d+\.\s+/, ""))));
        i++;
      }
      html.push(`<ol class="my-1 list-decimal space-y-0.5 pl-5">${items.map((item) => `<li>${item}</li>`).join("")}</ol>`);
      continue;
    }
    para.push(trimmed);
    i++;
  }
  flushPara();
  return html.join("");
}
