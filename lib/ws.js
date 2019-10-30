const socketio = require('socket.io');
const Depot = require('./depot');

// Constants
const UPDATE_FREQ = 5; // Update frequency in seconds

const DEBOOST_START = 30;
const DEBOOST_END = 25;
const BOOST_START = 3;
const BOOST_END = 8;

const NO_BOOST = 0;
const DEBOOST = 1;
const BOOST = 2;

function pseudoRandom({ boost, price }) {
  let threshold = 0.5;

  // Adaptive debooster, will boost/deboost chances according to price
  if (boost == BOOST) {
    threshold -= Math.min(0.3, 1.5 / price);
  } else if (boost == DEBOOST) {
    threshold += Math.min(0.4, price / 300);
  }

  return Math.random() > threshold ? 1 : -1;
}


// Prevent the stocks from staying above or below a certain limit for too long
function updateBoost(item) {
  if (item.boost == NO_BOOST) {
    if (item.price >= DEBOOST_START) {
      return DEBOOST;
    } else if (item.price <= BOOST_START) {
      return BOOST;
    }
  } else if (item.price <= DEBOOST_END || item.price >= BOOST_END) {
    return NO_BOOST;
  }

  return item.boost;
}

function updatePrice(item) {
  item.boost = updateBoost(item);

  const variance = item.variance * pseudoRandom(item);
  item.price = Math.max(0, item.price * item.rate + variance);

  return { id: item.id, title: item.title, price: item.price };
}

module.exports = async function ws(server) {
  const io = socketio(server);
  const items = await Depot.list();

  // Add boost prop for tracking booster status
  items.forEach(item => { item.boost = NO_BOOST });

  setInterval(async () => {
    const prices = items.map(updatePrice);

    await Promise.all(prices.map(({ id, price }) => Depot.update({ id, price })));
    io.emit('price-update', prices);
  }, 1000 * UPDATE_FREQ);
};
