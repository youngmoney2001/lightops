export const environment = {
  production: false,
  apiUrl: 'https://38.242.228.212:7000/api',
  websocketUrl: 'wss://38.242.228.212:7000/ws',
  apiVersion: 'v1',
  appName: 'Lightops',
  appVersion: '1.0.0',
  debug: true,
  defaultLanguage: 'fr',
  supportedLanguages: ['fr', 'en'],
  tokenRefreshInterval: 300000, // 5 minutes en millisecondes
  sessionTimeout: 3600000, // 1 heure en millisecondes
  features: {
    geofencing: true,
    realTimeMonitoring: true,
    notifications: true,
    multiLanguage: true,
    darkMode: true
  }
};
