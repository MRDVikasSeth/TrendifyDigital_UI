

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { StudentAccessService } from '../../../home/Service/studentAccess.service';
import { CourseSectionService } from '../../../home/Service/courseSection.service';
import { StudentService } from '../../../home/Service/student.service';
import { MyCourseService } from '../../../home/Service/myCourse.service';

@Component({
  selector: 'app-student-course-access',
  standalone: false,
  templateUrl: './StudentCourseAccess.html',
  styleUrl: './StudentCourseAccess.css'
})
export class StudentCourseAccess implements OnInit {
  studentId!: string;
  studentName = '';
  courseSections: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private studentAccessSer: StudentAccessService,
    private courseSectionSer: MyCourseService,

    private studentSer: StudentService
  ) { }

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('studentId')!;
    this.loadSections();
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

 loadSections() {
  this.courseSectionSer.getAllSections().subscribe({
    next: (allSections) => {
      // Base course sections
      this.courseSections = allSections.map((s: any) => ({
        ...s,
        accessGranted: false,
        sectionCost: 0   // default
      }));

      // Fetch student-specific access
      this.studentAccessSer.getAccessByStudent(this.studentId).subscribe({
        next: (accessData) => {
          console.log('Access Data:', accessData);

          this.courseSections.forEach(section => {
            const matched = accessData.find(a => a.sectionId === section._id);
            if (matched) {
              section.accessGranted = matched.accessGranted;
              section.sectionCost = matched.sectionCost || 0; // ✅ map cost
            }
          });

          console.log('Mapped courseSections:', this.courseSections);
        },
        error: () => console.warn('⚠️ Could not fetch student access info')
      });
    },
    error: () => Swal.fire('Error', 'Failed to load course sections', 'error')
  });
}


  toggleAccess(section: any) {
    const action = section.accessGranted ? 'revoke' : 'assign';

    if (action === 'assign') {
      // 🔹 Ask admin for section cost before granting
      Swal.fire({
        title: `Grant Access to "${section.sectionName}"`,
        input: 'number',
        inputLabel: 'Enter Section Cost (₹)',
        inputPlaceholder: 'e.g., 3000',
        showCancelButton: true,
        confirmButtonText: 'Grant Access',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value || isNaN(Number(value)) || Number(value) <= 0) {
            return 'Please enter a valid cost!';
          }
          return null;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const sectionCost = Number(result.value);
          this.studentAccessSer.assignAccess(this.studentId, section._id, 'Admin', sectionCost).subscribe({
            next: () => {
              Swal.fire('✅ Success', `Access granted with cost ₹${sectionCost}`, 'success');
              this.loadSections();
            },
            error: () => Swal.fire('❌ Error', 'Failed to grant access', 'error')
          });
        }
      });

    } else {
      // 🔹 Revoke access (no cost input)
      Swal.fire({
        title: 'Revoke Access',
        text: `Are you sure you want to revoke access for "${section.sectionName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, revoke',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.studentAccessSer.revokeAccess(this.studentId, section._id).subscribe({
            next: () => {
              Swal.fire('✅ Success', 'Access revoked successfully', 'success');
              this.loadSections();
            },
            error: () => Swal.fire('❌ Error', 'Failed to revoke access', 'error')
          });
        }
      });
    }
  }

}
