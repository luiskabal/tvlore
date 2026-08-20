import { TextInput } from "react-native";

import { Button, PageHeader, SegmentedControl, Surface, ui } from "../ui";
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
      <PageHeader
        subtitle="Find shows, movies, and suggestions."
        title="Search"
      />

      <Surface style={styles.searchPanel}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onQueryChange}
          onSubmitEditing={onSubmit}
          placeholder="Dark, Severance, The Matrix"
          placeholderTextColor={ui.color.muted2}
          returnKeyType="search"
          style={styles.input}
          value={query}
        />

        <SegmentedControl
          options={filters}
          onChange={onSelectFilter}
          value={filter}
        />

        <Button
          disabled={!canSearch || isSearching}
          icon="search"
          isLoading={isSearching}
          label="Search"
          loadingLabel="Searching"
          onPress={onSubmit}
          style={styles.searchButton}
        />
      </Surface>
    </>
  );
}
