-- Up
CREATE TABLE "group" (
  id INTEGER PRIMARY KEY,
  url VARCHAR(255),
  title VARCHAR(255),
  searchQuery VARCHAR(255),
  situation VARCHAR(255),
  longId VARCHAR(255),
  creationYear INTEGER,
  situationDate VARCHAR(255),
  lastUpdateDate VARCHAR(255),
  leader1 VARCHAR(255),
  leader2 VARCHAR(255),
  areas VARCHAR(255),
  institution VARCHAR(255),
  unit VARCHAR(255),
  addressPlace VARCHAR(255),
  addressNumber VARCHAR(255),
  addressComplement VARCHAR(255),
  addressNeighborhood VARCHAR(255),
  addressUf VARCHAR(255),
  addressLocation VARCHAR(255),
  addressCep VARCHAR(255),
  addressPostbox VARCHAR(255),
  locationLatitude FLOAT,
  locationLongitude FLOAT,
  contactPhone VARCHAR(255),
  contactFax VARCHAR(255),
  contactEmail VARCHAR(255),
  contactWebsite VARCHAR(255),
  repercussions TEXT
);

-- Down
DROP TABLE "group";