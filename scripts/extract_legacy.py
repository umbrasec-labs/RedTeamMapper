#!/usr/bin/env python3
"""Carry the v3 Red Team Mapper page into typed data for the v4 app.

Mechanical transform: it reads legacy/index.html and models its content without
rewriting any of it, except the section titles in TITLE_OVERRIDES. It emits

  src/data/legacy/sections.json   per section: callouts, cards and code blocks
  src/data/legacy/flows.json      operation flow chains as step sequences
  src/data/legacy/nav.json        sidebar groups, from the v3 sidebar

The v3 card structure (accent hue, tags, title, sub, item list) maps directly
onto the card model the app renders, so sections become expandable card grids
rather than raw HTML. Run with `npm run extract`.
"""
from __future__ import annotations

import html as htmllib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "legacy" / "index.html"
OUT_DATA = ROOT / "src" / "data" / "legacy"

TAG_RE = re.compile(r"<(/?)(\w+)([^>]*)>")
VOID = {"br", "hr", "img", "input", "meta", "link", "source", "path", "circle", "rect", "use"}

HUE = {
    "blue": "slate", "cyan": "teal", "green": "sage", "orange": "gold", "pink": "rose",
    "purple": "mauve", "red": "ember", "rose": "rose", "teal": "teal", "yellow": "gold",
}
CALLOUT_TONE = {"danger": "danger", "warn": "warn", "warning": "warn", "info": "info",
                "success": "success", "tip": "success"}


def inner_html(doc: str, open_start: int, tag: str) -> tuple[str, int]:
    """Given the index of a `<tag ...>`, return (inner_html, index_after_close)."""
    m = TAG_RE.match(doc, open_start)
    assert m and m.group(2) == tag, f"expected <{tag}> at {open_start}"
    body_start = m.end()
    depth = 1
    for t in TAG_RE.finditer(doc, body_start):
        name = t.group(2).lower()
        if name in VOID or t.group(3).endswith("/") or name != tag:
            continue
        if t.group(1):
            depth -= 1
            if depth == 0:
                return doc[body_start:t.start()], t.end()
        else:
            depth += 1
    raise ValueError(f"unbalanced <{tag}> from {open_start}")


def rich(fragment: str) -> str:
    """Tags -> plain text, but <code> becomes `backticks` for the RichText renderer."""
    s = re.sub(r"<code>(.*?)</code>", r"`\1`", fragment, flags=re.S)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", htmllib.unescape(s)).strip()


def plain(fragment: str) -> str:
    return re.sub(r"\s+", " ", htmllib.unescape(re.sub(r"<[^>]+>", "", fragment))).strip()


def pre_text(fragment: str) -> str:
    """Strip tags but keep newlines, for code blocks."""
    s = htmllib.unescape(re.sub(r"<[^>]+>", "", fragment))
    return "\n".join(line.rstrip() for line in s.strip("\n").splitlines())


# ------------------------------------------------------------------ #
# Cards, callouts and code blocks within a section body
# ------------------------------------------------------------------ #
def parse_cards(body: str) -> list[dict]:
    cards = []
    for m in re.finditer(r'<div class="card">', body):
        frag, _ = inner_html(body, m.start(), "div")
        accent = re.search(r'card-accent (\w+)', frag)
        hue = HUE.get(accent.group(1), "ember") if accent else "ember"
        tag_m = re.search(r'<span class="tag \w+">(.*?)</span>', frag, re.S)
        tag = plain(tag_m.group(1)) if tag_m else ""
        title_m = re.search(r'<h3>(.*?)</h3>', frag, re.S)
        title = plain(title_m.group(1)) if title_m else ""
        sub_m = re.search(r'<div class="card-sub">(.*?)</div>', frag, re.S)
        summary = rich(sub_m.group(1)) if sub_m else ""
        items = []
        for li in re.findall(r'<li>(.*?)</li>', frag, re.S):
            sm = re.search(r'<strong>(.*?)</strong>(.*)', li, re.S)
            if sm:
                items.append({"lead": plain(sm.group(1)), "text": rich(sm.group(2)).lstrip(" -–—:")})
            else:
                items.append({"lead": "", "text": rich(li)})
        if title:
            cards.append({"hue": hue, "tag": tag, "title": title, "summary": summary, "items": items})
    return cards


