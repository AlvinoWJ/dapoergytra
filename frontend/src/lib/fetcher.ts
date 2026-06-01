import api from "./api";

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export const fetcherWithParams = ([url, params]: [
  string,
  Record<string, unknown>,
]) => api.get(url, { params }).then((res) => res.data);
