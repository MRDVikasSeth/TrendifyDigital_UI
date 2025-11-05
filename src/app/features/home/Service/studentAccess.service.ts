import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentAccessDTO } from '../../../core/DTOs/studentAccess.dto';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentAccessService {
    private apiUrl = `${environment.apiBaseUrl}student-access`;

  constructor(private http: HttpClient) {}

  getAccessByStudent(studentId: string): Observable<StudentAccessDTO[]> {
    return this.http.get<StudentAccessDTO[]>(`${this.apiUrl}/${studentId}`);
  }

  assignAccess(studentId: string, sectionId: string, grantedBy: string, sectionCost?: number): Observable<any> {
  const payload: any = { studentId, sectionId, grantedBy };
  if (sectionCost !== undefined) {
    payload.sectionCost = sectionCost;
  }
  return this.http.post(`${this.apiUrl}/assign`, payload);
}


  revokeAccess(studentId: string, sectionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/revoke`, { studentId, sectionId });
  }
}
