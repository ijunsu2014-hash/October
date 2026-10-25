param appName string
param appPrincipalId string
param appDbName string
param postgresHost string
param redisHost string
param instrumentationConnectionString string
param allowedOrigin string
@secure()
param jwtSecret string

resource app 'Microsoft.Web/sites@2026-08-01' existing = {
  name: appName
}

resource appSettings 'Microsoft.Web/sites/config@2023-12-01' = {
  parent: app
  name: 'appsettings'
  properties: {
    NODE_ENV: 'production'
    SCM_DO_BUILD_DURING_DEPLOYMENT: 'false'
    ENABLE_ORYX_BUILD: 'false'
    NPM_CONFIG_PRODUCTION: 'false'
    ORYX_DISABLE_COMPRESSION: 'true'
    WEBSITES_CONTAINER_START_TIME_LIMIT: '1800'
    WEBSITE_NODE_DEFAULT_VERSION: '~22'
    AZURE_USE_MANAGED_IDENTITY: 'true'
    AZURE_REDIS_USERNAME: appPrincipalId
    PGHOST: postgresHost
    PGPORT: '5432'
    PGDATABASE: appDbName
    PGUSER: appName
    PGSSLMODE: 'require'
    REDIS_URL: 'rediss://${redisHost}:10000'
    APPLICATIONINSIGHTS_CONNECTION_STRING: instrumentationConnectionString
    ApplicationInsightsAgent_EXTENSION_VERSION: '~3'
    JWT_SECRET: jwtSecret
  }
}

resource webConfig 'Microsoft.Web/sites/config@2023-12-01' = {
  parent: app
  name: 'web'
  properties: {
    cors: {
      allowedOrigins: [allowedOrigin]
      supportCredentials: false
    }
  }
}