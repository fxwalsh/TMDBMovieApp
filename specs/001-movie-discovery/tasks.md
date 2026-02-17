# Tasks: Movie Discovery App

**Input**: Design documents from `/specs/001-movie-discovery/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tmdb-api.md, quickstart.md

**Generated**: 2026-02-16  
**Feature Branch**: `001-movie-discovery`

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are omitted per template guidance.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Vite + React + TypeScript project using `npm create vite@latest . -- --template react-ts`
- [X] T002 [P] Install core dependencies: @mui/material, @mui/icons-material, @emotion/react, @emotion/styled
- [X] T003 [P] Install state/data dependencies: @tanstack/react-query, openapi-fetch, zod, react-router-dom
- [X] T004 [P] Install dev dependencies: openapi-typescript, vitest, @testing-library/react, @testing-library/user-event, jsdom
- [X] T005 Configure TypeScript strict mode in tsconfig.json
- [X] T006 [P] Configure ESLint and Prettier for code quality
- [X] T007 Generate TypeScript types from OpenAPI spec: `npm run generate:types` (creates src/api/generated/tmdb.ts)
- [X] T008 Create project directory structure: src/api/, src/lib/, src/features/, src/components/
- [X] T009 [P] Add placeholder image to public/placeholder-movie.png

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 [P] Create openapi-fetch client in src/api/client.ts with TMDB base URL and API key middleware
- [X] T011 [P] Create AppError class in src/api/errors.ts with kind/status/endpoint/safeDetails fields
- [X] T012 [P] Create Zod validation wrapper function in src/api/validate.ts (validateResponse helper)
- [X] T013 [P] Create TanStack Query key factory in src/lib/queryKeys.ts (movieKeys, genreKeys)
- [X] T014 [P] Create MUI dark theme in src/lib/theme.ts with custom palette and component overrides
- [X] T015 Create React Router configuration in src/router.tsx using createBrowserRouter
- [X] T016 Setup App.tsx with QueryClientProvider, ThemeProvider, and RouterProvider
- [X] T017 [P] Create LoadingState component in src/components/LoadingState.tsx using MUI CircularProgress
- [X] T018 [P] Create ErrorMessage component in src/components/ErrorMessage.tsx using MUI Alert
- [X] T019 [P] Create EmptyState component in src/components/EmptyState.tsx using MUI Typography
- [X] T020 [P] Create AppBar component in src/components/AppBar.tsx with navigation links (Home, Favorites)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse and Discover Movies (Priority: P1) 🎯 MVP

**Goal**: Users can browse a paginated list of 20 movies per page with title, year, rating, and poster. This is the core MVP that delivers immediate value.

**Independent Test**: Load app, verify 20 movies display on first page with all fields (title, year, rating, poster), click Next Page, verify next 20 movies load.

**Endpoints**: GET /3/discover/movie  
**Entities**: Movie (id, title, poster_path, release_date, vote_average, genre_ids, popularity)

### Implementation for User Story 1

- [X] T021 [P] [US1] Create movieSchema in src/api/schemas.ts (Zod schema wrapping OpenAPI Movie type)
- [X] T022 [P] [US1] Create movieListResponseSchema in src/api/schemas.ts (page, results, total_pages, total_results)
- [X] T023 [US1] Implement useMovies query hook in src/features/movies/queries.ts for GET /3/discover/movie endpoint
- [X] T024 [P] [US1] Create MovieCard component in src/features/movies/components/MovieCard.tsx (displays title, year, rating, poster)
- [X] T025 [P] [US1] Create getMovieYear utility in src/api/schemas.ts (extracts year from release_date)
- [X] T026 [P] [US1] Create getPosterUrl utility in src/api/schemas.ts (builds TMDB image URL with fallback)
- [X] T027 [US1] Create MovieGrid component in src/features/movies/components/MovieGrid.tsx (MUI Grid with MovieCard children)
- [X] T028 [P] [US1] Create Pagination component in src/features/movies/components/Pagination.tsx using MUI Pagination
- [X] T029 [US1] Implement HomePage in src/features/movies/pages/HomePage.tsx (MovieGrid + Pagination)
- [X] T030 [US1] Integrate useMovies hook into HomePage with page state management
- [X] T031 [US1] Add loading state to HomePage using LoadingState component
- [X] T032 [US1] Add error state to HomePage using ErrorMessage component
- [X] T033 [US1] Add empty state to HomePage using EmptyState component
- [X] T034 [US1] Add HomePage route to src/router.tsx at path "/"

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can browse movies!

---

## Phase 4: User Story 2 - Filter Movies by Title and Genre (Priority: P2)

**Goal**: Users can filter movies by title (500ms debounced search via /search/movie) and by genre (single-select dropdown via /discover/movie with with_genres). Combined filters work together.

**Independent Test**: Type "Inception" in search box, wait 500ms, verify only matching movies display. Select "Action" genre, verify only action movies display. Clear filters, verify full list returns.

**Endpoints**: GET /3/search/movie, GET /3/genre/movie/list  
**Entities**: Genre (id, name)

### Implementation for User Story 2

- [X] T035 [P] [US2] Create genreSchema in src/api/schemas.ts (Zod schema for Genre: id, name)
- [X] T036 [P] [US2] Create genreListResponseSchema in src/api/schemas.ts (genres array wrapper)
- [X] T037 [P] [US2] Implement useSearchMovies query hook in src/features/movies/queries.ts for GET /3/search/movie endpoint
- [X] T038 [P] [US2] Implement useGenres query hook in src/features/movies/queries.ts for GET /3/genre/movie/list endpoint
- [X] T039 [P] [US2] Create useDebounce custom hook in src/shared/hooks/useDebounce.ts (500ms delay)
- [X] T040 [US2] Create MovieFilters component in src/features/movies/components/MovieFilters.tsx (TextField for title, Select for genre)
- [X] T041 [US2] Add title filter state to HomePage with useDebounce integration
- [X] T042 [US2] Add genre filter state to HomePage with genre dropdown integration
- [X] T043 [US2] Update HomePage to conditionally use useMovies (no title) or useSearchMovies (with title)
- [X] T044 [US2] Add genre filtering logic to HomePage (pass with_genres to useMovies when title is empty)
- [X] T045 [US2] Handle combined filters in HomePage (title search + client-side genre filtering if needed)
- [X] T046 [US2] Add "No movies found" empty state when filters return zero results
- [X] T047 [US2] Display active filters in empty state message for user clarity

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can browse and filter!

---

## Phase 5: User Story 3 - View Movie Details (Priority: P3)

**Goal**: Users can click a movie card to navigate to a detailed page showing title, overview, genres, runtime, and release date with back navigation.

**Independent Test**: Click any movie card, navigate to details page, verify all fields display (title, overview, genres list, runtime, release date). Click back, return to Home with filters preserved.

**Endpoints**: GET /3/movie/{movie_id}  
**Entities**: Movie (full details including genres array, runtime)

### Implementation for User Story 3

- [ ] T048 [P] [US3] Create movieDetailsSchema in src/api/schemas.ts (extends movieSchema with genres array, runtime required)
- [ ] T049 [US3] Implement useMovieDetails query hook in src/features/movies/queries.ts for GET /3/movie/{movie_id} endpoint
- [ ] T050 [P] [US3] Create MovieDetails component in src/features/movies/components/MovieDetails.tsx (displays full movie info)
- [ ] T051 [US3] Implement MovieDetailsPage in src/features/movies/pages/MovieDetailsPage.tsx using useMovieDetails hook
- [ ] T052 [US3] Add loading state to MovieDetailsPage using LoadingState component
- [ ] T053 [US3] Add error state to MovieDetailsPage using ErrorMessage component (e.g., movie not found)
- [ ] T054 [US3] Add MovieDetailsPage route to src/router.tsx at path "/movie/:id"
- [ ] T055 [US3] Add onClick navigation to MovieCard component using react-router-dom's useNavigate
- [ ] T056 [US3] Add Back button to MovieDetailsPage navigating to HomePage
- [ ] T057 [US3] Test navigation preserves HomePage filters and pagination state

**Checkpoint**: All user stories 1, 2, and 3 should now be independently functional. Users can browse, filter, and view details!

---

## Phase 6: User Story 4 - Manage Favorite Movies (Priority: P4)

**Goal**: Users can add/remove movies from favorites on details page, view all favorites on dedicated page, with localStorage persistence across sessions.

**Independent Test**: Add movie to favorites from details page, navigate to Favorites page, verify movie appears. Refresh browser, verify favorites persist. Remove movie, verify it disappears.

**Endpoints**: None (client-side only)  
**Entities**: Favorite (array of movie IDs in localStorage)

### Implementation for User Story 4

- [ ] T058 [P] [US4] Create favoritesArraySchema in src/api/schemas.ts (Zod array of positive integers)
- [ ] T059 [US4] Create useFavorites hook in src/features/favorites/hooks/useFavorites.ts with localStorage CRUD operations
- [ ] T060 [US4] Implement loadFavorites function in useFavorites (reads from localStorage, validates with Zod)
- [ ] T061 [US4] Implement saveFavorites function in useFavorites (writes to localStorage with validation)
- [ ] T062 [US4] Implement toggleFavorite function in useFavorites (add/remove movie ID)
- [ ] T063 [US4] Implement isFavorite function in useFavorites (checks if movie is favorited)
- [ ] T064 [P] [US4] Create FavoriteButton component in src/features/favorites/components/FavoriteButton.tsx (Add/Remove toggle)
- [ ] T065 [US4] Add FavoriteButton to MovieDetailsPage using useFavorites hook
- [ ] T066 [US4] Update FavoriteButton icon and text based on isFavorite state
- [ ] T067 [P] [US4] Create FavoritesList component in src/features/favorites/components/FavoritesList.tsx (reuses MovieGrid)
- [ ] T068 [US4] Implement FavoritesPage in src/features/favorites/pages/FavoritesPage.tsx
- [ ] T069 [US4] Fetch full movie details for each favorited ID in FavoritesPage using useMovieDetails
- [ ] T070 [US4] Add loading state to FavoritesPage while fetching movie details
- [ ] T071 [US4] Add empty state to FavoritesPage when no favorites exist
- [ ] T072 [US4] Add Remove button to each movie card in FavoritesPage
- [ ] T073 [US4] Add FavoritesPage route to src/router.tsx at path "/favorites"
- [ ] T074 [US4] Add Favorites link to AppBar navigation
- [ ] T075 [US4] Test localStorage persistence across page refreshes and browser sessions

**Checkpoint**: All user stories 1-4 should now be fully functional. Users have a complete movie discovery app with favorites!

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T076 [P] Add getRatingColor utility to src/api/schemas.ts for rating badges (success/warning/error colors)
- [ ] T077 [P] Apply rating colors to MovieCard vote_average display using MUI Chip
- [ ] T078 [P] Add image loading optimization to MovieCard (lazy loading, error handling)
- [ ] T079 [P] Add React.memo to MovieCard for performance optimization
- [ ] T080 [P] Add accessibility improvements: ARIA labels, keyboard navigation, focus management
- [ ] T081 [P] Add MUI Skeleton loading placeholders to MovieGrid during data fetch
- [ ] T082 [P] Test error scenarios: API unavailable, invalid movie ID, localStorage cleared
- [ ] T083 [P] Add graceful handling for movies with missing fields (no release_date, no poster, no overview)
- [ ] T084 Verify all constitution principles are met (named exports, MUI only, TanStack Query, Zod validation)
- [ ] T085 Run quickstart.md validation steps to confirm developer onboarding works
- [ ] T086 [P] Update documentation with any discovered API deviations in docs/contract-deviations.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - MVP ready after this
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion - Can start in parallel with US1 (if staffed) or after US1
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion - Should be after US1 (needs MovieCard navigation)
- **User Story 4 (Phase 6)**: Depends on Foundational phase completion and US3 (needs MovieDetailsPage) - Should be last story
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - **ZERO dependencies on other stories** - Independently testable MVP
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - **ZERO dependencies on other stories** - Independently testable (integrates into US1's HomePage)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - **Soft dependency on US1** (navigation from MovieCard) - Independently testable with direct URL navigation
- **User Story 4 (P4)**: **Depends on US3** (FavoriteButton on MovieDetailsPage) - Independently testable once US3 complete

### Within Each User Story

**US1 (Browse Movies)**:
1. Schemas first (T021-T022)
2. Query hook (T023)
3. Components in parallel (T024-T028)
4. Page integration (T029-T034)

**US2 (Filter Movies)**:
1. Schemas and hooks in parallel (T035-T039)
2. Filters component (T040)
3. Integration into HomePage (T041-T047)

**US3 (Movie Details)**:
1. Schema and query hook in parallel (T048-T049)
2. Components (T050-T051)
3. States and routing (T052-T057)

**US4 (Favorites)**:
1. Schema and localStorage hook (T058-T063)
2. Components in parallel (T064, T067)
3. Integration (T065-T066, T068-T075)

### Parallel Opportunities

**Setup (Phase 1)**: T002, T003, T004, T006, T009 can all run in parallel

**Foundational (Phase 2)**: T010, T011, T012, T013, T014, T017, T018, T019, T020 can all run in parallel (11 tasks!)

**User Story 1**: 
- T021, T022 can run in parallel (schemas)
- T024, T025, T026, T028 can run in parallel (components and utilities)

**User Story 2**:
- T035, T036, T037, T038, T039 can run in parallel (5 tasks!)

**User Story 3**:
- T048, T049 can run in parallel (schema and hook)
- T050, T051 can run in parallel (component and page)

**User Story 4**:
- T058, T064, T067 can run in parallel (schema, button, list)

**Polish (Phase 7)**: T076, T077, T078, T079, T080, T081, T082, T083, T086 can all run in parallel (9 tasks!)

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch these US1 tasks in parallel:

# Terminal 1: Schemas
Task T021: "Create movieSchema in src/api/schemas.ts"
Task T022: "Create movieListResponseSchema in src/api/schemas.ts"

# Terminal 2: Components  
Task T024: "Create MovieCard component in src/features/movies/components/MovieCard.tsx"
Task T028: "Create Pagination component in src/features/movies/components/Pagination.tsx"

# Terminal 3: Utilities
Task T025: "Create getMovieYear utility in src/api/schemas.ts"
Task T026: "Create getPosterUrl utility in src/api/schemas.ts"

# Then sequentially:
# T023: useMovies query hook (depends on schemas T021-T022)
# T027: MovieGrid component (depends on MovieCard T024)
# T029-T034: HomePage integration (depends on all above)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T020) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (T021-T034)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Open app, see 20 movies on first page
   - All cards show title, year, rating, poster
   - Pagination works (Next/Previous)
   - Loading states appear during fetch
   - Errors display user-friendly messages
5. **Deploy/demo if ready** - You now have a working movie discovery app!

### Incremental Delivery

1. **Foundation**: Complete Setup + Foundational → Foundation ready (T001-T020)
2. **MVP Release**: Add User Story 1 → Test independently → Deploy/Demo (T021-T034)
   - Users can browse movies with pagination
3. **Enhancement 1**: Add User Story 2 → Test independently → Deploy/Demo (T035-T047)
   - Users can now filter by title and genre
4. **Enhancement 2**: Add User Story 3 → Test independently → Deploy/Demo (T048-T057)
   - Users can now view detailed movie information
5. **Enhancement 3**: Add User Story 4 → Test independently → Deploy/Demo (T058-T075)
   - Users can now save favorites
6. **Polish Release**: Add Phase 7 polish → Final release (T076-T086)

**Why this works**: Each story adds value without breaking previous stories. You can stop at any checkpoint and have a functional app.

### Parallel Team Strategy

With multiple developers available:

1. **Everyone together**: Complete Setup + Foundational (T001-T020)
2. **Once Foundational is done**, split work:
   - **Developer A**: User Story 1 (T021-T034) - Browse movies
   - **Developer B**: User Story 2 (T035-T047) - Filters (integrates with A's HomePage)
   - **Developer C**: User Story 3 (T048-T057) - Details page (integrates with A's MovieCard)
3. **Developer D** (if available): Can start Polish tasks that don't conflict (T076-T083)
4. **Integration**: Stories merge cleanly because they're designed to be independent
5. **Final**: Developer completes User Story 4 (T058-T075) after US3 is done

---

## Task Summary

| Phase | Task Range | Count | Parallelizable | Can Start After |
|-------|------------|-------|----------------|-----------------|
| Setup | T001-T009 | 9 | 6 tasks (67%) | Immediate |
| Foundational | T010-T020 | 11 | 9 tasks (82%) | Setup complete |
| US1 (P1 MVP) | T021-T034 | 14 | 6 tasks (43%) | Foundational complete |
| US2 (P2) | T035-T047 | 13 | 5 tasks (38%) | Foundational complete |
| US3 (P3) | T048-T057 | 10 | 4 tasks (40%) | Foundational complete (soft: US1) |
| US4 (P4) | T058-T075 | 18 | 3 tasks (17%) | Foundational + US3 complete |
| Polish | T076-T086 | 11 | 9 tasks (82%) | All user stories complete |
| **TOTAL** | **T001-T086** | **86** | **42 tasks (49%)** | - |

**Estimates** (rough):
- Setup: ~2-4 hours
- Foundational: ~8-12 hours (critical path)
- US1 (MVP): ~12-16 hours
- US2 (Filters): ~10-14 hours
- US3 (Details): ~6-10 hours
- US4 (Favorites): ~10-14 hours
- Polish: ~4-8 hours
- **Total**: ~52-78 hours for full feature

**MVP to production** (US1 only): ~22-32 hours

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to parallelize
- **[Story] label**: Maps task to specific user story (US1, US2, US3, US4) for traceability
- **No default exports**: All exports must use named exports per Constitution §6
- **MUI only**: All UI components must use Material UI per Constitution
- **OpenAPI types**: All API types generated from `/api/tmdb-api.json` per Constitution Principle II
- **Zod validation**: All API responses validated at boundary per Constitution Principle IV
- **TanStack Query**: All server state via `useQuery` hooks per Constitution Principle V
- **Independent stories**: Each user story is independently completable and testable
- **Checkpoint validation**: Stop at any checkpoint to validate story independently before proceeding
- **Commit strategy**: Commit after each task or logical group of parallel tasks
- **Test strategy**: Tests not explicitly requested, focus on functional implementation

**Success Criteria**: After completing any user story phase, that story should work end-to-end without the other stories being implemented.
