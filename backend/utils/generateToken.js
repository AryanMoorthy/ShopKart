const jwt = require('jsonwebtoken');

const generateToken = (res, customerId) => {
  const token = jwt.sign({ id: customerId }, process.env.JWT_SECRET || 'shopkart_super_secret_jwt_key_2026', {
    expiresIn: '1d'
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  return token;
};

module.exports = generateToken;
