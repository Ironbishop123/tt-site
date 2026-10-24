"""drops.json calendar + price gate (spec v0.7.4 §3).
Usage: drops_check.py drops.json [--publish] [--features path]   (default features: ../data/features.json next to this tool)
Flags: last_chance (default OFF). With it OFF, any last_chance_* field or a "last_chance" status is rejected."""
import json,sys,os
from datetime import datetime,timedelta,timezone,time
from zoneinfo import ZoneInfo
TZ=ZoneInfo("America/Chicago"); U=timezone.utc
LC=("last_chance_starts_at","last_chance_ends_at","last_chance_price")
def dst_day(d):  # generated from zone rules, not a typed list
    a=datetime.combine(d,time(),TZ).astimezone(U); b=datetime.combine(d+timedelta(1),time(),TZ).astimezone(U)
    return (b-a).total_seconds()!=86400
def P(x): return datetime.fromisoformat(x)
def load_features(path=None):
    path=path or os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","data","features.json")
    f=json.load(open(path)); return {"last_chance": f.get("last_chance") is True}
def day(e,k,s,t,r):
    a,b=P(r[s]),P(r[t])
    if a.astimezone(TZ).utcoffset()!=a.utcoffset(): e.append(f"{k}: {s} offset wrong for zone")
    if b.astimezone(TZ).utcoffset()!=b.utcoffset(): e.append(f"{k}: {t} offset wrong for zone")
    al,bl=a.astimezone(TZ),b.astimezone(TZ)
    if al.time()!=time(0,0,0) or bl.time()!=time(23,59,59) or al.date()!=bl.date(): e.append(f"{k}: not one local 00:00:00-23:59:59 day")
    if ((b+timedelta(seconds=1)).astimezone(U)-a.astimezone(U)).total_seconds()!=86400: e.append(f"{k}: not 86400 s in UTC")
    if dst_day(al.date()): e.append(f"{k}: {al.date()} is a DST-change day")
def check(r,publish=False,features=None):
    features=features or {"last_chance":False}; e=[]
    lc_used=[k for k in LC if k in r]
    if r.get("status_override")=="last_chance" or r.get("status")=="last_chance": lc_used.append("status=last_chance")
    prices=["live_price","vault_price"]
    if not features["last_chance"]:
        if lc_used: e.append(f"last_chance flag OFF but used: {lc_used}")
    else:
        miss=[k for k in LC if k not in r]
        if miss: e.append(f"last_chance flag ON, missing {miss}")
        prices.append("last_chance_price")
    for p in prices:
        if p not in r: e.append(f"missing {p}")
    if any(k not in r for k in ("starts_at","ends_at")): return e+["missing starts_at/ends_at"]
    day(e,"LIVE","starts_at","ends_at",r)
    if features["last_chance"] and all(k in r for k in LC[:2]):
        day(e,"LAST CHANCE","last_chance_starts_at","last_chance_ends_at",r)
        if (P(r["ends_at"])+timedelta(seconds=1)).astimezone(U)!=P(r["last_chance_starts_at"]).astimezone(U): e.append("LAST CHANCE does not start at ends_at+1s")
    if publish and any(r.get(p) is None for p in prices if p in r): e.append("null price blocks publish")
    return e
if __name__=="__main__":
    a=sys.argv[1:]; fp=None
    if "--features" in a: fp=a[a.index("--features")+1]
    F=load_features(fp); print("features:",F)
    bad=0
    for r in json.load(open(a[0]))["drops"]:
        er=check(r,"--publish" in a,F); print(r.get("id"),"OK" if not er else er); bad+=bool(er)
    sys.exit(1 if bad else 0)
