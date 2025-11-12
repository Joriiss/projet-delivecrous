const paginate = (data, page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const paginatedData = Array.isArray(data) 
    ? data.slice(skip, skip + limitNum)
    : [];

  return {
    page: pageNum,
    limit: limitNum,
    total: Array.isArray(data) ? data.length : 0,
    totalPages: Math.ceil((Array.isArray(data) ? data.length : 0) / limitNum),
    data: paginatedData
  };
};

const paginateQuery = (query, page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  return query.skip(skip).limit(limitNum);
};

const formatPaginationResponse = (data, total, page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  return {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
    data
  };
};

module.exports = {
  paginate,
  paginateQuery,
  formatPaginationResponse
};

