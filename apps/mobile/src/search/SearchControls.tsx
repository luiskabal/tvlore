import { Pressable, Text, TextInput, View } from "react-native";

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
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Shows and movies</Text>
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
              <Text style={[styles.filterText, filter === item.value ? styles.activeFilterText : null]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          disabled={!canSearch || isSearching}
          style={[styles.primaryButton, !canSearch || isSearching ? styles.disabledButton : null]}
          onPress={onSubmit}
        >
          <Text style={styles.primaryButtonText}>{isSearching ? "Searching" : "Search"}</Text>
        </Pressable>
      </View>
    </>
  );
}
