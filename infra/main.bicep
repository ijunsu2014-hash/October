targetScope = 'subscription'

param environmentName string
param location string
param sessionId string
param deployedBy string
param createdAt string
param entraAdminObjectId string
param entraAdminName string
param useExistingPostgres bool = false
@secure()
param jwtSecret string
param appDbName string = 'simsimplay'

var postgresHost = 'psql-simsimplay-dev-958f.postgres.database.azure.com'

var tags = {
  'app-onboard-skill': 'true'
  'app-onboard-session-id': sessionId
  'created-at': createdAt
  environment: environmentName
  'deployed-by': deployedBy
}

resource rg 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: 'rg-simsimplay-dev-958f'
  location: location
  tags: tags
}

module monitoring 'modules/monitoring.bicep' = {
  scope: rg
  name: 'monitoring'
  params: {
    location: location
    tags: tags
    workspaceName: 'log-simsimplay-dev-958f'
    appInsightsName: 'appi-simsimplay-dev-958f'
  }
}

module postgres 'modules/postgres.bicep' = if (!useExistingPostgres) {
  scope: rg
  name: 'postgres'
  params: {
    location: location
    tags: tags
    serverName: 'psql-simsimplay-dev-958f'
    databaseName: appDbName
    entraAdminObjectId: entraAdminObjectId
    entraAdminName: entraAdminName
    tenantId: tenant().tenantId
  }
}

module redis 'modules/redis.bicep' = {
  scope: rg
  name: 'redis'
  params: {
    location: location
    tags: tags
    redisName: 'redis-simsimplay-dev-958f'
  }
}

module api 'modules/app-service.bicep' = {
  scope: rg
  name: 'api'
  params: {
    location: location
    tags: tags
    appName: 'app-simsimplay-dev-958f'
    planName: 'asp-simsimplay-dev-958f'
  }
}

module web 'modules/static-web-app.bicep' = {
  scope: rg
  name: 'web'
  params: {
    location: 'eastasia'
    tags: tags
    appName: 'swa-simsimplay-dev-958f'
  }
}

module appConfig 'modules/app-settings.bicep' = {
  scope: rg
  name: 'api-app-settings'
  dependsOn: [
    postgres
  ]
  params: {
    appName: 'app-simsimplay-dev-958f'
    appPrincipalId: api.outputs.principalId
    appDbName: appDbName
    postgresHost: postgresHost
    redisHost: redis.outputs.host
    instrumentationConnectionString: monitoring.outputs.connectionString
    jwtSecret: jwtSecret
    allowedOrigin: 'https://${web.outputs.defaultHostname}'
  }
}

module redisAccess 'modules/role-assignments.bicep' = {
  scope: rg
  name: 'redis-data-access'
  dependsOn: [
    redis
  ]
  params: {
    redisName: 'redis-simsimplay-dev-958f'
    appPrincipalId: api.outputs.principalId
  }
}

module githubOidc 'modules/github-oidc.bicep' = {
  scope: rg
  name: 'github-oidc'
  dependsOn: [
    api
    web
  ]
  params: {
    location: location
    tags: tags
    identityName: 'id-simsimplay-dev-958f-github'
    appName: 'app-simsimplay-dev-958f'
    staticWebAppName: 'swa-simsimplay-dev-958f'
  }
}

output apiBaseUrl string = 'https://${api.outputs.defaultHostName}'
output staticWebAppUrl string = 'https://${web.outputs.defaultHostname}'
output githubClientId string = githubOidc.outputs.clientId
output githubTenantId string = tenant().tenantId
output githubSubscriptionId string = subscription().subscriptionId