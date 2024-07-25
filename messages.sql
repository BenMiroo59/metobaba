CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50),
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
