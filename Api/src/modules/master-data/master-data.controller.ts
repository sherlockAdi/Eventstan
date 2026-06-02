import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataStoreService } from '../../shared/data-store/data-store.service';

@ApiTags('master-data')
@Controller('master-data')
export class MasterDataController {
  constructor(private readonly store: DataStoreService) {}

  @Get('categories')
  listCategories() {
    return this.store.categories;
  }

  @Get('countries')
  listCountries() {
    return [{ code: 'AE', name: 'United Arab Emirates', defaultCurrency: 'AED' }];
  }

  @Get('currencies')
  listCurrencies() {
    return ['AED', 'USD', 'SAR', 'QAR', 'OMR', 'KWD'];
  }
}
