const path = require("path");

module.exports = {
	getConnection: getConnection,
	imageValidator: imageValidator
};

function getConnection(pool){
	return new Promise((resolve, reject) => {
		pool.getConnection(async function(err, connection) {
			if (err) return reject(err);
			resolve(connection);
		});
	});
}

function imageValidator(req, file, cb){
	const allowedExtentions = [".jpg", ".jpeg", ".png", ".gif"];
	const fileExtention = path.extname(file.originalname).toLowerCase();

	let hasFound = false;
	for(let i = 0; i < allowedExtentions.length; i++){
		if(allowedExtentions[i] === fileExtention){
			hasFound = true;
			break;
		}
	}

	if(!hasFound) return cb(new Error("Only image files with extentions jpg, jpeg, png and gif are allowed"), false);
	return cb(null, true);
}