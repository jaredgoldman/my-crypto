import { Exchange } from '@prisma/client'
import { prismaCli } from '../config/db'
import { v4 as uuid } from 'uuid'
import { Paginated } from '@src/types/api'

export type ExchangeCreationParams = Pick<Exchange, 'name' | 'url' | 'image'>

export class ExchangeService {
  async get(id: string): Promise<Exchange | null> {
    return await prismaCli.exchange.findFirst({ where: { id } })
  }

  async getAll(page: number, limit: number): Promise<Paginated<Exchange>> {
    const exchanges = await prismaCli.exchange.findMany({
      skip: page ? page * limit : 0,
      take: limit,
    })

    return {
      data: exchanges,
      next: exchanges.length === limit ? page + 1 : null,
      previous: page > 0 ? page - 1 : null,
    }
  }

  async create(params: ExchangeCreationParams): Promise<Exchange> {
    return await prismaCli.exchange.create({
      data: {
        id: uuid(),
        name: params.name,
        url: params.url,
        image: params.image,
      },
    })
  }

  async delete(id: string): Promise<Exchange> {
    return await prismaCli.exchange.delete({ where: { id } })
  }
}