def parse_callouts(body: str) -> list[dict]:
    outs = []
    for m in re.finditer(r'<div class="callout (\w+)">', body):
        tone = CALLOUT_TONE.get(m.group(1), "info")
        frag, _ = inner_html(body, m.start(), "div")
        bm = re.search(r'<div class="callout-body">(.*?)</div>', frag, re.S)
        inner = bm.group(1) if bm else frag
        tm = re.search(r'<strong>(.*?)</strong>(.*)', inner, re.S)
        if tm:
            outs.append({"tone": tone, "title": plain(tm.group(1)), "body": rich(tm.group(2)).lstrip(" -–—:")})
        else:
            outs.append({"tone": tone, "title": "", "body": rich(inner)})
    return outs


def parse_code(body: str) -> list[dict]:
    outs = []
    for m in re.finditer(r'<div class="mono-block">', body):
        frag, _ = inner_html(body, m.start(), "div")
        h = re.search(r'<h4>(.*?)</h4>', frag, re.S)
        pre = re.search(r'<pre>(.*?)</pre>', frag, re.S)
        if pre:
            outs.append({"title": plain(h.group(1)) if h else "", "text": pre_text(pre.group(1))})
    return outs


# ------------------------------------------------------------------ #
# Sections
# ------------------------------------------------------------------ #
# Section titles that deliberately differ from legacy/index.html, which stays
# verbatim. ATT&CK v19 split Defense Evasion into Stealth (TA0005) and Defense
# Impairment (TA0112), so the evasion section follows its phase label.
TITLE_OVERRIDES = {
    "evasion": "// Stealth & Impairment",
}


def extract_sections(doc: str, group_of: dict[str, str]) -> list[dict]:
    out = []
    for m in re.finditer(r'<div class="section" id="([a-z0-9-]+)"\s*>', doc):
        sid = m.group(1)
        body, _ = inner_html(doc, m.start(), "div")
        title, desc = sid, ""
        hm = re.search(r'<div class="section-header"\s*>', body)
        if hm:
            header, _ = inner_html(body, hm.start(), "div")
            dm = re.search(r'<div class="section-desc"\s*>(.*?)</div>', header, re.S)
            desc = plain(dm.group(1)) if dm else ""
            htext = header[: dm.start()] + header[dm.end():] if dm else header
            title = plain(htext)
        out.append({
            "id": sid,
            "eyebrow": group_of.get(sid, "Reference"),
            "title": TITLE_OVERRIDES.get(sid, title or sid),
            "description": desc,
            "callouts": parse_callouts(body),
            "cards": parse_cards(body),
            "code": parse_code(body),
        })
    return out


# ------------------------------------------------------------------ #
# Flow chains
# ------------------------------------------------------------------ #
HL_HUE = {
    "hl-blue": "slate", "hl-cyan": "teal", "hl-green": "sage", "hl-orange": "gold",
    "hl-pink": "rose", "hl-purple": "mauve", "hl-red": "ember", "hl-teal": "teal", "hl-yellow": "gold",
}
TITLE_HUE = {"red": "ember", "green": "sage", "purple": "mauve", "orange": "gold",
             "cyan": "teal", "blue": "slate", "pink": "rose", "yellow": "gold", "teal": "teal"}


