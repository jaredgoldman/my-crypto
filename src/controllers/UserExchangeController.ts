import { UserService } from '../services/UserService'
import { ExchangeService } from '../services/ExchangeService'
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
import { AuthToken } from '@src/types/client'

export interface UserExchangeCreateParams {
  exchangeId: string
  apiKey: string
}

@Tags('secure')
@Security('jwt')
@Route('user-exchange')
export class UserExchangeController extends Controller {
  private exchangeService = new ExchangeService()

  @Post()
  @SuccessResponse('201', 'OK')
  public async createUserExchange(
    @Body() requestBody: UserExchangeCreateParams,
    @Request() request: Express.Request
  ): Promise<Response<UserExchange> | void> {
    const user = (request as any).user as AuthToken
    const exchange = await this.exchangeService.get(requestBody.exchangeId)

    if (exchange) {
      const userExchange = await this.exchangeService.createUserExchange(
        user.sub,
        exchange.id,
        requestBody.apiKey
      )

      return { data: userExchange, message: ResponseMessage.success }
    } else {
      throw new ApiError(404, 'Exchange not found')
    }
  }

  @Get()
  @SuccessResponse('200', 'OK')
  public async getUserExchanges(
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
    @Request() request: Express.Request
  ): Promise<PaginatedResponse<UserExchange> | void> {
    const user = (request as any).user as AuthToken
    const userExchanges = await this.exchangeService.getUserExchanges(
      user.sub,
      page,
      limit
    )
    return { data: userExchanges, message: ResponseMessage.success }
  }

  @Get('{exchangeId}')
  @SuccessResponse('200', 'OK')
  public async getUserExchange(
    @Request() request: Express.Request,
    @Path() exchangeId: string
  ): Promise<Response<UserExchange> | void> {
    const user = (request as any).user as AuthToken
    const userExchange = await this.exchangeService.getUserExchange(user.sub, exchangeId)
    if (!userExchange) {
      throw new ApiError(404, 'User exchange not found')
    }
    return { data: userExchange, message: ResponseMessage.success }
  }
}
