#!/usr/bin/env python3
"""
Simple local job runner for development.
It reads projects/jobs/*.json and claims due queued jobs.
Production should use a real queue such as Redis/BullMQ or a managed queue.
"""
import json,time,sys
from pathlib import Path
ROOT=Path("projects/jobs")

def run_once():
    ROOT.mkdir(parents=True,exist_ok=True)
    now=time.time()
    for p in sorted(ROOT.glob("*.json")):
        try: job=json.loads(p.read_text())
        except: continue
        if job.get("status")!="queued": continue
        run_at=job.get("runAt")
        if run_at:
            try:
                from datetime import datetime
                if datetime.fromisoformat(run_at.replace("Z","+00:00")).timestamp()>now: continue
            except: pass
        job["status"]="awaiting_worker"
        job["claimedAt"]=datetime_now()
        p.write_text(json.dumps(job,indent=2))
        print("Claimed",job["id"],job["type"])
        return True
    return False

def datetime_now():
    from datetime import datetime,timezone
    return datetime.now(timezone.utc).isoformat()

if __name__=="__main__":
    once="--once" in sys.argv
    while True:
        run_once()
        if once: break
        time.sleep(15)
