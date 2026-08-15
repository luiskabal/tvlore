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

export function getCountryFlagEmoji(country: string) {
  const code = country.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    return "";
  }

  return String.fromCodePoint(...[...code].map((letter) => 127397 + letter.charCodeAt(0)));
}

export function formatWatchCountry(country: string) {
  const code = country.trim().toUpperCase();
  const flag = getCountryFlagEmoji(code);

  return flag ? `${flag} ${code}` : code;
}
