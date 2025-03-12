import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Base API URL path
export const BASE_PATH = "/defense";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper to ensure URLs have the correct base path
export function getFullUrl(url: string): string {
  // If it's an absolute URL or already starts with our base path, return it as is
  if (url.startsWith('http') || url.startsWith(BASE_PATH)) {
    return url;
  }
  
  // If it's an API call, prefix with the base path
  if (url.startsWith('/api')) {
    return `${BASE_PATH}${url}`;
  }
  
  // For other relative URLs, just prefix with the base path
  return `${BASE_PATH}${url.startsWith('/') ? url : `/${url}`}`;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure URL has the correct base path
  const fullUrl = getFullUrl(url);
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Ensure URL has the correct base path
    const url = getFullUrl(queryKey[0] as string);
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
