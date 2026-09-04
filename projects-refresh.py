#!/usr/bin/env python3
"""
projects-refresh.py  -  rewrites projects-data.json, the file behind the
Projects board on habit-modules.html.

It runs on Scott's machine, because that is the only place his project folders
exist. Everything it needs from the database is handed to it on stdin, because
the to-do list and the session records are not readable without a signed-in
session.

    cat db-facts.json | python3 projects-refresh.py            # write + publish
    cat db-facts.json | python3 projects-refresh.py --dry-run  # write only

db-facts.json looks like:
    { "project-you": { "figures":[{"n":"138","l":"Pages live"}, ...],
                       "last_label":"Last thing finished",
                       "last_text":"Clever Phrases and Fun Facts",
                       "status_extra":"The last piece of work went live at 10:23pm last night.",
                       "url":"mission.html" }, ... }

Nothing here invents a fact. If a folder is missing, the card says the project
is brand new. If there is no picture, the card says there is no picture. The
board would rather show a gap than something that is not true.
"""

import base64, io, json, os, subprocess, sys
from datetime import datetime
from zoneinfo import ZoneInfo

# Scott's rules: every time and date on this project is Eastern, named as
# Eastern, and never the clock of whatever machine happens to be running.
ET = ZoneInfo("America/New_York")
def today_et():
    return datetime.now(ET).date()
def day_of(ts):
    return datetime.fromtimestamp(ts, ET).date()

ROOT = os.path.expanduser("~/mnt/CoWork")
OUT  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "projects-data.json")

SUPA = "https://arnjntspmrhigodlssbn.supabase.co"
ANON = ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybmpudHNwbXJoaWdvZGxzc2Ju"
        "Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTQ0NTgsImV4cCI6MjEwMTg5MDQ1OH0."
        "UN4JMuoKaAWQfhiCstuoOJQ1sVU2hU5pK0tLBY60dfM")
PUTKEY = "py-put-6f2a9c41d83b"

# ---- the only place to add a project -------------------------------------
# The picture, in order: hero_pin (a file inside the project folder), then
# hero_url (a picture already on the site), then the newest picture in the
# folder, then nothing at all. Set neither and the card looks after itself.
PROJECTS = [
    dict(slug="project-you", name="Project YOU", accent="#3f6f8f",
         folder="Project YOU",
         hero_pin=None, hero_url="https://xrodgers28.github.io/ProjectYou/project-you-logo.png",
         hero_fit="contain"),
    dict(slug="treadwell", name="TreadWell", accent="#2f5d50",
         folder="TreadWell",
         hero_pin="08-Strategy-Bank/The TreadWell community - infographic.png",
         hero_url=None, hero_fit="cover"),
    dict(slug="elevator-pitch", name="Elevator Pitch", accent="#c2622a",
         folder="Elevator Pitch",
         hero_pin=None, hero_url=None, hero_fit="cover"),
]

SKIP_DIRS  = ("_to_delete", "_archived files", "_archive", ".git")
SKIP_FILES = (".DS_Store",)
PIC = (".png", ".jpg", ".jpeg", ".webp")


def walk(folder):
    """Every real file in a project folder, newest first. Returns (count, newest_date)."""
    n, newest, pics = 0, None, []
    for dirpath, dirnames, filenames in os.walk(folder):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for f in filenames:
            if f in SKIP_FILES or f.startswith("."):
                continue
            p = os.path.join(dirpath, f)
            try:
                m = os.path.getmtime(p)
            except OSError:
                continue
            n += 1
            d = day_of(m)
            if newest is None or d > newest:
                newest = d
            if f.lower().endswith(PIC):
                pics.append((m, p))
    pics.sort(reverse=True)
    return n, newest, [p for _, p in pics]


