import {useMemo} from 'react';
import {useInfiniteQuery} from 'react-query';

interface UsePaginatedListArgs {
  queryKey: any[];
  queryFn: (...args: any[]) => Promise<any>;
  selectItems: (page: any) => any[] | undefined;
  enabled?: boolean;
}

// Wraps react-query's useInfiniteQuery with the page-number/total_pages
// cursor logic every list screen in this app was hand-rolling identically,
// and flattens pages via useMemo instead of the useEffect(() =>
// setState(flatten(data))) pattern that caused several dead-mock-array
// shadowing bugs.
export function usePaginatedList({
  queryKey,
  queryFn,
  selectItems,
  enabled,
}: UsePaginatedListArgs) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    enabled,
    // A queryKey change (typing a search term, switching a filter) would
    // otherwise reset `data` to undefined until the new page resolves —
    // the list momentarily empties out, collapsing to the empty/loading
    // state and snapping back once results arrive. Keeping the previous
    // page around during that gap keeps the list's height and content
    // stable, only swapping once the new results are ready.
    keepPreviousData: true,
    getNextPageParam: lastPage => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) {
        return undefined;
      }
      return pagination.current_page < pagination.total_pages
        ? pagination.current_page + 1
        : undefined;
    },
  });

  const items = useMemo(
    () => data?.pages?.flatMap(page => selectItems(page) ?? []) ?? [],
    [data, selectItems],
  );

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    items,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    onEndReached,
    refetch,
  };
}
