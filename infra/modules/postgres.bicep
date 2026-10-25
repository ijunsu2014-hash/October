param location string
param tags object
param serverName string
param databaseName string
param entraAdminObjectId string
param entraAdminName string
param tenantId string
param entraAdminType string = 'User'

resource server 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
	name: serverName
	location: location
	tags: tags
	sku: {
		name: 'Standard_B1ms'
		tier: 'Burstable'
	}
	properties: {
		version: '16'
		authConfig: {
			activeDirectoryAuth: 'Enabled'
			passwordAuth: 'Disabled'
			tenantId: tenantId
		}
		storage: {
			storageSizeGB: 32
		}
		backup: {
			backupRetentionDays: 7
			geoRedundantBackup: 'Disabled'
		}
		highAvailability: {
			mode: 'Disabled'
		}
		network: {
			publicNetworkAccess: 'Enabled'
		}
	}
}

resource admin 'Microsoft.DBforPostgreSQL/flexibleServers/administrators@2024-08-01' = {
	parent: server
	name: entraAdminObjectId
	properties: {
		principalName: entraAdminName
		principalType: entraAdminType
		tenantId: tenantId
	}
}

resource firewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {
	parent: server
	name: 'AllowAllAzureServicesAndResourcesWithinAzureIps'
	properties: {
		startIpAddress: '0.0.0.0'
		endIpAddress: '0.0.0.0'
	}
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
	parent: server
	name: databaseName
	properties: {
		charset: 'UTF8'
		collation: 'en_US.utf8'
	}
}

resource config 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2024-08-01' = {
	parent: server
	name: 'azure.extensions'
	properties: {
		value: 'uuid-ossp,pgcrypto,pg_trgm'
		source: 'user-override'
	}
}

output id string = server.id
output host string = '${server.name}.postgres.database.azure.com'