CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR ( 255 ) NOT NULL,
);

CREATE TABLE IF NOT EXISTS contacts (user_id INT NOT NULL , name VARCHAR ( 255 ) NOT NULL, encrypted_data TEXT NOT NULL,FOREIGN KEY (user_id) REFERENCES users(user_id),PRIMARY KEY (user_id, encrypted_data));

