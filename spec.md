## Movie Discovery App Specification (React + TMDB)

### 1) Goal
Build a React application that lets movie fans **discover and view the latest movies** using the TMDB API defined in `openAPI.md`.

### 2) Pages and Navigation
- The app must have a **persistent navigation bar** visible on all pages.
- The navigation bar must provide links to:
  - **Home** (Discover Movies)
  - **Favourites**

### 3) Home Page: Discover Movies
- The **Home page is the Discover Movies page**.
- It must display a paginated list of movies:
  - **20 movies per page**
  - Pagination controls must allow moving between pages (at minimum: next/previous; page numbers optional).
- Each movie must be displayed as a **movie card** containing:
  - **Title**
  - **Release year** (derived from release date if needed)
  - **Rating**
  - **Poster artwork** (use a sensible placeholder if unavailable)

#### Filtering (Home Page)
Users must be able to filter the displayed movies by:

1. **Title filter**
   - A text input that filters by movie title.
   - Recommended behavior: case-insensitive **contains** match.

2. **Genre filter**
   - A genre selector (dropdown, chips, or multi-select).
   - Recommended default: **single genre** selection unless multi-genre is required.

Filtering must apply to the list currently shown and must not break pagination.

### 4) Movie Details Page
- Clicking/selecting a movie card must navigate to a **Movie Details page** for that movie.
- The details page must display:
  - **Title**
  - **Overview**
  - **Genres**
  - **Runtime**
  - **Release date**

### 5) Favourites
- Users must be able to **add** and **remove** movies from a favourites list.
  - This control must be available at least on the Movie Details page (optional on cards too).
- The **Favourites page** must display the user’s saved favourite movies.
  - Each favourite should show at least: **title, year, rating, poster** (same card format is fine).
  - Users must be able to remove items from favourites from this page.

### 6) Local Storage / Session Data
- All user-specific session data (at minimum, the favourites list) must be stored **locally on the device** for now (e.g., `localStorage`).
- The favourites list must persist across page refreshes.

### 7) API Usage and App States
- All movie and genre data must be loaded via the TMDB API described in `openAPI.md`.
- The app must handle common API states gracefully:
  - **Loading** state
  - **Error** state (user-safe message)
  - **Empty results** state (e.g., filters return no movies)
