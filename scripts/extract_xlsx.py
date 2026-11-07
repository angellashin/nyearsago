#!/usr/bin/env python3
"""Read-only workbook importer; standard library only."""
import collections
import datetime as dt
import glob
import json
import re
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

MONTHS = [11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
OUT = Path("data/events.js")


def column_index(ref):
    value = 0
    for c in re.match(r"[A-Z]+", ref).group():
        value = value * 26 + ord(c) - 64
    return value


def workbook_text(zipf):
    shared = []
    if "xl/sharedStrings.xml" in zipf.namelist():
        root = ET.fromstring(zipf.read("xl/sharedStrings.xml"))
        shared = ["".join(t.text or "" for t in item.iter(NS + "t")) for item in root]
    return shared


def worksheet_rows(zipf, sheet_num, shared):
    root = ET.fromstring(zipf.read(f"xl/worksheets/sheet{sheet_num}.xml"))
    for row in root.findall(".//" + NS + "sheetData/" + NS + "row"):
        values = {"_row": row.attrib.get("r", "")}
        for cell in row.findall(NS + "c"):
            val = cell.find(NS + "v")
            inline = cell.find(NS + "is")
            if cell.attrib.get("t") == "s" and val is not None:
                text = shared[int(val.text)]
            elif val is not None:
                text = val.text or ""
            elif inline is not None:
                text = "".join(t.text or "" for t in inline.iter(NS + "t"))
            else:
                text = ""
            values[re.match(r"[A-Z]+", cell.attrib["r"]).group()] = text
        yield values


def parse_month_day(value):
    match = re.fullmatch(r"(\d{1,2})월\s*(\d{1,2})일", value.strip())
    if match:
        return int(match.group(1)), int(match.group(2))
    match = re.fullmatch(r"2000-(\d\d)-(\d\d)T.*", value)
    if match:
        return int(match.group(1)), int(match.group(2))
    return None


def parse_event(raw):
    first, _, rest = raw.partition("\n")
    match = re.match(r"(?:(\d{1,4})년\s*[:：|]\s*)?(.*)", first.strip())
    year = int(match.group(1)) if match and match.group(1) else None
    title = (match.group(2) if match else first).strip()
    summary = rest.strip()
    return year, title, summary


def category(text):
    t = text.lower()
    groups = [
        ("과학·기술", ["과학", "기술", "발명", "우주", "컴퓨터", "인터넷", "비행", "원자", "의학", "ai"]),
        ("문화·예술", ["영화", "음악", "미술", "책", "잡지", "방송", "예술", "문화", "소설"]),
        ("스포츠", ["월드컵", "올림픽", "경기", "선수", "야구", "축구", "스포츠"]),
        ("정치·사회", ["대통령", "선거", "조약", "전쟁", "독립", "혁명", "운동", "법", "창설"]),
    ]
    for label, words in groups:
        if any(word in t for word in words):
            return label
    return "역사"


def main():
    files = glob.glob("*.xlsx")
    if len(files) != 1:
        raise SystemExit(f"Expected one source workbook, found {len(files)}")
    events = []
    by_date = collections.defaultdict(list)
    with zipfile.ZipFile(files[0]) as zipf:
        shared = workbook_text(zipf)
        for sheet_num, month in enumerate(MONTHS, 1):
            for row in worksheet_rows(zipf, sheet_num, shared):
                parsed = parse_month_day(row.get("A", ""))
                if not parsed or parsed[0] != month:
                    continue
                day = parsed[1]
                for col, raw in row.items():
                    if col.startswith("_"):
                        continue
                    idx = column_index(col)
                    if idx < 2 or idx % 2 or not raw.strip():
                        continue
                    grade = row.get(_column_letter(idx + 1), "")
                    if grade not in {"1", "2", "3", "4", "5"}:
                        continue
                    year, title, summary = parse_event(raw)
                    event = {
                        "id": f"{month:02d}-{day:02d}-{len(by_date[(month, day)]) + 1:02d}",
                        "month": month,
                        "day": day,
                        "year": year,
                        "title": title,
                        "summary": summary,
                        "grade": int(grade),
                        "category": category(title + " " + summary),
                        "sourceSheet": f"{month}월",
                        "sourceCell": f"{col}{row['_row']}",
                        "verification": "candidate",
                    }
                    by_date[(month, day)].append(event)
                    events.append(event)
    days = set(by_date)
    expected = {(m, d) for m in range(1, 13) for d in range(1, (30 if m == 2 else 31 if m in (4, 6, 9, 11) else 32))}
    expected.add((2, 29))
    if days != expected:
        raise SystemExit(f"Date coverage mismatch: expected 366, got {len(days)}")
    dates = []
    for month in range(1, 13):
        limit = 29 if month == 2 else 30 if month in (4, 6, 9, 11) else 31
        for day in range(1, limit + 1):
            options = by_date[(month, day)]
            top = sorted(options, key=lambda e: (-e["grade"], e["id"]))[0]
            dates.append({"month": month, "day": day, "events": options, "featuredId": top["id"]})
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text("window.EVENT_DATA = " + json.dumps({"dates": dates, "events": events}, ensure_ascii=False) + ";\n", encoding="utf-8")
    print(f"Imported {len(events)} candidates across {len(dates)} dates to {OUT}")


def _column_letter(index):
    result = ""
    while index:
        index, rem = divmod(index - 1, 26)
        result = chr(65 + rem) + result
    return result


if __name__ == "__main__":
    main()
