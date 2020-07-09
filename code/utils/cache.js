const nodeCache = require("node-cache");

class Cache {
	constructor(ttlSeconds) {
		this.cache = new nodeCache.NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
	}
}

module.exports = Cache;