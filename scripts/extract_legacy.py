#!/usr/bin/env python3
"""Carry the v3 Red Team Mapper page into typed data for the v4 app.

This is a mechanical transform: it copies the existing page's content across
without rewriting it. It reads legacy/index.html and emits

  src/data/legacy/sections.json   one entry per <div class="section">
  src/data/legacy/flows.json      structured flow chains
  src/data/legacy/nav.json        sidebar groups, from the v3 sidebar
  src/styles/legacy.css           the v3 component styles, scoped under .rtm

Section bodies are preserved as sanitised inner HTML and rendered inside a
`.rtm` wrapper so the original cards, callouts and tables keep their look.
Run with `npm run extract`.
"""
from __future__ import annotations

import html as htmllib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "legacy" / "index.html"
OUT_DATA = ROOT / "src" / "data" / "legacy"
OUT_CSS = ROOT / "src" / "styles" / "legacy.css"

# ------------------------------------------------------------------ #
# Tiny depth-aware slicer: find the inner HTML of a <tag ...> ... </tag>
# starting at a given index, honouring nesting of the same tag name.
# ------------------------------------------------------------------ #
TAG_RE = re.compile(r"<(/?)(\w+)([^>]*)>")
VOID = {"br", "hr", "img", "input", "meta", "link", "source", "path", "circle", "rect", "use"}


def inner_html(doc: str, open_start: int, tag: str) -> tuple[str, int]:
    """Given the index of a `<tag ...>`, return (inner_html, index_after_close)."""
    m = TAG_RE.match(doc, open_start)
    assert m and m.group(2) == tag, f"expected <{tag}> at {open_start}"
    body_start = m.end()
    depth = 1
    pos = body_start
    for t in TAG_RE.finditer(doc, body_start):
        name = t.group(2).lower()
        if name in VOID or t.group(3).endswith("/"):
            continue
        if name != tag:
            continue
        if t.group(1):  # closing
            depth -= 1
            if depth == 0:
                return doc[body_start:t.start()], t.end()
        else:
            depth += 1
    raise ValueError(f"unbalanced <{tag}> from {open_start}")


def text_of(fragment: str) -> str:
    """Strip tags to plain text."""
    return htmllib.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


# ------------------------------------------------------------------ #
# Sections
# ------------------------------------------------------------------ #
HL_HUE = {
    "hl-blue": "slate", "hl-cyan": "teal", "hl-green": "sage", "hl-orange": "gold",
    "hl-pink": "rose", "hl-purple": "mauve", "hl-red": "ember", "hl-teal": "teal",
    "hl-yellow": "gold",
}
TITLE_HUE = {
    "red": "ember", "green": "sage", "purple": "mauve", "orange": "gold",
    "cyan": "teal", "blue": "slate", "pink": "rose", "yellow": "gold", "teal": "teal",
}


def extract_sections(doc: str) -> list[dict]:
    out = []
    for m in re.finditer(r'<div class="section" id="([a-z0-9-]+)"\s*>', doc):
        sid = m.group(1)
        body, _ = inner_html(doc, m.start(), "div")
        # Pull the header out of the body; keep the rest as content HTML.
        hm = re.search(r'<div class="section-header"\s*>', body)
        title, desc, content = sid, "", body
        if hm:
            header, after = inner_html(body, hm.start(), "div")
            dm = re.search(r'<div class="section-desc"\s*>(.*?)</div>', header, re.S)
            desc = text_of(dm.group(1)) if dm else ""
            # Title = header text minus the description.
            htext = header
            if dm:
                htext = header[: dm.start()] + header[dm.end():]
            title = text_of(htext)
            content = body[:hm.start()] + body[after:]
        out.append({
            "id": sid,
            "title": title or sid,
            "desc": desc,
            "html": content.strip(),
        })
    return out


# ------------------------------------------------------------------ #
# Flow chains
# ------------------------------------------------------------------ #
def extract_flows(doc: str) -> list[dict]:
    flows = []
    for i, m in enumerate(re.finditer(r'<div class="flow-chain"\s*>', doc)):
        chain, _ = inner_html(doc, m.start(), "div")
        tm = re.search(r'<div class="flow-chain-title ([a-z]+)"\s*>(.*?)</div>', chain, re.S)
        title = text_of(tm.group(2)) if tm else f"Chain {i + 1}"
        hue = TITLE_HUE.get(tm.group(1), "ember") if tm else "ember"
        steps = []
        for sm in re.finditer(r'<div class="flow-node ([a-z-]+)"\s*>(.*?)</div>', chain, re.S):
            steps.append({"label": text_of(sm.group(2)), "hue": HL_HUE.get(sm.group(1), "slate")})
        arrows = [text_of(a) for a in re.findall(r'<span class="flow-arrow-label"\s*>(.*?)</span>', chain, re.S)]
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:48] or f"chain-{i + 1}"
        flows.append({"id": slug, "title": title, "hue": hue, "steps": steps, "arrows": arrows})
    # De-dupe ids.
    seen: dict[str, int] = {}
    for f in flows:
        if f["id"] in seen:
            seen[f["id"]] += 1
            f["id"] = f"{f['id']}-{seen[f['id']]}"
        else:
            seen[f["id"]] = 1
    return flows


