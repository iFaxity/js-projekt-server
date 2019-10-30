const socketio = require('socket.io');
const Depot = require('./depot');

// Constants
//const UPDATE_FREQ = 5; // Update frequency in seconds
const UPDATE_FREQ = 0.1; // Update frequency in seconds

const DEBOOST_START = 30;
const DEBOOST_END = 25;
const BOOST_START = 3;
const BOOST_END = 8;

const NO_BOOST = 0;
const DEBOOST = 1;
const BOOST = 2;

// Returns 1 or -1
// Not really random and will shift to hold a certain balance
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

module.exports = async function ws(server) {
  const io = socketio(server);
  const items = await Depot.list();

  // Add boost prop for tracking booster status
  // Won't get set to the database
  for (let item of items) {
    item.boost = NO_BOOST;
  }

  async function updatePrices() {
    // Simple wiener process for price simulation
    for (let item of items) {
      // Prevent the stocks from staying above or below a certain limit for too long
      if (item.boost == NO_BOOST) {
        if (item.price >= DEBOOST_START) {
          item.boost = DEBOOST;
        } else if (item.price <= BOOST_START) {
          item.boost = BOOST;
        }
      } else if (
        item.boost == DEBOOST && item.price <= DEBOOST_END
        || item.boost == BOOST && item.price >= BOOST_END
      ) {
        item.boost = NO_BOOST;
      }

      const variance = item.variance * pseudoRandom(item);
      item.price = Math.max(0, item.price * item.rate + variance);
    }

    // Only update price
    await Promise.all(items.map(({ id, price }) => {
      return Depot.update({ id, price });
    }));

    const prices = items.map(({ id, title, price }) => {
      return { id, title, price, };
    });

    io.emit('price-update', prices);
  }

  setInterval(updatePrices, 1000 * UPDATE_FREQ);

  //TODO: update stock on buy/sell
  // Buy/sell happens in REST server but updates via websocket
  console.log('Websocket started');
};
