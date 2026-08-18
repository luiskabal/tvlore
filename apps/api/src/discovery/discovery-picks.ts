import type { CatalogSearchResultDto, MediaType } from "../catalog/catalog.types";

export const tvlorePicks: CatalogSearchResultDto[] = [
  pick("show", "70523", "Dark", 2017, "/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg", "A missing child sets four families on a frantic hunt for answers as they unearth a mind-bending mystery that spans three generations."),
  pick("show", "95396", "Severance", 2022, "/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg", "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives."),
  pick("show", "83867", "Andor", 2022, "/khZqmwHQicTYoS7Flreb9EddFZC.jpg", "Cassian Andor discovers the difference he can make in the struggle against the tyrannical Galactic Empire."),
  pick("movie", "329865", "Arrival", 2016, "/pEzNVQfdzYDzVK0XqxERIw2x2se.jpg", "An expert linguist is recruited by the military after alien crafts land around the world."),
  pick("movie", "496243", "Parasite", 2019, "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", "A struggling family becomes entangled with the wealthy Parks through an unexpected chain of events."),
  pick("movie", "545611", "Everything Everywhere All at Once", 2022, "/u68AjlvlutfEIcpmbYpKcdi09ut.jpg", "An aging immigrant is swept into an adventure across the lives she could have led."),
];

function pick(
  mediaType: MediaType,
  providerId: string,
  title: string,
  year: number,
  posterPath: string,
  overview: string,
): CatalogSearchResultDto {
  return {
    externalRef: { provider: "tmdb", providerId },
    mediaType,
    overview,
    posterPath,
    title,
    tvloreId: null,
    year,
  };
}