# ------------------------------------------------------------------ #
# Sidebar groups
# ------------------------------------------------------------------ #
def extract_nav(doc: str) -> list[dict]:
    groups = []
    for m in re.finditer(r'<div class="nav-group"\s*>', doc):
        block, _ = inner_html(doc, m.start(), "div")
        lm = re.search(r'<div class="nav-group-label"\s*>(.*?)</div>', block, re.S)
        label = text_of(lm.group(1)) if lm else ""
        ids = re.findall(r'<a class="nav-link"[^>]*href="#([a-z0-9-]+)"', block)
        if ids:
            groups.append({"label": label, "ids": ids})
    return groups


# ------------------------------------------------------------------ #
# CSS: scope the v3 component styles under `.rtm`, keep :root vars global.
# ------------------------------------------------------------------ #
def scope_css(css: str) -> str:
    out = []

    def prefix_selectors(sel: str) -> str:
        parts = []
        for s in sel.split(","):
            s = s.strip()
            if not s:
                continue
            if s == "*":
                parts.append(".rtm, .rtm *")
            elif s in ("html", "body", ":root"):
                parts.append(".rtm")
            elif s.startswith(("html", "body")):
                # e.g. `body.modal-open` -> `.rtm.modal-open`
                parts.append(".rtm" + s[4:] if s.startswith("body") else ".rtm" + s[4:])
            elif s.startswith(("@", ".rtm")):
                parts.append(s)
            else:
                parts.append(f".rtm {s}")
        return ", ".join(parts)

    i = 0
    n = len(css)
    while i < n:
        at = css.find("@", i)
        brace = css.find("{", i)
        if brace == -1:
            break
        if at != -1 and at < brace:
            # at-rule
            name_end = css.find("{", at)
            at_prelude = css[at:name_end].strip()
            if at_prelude.startswith(("@media", "@supports")):
                depth = 1
                j = name_end + 1
                while j < n and depth:
                    if css[j] == "{":
                        depth += 1
                    elif css[j] == "}":
                        depth -= 1
                    j += 1
                inner = css[name_end + 1:j - 1]
                out.append(f"{at_prelude} {{\n{scope_css(inner)}\n}}")
                i = j
                continue
            else:  # @keyframes, @font-face, @import - keep verbatim
                depth = 0
                j = name_end
                if css[name_end] == "{":
                    depth = 1
                    j = name_end + 1
                    while j < n and depth:
                        if css[j] == "{":
                            depth += 1
                        elif css[j] == "}":
                            depth -= 1
                        j += 1
                out.append(css[at:j])
                i = j
                continue
        sel = css[i:brace]
        close = css.find("}", brace)
        if close == -1:
            break
        decls = css[brace + 1:close]
        if ":root" in sel:
            out.append(f":root {{{decls}}}")  # keep variables global
        else:
            out.append(f"{prefix_selectors(sel)} {{{decls}}}")
        i = close + 1
    return "\n".join(out)


def main() -> None:
    doc = SRC.read_text(encoding="utf-8")
    OUT_DATA.mkdir(parents=True, exist_ok=True)

    sections = extract_sections(doc)
    flows = extract_flows(doc)
    nav = extract_nav(doc)

    # CSS from the two <style> blocks.
    styles = re.findall(r"<style[^>]*>(.*?)</style>", doc, re.S)
    scoped = "\n".join(scope_css(s) for s in styles)
    OUT_CSS.write_text(
        "/* Generated by scripts/extract_legacy.py - the v3 component styles,\n"
        "   scoped under .rtm so section content keeps its original look.\n"
        "   Do not edit by hand; re-run `npm run extract`. */\n" + scoped + "\n",
        encoding="utf-8",
    )

    for name, data in [("sections.json", sections), ("flows.json", flows), ("nav.json", nav)]:
        (OUT_DATA / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"sections: {len(sections)}")
    print(f"flows:    {len(flows)} ({sum(len(f['steps']) for f in flows)} steps)")
    print(f"nav:      {len(nav)} groups")
    print(f"css:      {len(scoped)} bytes scoped")


if __name__ == "__main__":
    main()
