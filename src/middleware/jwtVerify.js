const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = 'secretkey'
const validateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader.split(" ")[1]
    if (!token) {
        res.status(400).send("Token not present")
    } else {
        jwt.verify(token, ACCESS_TOKEN_SECRET, (err, token) => {
            if (err) {
                res.status(401).send("Token invalid");
            } else {
                req.token = token
                next();
            }
        });
    }
}

module.exports = {validateToken}
