const NZ_TIME_ZONE = "Pacific/Auckland";

const nzDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: NZ_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function getPart(parts, type) {
  const part = parts.find((entry) => entry.type === type);
  return part ? part.value : "";
}

// Format a Date into SQLite-friendly "YYYY-MM-DD HH:MM:SS" in NZ time.
export function formatNzSqlite(date = new Date()) {
  const parts = nzDateTimeFormatter.formatToParts(date);
  let hour = getPart(parts, "hour");
  if (hour === "24") hour = "00";
  return `${getPart(parts, "year")}-${getPart(parts, "month")}-${getPart(
    parts,
    "day"
  )} ${hour}:${getPart(parts, "minute")}:${getPart(parts, "second")}`;
}

// Current NZ time formatted for SQLite comparisons/inserts.
export function nowNzSqlite() {
  return formatNzSqlite(new Date());
}
