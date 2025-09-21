import { useCallback, useMemo } from "react";

export type UpdateMode = "push" | "replace";

export type QueryObject = Record<
  string,
  string | number | string[] | undefined
>;

export type AdapterHooks = {
  pathname: string;
  search: string;
  navigate: (url: string, mode: UpdateMode) => void;
};

export function createUseQueryState(useAdapter: () => AdapterHooks) {
  function asNumberOrString(querystring: string): number | string {
    const text = querystring.trim();
    if (text === "") return "";
    const num = Number(text);
    return Number.isFinite(num) && String(num) === text ? num : text;
  }

  return function useQueryState(
    initial?: Partial<QueryObject>,
    mode: UpdateMode = "push"
  ) {
    const { pathname, search, navigate } = useAdapter();

    const values = useMemo<QueryObject>(() => {
      const params = new URLSearchParams(search);
      const queryValue: QueryObject = { ...(initial ?? {}) };
      const keys = new Set<string>();
      params.forEach((_, key) => keys.add(key));

      for (const key of keys) {
        const all = params
          .getAll(key)
          .map((value) => value.trim())
          .filter((value) => value !== "");
        if (all.length > 1) {
          queryValue[key] = all;
        } else {
          const value = params.get(key);
          if (value == null) continue;
          const converted = asNumberOrString(value);
          queryValue[key] = converted === "" ? undefined : converted;
        }
      }
      return queryValue;
    }, [search, initial]);

    const setValues = useCallback(
      (patch: Partial<QueryObject>) => {
        const searchParams = new URLSearchParams(search);

        for (const key of Object.keys(patch)) {
          const value = patch[key];

          if (value == null) {
            searchParams.delete(key);
            continue;
          }

          if (Array.isArray(value)) {
            searchParams.delete(key);
            for (const item of value) {
              const string = String(item ?? "").trim();
              if (string !== "") searchParams.append(key, string);
            }
            if (!searchParams.getAll(key).length) searchParams.delete(key);
            continue;
          }

          const text = String(value).trim();
          if (text === "") searchParams.delete(key);
          else searchParams.set(key, text);
        }

        const query = searchParams.toString();
        const url = query ? `${pathname}?${query}` : pathname;
        navigate(url, mode);
      },
      [search, pathname, navigate, mode]
    );

    return { values, setValues } as const;
  };
}
