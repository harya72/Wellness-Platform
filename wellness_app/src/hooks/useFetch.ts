import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL, SYSTEM_TOKEN } from "src/constants/constants";

type UseFetchProps = {
  initialUrl?: string;
  initialOptions?: RequestInit;
  autoFetch?: boolean;
};

type UseFetchReturn<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetchData: (
    url?: string,
    method?: string,
    body?: object,
    retry?: boolean,
    newAccessToken?: string,
  ) => Promise<T | null>;
  setUrl: (url: string) => void;
  setOptions: (options: RequestInit) => void;
};

export const useFetch = <T>({
  initialUrl = "",
  initialOptions = {},
  autoFetch = true,
}: UseFetchProps): UseFetchReturn<T> => {
  const [url, setUrl] = useState(initialUrl);
  const [options, setOptions] = useState<RequestInit>(initialOptions);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useUI();

  const { token, clearToken, storeToken } = useAuth();
  const isRefreshingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const fetchData = useCallback(
    async (
      urlParam?: string,
      method: string = "GET",
      requestBody?: object,
      retry = true,
      newAccessToken?: string,
    ): Promise<T | null> => {
      const currentUrl = urlParam || url;
      console.log("Fetching:", API_BASE_URL + currentUrl);
      console.log("method", method);

      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_BASE_URL + currentUrl, {
          method,
          ...options,
          headers: {
            "Content-Type": "application/json",
            "X-JWT-Assertion": newAccessToken || token || SYSTEM_TOKEN,
            ...options.headers,
          },
          signal: controller.signal,
          ...(requestBody ? { body: JSON.stringify(requestBody) } : {}),
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            showToast({
              message: "Token expired, please login again",
              success: false,
              title: "Session Expired",
            });
            clearToken();
          }
          throw new Error(result?.message || "Request failed");
        } else {
          setData(result);
          return result;
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.warn("Fetch error:", err);
          setError(err?.message || "Internal Server Error");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url, options, token, storeToken, clearToken, isRefreshingRef],
  );

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    if (autoFetch) fetchData();

    return () => {
      if (controllerRef.current && !isRefreshingRef.current) {
        console.log("Aborting request on cleanup");
        controllerRef.current.abort();
      }
    };
  }, [autoFetch, isRefreshingRef, url]);

  return { data, error, loading, fetchData, setUrl, setOptions };
};
