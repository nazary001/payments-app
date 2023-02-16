import { Pool } from "pg";

import config from "./utils/config";
import logger from "./utils/logger";

const pool = new Pool({
	connectionString: config.dbUrl,
	connectionTimeoutMillis: 5000,
	ssl: config.dbUrl.includes("localhost")
		? false
		: { rejectUnauthorized: false },
});

/**
 * above `connectionString` will require system user being able to access the `asd` db
 * if not allowed, then you might see error:
 * 	Error: role "Username" does not exist
 * troubleshooting:
 * 1. log in to psql and connect to the asd db, the run below script:
 *
 * create user "Username" with login;
 * --- Username must be your name used to loging to your computer
 *
 * 2. edit connection policy to your Postgres db server to trust for
 * all connections localhost. this needs to be set in <path to pgsql server>\data\pg_hba.conf:
 * # TYPE  DATABASE        USER            ADDRESS                 METHOD
 * # IPv4 local connections:
 * host    all             all             127.0.0.1/32            trust
 * # IPv6 local connections:
 * host    all             all             ::1/128                 trust
 */


export const connectDb = async () => {
	let client;
	try {
		client = await pool.connect();
	} catch (err) {
		logger.error("%O", err);
		process.exit(1);
	}
	logger.info("Postgres connected to %s", client.database);
	client.release();
};

export const disconnectDb = () => pool.end();

/**
 * Access this with `import db from "path/to/db";` then use it with
 * `await db.query("<SQL>", [...<variables>])`.
 */
export default {
	query: (...args) => {
		logger.debug("Postgres querying %O", args);
		return pool.query.apply(pool, args);
	},
};