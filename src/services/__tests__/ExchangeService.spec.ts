import { prismaCli } from '../../config/db'
import { ExchangeService } from '../ExchangeService'
import { getExchangeData } from '../../mocks/utils'

const exchangeService = new ExchangeService()

describe('exchange service', () => {
  test('should create an exchange', async () => {
    const exchangeData = getExchangeData()
    const exchange = await exchangeService.create(exchangeData)
    expect(exchange.name).toBe(exchangeData.name)
    await prismaCli.exchange.delete({ where: { id: exchange.id } })
  })

  test('should get an exchange', async () => {
    const exchangeData = getExchangeData()
    const exchange = await exchangeService.create(exchangeData)
    const exchange2 = await exchangeService.get(exchange.id)
    expect(exchange2?.name).toBe(exchangeData.name)
    await prismaCli.exchange.delete({ where: { id: exchange.id } })
  })

  test('should get all exchanges', async () => {
    const numbOfExchanges = await prismaCli.exchange.count()
    const exchanges = await exchangeService.getAll(0, 100)
    expect(exchanges.data.length).toBe(numbOfExchanges)
  })

  test('should delete an exchange', async () => {
    const exchangeData = getExchangeData()
    const exchange = await exchangeService.create(exchangeData)
    await exchangeService.delete(exchange.id)
    const exchange2 = await prismaCli.exchange.findUnique({ where: { id: exchange.id } })
    expect(exchange2).toBe(null)
  })
})
