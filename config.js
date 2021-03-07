const config = {
	database: {
		host:	  'localhost',
		user: 	  process.env.database_user,
		port: 	  3306,
		db: 	  process.env.database
	},
	server: {
		host: '127.0.0.1',
		port: '4000'
	}
};
module.exports = config