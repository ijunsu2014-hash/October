param location string
param tags object
param appName string
param planName string

resource plan 'Microsoft.Web/serverfarms@2026-08-01' = {
	name: planName
	location: location
	tags: tags
	sku: {
		name: 'B1'
		tier: 'Basic'
		size: 'B1'
		family: 'B'
		capacity: 1
	}
	kind: 'linux'
	properties: {
		reserved: true
	}
}

resource app 'Microsoft.Web/sites@2026-08-01' = {
	name: appName
	location: location
	tags: tags
	identity: {
		type: 'SystemAssigned'
	}
	kind: 'app,linux'
	properties: {
		serverFarmId: plan.id
		httpsOnly: true
		siteConfig: {
			linuxFxVersion: 'NODE|22-lts'
			minTlsVersion: '1.2'
			ftpsState: 'Disabled'
			healthCheckPath: '/api/health'
			alwaysOn: true
		}
	}
}

resource scmAuth 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2023-12-01' = {
	parent: app
	name: 'scm'
	properties: {
		allow: false
	}
}

resource ftpAuth 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2023-12-01' = {
	parent: app
	name: 'ftp'
	properties: {
		allow: false
	}
}

output principalId string = app.identity.principalId
output appId string = app.id
output defaultHostName string = app.properties.defaultHostName