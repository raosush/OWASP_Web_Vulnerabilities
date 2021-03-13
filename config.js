const config = {
	database: {
		host:	  process.env.DB_HOST,
		user: 	  process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		port: 	  process.env.DB_PORT,
		db: 	  process.env.DB
	},
	server: {
		host: '127.0.0.1',
		port: '4000'
	}
};
module.exports = config