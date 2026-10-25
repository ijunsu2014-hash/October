param location string
param tags object
param identityName string
param appName string
param staticWebAppName string

var websiteContributorRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'de139f84-1756-47ae-9be6-808fbbe84772')
var staticWebAppRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c')

resource githubIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' = {
  name: identityName
  location: location
  tags: tags
}

resource githubFederation 'Microsoft.ManagedIdentity/userAssignedIdentities/federatedIdentityCredentials@2024-11-30' = {
  parent: githubIdentity
  name: 'github-production'
  properties: {
    issuer: 'https://token.actions.githubusercontent.com'
    audiences: [
      'api://AzureADTokenExchange'
    ]
    subject: 'repo:ijunsu2014-hash@277180662/October@1412652139:environment:production'
  }
}

resource app 'Microsoft.Web/sites@2026-08-01' existing = {
  name: appName
}

resource staticWebApp 'Microsoft.Web/staticSites@2025-05-01' existing = {
  name: staticWebAppName
}

resource apiDeploymentAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(app.id, githubIdentity.id, websiteContributorRoleDefinitionId)
  scope: app
  properties: {
    roleDefinitionId: websiteContributorRoleDefinitionId
    principalId: githubIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource webDeploymentAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(staticWebApp.id, githubIdentity.id, staticWebAppRoleDefinitionId)
  scope: staticWebApp
  properties: {
    roleDefinitionId: staticWebAppRoleDefinitionId
    principalId: githubIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

output clientId string = githubIdentity.properties.clientId