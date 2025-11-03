import { TopicDTO } from './ITopic.dto';

export interface ModuleDTO {
  _id?: string;
  moduleId?: string;
  sectionId?: string;
  title?: string;
  docsCount?: number;
  videosCount?: number;
  isActive?: boolean;
  createdAt?: Date;
  topics?: TopicDTO[];
}