def extract_flows(doc: str) -> list[dict]:
    flows = []
    seen: dict[str, int] = {}
    for i, m in enumerate(re.finditer(r'<div class="flow-chain"\s*>', doc)):
        chain, _ = inner_html(doc, m.start(), "div")
        tm = re.search(r'<div class="flow-chain-title ([a-z]+)"\s*>(.*?)</div>', chain, re.S)
        title = plain(tm.group(2)) if tm else f"Chain {i + 1}"
        hue = TITLE_HUE.get(tm.group(1), "ember") if tm else "ember"
        steps = [{"label": plain(s.group(2)), "hue": HL_HUE.get(s.group(1), "slate")}
                 for s in re.finditer(r'<div class="flow-node ([a-z-]+)"\s*>(.*?)</div>', chain, re.S)]
        arrows = [plain(a) for a in re.findall(r'<span class="flow-arrow-label"\s*>(.*?)</span>', chain, re.S)]
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:48] or f"chain-{i + 1}"
        if slug in seen:
            seen[slug] += 1
            slug = f"{slug}-{seen[slug]}"
        else:
            seen[slug] = 1
        flows.append({"id": slug, "title": title, "hue": hue, "steps": steps, "arrows": arrows})
    return flows


def extract_nav(doc: str) -> list[dict]:
    groups = []
    for m in re.finditer(r'<div class="nav-group"\s*>', doc):
        block, _ = inner_html(doc, m.start(), "div")
        lm = re.search(r'<div class="nav-group-label"\s*>(.*?)</div>', block, re.S)
        label = plain(lm.group(1)) if lm else ""
        ids = re.findall(r'<a class="nav-link"[^>]*href="#([a-z0-9-]+)"', block)
        if ids:
            groups.append({"label": label, "ids": ids})
    return groups


# The 7 operation phases from the v3 lifecycle bar, each linked to the sections
# that belong to it. Labels/icons/hues are presentation; the grouping is ours.
PHASES = [
    {"id": "infra", "order": 1, "label": "Infrastructure", "short": "Infra", "icon": "network", "hue": "slate",
     "sections": ["recon", "osint", "infra", "c2"]},
    {"id": "access", "order": 2, "label": "Initial Access", "short": "Access", "icon": "mail", "hue": "ember",
     "sections": ["access", "social", "motw", "payload"]},
    {"id": "exec", "order": 3, "label": "Execution", "short": "Exec", "icon": "cpu", "hue": "gold",
     "sections": ["inject", "evasion", "persist"]},
    {"id": "evade", "order": 4, "label": "Stealth & Impairment", "short": "Evade", "icon": "ghost", "hue": "mauve",
     "sections": ["evasion", "opsec"]},
    {"id": "lateral", "order": 5, "label": "Privilege & Movement", "short": "Lateral", "icon": "git", "hue": "teal",
     "sections": ["privesc", "cred", "lateral", "ad"]},
    {"id": "collect", "order": 6, "label": "Collection", "short": "Collect", "icon": "database", "hue": "sage",
     "sections": ["cloud", "ai", "crossplatform", "cracking"]},
    {"id": "exfil", "order": 7, "label": "Exfiltration & Impact", "short": "Exfil", "icon": "upload", "hue": "rose",
     "sections": ["exfil", "cves", "arsenal"]},
]


def main() -> None:
    doc = SRC.read_text(encoding="utf-8")
    OUT_DATA.mkdir(parents=True, exist_ok=True)

    nav = extract_nav(doc)
    group_of = {sid: g["label"] for g in nav for sid in g["ids"]}
    sections = extract_sections(doc, group_of)
    flows = extract_flows(doc)

    for name, data in [
        ("sections.json", sections),
        ("flows.json", flows),
        ("nav.json", nav),
        ("phases.json", PHASES),
    ]:
        (OUT_DATA / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    content = [s for s in sections if s["id"] != "flows"]
    print(f"sections: {len(sections)}")
    print(f"cards:    {sum(len(s['cards']) for s in content)}")
    print(f"callouts: {sum(len(s['callouts']) for s in content)}")
    print(f"code:     {sum(len(s['code']) for s in content)}")
    print(f"flows:    {len(flows)} ({sum(len(f['steps']) for f in flows)} steps)")
    print(f"phases:   {len(PHASES)}; nav groups: {len(nav)}")
    # sanity: every phase section id exists
    ids = {s["id"] for s in sections}
    missing = [sid for p in PHASES for sid in p["sections"] if sid not in ids]
    print(f"phase refs missing: {missing or 'none'}")


if __name__ == "__main__":
    main()
