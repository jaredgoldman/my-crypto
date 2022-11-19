import { Controller, Route, Security, Request, Get, Path } from 'tsoa'
import { CcxtService } from '../services/CcxtService'
import { UserExchangeService } from '../services/UserExchangeService'

@Security('basic')
@Route('crypto/{userExchangeId}')
export class CcxtController extends Controller {
  public userExchangeService = new UserExchangeService()
  @Get()
  public async refreshData(
    @Request() request: Express.Request,
    @Path() userExchangeId: string
  ) {
    const user = (request as any).user
    const { key, secret, exchangeName } =
      await this.userExchangeService.getUserExchangeKeys(userExchangeId, user.id)

    const ccxtService = new CcxtService(
      exchangeName,
      key,
      secret,
      user.sub,
      userExchangeId
    )
    await ccxtService.fetchAndStoreUserExchangeData()
    return { data: user, message: 'success' }
  }
}
