import { UserCreateParams, UserService } from '../services/UserService'
import { User } from '@prisma/client'
import { Response, ResponseMessage } from '../types/api'
import { Controller, Get, Post, Route, Tags, Security, Request, Body, Path } from 'tsoa'
import { AuthToken } from '@src/types/client'

@Route('user')
@Tags('secure')
export class UserController extends Controller {
  private userService = new UserService()

  @Post()
  public async createUser(
    @Body() requestBody: UserCreateParams
  ): Promise<Response<{ user: User; token: string }>> {
    const user = await this.userService.createUser(requestBody)
    const token = await this.userService.generateToken(user)
    return { data: { user, token }, message: ResponseMessage.success, statusCode: 200 }
  }

  @Get('{id}')
  @Security('jwt')
  public async getUser(@Path('id') id: string) {
    const data = await this.userService.getUser(id)
    if (data) {
      return { data, message: ResponseMessage.success, statusCode: 200 }
    } else {
      return { message: ResponseMessage.notFound, statusCode: 404 }
    }
  }

  @Post('login')
  public async login(@Request() request: Express.Request) {
    // grab JWT from Reques
    const { sub } = (request as any).user as AuthToken
  }
}
