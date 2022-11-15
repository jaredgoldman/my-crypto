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
    @Query() userId: string,
    @Query() exchangeId: string
  ): Promise<Response<UserExchange | undefined>> {
    let data: UserExchange | undefined
    let message: ResponseMessage = ResponseMessage.success
    const userExchange = await this.userExchangeService.get(userId, exchangeId)
    if (userExchange) {
      const deletedUserExchange = await this.userExchangeService.delete(userExchange?.id)
      message = deletedUserExchange ? ResponseMessage.success : ResponseMessage.notFound
    }
    return { data, message }
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

  @Get('{exchangeId}')
  @SuccessResponse('200', 'OK')
  public async get(
    @Request() request: Express.Request,
    @Path() exchangeId: string
  ): Promise<Response<UserExchange> | void> {
    const user = (request as any).user as AuthToken
    const userExchange = await this.userExchangeService.get(user.sub, exchangeId)

    return { data: userExchange, message: ResponseMessage.success }
  }
}
