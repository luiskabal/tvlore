import { BadRequestException } from "@nestjs/common";

import type { WatchProviderDto, WatchProvidersResponseDto } from "./catalog.types";

const defaultWatchCountry = "CL";

export function parseWatchCountry(value: string | undefined) {
  const country = value?.trim().toUpperCase() || defaultWatchCountry;

  if (!/^[A-Z]{2}$/.test(country)) {
    throw new BadRequestException({
      code: "VALIDATION_FAILED",
      message: "country must be an ISO 3166-1 alpha-2 country code",
      details: null,
    });
  }

  return country;
}

export function toWatchProvidersResponse(value: unknown, country: string): WatchProvidersResponseDto {
  const countryResult = isRecord(value) && isRecord(value.results) && isRecord(value.results[country])
    ? value.results[country]
    : null;

  return {
    country,
    link: countryResult ? getString(countryResult.link) : null,
    providers: {
      buy: countryResult ? toProviders(countryResult.buy) : [],
      free: countryResult ? toProviders(countryResult.free) : [],
      rent: countryResult ? toProviders(countryResult.rent) : [],
      stream: countryResult ? toProviders(countryResult.flatrate) : [],
    },
  };
}

function toProviders(value: unknown): WatchProviderDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(toProvider).filter((provider): provider is WatchProviderDto => Boolean(provider));
}

function toProvider(value: unknown): WatchProviderDto | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = getPositiveInteger(value.provider_id);
  const name = getString(value.provider_name);

  if (id === null || !name) {
    return null;
  }

  return {
    id,
    logoPath: getString(value.logo_path),
    name,
  };
}

function getPositiveInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
