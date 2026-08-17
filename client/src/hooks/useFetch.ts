import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useFetchData = (key: unknown[], fetcherFn: () => Promise<unknown>, options: any = {}) => {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: fetcherFn,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useMutateData = (mutationFn: (variables: any) => Promise<unknown>, options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      if (options.invalidateKey) {
        queryClient.invalidateQueries({
          queryKey: Array.isArray(options.invalidateKey) ? options.invalidateKey : [options.invalidateKey],
        });
      }
      if (options.onSuccess) {
        options.onSuccess();
      }
    },
    ...options,
  });
};
