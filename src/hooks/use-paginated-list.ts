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
