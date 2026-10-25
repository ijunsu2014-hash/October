param location string
param tags object
param redisName string

resource redis 'Microsoft.Cache/redisEnterprise@2026-09-01' = {
	name: redisName
	location: location
	tags: tags
	sku: {
		name: 'Balanced_B0'
	}
	properties: {
		minimumTlsVersion: '1.2'
		publicNetworkAccess: 'Enabled'
		highAvailability: 'Enabled'
	}
}

resource database 'Microsoft.Cache/redisEnterprise/databases@2026-09-01' = {
	parent: redis
	name: 'default'
	properties: {
		accessKeysAuthentication: 'Disabled'
		clientProtocol: 'Encrypted'
		clusteringPolicy: 'OSSCluster'
		evictionPolicy: 'VolatileLRU'
		modules: []
		port: 10000
	}
}

output id string = redis.id
output host string = redis.properties.hostName