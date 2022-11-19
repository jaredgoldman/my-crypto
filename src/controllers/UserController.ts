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
import { AuthToken } from '../types/client'

@Route('user')
@Tags('user')
export class UserController extends Controller {
  private userService = new UserService()

  @Post()
  @SuccessResponse('200', 'OK')
  public async create(
    @Body() requestBody: UserCreateParams
  ): Promise<Response<{ user: User; token: string }>> {
    const user = await this.userService.create(requestBody)
    const token = await this.userService.generateSessionToken(user)
    return { data: { user, token }, message: ResponseMessage.success }
  }

  @Post('delete')
  @Security('basic')
  @SuccessResponse('200', 'Resource deleted succesfully')
  public async delete(@Request() request: Express.Request): Promise<Response<User>> {
    const user = (request as any).user as AuthToken
    const userData = await this.userService.delete(user.sub)
    return { data: userData, message: ResponseMessage.success }
  }

  @Get('{id}')
  @Security('basic')
  @SuccessResponse('200', 'OK')
  public async get(@Path('id') id: string) {
    const data = await this.userService.get(id)
    if (data) {
      return { data, message: ResponseMessage.success }
    }
    throw new ApiError(404, 'User not found')
  }

  @Post('login')
  @SuccessResponse('200', 'OK')
  public async login(
    @Body() requestBody: { email: string; password: string }
  ): Promise<Response<{ token: string; user: User }>> {
    const loggedInUser = await this.userService.login(
      requestBody.email,
      requestBody.password
    )
    return { data: loggedInUser, message: ResponseMessage.success }
  }

  @Post('logout')
  @Security('basic')
  @SuccessResponse('204', 'No Content')
  public async logout(@Request() request: Express.Request): Promise<Response<undefined>> {
    const user = (request as any).user as AuthToken
    await this.userService.logout(user.sub)
    return { data: undefined, message: ResponseMessage.success }
  }
}
