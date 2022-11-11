import { UserCreateParams, UserService } from '../services/UserService'
import { User } from '@prisma/client'
import { Response, ResponseMessage } from '../types/api'
import {
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

@Route('user')
export class UserController extends Controller {
  private userService = new UserService()

  @Post()
  @SuccessResponse('200', 'OK')
  public async createUser(
    @Body() requestBody: UserCreateParams
  ): Promise<Response<{ user: User; token: string }>> {
    const user = await this.userService.createUser(requestBody)
    const token = await this.userService.generateSessionToken(user)
    return { data: { user, token }, message: ResponseMessage.success }
  }

  @Get('{id}')
  @Tags('secure')
  @Security('jwt')
  @SuccessResponse('200', 'OK')
  public async getUser(@Path('id') id: string) {
    const data = await this.userService.getUser(id)
    if (data) {
      return { data, message: ResponseMessage.success }
    }
    throw new ApiError(404, 'User not found')
  }

  @Post('login')
  @Security('login')
  @SuccessResponse('200', 'OK')
  public async login(
    @Request() request: Express.Request
  ): Promise<Response<{ token: string; user: User }>> {
    const userData = (request as any).user as { token: string; user: User }
    return { data: userData, message: ResponseMessage.success }
  }

  @Post('logout')
  @Tags('secure')
  @Security('jwt')
  @SuccessResponse('204', 'No Content')
  public async logout(@Body() requestBody: { id: string }): Promise<Response<undefined>> {
    await this.userService.logout(requestBody.id)
    return { data: undefined, message: ResponseMessage.success }
  }
}
