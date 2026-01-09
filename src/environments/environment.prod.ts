export const environment = {
  production: true,
  apiUrl: 'https://38.242.228.212:7000/api',
  apiVersion: 'v1',
  appName: 'Lightops',
  appVersion: '1.0.0',
  debug: false,
  defaultLanguage: 'fr',
  supportedLanguages: ['fr', 'en'],
  tokenRefreshInterval: 300000,
  sessionTimeout: 3600000,
  features: {
    geofencing: true,
    realTimeMonitoring: true,
    notifications: true,
    multiLanguage: true,
    darkMode: true
  }
};
