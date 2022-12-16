export const mockFetchMyTrades = jest.fn()
const mock = jest.fn().mockImplementation(() => {
  return { fetchMyTrades: mockFetchMyTrades }
})

export default mock
