const { withNativeFederation } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'admin-app',

  exposes: {
    './lifecycles': './src/bootstrap.ts',
  },

  // El host es React: no compartimos nada, el remoto va autocontenido (ESM).
  shared: {},

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ],

});
