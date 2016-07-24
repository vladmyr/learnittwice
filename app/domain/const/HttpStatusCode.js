const HTTP_STATUS_CODE = {
  // 2XX - Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // 3XX - Redirection
  NOT_MODIFIED: 304,

  // 4XX - Client error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 404,

  // 5XX - Server error
  INTERNAL_SERVER_ERROR: 500,
  PERMISSION_DENIED: 550
};

module.exports = HTTP_STATUS_CODE;