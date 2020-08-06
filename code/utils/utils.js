module.exports = {
    getConnection: getConnection
}

function getConnection(pool){
	return new Promise((resolve, reject) => {
		pool.getConnection(async function(err, connection) {
			if (err) return reject(err)
      		resolve(connection)
		});
	})
}