/**
 * Platform-wide prototype switches shared by the dashboard and public page.
 * While demoMode is true, wording stays honest that data is sample data and
 * nothing is sent. Turn it off once real availability and email are connected.
 */
export const platform = {
  demoMode: true,
  /** Single pilot coach route until tenants and subdomains exist. */
  publicBasePath: "/kelly-jane",
  timeZone: "Europe/London",
};