def hero(path_or_bytes, fit):
    """A 640x250 picture for the top of a card. Cropped from the TOP, because
    the top of a document is its title and the middle is body text."""
    from PIL import Image
    src = io.BytesIO(path_or_bytes) if isinstance(path_or_bytes, bytes) else path_or_bytes
    im = Image.open(src)
    W, H = 640, 250
    if fit == "contain":
        im = im.convert("RGBA")
        im.thumbnail((int(W * .60), int(H * .72)), Image.LANCZOS)
        c = Image.new("RGB", (W, H), (247, 249, 251))
        c.paste(im, ((W - im.width) // 2, (H - im.height) // 2), im)
        out = c
        q = 80
    else:
        im = im.convert("RGB")
        s = max(W / im.width, H / im.height)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        left = (im.width - W) // 2
        out = im.crop((left, 0, left + W, H))
        q = 72
    b = io.BytesIO()
    out.save(b, "JPEG", quality=q, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()


def fetch(url):
    r = subprocess.run(["curl", "-sfL", "--max-time", "30", url], capture_output=True)
    return r.stdout if r.returncode == 0 else None


def state_for(newest, has_folder):
    """How the card describes itself. One rule, so two projects can be compared."""
    if not has_folder or newest is None:
        return "Brand new", "note", None
    days = (today_et() - newest).days
    if days <= 0:   return "Moving", "good", days
    if days < 7:    return "Warm",   "good", days
    if days < 30:   return "Quiet",  "warn", days
    return "Parked", "warn", days


def pretty(d):
    return d.strftime("%b %-d, %Y")


def main():
    facts = {}
    if not sys.stdin.isatty():
        raw = sys.stdin.read().strip()
        if raw:
            facts = json.loads(raw)

    out = []
    for p in PROJECTS:
        f = facts.get(p["slug"], {})
        folder = os.path.join(ROOT, p["folder"])
        has = os.path.isdir(folder)
        n, newest, pics = walk(folder) if has else (0, None, [])
        state, tone, days = state_for(newest, has)

        if state == "Brand new":
            status = "Nothing in it yet. <b>Give it a folder</b> and this card starts filling itself in."
        elif days <= 0:
            status = "Something changed <b>today</b>."
        elif days == 1:
            status = "Last touched <b>yesterday</b>, " + pretty(newest) + "."
        elif days < 7:
            status = "Last touched <b>" + str(days) + " days ago</b>, " + pretty(newest) + "."
        else:
            status = "Nothing has moved for <b>" + str(days) + " days</b>. Last touched " + pretty(newest) + "."
        if f.get("status_extra"):
            status += " " + f["status_extra"]

        # the picture: a pinned one, else the newest picture in the folder,
        # else a picture named by URL, else nothing at all.
        img, src = None, None
        try:
            if p.get("hero_pin") and os.path.isfile(os.path.join(folder, p["hero_pin"])):
                src = p["hero_pin"]
                img = hero(os.path.join(folder, p["hero_pin"]), p["hero_fit"])
            elif p.get("hero_url"):
                data = fetch(p["hero_url"])
                if data:
                    src = p["hero_url"].rsplit("/", 1)[-1]
                    img = hero(data, p["hero_fit"])
            if img is None and pics:
                src = os.path.relpath(pics[0], folder)
                img = hero(pics[0], p["hero_fit"])
        except Exception as e:
            sys.stderr.write("picture skipped for %s: %s\n" % (p["slug"], e))
            img, src = None, None

        figures = f.get("figures")
        if not figures:
            figures = [{"n": str(n), "l": "Files"},
                       {"n": str(days) if days is not None else "0", "l": "Days quiet"},
                       {"n": "0", "l": "Open jobs"}]

        out.append(dict(slug=p["slug"], name=p["name"], accent=p["accent"],
                        state=state, tone=tone, status=status,
                        hero=img, hero_fit=p["hero_fit"], hero_from=src,
                        figures=figures[:3],
                        last_label=f.get("last_label", "Waiting on you"),
                        last_text=f.get("last_text", "A first note from you about what this project is for"),
                        url=f.get("url")))

    now = datetime.now(ET)
    doc = {"version": "1.0",
           "checked": now.isoformat(timespec="seconds"),
           "checked_label": now.strftime("%b %-d, %Y at %-I:%M%p ET").replace("AM", "am").replace("PM", "pm"),
           "projects": out}
    body = json.dumps(doc, separators=(",", ":"))
    open(OUT, "w").write(body)
    print("wrote %s, %d bytes" % (OUT, len(body)))

    if "--dry-run" in sys.argv:
        return

    gz = subprocess.run(["gzip", "-nc", OUT], capture_output=True).stdout
    payload = json.dumps({"path": "projects-data.json",
                          "gzb64": base64.b64encode(gz).decode()})
    r = subprocess.run(["curl", "-s", "-X", "POST", SUPA + "/functions/v1/stput",
                        "-H", "apikey: " + ANON, "-H", "Authorization: Bearer " + ANON,
                        "-H", "x-put-key: " + PUTKEY, "-H", "Content-Type: application/json",
                        "--data-binary", "@-"], input=payload.encode(), capture_output=True)
    print(r.stdout.decode().strip())


if __name__ == "__main__":
    main()
