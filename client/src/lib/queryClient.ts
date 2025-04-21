import { QueryClient, QueryFunction } from "@tanstack/react-query";

interface ApiError extends Error {
  status: number;
  statusText: string;
  body?: any;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Create a custom error with status and statusText
    const error = new Error(`${res.status}: ${text}`) as ApiError;
    error.status = res.status;
    error.statusText = res.statusText;
    
    try {
      error.body = JSON.parse(text);
    } catch (e) {
      // If the text is not valid JSON, just use it as is
      error.body = { message: text };
    }
    
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // For DELETE requests, a 404 might be fine in some contexts
    // Let the caller handle this case if needed
    if (method === 'DELETE' && res.status === 404) {
      const error = new Error(`Resource not found`) as ApiError;
      error.status = 404;
      error.statusText = res.statusText;
      throw error;
    }
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API Request Error (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
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
