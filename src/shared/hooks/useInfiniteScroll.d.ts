interface UseInfiniteScrollOptions {
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage: () => void;
    threshold?: number;
    rootMargin?: string;
}
export declare const useInfiniteScroll: ({ hasNextPage, isFetchingNextPage, fetchNextPage, threshold, rootMargin, }: UseInfiniteScrollOptions) => {
    lastElementRef: (node: HTMLElement | null) => void;
};
export {};
//# sourceMappingURL=useInfiniteScroll.d.ts.map