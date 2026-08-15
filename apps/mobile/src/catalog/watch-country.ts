const defaultWatchCountry = "CL";

export function getDeviceWatchCountry() {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;

  return getWatchCountryFromLocale(locale) ?? defaultWatchCountry;
}

export function getWatchCountryFromLocale(locale: string) {
  const region = locale
    .replace("_", "-")
    .split("-")
    .slice(1)
    .find((part) => /^[A-Z]{2}$/i.test(part));

  return region?.toUpperCase() ?? null;
}
