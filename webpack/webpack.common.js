// webpack/webpack.common.js
// Webpack конфигурация для сборки проекта на React с TypeScript и Sass

const path = require('path'); /// для того чтобы превратить относительный путь в абсолютный, мы будем использовать пакет path
const rootDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(rootDir, '.env') });
require('dotenv').config({ path: path.join(rootDir, '.env.local'), override: true });
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Плагин для генерации HTML с правильными путями к скриптам
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // извлекаем CSS из файлов .js при сборке
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Копируем файлы и папки в папку dist
// const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); // Минимизация CSS
const webpack = require('webpack'); //подключаем webpack для использования встроенного плагина EnvironmentPlugin
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'); // Плагин для проверки типов TypeScript в отдельном процессе
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin'); // Плагин для поддержки путей из tsconfig.json

// В  зависимости от того, какой скрипт мы запустили
// переменная production получит либо false, либо true
const production = process.env.NODE_ENV === 'production';

/**
 * Явные ключи process.env.* для браузера (Webpack 5 не полифиллит process;
 * подстановка по каждому ключу надёжнее, чем одна замена всего process.env).
 */
function buildClientProcessEnvDefinitions() {
  const env = { ...process.env };

  // Как у Vite: в клиенте читаются VITE_*; локально часто задают только STORAGE_BUCKET_NAME / SUPABASE_URL
  if (!env.VITE_STORAGE_BUCKET_NAME && env.STORAGE_BUCKET_NAME) {
    env.VITE_STORAGE_BUCKET_NAME = env.STORAGE_BUCKET_NAME;
  }
  if (!env.VITE_SUPABASE_URL && env.SUPABASE_URL) {
    env.VITE_SUPABASE_URL = env.SUPABASE_URL;
  }

  const nodeEnv =
    env.NODE_ENV !== undefined && env.NODE_ENV !== ''
      ? env.NODE_ENV
      : production
        ? 'production'
        : 'development';

  /** @type {Record<string, string>} */
  const defs = {};
  const set = (key, value) => {
    defs[`process.env.${key}`] = JSON.stringify(value ?? '');
  };

  set('NODE_ENV', nodeEnv);
  set('NETLIFY_SITE_URL', env.NETLIFY_SITE_URL ?? '');

  for (const key of Object.keys(env)) {
    if (key.startsWith('VITE_')) {
      set(key, env[key]);
    }
  }

  set('SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY ?? '');

  return defs;
}

const processEnvDefinitions = buildClientProcessEnvDefinitions();

module.exports = {
  entry: path.resolve(__dirname, '..', './src/index.tsx'), // Основной файл для React с TypeScript
  output: {
    path: path.resolve(__dirname, '..', './dist'), // Папка для собранных файлов
    filename: production
      ? 'scripts/[name].[contenthash].js' // Имя итогового бандла, добавляем contenthash к имени файла, если запускаем в режиме production
      : 'scripts/[name].js',

    assetModuleFilename: 'images/[name].[contenthash:8][ext]', // Относительный путь для изображений
    publicPath: '/', // Важно для работы historyApiFallback
    clean: true, // Очищать `dist` перед каждой сборкой
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'], // Указываем файлы, с которыми будет работать webpack
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, '../tsconfig.json'),
      }),
    ], // Поддержка путей из tsconfig.json
    alias: {
      // Псевдонимы для путей
      '@': path.resolve(__dirname, '../src'),
      '@shared': path.resolve(__dirname, '../src/shared'),
      '@entities': path.resolve(__dirname, '../src/entities'),
      '@features': path.resolve(__dirname, '../src/features'),
      '@widgets': path.resolve(__dirname, '../src/widgets'),
      '@pages': path.resolve(__dirname, '../src/pages'),
      '@app': path.resolve(__dirname, '../src/app'),
      '@routes': path.resolve(__dirname, '../src/routes'),
      '@audio': path.resolve(__dirname, '../src/audio'),
      '@models': path.resolve(__dirname, '../src/models'),
      '@config': path.resolve(__dirname, '../src/config'),
    },
    fallback: {
      process: require.resolve('process/browser.js'),
    },
  },

  module: {
    // Правила обработки файлов при сборке
    rules: [
      {
        test: /\.[tj]sx?$/, // Обработка TypeScript файлов
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              // getCustomTransformers: () => ({
              //   before: [require('react-refresh-typescript')()],
              // }),
            },
          },
        ], // Используем ts-loader для компиляции TypeScript
        exclude: /node_modules/, // Исключает папку node_modules
      },
      {
        test: /\.(js|jsx)$/, // Регулярное выражение, которое ищет все обрабатывает все JS файлы через Babel
        use: 'babel-loader', // Используем babel-loader для JS
        exclude: /node_modules/, // Исключает папку node_modules,
      },
      // {
      //   test: /\.pug$/,
      //   loader: 'pug-loader',
      //   options: {
      //     attrs: ['img:src', 'source:srcset'],
      //   },
      // },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          production ? MiniCssExtractPlugin.loader : 'style-loader', // Используем MiniCssExtractPlugin для production, иначе style-loader для разработки
          // style-loader - добавляет CSS в DOM с помощью тега <style>
          // MiniCssExtractPlugin.loader - извлекает CSS в отдельные файлы
          // Если мы используем MiniCssExtractPlugin, то в режиме разработки он не нужен,
          // так как мы будем использовать style-loader для инъекции стилей в DOM
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[name]__[local]__[hash:base64:5]',
                auto: /\.module\.\w+$/i,
                namedExport: false,
              },
              importLoaders: 2, //Значение 2 говорит о том, что некоторые трансформации PostCSS нужно применить до css-loader.
              sourceMap: !production,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: !production,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              // КЛЮЧЕВОЕ: используем новую embedded-реализацию → нет legacy JS API
              implementation: require('sass-embedded'),
              sourceMap: !production,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|webp|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[contenthash:8][ext][query]',
        },
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: 'icons/[name].[contenthash:8][ext]',
        },
      },
    ],
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new CopyWebpackPlugin({
      // Плагин для копирования файлов и папок в папку dist
      patterns: [
        { from: path.resolve(__dirname, '../robots.txt'), to: 'robots.txt' },
        {
          from: path.resolve(__dirname, '../sitemap.xml'), // Путь к файлу sitemap.xml
          to: path.resolve(__dirname, '../dist/'), // Папка в которую нужно скопировать
        },
        {
          from: path.resolve(__dirname, '../_headers'), // Путь к файлу _headers
          to: path.resolve(__dirname, '../dist/'), // Папка в которую нужно скопировать
        },
        // _redirects удалён - используем только netlify.toml для единой логики на dev и production
        {
          from: path.resolve(__dirname, '../src/audio'), // Путь к аудиофайлам в src
          to: path.resolve(__dirname, '../dist/audio'), // Папка назначения в dist
        },
        {
          from: path.resolve(__dirname, '../src/images'), // Путь к фотографиям в src
          to: path.resolve(__dirname, '../dist/images'), // Папка назначения в dist
        },
        {
          from: path.resolve(__dirname, '../src/assets'), // Путь к JSON файлам в src/assets
          to: path.resolve(__dirname, '../dist/assets'), // Папка назначения в dist
          filter: (resourcePath) => {
            // Копируем только JSON файлы
            return resourcePath.endsWith('.json');
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: require('path').resolve(__dirname, '../src/index.html'), // Указываем исходный HTML-шаблон
      inject: 'body', // Скрипты будут вставляться перед закрывающим тегом </body>
      filename: 'index.html', // Имя итогового HTML файла
    }),

    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash:6].css',
    }),

    // Клиент: каждый process.env.KEY → литерал на этапе сборки (без runtime process.env)
    new webpack.DefinePlugin(processEnvDefinitions),
    // Зависимости, обращающиеся к process как к объекту (не только process.env)
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
    }),
  ],

  // optimization: {
  //   minimize: true,
  //   minimizer: [
  //     new CssMinimizerPlugin(), // Минимизация CSS с помощью CssMinimizerPlugin
  //   ],
  // },

  performance: {
    hints: false, // не отображаются предупреждения и ошибки по производительности
  },
};
