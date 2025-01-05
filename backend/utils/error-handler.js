const errorHandler = (res, error, message) => {
  console.error(`${message}:`, error.message);
  res.status(500).json({ message });
};

module.exports = { errorHandler };
