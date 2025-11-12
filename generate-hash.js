const bcrypt = require('bcryptjs');

bcrypt.hash('kepaladinas123', 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password: kepaladinas123');
    console.log('Hash:', hash);
  }
  process.exit(0);
});
