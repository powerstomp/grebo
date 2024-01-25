import pg from 'pg';
import config from './config.json' with { type: 'json' };

const pool = new pg.Pool(config.db);

pool.connect()
	.then(client => {
		console.log('Connected to database.');
		client.release();
	}).catch(error => {
		console.error(`Error connecting to database: ${error}`);
		process.exit(1);
	});

export { pool };
