/**
 * Script to fix MongoDB username index issue
 * Run this ONCE on your server to remove the old username index
 * 
 * Usage: node fix_mongodb_index.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function fixUserIndexes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // List all indexes
        console.log('\nCurrent indexes on users collection:');
        const indexes = await usersCollection.indexes();
        indexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key));
        });

        // Check if username_1 index exists
        const hasUsernameIndex = indexes.some(index => index.name === 'username_1');

        if (hasUsernameIndex) {
            console.log('\n⚠️  Found username_1 index - Dropping it...');
            await usersCollection.dropIndex('username_1');
            console.log('✓ Dropped username_1 index');
        } else {
            console.log('\n✓ No username_1 index found (already removed or never existed)');
        }

        // List indexes after removal
        console.log('\nIndexes after cleanup:');
        const newIndexes = await usersCollection.indexes();
        newIndexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key));
        });

        console.log('\n✅ Database indexes fixed!');
        console.log('You can now use Google Sign-In without errors.');

        await mongoose.connection.close();
        console.log('\n✓ Connection closed');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

fixUserIndexes();
