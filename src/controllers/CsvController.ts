import { Controller, Path, Post, Route, Security, SuccessResponse, Tags } from 'tsoa'
import { TradeService } from '../services/TradeService'
import { CsvService } from '../services/CsvService'
import { Response, ResponseMessage } from '../types/api'

@Security('basic')
@Tags('csv')
@Route('csv')
export class CsvController extends Controller {
  private csvService = new CsvService()
  private tradeService = new TradeService()

  @Post('export/{userId}')
  @SuccessResponse('201', 'Created')
  public async exportTrades(@Path('userId') userId: string): Promise<Response<string>> {
    const trades = await this.tradeService.getTrades(userId)
    this.csvService.generateTradeCsv(trades)
    return { data: 'Trades exported successfully.', message: ResponseMessage.success }
  }
}
