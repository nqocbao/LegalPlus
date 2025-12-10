import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export const CoreControllers =
  (params?: {
    path?: string;
    version?: string;
    tag?: string;
  }): ClassDecorator =>
    (target: any) => {
      let url = "";
      if (params?.version) {
        url += `/v${params.version}`;
      }
      if (params?.path) {
        url += `/${params.path}`;
      }

      ApiTags(params?.tag || url)(target);
      Controller(url)(target);
    };
