const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:dvjes:postgres@localhost:5432/petition");
const bcrypt = require("bcryptjs");

// ========================================================
// ================ Login and Registration ================
// ========================================================
exports.hashPassword = function(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
};
exports.checkPassword = function(
    textEnteredInLoginForm,
    hashedPasswordFromDatabase
) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
};
// --------------------------------------------------------
exports.getUserByEmail = function(email) {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
};
exports.getSigIdByUserId = function(id) {
    return db.query(`SELECT * FROM signatures WHERE user_id = $1`, [id]);
};

exports.registerUser = function(first, last, email, password) {
    return db.query(
        `INSERT INTO users (first, last, email, hash_password)
		VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, password]
    );
};

// ========================================================
// ================ Petition ==============================
// ========================================================
exports.signPetition = function(id, first, last, sig) {
    return db.query(
        `INSERT INTO signatures (user_id, first, last, signature)
		VALUES ($1, $2, $3, $4) RETURNING id`,
        [id, first, last, sig]
    );
};

exports.getSignatureById = function(sigId) {
    return db
        .query("SELECT signature FROM signatures WHERE id=$1", [sigId])
        .then(function(results) {
            console.log(results);
            return results.rows[0].signature;
        });
};

exports.signers = function() {
    return db
        .query("SELECT firstName, lastName FROM signatures")
        .then(function(results) {
            return results.rows;
        });
};
