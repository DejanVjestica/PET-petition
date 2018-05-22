const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:dvjes:postgres@localhost:5432/petition");
// const db = spicedPg("postgres:spicedling:password@localhost:5432/petition");

exports.signPetition = function(first, last, sig) {
    return db.query(
        `INSERT INTO signatures (first, last, signature)
		VALUES ($1, $2, $3) RETURNING id`,
        [first, last, sig]
    );
};
