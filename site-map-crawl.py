#!/usr/bin/env python3
"""
Project YOU - Site Map crawler.  Rebuilds the page-to-page map that
site-map.html renders.  Nothing in here is hand-maintained: it reads the
live repository plus two live database lists and emits one JSON payload.

Usage:
  python3 site-map-crawl.py --repo /path/to/ProjectYou \
      --pages-list pages.txt --trackers trackers.json --out data.json

  --pages-list  a plain list (whitespace separated) of every `path` in
                public.pages ending in .html
  --trackers    a JSON array of the `url` basenames in public.session_trackers

Both come from the database, so the caller runs these two queries first:
  select string_agg(path,' ' order by path) from public.pages where path like '%.html';
  select json_agg(regexp_replace(url,'^.*/','') order by day, slug) from public.session_trackers;
"""
import argparse, collections, html as _html, json, os, re, sys

ARCHIVE_RE = re.compile(r'^(session-tracker-20|morning-report-20|decision-review-20|feedback-20|todays-tasks-v)')
# The Site Map links to every page it lists. Counting those as real links would
# make every orphan look reachable and destroy the signal the map exists to give,
# so the map is excluded as a SOURCE of links. It still appears as a page.
MAP_PAGES = {'site-map.html'}
HREF_RE    = re.compile(r'''href\s*=\s*["']([^"'>]+)["']''', re.I)
JSHREF_RE  = re.compile(r'''["'`]([A-Za-z0-9_\-]+\.html(?:#[A-Za-z0-9_\-]*)?)["'`]''')
DIV_RE     = re.compile(r'<div\b|</div>', re.I)

def strip_nav(h):
    """Remove the inline .pynav block. navpatch.js rewrites it at runtime from
    nav-config.js, so its hrefs are not real page-to-page links."""
    i = h.find('<div class="pynav"')
    if i < 0: i = h.find("<div class='pynav'")
    if i < 0: return h
    depth, k = 0, i
    while k < len(h):
        m = DIV_RE.search(h, k)
        if not m: return h
        if m.group(0).lower() == '</div>':
            depth -= 1
            if depth == 0: return h[:i] + h[m.end():]
        else:
            depth += 1
        k = m.end()
    return h

def label(s):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>|&amp;|&nbsp;|\\u2190', ' ', s)).strip()

def read_nav(repo):
    """The live menu, read out of nav-config.js. One source, never retyped."""
    nc = open(os.path.join(repo, 'nav-config.js'), encoding='utf-8').read()
    def block(name):
        i = nc.find('window.' + name)
        if i < 0: return ''
        k = nc.find('\n};', i)
        return nc[i:k + 3] if k > 0 else nc[i:nc.find(';', i)]
    rows, owner, cur = [], {}, None
    DISPLAY = {"Parking Lot": "Lists (top bar)", "Group label": "Section landing"}
    for line in block('NAV_CONFIG').splitlines():
        g = re.match(r'\s*"([^"]+)"\s*:\s*\[', line)
        if g: cur = g.group(1); continue
        m = re.search(r'"label"\s*:\s*"(.*?)"\s*,\s*"href"\s*:\s*"([^"]+)"', line)
        if m and cur:
            rows.append((DISPLAY.get(cur, cur), label(m.group(1)), m.group(2)))
    # Every subsection strip is a window.<NAME>_NAV block. Read them ALL, by
    # pattern, so a new one (TRAVEL_NAV arrived Sep 1 2026) is picked up on its
    # own instead of quietly reading as "not in the menu".
    PRETTY = {'MAPS': 'Maps and Diagrams', 'LISTS': 'Lists tabs',
              'CAL': 'Calendar tabs', 'TRAVEL': 'Travel tabs'}
    for nm in re.findall(r'window\.([A-Z0-9_]+)_NAV\s*=', nc):
        gname = PRETTY.get(nm, nm.replace('_', ' ').title() + ' tabs')
        for m in re.finditer(r'"label"\s*:\s*"(.*?)"\s*,\s*"href"\s*:\s*"([^"]+)"', block(nm + '_NAV')):
            rows.append((gname, label(m.group(1)), m.group(2)))
    for m in re.finditer(r'"([^"]+)"\s*:\s*"([^"]+\.html)"', block('NAV_GROUP_LINKS')):
        rows.append(('Section landing', m.group(1), m.group(2)))
    for grp, _lab, href in rows:
        b = href.split('#')[0]
        if b and b not in owner: owner[b] = grp
    return rows, owner

