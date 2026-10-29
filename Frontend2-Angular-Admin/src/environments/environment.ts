const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
const rootDomain = host.replace(/^(www|admin|taller|api)\./, '');
const gatewayBase = isHttps ? `https://api.${rootDomain}` : `http://${host}:3000`;

export const environment = {
  production: false,
  graphqlUrl: `${gatewayBase}/graphql`, // gateway → business-service
  aiApiUrl: `${gatewayBase}/api`,
};
