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

  return {
    ...rest,
    ...(categoryId ?? category_id ? {categoryId: categoryId ?? category_id} : {}),
    ...(cityId ?? city_id ? {cityId: cityId ?? city_id} : {}),
    // The backend caps `limit` at 100; a legacy per_page:1000 would otherwise
    // turn what used to be a silently-ignored param into a hard 400.
    ...(limit ?? per_page
      ? {limit: Math.min(Number(limit ?? per_page), 100)}
      : {}),
    ...(search ?? keyword ? {search: search ?? keyword} : {}),
  };
}
