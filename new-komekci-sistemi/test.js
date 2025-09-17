const bcrypt = require('bcrypt');

const password = '654731Cyber!';
const saltRounds = 10; // Recommended value is between 10-12

bcrypt.hash(password, saltRounds)
  .then(hash => {
    // This is the hashed password you'd store in your database
    console.log('Hashed Password:', hash);
  })
  .catch(err => {
    console.error('Error hashing password:', err);
  });