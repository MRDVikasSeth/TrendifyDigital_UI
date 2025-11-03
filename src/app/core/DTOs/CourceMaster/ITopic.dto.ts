import { ContentDTO } from './IContent.dto';

export interface TopicDTO {
  _id?: string;
  topicId?: string;
  moduleId?: string;
  title?: string;
  isActive?: boolean;
  createdAt?: Date;
  contents?: ContentDTO[];
}
