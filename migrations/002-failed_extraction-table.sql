-- Up
CREATE TABLE "failed_extraction" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  searchQuery VARCHAR(255),
  title VARCHAR(255),
  errorMessage VARCHAR(255),
  pageSize INTEGER,
  page INTEGER,
  resultIndex INTEGER
);

-- Down
DROP TABLE "failed_extraction";