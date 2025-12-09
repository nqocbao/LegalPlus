import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

@Injectable()
export class ConfigService extends NestConfigService {
  constructor() {
    super();
  }

  authentication = {
    secret: this.getOrThrow('AUTH_SECRET_KEY'),
    accessExpireTime: +this.get('AUTH_ACCESS_EXP_TIME') || 86400,
    refreshExpireTime: +this.get('AUTH_REFRESH_EXP_TIME') || 86400,
    adminEmail: this.get('ADMIN_EMAIL'),
    adminPassword: this.get('ADMIN_PASSWORD'),
  };

  database = {
    url: this.getOrThrow('DATABASE_URL'),
  };

  application = {
    PORT: +this.getOrThrow<number>('PORT'),
    ADMIN_EMAIL: this.getOrThrow<string>('ADMIN_EMAIL'),
    ADMIN_PASSWORD: this.getOrThrow<string>('ADMIN_PASSWORD'),
  };

  validateConfig<T extends object>(cls: ClassConstructor<T>, config: T): T {
    const configInstance = plainToInstance(cls, config, {});
    const errors = validateSync(configInstance);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((err) => Object.values(!err.constraints))
        .join(', ');
      throw new Error(`Invalid configuration: ${errorMessages}`);
    }

    return configInstance;
  }
}
