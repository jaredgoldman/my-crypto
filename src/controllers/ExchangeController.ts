import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa'
import { Exchange } from '@prisma/client'
import { ExchangeService, ExchangeCreationParams } from '../services/ExchangeService'
import { PaginatedResponse, Response, ResponseMessage } from '../types/api'
import ApiError from '@src/utils/ApiError'

@Route('exchanges')
@Tags('exchange')
// TODO: make this service accessible by only admins
export class ExchangeController extends Controller {
  private exchangeService = new ExchangeService()
  @Get()
  @SuccessResponse('200', 'OK')
  public async getExchanges(
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10
  ): Promise<PaginatedResponse<Exchange>> {
    const data = await this.exchangeService.getAll(page, limit)
    return { data, message: ResponseMessage.success }
  }

  @Get('{id}')
  @SuccessResponse('200', 'OK')
  public async getExchange(@Path('id') id: string): Promise<Response<Exchange>> {
    const exchange = await this.exchangeService.get(id)
    if (!exchange) {
      throw new ApiError('exchange.notFound')
    }
    return { data: exchange, message: ResponseMessage.success }
  }

  @Post()
  @SuccessResponse('201', 'Created')
  public async createExchange(
    @Body() requestBody: ExchangeCreationParams
  ): Promise<Response<Exchange>> {
    this.setStatus(201)
    const data = await this.exchangeService.create(requestBody)
    return { data, message: ResponseMessage.success }
  }
}
