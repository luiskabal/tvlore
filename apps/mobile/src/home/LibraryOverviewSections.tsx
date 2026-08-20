import { EmptyState } from "../ui";
import type { LibrarySectionFilter } from "./library-overview-model";

export function EmptySection({ activeSection }: { activeSection: LibrarySectionFilter }) {
  return (
    <EmptyState
      detail={getEmptySectionDetail(activeSection)}
      icon={getEmptySectionIcon(activeSection)}
      title={getEmptySectionTitle(activeSection)}
    />
  );
}

function getEmptySectionIcon(activeSection: LibrarySectionFilter) {
  if (activeSection === "chronology") {
    return "time-outline";
  }

  if (activeSection === "shows") {
    return "tv-outline";
  }

  if (activeSection === "movies") {
    return "film-outline";
  }

  if (activeSection === "episodes") {
    return "albums-outline";
  }

  if (activeSection === "watchlist") {
    return "bookmark-outline";
  }

  return "star-outline";
}

function getEmptySectionTitle(activeSection: LibrarySectionFilter) {
  if (activeSection === "chronology") {
    return "No watch history";
  }

  if (activeSection === "shows") {
    return "No shows yet";
  }

  if (activeSection === "watchlist") {
    return "No saved titles";
  }

  if (activeSection === "movies") {
    return "No recent movies";
  }

  if (activeSection === "episodes") {
    return "No recent episodes";
  }

  if (activeSection === "rated") {
    return "No rated titles";
  }

  return "No activity";
}

function getEmptySectionDetail(activeSection: LibrarySectionFilter) {
  if (activeSection === "chronology") {
    return "Watched movies and episodes will appear here by date.";
  }

  if (activeSection === "shows") {
    return "Watched, rated, and saved shows will appear here.";
  }

  if (activeSection === "watchlist") {
    return "Saved shows and movies will appear here.";
  }

  if (activeSection === "movies") {
    return "Watched movies will appear here.";
  }

  if (activeSection === "episodes") {
    return "Watched episodes will appear here.";
  }

  if (activeSection === "rated") {
    return "Rated shows and movies will appear here.";
  }

  return "Library activity will appear here.";
}
