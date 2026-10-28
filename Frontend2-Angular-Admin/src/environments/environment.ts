const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export const environment = {
  production: false,
  graphqlUrl: `http://${host}:3000/graphql`, // gateway → business-service
  aiApiUrl: `http://${host}:3000/api`,
};
