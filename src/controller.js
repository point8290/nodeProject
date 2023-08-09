const pool = require("./db");

const getContacts = async (req, res) => {
  const { userId, page, pageSize, searchText } = req.body;

  if (!userId || !page || !pageSize) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    let getTotalContactCountQuery =
      "SELECT COUNT(*) FROM contacts WHERE user_id = $1";
    const queryParams = [userId];

    if (searchText) {
      getTotalContactCountQuery += " AND name ILIKE $2";
      queryParams.push(`%${searchText}%`);
    }

    const totalContacts = await pool.query(
      getTotalContactCountQuery,
      queryParams
    );
    const totalCount = parseInt(totalContacts.rows[0].count);

    let query =
      "SELECT name, pgp_sym_decrypt_bytea(encrypted_data::bytea,'MYSECRET') as encrypted_number FROM contacts WHERE user_id = $1";
    queryParams.push(pageSize, pageSize * (page - 1));

    if (searchText) {
      query += " AND name ILIKE $2 LIMIT $3 OFFSET $4";
    } else {
      query += " LIMIT $2 OFFSET $3";
    }

    const contactsResult = await pool.query(query, queryParams);
    const rows = contactsResult.rows.map((row) => {
      console.log("row.encrypted_number", row.encrypted_number);
      return {
        name: row.name,
        number: row.encrypted_number.toString(),
      };
    });

    res.status(200).json({ totalCount, rows });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const findCommonUsers = async (req, res) => {
  const { searchNumber } = req.query;

  if (!searchNumber) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    const result = await pool.query(
      `SELECT DISTINCT name, user_id FROM contacts WHERE pgp_sym_decrypt_bytea(encrypted_data::bytea,'MYSECRET') = $1`,
      [searchNumber]
    );
    console.log(result);
    const commonUsers = result.rows.map((row) => row.user_id);

    if (commonUsers.length === 0) {
      return res
        .status(404)
        .json({ error: "No common users found for the provided number" });
    }

    const commonUsersInfo = {
      Name: result.rows[0].name,
      commonUsers: commonUsers,
    };

    res.status(200).json(commonUsersInfo);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addContacts = async (req, res) => {
  const { userId, contacts } = req.body;
  if (!userId || !contacts) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    for (const contact of contacts) {
      const { name, number } = contact;
      if (name && number) {
        const existingContact = await pool.query(
          "SELECT * FROM contacts WHERE user_id = $1 AND pgp_sym_decrypt_bytea(encrypted_data::bytea,'MYSECRET') = $2",
          [userId, number]
        );
        console.log(existingContact.rowCount);

        if (existingContact.rowCount === 0) {
          await pool.query(
            `INSERT INTO contacts (user_id, name, encrypted_data) VALUES ($1, $2, pgp_sym_encrypt($3, 'MYSECRET'))`,
            [userId, name, number]
          );
        }
      }
    }

    res.status(200).json({ success: true, message: "Data saved successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getContacts,
  findCommonUsers,
  addContacts,
};
