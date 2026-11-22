/** Short zone name for a date, e.g. GMT in winter and BST in summer. */
export function zoneName(date: Date, timeZone = "Europe/London") {
  return (
    new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "short" })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? "UK time"
  );
}
