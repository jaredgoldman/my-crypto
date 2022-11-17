import { ExchangeService } from '../services/ExchangeService'
import { UserExchangeService } from '../services/UserExchangeService'
import { UserExchange } from '@prisma/client'
import { PaginatedResponse, Response, ResponseMessage } from '../types/api'
import {
  Query,
  Controller,
  Get,
  Post,
  Route,
  Tags,
  Security,
  Request,
  Body,
  Path,
  SuccessResponse,
} from 'tsoa'
import ApiError from '../utils/ApiError'
import { AuthToken } from '../types/client'

export interface UserExchangeCreateParams {
  exchangeId: string
  apiKey: string
  apiSecret: string
}

@Tags('user-exchange')
@Security('jwt')
@Route('user-exchange')
export class UserExchangeController extends Controller {
  private exchangeService = new ExchangeService()
  private userExchangeService = new UserExchangeService()

  @Post()
  @SuccessResponse('201', 'OK')
  public async create(
    @Body() requestBody: UserExchangeCreateParams,
    @Request() request: Express.Request
  ): Promise<Response<UserExchange> | void> {
    const user = (request as any).user as AuthToken
    const exchange = await this.exchangeService.get(requestBody.exchangeId)

    if (exchange) {
      const userExchange = await this.userExchangeService.create(
        user.sub,
        exchange.id,
        requestBody.apiKey,
        requestBody.apiSecret
      )

      return { data: userExchange, message: ResponseMessage.success }
    } else {
      throw new ApiError(404, 'Exchange not found')
    }
  }

  @Post('delete')
  @SuccessResponse('201', 'OK')
  public async delete(
    @Query() userExchangeId: string
  ): Promise<Response<UserExchange | undefined>> {
    const deletedUserExchange = await this.userExchangeService.delete(userExchangeId)
    return { data: deletedUserExchange, message: ResponseMessage.success }
  }

  @Get()
  @SuccessResponse('200', 'OK')
  public async getAll(
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
    @Request() request: Express.Request
  ): Promise<PaginatedResponse<UserExchange> | void> {
    const user = (request as any).user as AuthToken
    const userExchanges = await this.userExchangeService.getAll(user.sub, page, limit)
    return { data: userExchanges, message: ResponseMessage.success }
  }

  @Get('{id}')
  @SuccessResponse('200', 'OK')
  public async get(
    @Request() request: Express.Request,
    @Path() id: string
  ): Promise<Response<UserExchange> | void> {
    const user = (request as any).user as AuthToken
    const userExchange = await this.userExchangeService.get(id)
    if (userExchange && userExchange.userId === user.sub) {
      return { data: userExchange, message: ResponseMessage.success }
    }
    throw new ApiError(404, 'User exchange not found')
  }
}