def crawl(repo):
    files = sorted(f for f in os.listdir(repo) if f.endswith('.html'))
    ex = set(files)
    edges, info = [], {}
    for f in files:
        h = open(os.path.join(repo, f), encoding='utf-8', errors='replace').read()
        body = strip_nav(h)
        scripts = re.findall(r'<script\b[^>]*>(.*?)</script>', body, re.S)
        markup = re.sub(r'<style\b[^>]*>.*?</style>', ' ',
                 re.sub(r'<script\b[^>]*>.*?</script>', ' ', body, flags=re.S), flags=re.S)
        seen = set()
        for href in HREF_RE.findall(markup):
            href = href.strip()
            if href.startswith(('http', 'mailto:', 'tel:', '#', 'javascript:', 'data:')): continue
            t = href.split('?')[0]
            if not t.endswith('.html') and '.html#' not in t: continue
            b = t.split('#')[0]
            if b in seen or b == f: continue
            seen.add(b); edges.append((f, b))
        for t in JSHREF_RE.findall('\n'.join(scripts)):
            b = t.split('#')[0]
            if b in seen or b == f: continue
            seen.add(b); edges.append((f, b))
        mv = re.search(r'class="ver"[^>]*>\s*(v[\d.]+)', h) or re.search(r'PY_VERSION\s*=\s*["\'](v?[\d.]+)', h)
        mt = re.search(r'<title>(.*?)</title>', h, re.S)
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', h, re.S)
        title = label(h1.group(1)) if h1 else (re.sub(r'\s*&middot;.*$', '', mt.group(1)).strip() if mt else f)
        info[f] = dict(t=re.sub(r'\s+', ' ', _html.unescape(title)).strip()[:64],
                       v=mv.group(1) if mv else None,
                       kb=round(os.path.getsize(os.path.join(repo, f)) / 1024))
    return files, ex, edges, info

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--repo', required=True)
    ap.add_argument('--pages-list', required=True)
    ap.add_argument('--trackers', required=True)
    ap.add_argument('--out', default='data.json')
    ap.add_argument('--built', default=None, help='display stamp, e.g. "Sep 1, 2026 at 4:10am Eastern"')
    a = ap.parse_args()

    files, ex, edges, info = crawl(a.repo)
    navrows, owner = read_nav(a.repo)
    in_pages = set(open(a.pages_list).read().split())
    trackers = json.load(open(a.trackers))

    out = collections.defaultdict(set); inb = collections.defaultdict(set)
    for s, d in edges:
        if d in ex and s not in MAP_PAGES: out[s].add(d); inb[d].add(s)

    live = [f for f in files if not ARCHIVE_RE.match(f)]
    inmenu = {f: (f in owner) for f in files}
    base_owner = dict(owner)
    grp = {}
    for f in files:
        if ARCHIVE_RE.match(f): grp[f] = 'Session records'; continue
        if f in base_owner: grp[f] = base_owner[f]; continue
        srcs = [s for s in inb[f] if s in base_owner and not ARCHIVE_RE.match(s)]
        grp[f] = collections.Counter(base_owner[s] for s in srcs).most_common(1)[0][0] if srcs else 'Not in the menu'

    seen = {'index.html'}; stack = ['index.html']; depth = {'index.html': 0}
    for f in files:
        if inmenu[f] and f not in seen: seen.add(f); depth[f] = 1; stack.append(f)
    i = 0
    while i < len(stack):
        n = stack[i]; i += 1
        for t in sorted(out[n]):
            if t not in seen: seen.add(t); depth[t] = depth[n] + 1; stack.append(t)

    pages = {f: dict(f=f, t=info[f]['t'], v=info[f]['v'], kb=info[f]['kb'], grp=grp[f],
                     inmenu=inmenu[f], arch=bool(ARCHIVE_RE.match(f)),
                     norow=f not in in_pages, out=sorted(out[f]))
             for f in files}

    dead = [t for t in trackers if t not in ex]
    unlisted = [f for f in files if f.startswith('session-tracker-2026') and f not in trackers]
    orphans = [f for f in live if f not in depth]
    arch_orph = [f for f in files if ARCHIVE_RE.match(f) and not inb[f] and f not in trackers]
    norow = sorted(f for f in files if f not in in_pages)

    data = dict(built=a.built or '', pages=pages, navrows=navrows,
                order=["To Do List", "Calendar", "Calendar tabs", "Habit Modules", "Quantified Self",
                       "Lists (top bar)", "Lists tabs", "Editors", "Operating System",
                       "Maps and Diagrams", "Section landing"],
                orphans=orphans, dead_trackers=dead, unlisted_tracker=unlisted,
                arch_orphans=arch_orph, no_row=norow,
                n_total=len(files), n_live=len(live), n_arch=len(files) - len(live),
                n_dead=len(dead), n_orph_live=len(orphans), n_orph_arch=len(arch_orph),
                n_norow=len(norow), n_trk=len(trackers),
                menu_count=sum(1 for f in files if inmenu[f]),
                reach_nav=len([f for f in live if f in depth]),
                maxdepth=max([depth[f] for f in live if f in depth] or [0]),
                edges=sum(len(v) for v in out.values()))
    json.dump(data, open(a.out, 'w'), separators=(',', ':'))
    print(json.dumps({k: v for k, v in data.items() if isinstance(v, int)}, indent=1))
    print("wrote", a.out, os.path.getsize(a.out), "bytes")

if __name__ == '__main__':
    main()
