import { UserCreateParams, UserService } from '../services/UserService'
import { User } from '@prisma/client'
import { Response, ResponseMessage } from '../types/api'
import { Controller, Get, Post, Route, Tags, Security, Request, Body, Query } from 'tsoa'

@Route('user')
@Tags('secure')
export class UserController extends Controller {
  private userService = new UserService()

  @Post()
  public async createUser(
    @Body() requestBody: UserCreateParams
  ): Promise<Response<User>> {
    const data = await this.userService.createUser(requestBody)
    return { data, message: ResponseMessage.success, statusCode: 200 }
  }

  @Get()
  public async getUser(@Query('id') id: string) {
    const data = await this.userService.getUser(id)
    if (data) {
      return { data, message: ResponseMessage.success, statusCode: 200 }
    }
  }
}
