import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentPaymentService {
  //   private baseUrl = 'http://localhost:3000/api/payments'; 
  private apiUrl = `${environment.apiBaseUrl}payments`;

  constructor(private http: HttpClient) { }

  getPaymentsByStudent(studentId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${studentId}`);
  }

  addPayment(paymentData: any, adminId: string): Observable<any> {
    const payload = { ...paymentData, createdBy: adminId };
    return this.http.post<any>(this.apiUrl, payload);
  }

  updatePayment(paymentId: string, paymentData: any, adminId: string): Observable<any> {
    const payload = { ...paymentData, updatedBy: adminId };
    return this.http.put<any>(`${this.apiUrl}/${paymentId}`, payload);
  }


  deletePayment(paymentId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${paymentId}`);
  }
}
