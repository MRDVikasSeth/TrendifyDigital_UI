import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SectionDTO } from '../../../core/DTOs/CourceMaster/ISection.dto';
import { ModuleDTO } from '../../../core/DTOs/CourceMaster/IModule.dto';
import { TopicDTO } from '../../../core/DTOs/CourceMaster/ITopic.dto';
import { ContentDTO } from '../../../core/DTOs/CourceMaster/IContent.dto';


@Injectable({ providedIn: 'root' })
export class CourseStructureService {
  private baseUrl = `${environment.apiBaseUrl}admin`;

  constructor(private http: HttpClient) { }
  getAllSections(): Observable<SectionDTO[]> {
    return this.http.get<SectionDTO[]>(`${this.baseUrl}/sections`);
  }

  createSection(section: SectionDTO): Observable<SectionDTO> {
    return this.http.post<SectionDTO>(`${this.baseUrl}/sections`, section);
  }

  updateSection(id: string, section: SectionDTO): Observable<SectionDTO> {
    return this.http.put<SectionDTO>(`${this.baseUrl}/sections/${id}`, section);
  }

  deleteSection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sections/${id}`);
  }

  // =============================
  // MODULE CRUD (Under Section)
  // =============================

  getModulesBySection(sectionId: string): Observable<ModuleDTO[]> {
    return this.http.get<ModuleDTO[]>(`${this.baseUrl}/sections/${sectionId}/modules`);
  }

  createModule(sectionId: string, module: ModuleDTO): Observable<ModuleDTO> {
    return this.http.post<ModuleDTO>(`${this.baseUrl}/sections/${sectionId}/modules`, module);
  }

  updateModule(id: string, module: ModuleDTO): Observable<ModuleDTO> {
    return this.http.put<ModuleDTO>(`${this.baseUrl}/modules/${id}`, module);
  }

  deleteModule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/modules/${id}`);
  }

  // =============================
  // TOPIC CRUD (Under Module)
  // =============================

  getTopicsByModule(moduleId: string): Observable<TopicDTO[]> {
    return this.http.get<TopicDTO[]>(`${this.baseUrl}/modules/${moduleId}/topics`);
  }

  createTopic(moduleId: string, topic: TopicDTO): Observable<TopicDTO> {
    return this.http.post<TopicDTO>(`${this.baseUrl}/modules/${moduleId}/topics`, topic);
  }

  updateTopic(id: string, topic: TopicDTO): Observable<TopicDTO> {
    return this.http.put<TopicDTO>(`${this.baseUrl}/topics/${id}`, topic);
  }

  deleteTopic(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/topics/${id}`);
  }

  // =============================
  // CONTENT CRUD (Under Topic)
  // =============================

  getContentsByTopic(topicId: string) {
    return this.http.get<ContentDTO[]>(`${this.baseUrl}/content/byTopic/${topicId}`);
  }


  createContent(topicId: string, content: ContentDTO): Observable<ContentDTO> {
    // Matches: router.post('/content/:topicId')
    return this.http.post<ContentDTO>(`${this.baseUrl}/content/${topicId}`, content);
  }

  updateContent(id: string, content: ContentDTO): Observable<ContentDTO> {
    // Matches: router.put('/content/:id')
    return this.http.put<ContentDTO>(`${this.baseUrl}/content/${id}`, content);
  }

  deleteContent(id: string): Observable<void> {
    // Matches: router.delete('/content/:id')
    return this.http.delete<void>(`${this.baseUrl}/content/${id}`);
  }
}
