// Normalizes legacy list-query param names (used across several older
// screens) onto the new backend's actual field names (categoryId, cityId,
// limit, search). Unknown params are silently stripped server-side, so
// anything left unmapped here would otherwise have no filtering effect.
export function normalizeListQuery(query: Record<string, unknown> = {}) {
  const {
    category_id,
    city_id,
    per_page,
    keyword,
    categoryId,
    cityId,
    limit,
    search,
    ...rest
  } = query;

  const normalized: Record<string, unknown> = {
    ...rest,
    ...(categoryId ?? category_id
      ? {categoryId: categoryId ?? category_id}
      : {}),
    ...(cityId ?? city_id ? {cityId: cityId ?? city_id} : {}),
    // The backend caps `limit` at 100; a legacy per_page:1000 would otherwise
    // turn what used to be a silently-ignored param into a hard 400.
    ...(limit ?? per_page
      ? {limit: Math.min(Number(limit ?? per_page), 100)}
      : {}),
    ...(search ?? keyword ? {search: search ?? keyword} : {}),
  };

  // Flatten any array-valued param to a comma-separated string. Every
  // multi-value list field on the backend (categoryIds, excludeParentCategoryId,
  // …) is parsed from a CSV string via `@Transform(v => v.split(','))`, and its
  // query parser does NOT understand axios's default `key[]=a&key[]=b` array
  // encoding — those arrive as a literal "key[]" key and are dropped by the
  // ValidationPipe whitelist, silently losing the filter (e.g. a category
  // filter that returned every ad regardless). Joining here, once, fixes it for
  // every list screen instead of each caller having to remember to `.join(',')`.
  for (const key of Object.keys(normalized)) {
    const value = normalized[key];
    if (Array.isArray(value)) {
      if (value.length === 0) {
        delete normalized[key];
      } else {
        normalized[key] = value.join(',');
      }
    }
  }

  return normalized;
}
