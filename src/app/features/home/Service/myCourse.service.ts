import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })

export class MyCourseService {
    
  private baseUrl = `${environment.apiBaseUrl}admin`;

  constructor(private http: HttpClient) { }
  getAllSections(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sections`);
  }

  getModulesBySection(sectionId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sections/${sectionId}/modules`);
  }


  getTopicsByModule(moduleId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/modules/${moduleId}/topics`);
  }

}
