import { getAxiosInstance } from ".";

const BASE_PATH = "/weeks";

export const getWeekById = async (id: string) => {
  const api = getAxiosInstance();
  const { data } = await api.get(`${BASE_PATH}/${id}`);
  return data;
};

export const publishWeek = async (payload: any) => {
  const api = getAxiosInstance();
  const { data } = await api.post(`${BASE_PATH}/upsert`, payload);
  return data;
};
