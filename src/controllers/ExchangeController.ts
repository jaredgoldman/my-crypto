import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse } from 'tsoa'
import { Exchange } from '@prisma/client'
import { ExchangeService, ExchangeCreationParams } from '../services/ExchangeService'
import { PaginatedResponse, Response, ResponseMessage } from '../types/api'

@Route('exchanges')
export class ExchangeController extends Controller {
  private exchangeService = new ExchangeService()
  @SuccessResponse('200', 'OK')
  @Get()
  public async getExchanges(
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10
  ): Promise<PaginatedResponse<Exchange>> {
    const data = await this.exchangeService.getAll(page, limit)
    return { data, message: ResponseMessage.success, statusCode: 200 }
  }

  @SuccessResponse('200', 'OK')
  @Get('{id}')
  public async getExchange(@Path('id') id: string): Promise<Response<Exchange>> {
    const data = await this.exchangeService.get(id)
    return { data, message: ResponseMessage.success, statusCode: 200 }
  }

  @SuccessResponse('201', 'Created')
  @Post()
  public async createExchange(
    @Body() requestBody: ExchangeCreationParams
  ): Promise<Response<Exchange>> {
    this.setStatus(201)
    const data = await this.exchangeService.create(requestBody)
    return { data, message: ResponseMessage.success, statusCode: 201 }
  }
}
