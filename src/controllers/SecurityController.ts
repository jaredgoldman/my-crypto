import { Controller, Get, Route, Security, SuccessResponse, Tags, Request } from 'tsoa'
import { Response, ResponseMessage } from '../types/api'

@Tags('security')
@Route('secure')
@Security('jwt')
@SuccessResponse('200', 'OK')
export class SecurityController extends Controller {
  @Get()
  public async checkIfSecure(@Request() request: any): Promise<Response<undefined>> {
    return { data: request.user, message: ResponseMessage.success }
  }
}
