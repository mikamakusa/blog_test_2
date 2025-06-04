import bcrypt from 'bcryptjs';

async function createHashedPassword(password: string) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Original password:', password);
    console.log('Hashed password:', hash);
    
    // Verify the hash
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Verification successful:', isMatch);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Replace 'your-password' with the actual password you want to hash
createHashedPassword('Amakusa01+'); 