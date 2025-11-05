import { ModuleDTO } from './IModule.dto';

export interface SectionDTO {
  _id?: string;
  sectionId?: string;
  sectionName?: string;
  sectionCost?:number;
  isActive?: boolean;
  createdAt?: Date;
  modules?: ModuleDTO[];
}
