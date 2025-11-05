import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentPaymentService } from '../../../home/Service/studentPayment.service';
import { StudentService } from '../../../home/Service/student.service';

@Component({
  selector: 'app-student-payment',
  standalone: false,
  templateUrl: './StudentPaymentComponent.html',
  styleUrls: ['./StudentPaymentComponent.css']
})
export class StudentPaymentComponent implements OnInit {
  studentId!: string;
  studentName: string = '';
  payments: any[] = [];
  isPaymentModalOpen = false;
  isEditMode = false;
  paymentData: any = {};
  totalCourseCost = 0;
  totalPaid = 0;
  pendingAmount = 0;


  constructor(
    private route: ActivatedRoute,
    private paymentService: StudentPaymentService,
    private studentSer: StudentService
  ) { }

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('studentId')!;
    this.loadPayments();
    this.loadStudentDetails(this.studentId);
  }
  loadStudentDetails(studentId: string) {
    this.studentSer.getProfile(studentId).subscribe({
      next: (res) => {
        this.studentName = `${res.firstName} ${res.lastName}`;
      },
      error: (err) => {
        console.error('Error loading student details:', err);
      }
    });
  }
  loadPayments() {
    this.paymentService.getPaymentsByStudent(this.studentId).subscribe({
      next: (res) => {
        if (res.success) {
          this.payments = res.payments;
          this.totalCourseCost = res.summary.totalCourseCost;
          this.totalPaid = res.summary.totalPaid;
          this.pendingAmount = res.summary.pendingAmount;
        }
      },
      error: (err) => console.error('Error loading payments:', err)
    });
  }


  openAddPaymentModal() {
    this.isEditMode = false;
    this.paymentData = { studentId: this.studentId };
    this.isPaymentModalOpen = true;
  }

  openEditPaymentModal(payment: any) {
    this.isEditMode = true;
    this.paymentData = { ...payment };
    this.isPaymentModalOpen = true;
  }

  closePaymentModal() {
    this.isPaymentModalOpen = false;
  }

  savePayment() {
    if (this.isEditMode) {
      this.paymentService.updatePayment(this.paymentData._id, this.paymentData, 'admin-id').subscribe({
        next: () => {
          alert('Payment updated successfully ✅');
          this.closePaymentModal();
          this.loadPayments();
        },
        error: (err) => console.error('Error updating payment:', err)
      });
    } else {
      this.paymentService.addPayment(this.paymentData, 'admin-id').subscribe({
        next: () => {
          alert('Payment added successfully ✅');
          this.closePaymentModal();
          this.loadPayments();
        },
        error: (err) => console.error('Error adding payment:', err)
      });
    }
  }

  deletePayment(id: string) {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    this.paymentService.deletePayment(id).subscribe({
      next: () => {
        alert('Payment deleted successfully ❌');
        this.loadPayments();
      },
      error: (err) => console.error('Error deleting payment:', err)
    });
  }
}
