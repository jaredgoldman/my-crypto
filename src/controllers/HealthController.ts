import { Controller, Get, Route, SuccessResponse, Tags } from 'tsoa'

@Route('health')
@Tags('health')
@SuccessResponse('200')
export class HealthCheckController extends Controller {
  @Get()
  public async healthCheck(): Promise<any> {
    this.setStatus(200)
    return
  }
}
