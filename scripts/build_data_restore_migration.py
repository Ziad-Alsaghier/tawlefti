from pathlib import Path
import re

BACKUP_PATH = Path(
    "database/latestversion/db_cluster-16-10-2025@08-30-52.backup/"
    "db_cluster-16-10-2025@08-30-52.backup"
)
MIGRATION_PATH = Path("supabase/migrations/20260620154314_restore_client_and_user_data.sql")

AUTH_TABLES = [
    "users",
    "identities",
    "mfa_factors",
    "sessions",
    "refresh_tokens",
    "one_time_tokens",
    "sso_providers",
    "sso_domains",
]

PUBLIC_TABLES = [
    "additives",
    "banned_phones",
    "blend_compositions",
    "blends",
    "carts",
    "coffee_types",
    "customer_loyalty",
    "discount_codes",
    "expense_categories",
    "fixed_expenses",
    "loyalty_log",
    "method_status",
    "notification_templates",
    "notifications",
    "orders",
    "profiles",
    "purchases",
    "push_subscriptions",
    "reviews",
    "roastery_payouts",
    "roasting_sessions",
    "salaries",
    "salary_payments",
    "site_content",
    "store_settings",
    "subscription_plans",
    "subscriptions",
    "suppliers",
    "transactions",
    "wishlist",
]


def extract_copy_block(lines: list[str], schema: str, table: str) -> tuple[str, list[str]]:
    prefix = f"COPY {schema}.{table} "
    start = None
    for i, line in enumerate(lines):
        if line.startswith(prefix) and line.rstrip().endswith("FROM stdin;"):
            start = i
            break
    if start is None:
        raise ValueError(f"Missing COPY block for {schema}.{table}")

    header = lines[start]
    rows: list[str] = []
    i = start + 1
    while i < len(lines):
        if lines[i].strip() == r"\.":
            break
        rows.append(lines[i])
        i += 1
    return header, rows


def extract_setval_lines(lines: list[str]) -> list[str]:
    out: list[str] = []
    for line in lines:
        if line.startswith("SELECT pg_catalog.setval("):
            if "'public." in line:
                out.append(line)
    return out


def sql_literal(raw: str) -> str:
    if raw == r"\N":
        return "NULL"
    escaped = raw.replace("\\", "\\\\").replace("'", "''")
    return f"'{escaped}'"


def copy_to_insert(schema: str, table: str, header: str, rows: list[str], batch_size: int = 200) -> list[str]:
    m = re.match(rf"^COPY {schema}\.{table} \((.+)\) FROM stdin;$", header)
    if not m:
        raise ValueError(f"Invalid COPY header for {schema}.{table}")
    columns = m.group(1)

    out: list[str] = []
    if not rows:
        return out

    value_rows: list[str] = []
    for row in rows:
        cols = row.split("\t")
        values = ", ".join(sql_literal(c) for c in cols)
        value_rows.append(f"({values})")

    for i in range(0, len(value_rows), batch_size):
        chunk = value_rows[i : i + batch_size]
        out.append(f"INSERT INTO {schema}.{table} ({columns}) VALUES")
        out.append(",\n".join(chunk) + ";")
        out.append("")
    return out


def main() -> None:
    text = BACKUP_PATH.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()

    sql: list[str] = [
        "-- Restore full client and user data from legacy backup.",
        "-- Schema/design remains unchanged; this restores data only.",
        "",
        "BEGIN;",
        "",
        "SET session_replication_role = replica;",
        "",
        "TRUNCATE TABLE",
        "  auth.identities,",
        "  auth.mfa_factors,",
        "  auth.sessions,",
        "  auth.refresh_tokens,",
        "  auth.one_time_tokens,",
        "  auth.sso_domains,",
        "  auth.sso_providers,",
        "  auth.users",
        "CASCADE;",
        "",
        "TRUNCATE TABLE",
    ]

    for idx, table in enumerate(PUBLIC_TABLES):
        comma = "," if idx < len(PUBLIC_TABLES) - 1 else ""
        sql.append(f"  public.{table}{comma}")
    sql += [
        "RESTART IDENTITY CASCADE;",
        "",
    ]

    for table in AUTH_TABLES:
        header, rows = extract_copy_block(lines, "auth", table)
        sql.extend(copy_to_insert("auth", table, header, rows))
        sql.append("")

    for table in PUBLIC_TABLES:
        header, rows = extract_copy_block(lines, "public", table)
        sql.extend(copy_to_insert("public", table, header, rows))
        sql.append("")

    sql.extend(extract_setval_lines(lines))
    sql += [
        "",
        "SET session_replication_role = origin;",
        "",
        "COMMIT;",
        "",
    ]

    MIGRATION_PATH.write_text("\n".join(sql), encoding="utf-8")
    print(f"Wrote {MIGRATION_PATH}")


if __name__ == "__main__":
    main()
