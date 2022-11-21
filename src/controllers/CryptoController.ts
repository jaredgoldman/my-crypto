import { Controller, Route, Security, Request, Get, Path } from 'tsoa'
import { createCcxtExchange } from '../services/CcxtRestService'
import { UserExchangeService } from '../services/UserExchangeService'
import { User } from '@prisma/client'

@Security('basic')
@Route('crypto/{userExchangeId}')
export class CcxtController extends Controller {
  public userExchangeService = new UserExchangeService()
  @Get()
  public async refreshData(
    @Request() request: Express.Request,
    @Path() userExchangeId: string
  ) {
    const user = (request as any).user as User
    const CcxtRestService = await createCcxtExchange(userExchangeId, user.id)
    await CcxtRestService.fetchAndStoreUserExchangeData()
    return { data: user, message: 'success' }
  }
}
