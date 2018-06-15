const webpack = require('webpack');

module.exports = {
  webpack: config => {
    config.devtool = 'source-map';
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          APP_ENV: JSON.stringify(process.env.APP_ENV || 'local'),
          APP_VER: JSON.stringify(new Date().toLocaleString()),
        },
      }),
    );
    config.module.rules.push({
      test: /\.(svg|png)$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 9999999999,
          },
        },
      ],
    });
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    });
    config.module.rules[0].use.push({
      loader: '@mtfe/wets-image-loader',
      options: {
        limit: 8,
        outputPath: '/statics/'
      },
    });
    return config;
  },
};
