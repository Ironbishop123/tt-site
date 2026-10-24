"""drops.json calendar gate (spec v0.7 §3). Usage: drops_check.py drops.json [--publish]"""
import json,sys
from datetime import datetime,timedelta,timezone,date,time
from zoneinfo import ZoneInfo
TZ=ZoneInfo("America/Chicago"); U=timezone.utc
def dst_day(d):  # generated from zone rules, not a typed list
    a=datetime.combine(d,time(),TZ).astimezone(U); b=datetime.combine(d+timedelta(1),time(),TZ).astimezone(U)
    return (b-a).total_seconds()!=86400
def P(x): return datetime.fromisoformat(x)
def check(r,publish=False):
    e=[]
    for k,s,t in (("LIVE","starts_at","ends_at"),("LAST CHANCE","last_chance_starts_at","last_chance_ends_at")):
        a,b=P(r[s]),P(r[t])
        if a.astimezone(TZ).utcoffset()!=a.utcoffset(): e.append(f"{k}: {s} offset wrong for zone")
        if b.astimezone(TZ).utcoffset()!=b.utcoffset(): e.append(f"{k}: {t} offset wrong for zone")
        al,bl=a.astimezone(TZ),b.astimezone(TZ)
        if al.time()!=time(0,0,0) or bl.time()!=time(23,59,59) or al.date()!=bl.date(): e.append(f"{k}: not one local 00:00:00-23:59:59 day")
        if ((b+timedelta(seconds=1)).astimezone(U)-a.astimezone(U)).total_seconds()!=86400: e.append(f"{k}: not 86400 s in UTC")
        if dst_day(al.date()): e.append(f"{k}: {al.date()} is a DST-change day")
    if (P(r["ends_at"])+timedelta(seconds=1)).astimezone(U)!=P(r["last_chance_starts_at"]).astimezone(U): e.append("LAST CHANCE does not start at ends_at+1s")
    if publish and any(r[p] is None for p in ("live_price","last_chance_price","vault_price")): e.append("null price blocks publish")
    return e
if __name__=="__main__":
    bad=0
    for r in json.load(open(sys.argv[1]))["drops"]:
        er=check(r,"--publish" in sys.argv); print(r["id"],"OK" if not er else er); bad+=bool(er)
    sys.exit(1 if bad else 0)
