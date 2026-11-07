#!/usr/bin/env python3
import json
import re
from pathlib import Path

text = Path("data/events.js").read_text(encoding="utf-8")
payload = json.loads(re.sub(r"^window\.EVENT_DATA\s*=\s*|;\s*$", "", text))
dates, events = payload["dates"], payload["events"]
assert len(dates) == 366, f"expected 366 dates, got {len(dates)}"
assert len(events) == 3937, f"expected 3937 event candidates, got {len(events)}"
assert len({(d["month"], d["day"]) for d in dates}) == 366
assert all(d["events"] and d["featuredId"] in {e["id"] for e in d["events"]} for d in dates)
assert all(1 <= e["grade"] <= 5 and e["title"] for e in events)
assert all(e["verification"] == "candidate" for e in events)
print(f"PASS: {len(events)} unverified candidates / {len(dates)} calendar dates; leap day present")
