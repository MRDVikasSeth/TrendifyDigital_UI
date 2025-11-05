import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IStudentProfileDTO } from '../../../../core/DTOs/IStudentProfileDTO';
import { AuthService } from '../../service/auth.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs'; // 👈 Import for modern async handling

@Component({
  selector: 'app-LoginPage',
  standalone: false,
  templateUrl: './LoginPage.html',
  styleUrls: ['./LoginPage.css']
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      studentId: ['', Validators.required],
      password: ['', Validators.required]

    });
  }

  Login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { studentId, password } = this.loginForm.value;

    this.authService.login(studentId, password).subscribe({
      next: (response) => {
        if (response && response.success === true && response.student) {

          const student = response.student;
          console.log(student, 'login page');
          sessionStorage.setItem('studentProfile', JSON.stringify(student));


          Swal.fire({
            toast: true,
            icon: 'success',
            title: 'Login successful',
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          setTimeout(async () => {
            try {
              const studentID = student.StudentID;
              const profile = await this.fetchProfile(studentID);
              const studentRole = profile.role;

              if (studentRole === 'admin') {
                this.router.navigate(['/home/admin-Dashboard'], { state: { profile } });
              } else {
                this.router.navigate(['/home/dashboard'], { state: { profile } });
              }

            } catch (profileError) {
              Swal.fire({ icon: 'error', title: 'Profile Error', text: 'Could not load profile data.', timer: 3000 });
            }
          }, 2000);

        } else {
          Swal.fire({
            toast: true,
            icon: 'error',
            title: response.student?.Message || 'Wrong student ID or password',
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
        }
      },
      error: (err) => {
        console.error('Authentication Error:', err);
        Swal.fire({
          toast: true,
          icon: 'error',
          title: err.error?.message || 'Server error, please try again later.',
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }

  private async fetchProfile(studentId: string): Promise<IStudentProfileDTO> {
    try {
      const profile = await firstValueFrom(this.authService.getProfile(studentId));
      // console.log(profile.role, 'profile');
      sessionStorage.setItem('studentRole', JSON.stringify(profile.role));
      sessionStorage.setItem('studentID', JSON.stringify(profile.studentId));

      if (!profile) {
        throw new Error('Profile data is null or undefined');
      }
      const dto = this.mapToDTO(profile);

      return dto;

    } catch (err) {
      const errorMessage = (err as any).error?.message || 'Error fetching profile';
      console.error('Profile Fetching Failed:', errorMessage);
      throw errorMessage;
    }
  }
  private mapToDTO(profile: any): IStudentProfileDTO {
    return {
      studentId: profile.StudentID || profile._id,
      role: profile.role,
      loginID: profile.LoginID,
      fullName: `${profile.FirstName} ${profile.LastName}`.trim(),
      firstName: profile.FirstName,
      lastName: profile.LastName,
      email: profile.Email,
      mobileNo: profile.MobileNo,
      phone: profile.MobileNo,
      dob: profile.DOB,
      gender: profile.Gender,
      address: profile.Address,
      state: profile.State,
      city: profile.City || `${profile.Address}, ${profile.State}`,
      profilePicture: profile.ProfilePicture,
      resume: profile.Resume,
      objectiveOfCourse: profile.ObjectiveOfCourse,
      occupation: profile.Occupation,
      companyName: profile.CompanyName,
      designation: profile.Designation,
      registrationDate: profile.RegistrationDate,
      status: profile.Status,
      enrollId: profile.EnrollID || profile.EnrollmentID || null,
      courseCode: profile.CourseCode || null,
      batchCode: profile.BatchCode || null,
      batchTiming: profile.BatchTiming || null
    };
  }
}