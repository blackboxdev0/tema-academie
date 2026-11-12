#!/usr/bin/env python3
"""Read the approved private workbook; emit an editor-only import outside the repo."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[2]
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def extract(source, expected_digest):
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    if digest != expected_digest:
        raise ValueError("Workbook differs from approved snapshot; review the source first")
    with zipfile.ZipFile(source) as archive:
        strings = ["".join(item.itertext()) for item in ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("s:si", NS)]
        rows = {}
        for row in ET.fromstring(archive.read("xl/worksheets/sheet1.xml")).findall(".//s:row", NS):
            values = {}
            for cell in row:
                value = cell.find("s:v", NS)
                if value is not None:
                    values[re.sub(r"\d", "", cell.attrib["r"])] = strings[int(value.text)] if cell.attrib.get("t") == "s" else value.text
            rows[int(row.attrib["r"])] = values
    records = []
    for number in [*range(6, 24), *range(28, 34)]:
        row = rows[number]
        price = re.fullmatch(r"À partir de\s+(\d+(?:[.,]\d+)?)\s*\$", row.get("E", "").strip())
        if not price or not row.get("A", "").strip():
            raise ValueError("Source row is not recognized: " + str(number))
        record = dict(zip(["titre", "prerequis", "contenu", "duree", "resultat", "formateurs"], [row.get(c, "").strip() for c in "ABCDFG"]))
        record.update(source_key=f"Sheet1!A{number}:I{number}", logiciel="DIV" if number < 24 else "DIMO" if number < 32 else "MOOV", description="", prix=float(price[1].replace(",", ".")), prix_qualificatif="À partir de", places_par_defaut=int(float(row["H"])), source_date=row.get("I", "").strip())
        records.append(record)
    return {"source_id": "tema-catalogue-pre-lancement-v1", "source_sha256": digest, "records": records}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    destination = args.output.expanduser().resolve()
    if destination == ROOT or ROOT in destination.parents:
        raise ValueError("Private import must stay outside the public repository")
    config = json.loads((ROOT / "config/project.json").read_text())["catalogue_source"]
    manifest = extract(Path(config["private_snapshot_path"]), config["sha256"])
    destination.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(destination, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w") as output:
        json.dump(manifest, output, ensure_ascii=False)
    print(json.dumps({"formations": len(manifest["records"]), "software_counts": {key: sum(r["logiciel"] == key for r in manifest["records"]) for key in ["DIV", "DIMO", "MOOV"]}, "private_output": str(destination), "source_sha256": manifest["source_sha256"]}))


if __name__ == "__main__":
    main()
