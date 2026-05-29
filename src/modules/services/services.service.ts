import { Injectable, NotFoundException } from '@nestjs/common';
import { DataStoreService } from '../../shared/data-store/data-store.service';
import { CreateSubServiceDto } from './dto/create-sub-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly store: DataStoreService) {}

  create(dto: CreateServiceDto) {
    const vendor = this.store.vendors.find((item) => item.id === dto.vendorId);
    if (!vendor) throw new NotFoundException('Vendor not found');
    const service = { id: this.store.nextId('svc'), ...dto, status: 'ACTIVE' };
    this.store.services.push(service);
    return service;
  }

  createSubService(serviceId: string, dto: CreateSubServiceDto) {
    this.findOne(serviceId);
    const subService = { id: this.store.nextId('subsvc'), serviceId, ...dto, status: 'ACTIVE' };
    this.store.subServices.push(subService);
    return subService;
  }

  search(categoryId?: string, city?: string) {
    return this.store.services.filter((service) => {
      const categoryMatches = categoryId ? service.categoryId === categoryId : true;
      const cityMatches = city ? service.city.toLowerCase() === city.toLowerCase() : true;
      return categoryMatches && cityMatches && service.status === 'ACTIVE';
    }).map((service) => this.withSubServices(service));
  }

  findOne(id: string) {
    const service = this.store.services.find((item) => item.id === id);
    if (!service) throw new NotFoundException('Service not found');
    return this.withSubServices(service);
  }

  findSubServices(serviceId: string) {
    this.findOne(serviceId);
    return this.store.subServices.filter((item) => item.serviceId === serviceId && item.status === 'ACTIVE');
  }

  private withSubServices(service: (typeof this.store.services)[number]) {
    return {
      ...service,
      subServices: this.store.subServices.filter((item) => item.serviceId === service.id && item.status === 'ACTIVE'),
    };
  }
}
