const router = require('@koa/router')();
const Auth = require('../lib/auth');
const Depot = require('../lib/depot');
const User = require('../lib/user');

const BALANCE_PRECISION = 2;

// Better rounding
function roundNumber(value, precision) {
  const num = 10 ** precision;
  return Math.round(value * num) / num;
}

// Routes.
router.get('/', async ctx => {
  const data = {
    depot: await Depot.list(),
  };

  try {
    const { email } = await Auth.authorize(ctx);
    const { depot, balance } = await User.read(email);

    data.balance = balance;

    for (let item of Object.values(data.depot)) {
      item.amount = depot[item.id] || 0;
    }
  } catch {
    // Errors only throw if not authorized
  }

  ctx.body = { status: 200, data };
});
router.post('/buy', Auth.middleware, async ctx => {
  const { id, amount } = ctx.request.body;
  const { email } = ctx.payload;
  const { price } = await Depot.read(id);
  const { balance, depot } = await User.read(email);
  const newBalance = roundNumber(balance - price * amount, BALANCE_PRECISION);

  if (newBalance < 0) {
    throw new Error('Användaren saknar medel för att betala.');
  }

  const newAmount = depot[id] = amount + (depot[id] || 0);
  await User.update(email, { balance: newBalance, depot });

  ctx.body = {
    status: 200,
    message: 'Köpet lyckades',
    data: { balance: newBalance, amount: newAmount },
  };
});
router.post('/sell', Auth.middleware, async ctx => {
  const { id, amount } = ctx.request.body;
  const { email } = ctx.payload;
  const { price } = await Depot.read(id);
  const { balance, depot } = await User.read(email);
  const newBalance = roundNumber(balance + price * amount, BALANCE_PRECISION);

  if (!depot[id] || depot[id] < amount) {
    throw new Error('Kan inte sälja för mer än vad du har.');
  }

  const newAmount = depot[id] -= amount;
  await User.update(email, { balance: newBalance, depot });

  ctx.body = {
    status: 200,
    message: 'Säljandet lyckades',
    data: { balance: newBalance, amount: newAmount },
  };
});
router.post('/balance', Auth.middleware, async ctx => {
  const { amount } = ctx.request.body;
  const { email } = ctx.payload;
  const { balance } = await User.read(email);
  const data = { balance: balance + amount };

  await User.update(email, data);

  ctx.body = {
    status: 200,
    message: 'Betalmedel tillagt',
    data,
  };
});

// Authentication routes.
router.post('/register', async ctx => {
  const { email, name, password } = ctx.request.body;
  await Auth.register({ email, name, password });

  ctx.body = {
    status: 200,
    message: 'Användaren skapades',
  };
});
router.post('/login', async ctx => {
  const { email, password } = ctx.request.body;
  const token = await Auth.login(email, password);

  ctx.body = {
    status: 200,
    message: 'Inloggning lyckades',
    token,
  };
});

module.exports = router;
