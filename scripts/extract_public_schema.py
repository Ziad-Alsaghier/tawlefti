"""Extract public schema DDL from cluster backup for 0000_init.sql baseline."""
from __future__ import annotations

import re
from pathlib import Path

BACKUP = Path(
    "database/latestversion/db_cluster-16-10-2025@08-30-52.backup/"
    "db_cluster-16-10-2025@08-30-52.backup"
)
OUTPUT = Path("supabase/migrations/0000_init.sql")

# Order DDL blocks so dependencies resolve on a fresh database.
TYPE_ORDER = {
    "TABLE": 20,
    "COMMENT": 25,
    "SEQUENCE": 28,
    "CONSTRAINT": 30,
    "FK CONSTRAINT": 40,
    "FUNCTION": 50,
    "VIEW": 60,
    "TRIGGER": 70,
    "ROW SECURITY": 80,
    "POLICY": 90,
}

SKIP_TYPES = {"TABLE DATA", "SEQUENCE SET", "ACL", "DEFAULT ACL"}
ANY_HEADER_RE = re.compile(r"^-- Name: .+; Type: .+; Schema: .+; Owner: .+$")
PUBLIC_HEADER_RE = re.compile(
    r"^-- Name: (.+); Type: ([^;]+); Schema: public; Owner: .+$"
)


def parse_blocks(text: str) -> list[tuple[str, str, str]]:
    lines = text.splitlines()
    blocks: list[tuple[str, str, str]] = []
    i = 0
    while i < len(lines):
        m = PUBLIC_HEADER_RE.match(lines[i])
        if not m:
            i += 1
            continue
        name, obj_type = m.group(1), m.group(2).strip()
        if obj_type in SKIP_TYPES:
            i += 1
            continue
        i += 1
        if i < len(lines) and lines[i].strip() == "--":
            i += 1
        body: list[str] = []
        while i < len(lines):
            if ANY_HEADER_RE.match(lines[i]):
                break
            if lines[i].startswith("COPY public."):
                while i < len(lines) and lines[i].strip() != r"\.":
                    i += 1
                if i < len(lines):
                    i += 1
                continue
            body.append(lines[i])
            i += 1
        sql = "\n".join(body).strip()
        if sql:
            blocks.append((obj_type, name, sql))
    return blocks


def auth_user_trigger(text: str) -> str | None:
    marker = (
        "-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; "
        "Owner: supabase_auth_admin"
    )
    idx = text.find(marker)
    if idx == -1:
        return None
    chunk = text[idx:].splitlines()
    sql_lines: list[str] = []
    started = False
    for line in chunk[2:]:
        if line.startswith("-- Name:"):
            break
        if line.strip().startswith("CREATE TRIGGER"):
            started = True
        if started:
            sql_lines.append(line)
    sql = "\n".join(sql_lines).strip()
    return sql or None


def main() -> None:
    text = BACKUP.read_text(encoding="utf-8", errors="replace")
    blocks = parse_blocks(text)
    blocks.sort(key=lambda b: (TYPE_ORDER.get(b[0], 999), b[1]))

    parts = [
        "-- Baseline public schema extracted from database backup (2025-10-16).",
        "-- Preserves existing design; historical migrations are archived under supabase/migrations_legacy/.",
        "",
    ]

    for obj_type, _name, sql in blocks:
        parts.append(sql)
        parts.append("")

    trigger = auth_user_trigger(text)
    if trigger:
        parts.append("-- Auth trigger required for profile creation on signup")
        parts.append(trigger)
        parts.append("")

    OUTPUT.write_text("\n".join(parts), encoding="utf-8")
    print(f"Wrote {OUTPUT} ({len(blocks)} public objects)")


if __name__ == "__main__":
    main()
