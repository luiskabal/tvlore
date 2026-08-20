import { Text, View } from "react-native";

import { styles } from "./home-styles";
import type { LibrarySectionFilter } from "./library-overview-model";

export function EmptySection({ activeSection }: { activeSection: LibrarySectionFilter }) {
  return (
    <View style={styles.emptyPanel}>
      <Text style={styles.statusLabel}>{getEmptySectionTitle(activeSection)}</Text>
      <Text style={styles.statusDetail}>{getEmptySectionDetail(activeSection)}</Text>
    </View>
  );
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
