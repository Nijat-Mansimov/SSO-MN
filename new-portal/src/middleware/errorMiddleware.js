// Error-handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the full error stack for debugging

  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: message
  });
};
