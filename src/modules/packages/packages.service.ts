import { Injectable, NotFoundException } from '@nestjs/common';
import { DataStoreService } from '../../shared/data-store/data-store.service';
import { CreatePackageDto } from './dto/create-package.dto';

@Injectable()
export class PackagesService {
  constructor(private readonly store: DataStoreService) {}

  create(dto: CreatePackageDto) {
    const missingService = dto.itemIds.find((id) => !this.store.services.some((service) => service.id === id));
    if (missingService) throw new NotFoundException(`Package item not found: ${missingService}`);
    const eventPackage = { id: this.store.nextId('pkg'), ...dto, status: 'ACTIVE' };
    this.store.packages.push(eventPackage);
    return eventPackage;
  }

  findAll() {
    return this.store.packages.filter((item) => item.status === 'ACTIVE');
  }
}
