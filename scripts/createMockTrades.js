const fs = require('fs')

const trade = {
  info: {
    ordertxid: 'O4FLQY-SJ45P-B46C4L',
    postxid: 'TKH2SE-M7IF5-CFI7LT',
    pair: 'ALGOUSD',
    time: '1640059608.0367324',
    type: 'buy',
    ordertype: 'limit',
    price: '1.326410',
    cost: '0.000008',
    fee: '0.000000',
    vol: '0.00000627',
    margin: '0.000000',
    misc: '',
    id: 'TIJA6H-4Y3R3-W54EEV',
  },
  timestamp: 1640059608036,
  datetime: '2021-12-21T04:06:48.036Z',
  symbol: 'ALGO/USD',
  type: 'limit',
  side: 'buy',
  takerOrMaker: undefined,
  price: 1.32641,
  amount: 0.00000627,
  cost: 0.000008,
  fee: { cost: 0, currency: 'USD' },
  fees: [{ cost: 0, currency: 'USD' }],
}

const trades = []

for (let i = 0; i < 100; i++) {
  const newTrade = {
    ...trade,
    id: `TIJA6H-4Y3R3-W54EEV-${i}`,
    info: {
      ...trade.info,
      ordertxid: `O4FLQY--${i}`,
      postxid: `TKH2SE--${i}`,
    },
    order: `O4FLQY-SJ45P-B46C4L-${i}`,
    timestamp: trade.timestamp + i,
    datetime: new Date(trade.timestamp + i).toISOString(),
  }
  trades.push(newTrade)
}

fs.writeFileSync('src/mocks/trades.json', JSON.stringify(trades, null, 2))
