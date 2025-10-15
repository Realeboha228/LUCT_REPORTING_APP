// hash_passwords.js
// Run this file to generate hashed passwords for your SQL script

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function generateHashes() {
  console.log('='.repeat(60));
  console.log('🔐 GENERATING HASHED PASSWORDS');
  console.log('='.repeat(60));
  
  try {
    // Hash passwords
    const lecturerHash = await bcrypt.hash('lec123', SALT_ROUNDS);
    const prlHash = await bcrypt.hash('prl123', SALT_ROUNDS);
    const plHash = await bcrypt.hash('pl123', SALT_ROUNDS);
    
    console.log('\n✅ Hashed Passwords Generated:\n');
    console.log('Lecturer Password (lec123):');
    console.log(lecturerHash);
    console.log('\nPRL Password (prl123):');
    console.log(prlHash);
    console.log('\nPL Password (pl123):');
    console.log(plHash);
    console.log('\n' + '='.repeat(60));
    console.log('📋 Copy these hashes and use them in the SQL script below');
    console.log('='.repeat(60));
    
    // Generate SQL Update Statements
    console.log('\n\n-- SQL UPDATE STATEMENTS:');
    console.log('\n-- Update ALL Lecturers');
    console.log(`UPDATE users SET password = '${lecturerHash}' WHERE role = 'lecturer';`);
    
    console.log('\n-- Update ALL PRLs');
    console.log(`UPDATE users SET password = '${prlHash}' WHERE role = 'PRL';`);
    
    console.log('\n-- Update PL');
    console.log(`UPDATE users SET password = '${plHash}' WHERE role = 'PL';`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generateHashes();