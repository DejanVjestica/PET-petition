const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:dvjes:postgres@localhost:5432/petition");
const bcrypt = require("bcryptjs");

// ========================================================
// ================ Hashing a password ====================
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
// ========================================================
// ================ Login and Registration ================
// ========================================================
// exports.getUserByEmail = function(email) {
//     return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
// `
// SELECT first, last, hash_password, users.id as user_id, signatures.id as sig_id
// FROM users
// LEFT JOIN signatures
// ON signatures.user_id = users.id
// WHERE email = $1
// `
// };
exports.getUserByEmail = function(email) {
    return db.query(
        `
		SELECT first, last, hash_password, users.id as user_id, signatures.id as sig_id
		FROM users
		LEFT JOIN signatures
		ON signatures.user_id = users.id
		WHERE email = $1
		`,
        [email]
    );
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
// exports.login = function(email, password) {
//     return db.query(
//         `INSERT INTO users (email, hash_password)
// 		VALUES ($1, $2) RETURNING id`,
//         [email, password]
//     );
// };
exports.profile = function(age, city, homepage, userId) {
    return db.query(
        `INSERT INTO user_profiles (age, city, homepage, user_id)
		VALUES ($1, $2, $3, $4) RETURNING age, city, homepage, user_id`,
        [age, city, homepage, userId]
    );
};
// ========================================================
// ================ Petition ==============================
// ========================================================
exports.signPetition = function(user_id, sig) {
    return db.query(
        `INSERT INTO signatures (user_id, signature)
		VALUES ($1, $2) RETURNING id`,
        [user_id, sig]
    );
};

exports.getSignatureById = function(sigId) {
    return db
        .query("SELECT signature FROM signatures WHERE id=$1", [sigId])
        .then(function(results) {
            // console.log(results);
            return results.rows[0].signature;
        });
};

exports.getSigners = function() {
    return db.query(`
	   SELECT *
	   FROM users
	   LEFT JOIN user_profiles
	   ON users.id = user_profiles.user_id;
	   `);
};
module.exports.getSignersByCity = function getSignersByCity(city) {
    return db.query(
        `
        SELECT first, last
        FROM users
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE LOWER(city) = LOWER($1)
        `,
        [city]
    );
};
// ========================================================
// ================ Profile ===============================
// ========================================================

module.exports.updateUser = function updateUser(first, last, email, user_id) {
    return db.query(
        `
       UPDATE users
       SET first = $1, last = $2, email = $3
       WHERE id = $4
       `,
        [first, last, email, user_id]
    );
};
