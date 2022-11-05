import { Controller, Get, Route, Security, SuccessResponse, Tags, Request } from 'tsoa'
import { Response, ResponseMessage } from '../types/api'

@Tags('secure')
@Route('secure')
@Security('jwt')
@SuccessResponse('200', 'OK')
export class SecurityController extends Controller {
  @Get()
  public async checkIfSecure(): Promise<Response<undefined>> {
    return { data: undefined, message: ResponseMessage.success, statusCode: 200 }
  }
}
