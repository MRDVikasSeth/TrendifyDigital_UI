import { ModuleDTO } from './IModule.dto';

export interface SectionDTO {
  _id?: string;
  sectionId?: string;
  sectionName?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  modules?: ModuleDTO[];
}
