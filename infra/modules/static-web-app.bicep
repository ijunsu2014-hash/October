param location string
param tags object
param appName string

resource staticWebApp 'Microsoft.Web/staticSites@2025-05-01' = {
	name: appName
	location: location
	tags: tags
	sku: {
		name: 'Standard'
		tier: 'Standard'
	}
	properties: {}
}

output defaultHostname string = staticWebApp.properties.defaultHostname