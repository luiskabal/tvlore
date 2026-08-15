import { Pressable, TextInput, View } from "react-native";

import { AppText, Button } from "../ui";
import type { SearchFilter } from "./use-catalog-search";
import { styles } from "./search-styles";

const filters: { label: string; value: SearchFilter }[] = [
  { label: "All", value: "all" },
  { label: "Shows", value: "show" },
  { label: "Movies", value: "movie" },
];

export function SearchControls({
  canSearch,
  filter,
  isSearching,
  onQueryChange,
  onSelectFilter,
  onSubmit,
  query,
}: {
  canSearch: boolean;
  filter: SearchFilter;
  isSearching: boolean;
  onQueryChange: (query: string) => void;
  onSelectFilter: (filter: SearchFilter) => void;
  onSubmit: () => void;
  query: string;
}) {
  return (
    <>
      <View style={styles.header}>
        <AppText style={styles.title}>Search</AppText>
        <AppText style={styles.subtitle} tone="muted">Shows and movies</AppText>
      </View>

      <View style={styles.searchPanel}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onQueryChange}
          onSubmitEditing={onSubmit}
          placeholder="Dark, Severance, The Matrix"
          returnKeyType="search"
          style={styles.input}
          value={query}
        />

        <View style={styles.filterRow}>
          {filters.map((item) => (
            <Pressable
              key={item.value}
              style={[
                styles.filterButton,
                filter === item.value ? styles.activeFilterButton : null,
                isSearching && filter !== item.value ? styles.pendingFilterButton : null,
              ]}
              onPress={() => onSelectFilter(item.value)}
            >
              <AppText
                style={[styles.filterText, filter === item.value ? styles.activeFilterText : null]}
                variant="caption"
              >
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        <Button
          disabled={!canSearch || isSearching}
          isLoading={isSearching}
          label="Search"
          loadingLabel="Searching"
          onPress={onSubmit}
          style={styles.searchButton}
        />
      </View>
    </>
  );
}
