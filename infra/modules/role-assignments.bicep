param redisName string
param appPrincipalId string

resource redis 'Microsoft.Cache/redisEnterprise@2026-09-01' existing = {
	name: redisName
}

resource database 'Microsoft.Cache/redisEnterprise/databases@2026-09-01' existing = {
	parent: redis
	name: 'default'
}

resource appAccess 'Microsoft.Cache/redisEnterprise/databases/accessPolicyAssignments@2026-05-01-preview' = {
	parent: database
	name: 'apiManagedIdentity'
	properties: {
		accessPolicyName: 'default'
		accessString: '+@read +@write +ping +client|setinfo ~*'
		user: {
			objectId: appPrincipalId
		}
	}
}