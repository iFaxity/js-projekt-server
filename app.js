const fs = require('fs');
const Koa = require('koa');
const etag = require('koa-etag');
const conditional = require('koa-conditional-get');
const cors = require('@koa/cors');
const morgan = require('koa-morgan');
const bodyParser = require('koa-bodyparser');

const index = require('./routes');
const app = new Koa();

const { NODE_ENV } = require('@ifaxity/env');

// Error handler
app.use(async (ctx, next) => {
  try {
    await next();

    if (!ctx.status || ctx.status == 404) {
      ctx.throw(404);
    }
  } catch (ex) {
    // Render the error page
    ctx.status = ex.status || 500;
    ctx.body = {
      status: ctx.status,
      message: ex.message || 'Generellt serverfel',
    };
  }
});

if (NODE_ENV == 'production') {
  // Trust nginx proxy
  app.proxy = true;

  // Apache style access.log
  app.use(morgan('combined', {
    stream: fs.createWriteStream(`${__dirname}/access.log`, { flags: 'a' }),
  }));
} else if (NODE_ENV == 'development') {
  // In development we use stdout instead with less info
  app.use(morgan('dev'));
}

// Add etag support
app.use(conditional());
app.use(etag());
// Add cors support
app.use(cors());

// Add parser for json and urlencoded body
// Available as ctx.request.body;
app.use(bodyParser());

// Mount routes
app.use(index.routes());

module.exports = app;
