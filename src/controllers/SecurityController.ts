import { Controller, Get, Route, Security, SuccessResponse, Tags, Request } from 'tsoa'
import { Response, ResponseMessage } from '../types/api'

@Route('secure')
@SuccessResponse('200', 'OK')
export class SecurityController extends Controller {
  @Get()
  @Tags('security')
  @Security('jwt')
  public async checkIfSecure(
    @Request() request: Express.Request
  ): Promise<Response<undefined>> {
    const user = (request as any).user
    return { data: user, message: ResponseMessage.success }
  }

  @Get('basic')
  @Tags('security')
  @Security('basic')
  public async checkIfSecureBasic(
    @Request() request: Express.Request
  ): Promise<Response<undefined>> {
    const user = (request as any).user
    return { data: user, message: ResponseMessage.success }
  }
}
