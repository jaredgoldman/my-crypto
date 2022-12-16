import { Controller, Route, Security, Request, Get, Path, Tags } from 'tsoa'
import { createCcxtRestService } from '../services/CcxtRestService'
import { createCcxtSocketService } from '../services/CcxtSocketService'
import { UserExchangeService } from '../services/UserExchangeService'
import { User } from '@prisma/client'

@Security('basic')
@Tags('crypto')
@Route('crypto/{userExchangeId}')
export class CcxtController extends Controller {
  public userExchangeService = new UserExchangeService()

  @Get('ticker/{symbol}')
  public async watchTicker(
    @Request() request: Express.Request,
    @Path('userExchangeId') userExchangeId: string,
    @Path('symbol') symbol: string
  ) {
    const user = (request as any).user as User
    const CcxtSocketService = await createCcxtSocketService(userExchangeId, user.id)
    CcxtSocketService.watchTicker(symbol)
    return { data: 'Watching ticker', message: 'success' }
  }

  @Get('refresh')
  public async refreshData(
    @Request() request: Express.Request,
    @Path() userExchangeId: string
  ) {
    const user = (request as any).user as User
    const CcxtRestService = await createCcxtRestService(userExchangeId, user.id)
    await CcxtRestService.fetchAndStoreUserExchangeData()
    return { data: 'Refreshed user exchange data', message: 'success' }
  }
}
