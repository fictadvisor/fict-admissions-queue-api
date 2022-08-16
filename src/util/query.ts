import { Like } from "typeorm";

export const paginationQuery = (query, options = {}) => {
  const { skip, take } = query;
  const temp: any = { ...options };

  if (skip) {
    temp.skip = parseInt(skip);
  }

  if (take) {
    temp.take = parseInt(take);
  }

  return temp;
};

export const searchQuery = (params: string[], query, options = {}) => {
  const { search } = query;
  const temp: any = paginationQuery(query, options);
  const condition = temp.where ?? {};

  if (search) {
    const w = params.map(p => ({ [p]: Like(`%${search}%`), ...condition }));
    temp.where = w;
  }

  return temp;
};