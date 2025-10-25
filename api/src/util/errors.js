export class HttpError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}