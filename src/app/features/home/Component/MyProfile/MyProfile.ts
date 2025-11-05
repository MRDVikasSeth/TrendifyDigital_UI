import { Component, OnInit } from '@angular/core';
import { IStudentProfileDTO } from '../../../../core/DTOs/IStudentProfileDTO';
import { StudentService } from '../../Service/student.service';
import { IPasswordUpdateDTO } from '../../../../core/DTOs/PasswordUpdateDTO';
import { NgForm } from '@angular/forms';
import { UserActivityService } from '../../Service/userActivity.service';
import { StudentPaymentService } from '../../Service/studentPayment.service';



/**
 * Maps a raw PascalCase student object (from API/session storage) 
 * to the camelCase IStudentProfileDTO format expected by the frontend.
 * @param rawData The raw student object using PascalCase keys (e.g., FirstName, LastName).
 * @returns A new IStudentProfileDTO object with camelCase keys.
 */
function mapRawToStudentDTO(rawData: any): IStudentProfileDTO {
  if (!rawData) {
    return {} as IStudentProfileDTO;
  }

  const dto: IStudentProfileDTO = {
    firstName: rawData.FirstName || '',
    lastName: rawData.LastName || '',
    fullName: `${rawData.FirstName || ''} ${rawData.LastName || ''}`.trim(),

    studentId: rawData.StudentID,
    loginID: rawData.LoginID,
    email: rawData.Email,
    mobileNo: rawData.MobileNo,
    dob: rawData.DOB,
    gender: rawData.Gender,
    address: rawData.Address,
    state: rawData.State,
    occupation: rawData.Occupation,
    companyName: rawData.CompanyName,
    designation: rawData.Designation,
    objectiveOfCourse: rawData.ObjectiveOfCourse,
    status: rawData.Status,
    registrationDate: rawData.RegistrationDate,

    enrollId: rawData.EnrollID || rawData.EnrollmentID || null,
    courseCode: rawData.CourseCode,
    batchCode: rawData.BatchCode,
    batchTiming: rawData.BatchTiming,

    phone: rawData.MobileNo || rawData.Phone || null,
    city: rawData.City || null,
    profilePicture: rawData.ProfilePicture || null,
    resume: rawData.Resume || null,
  } as IStudentProfileDTO;

  return dto;
}


@Component({
  selector: 'app-my-profile',
  standalone: false,
  templateUrl: './MyProfile.html',
  styleUrls: ['./MyProfile.css']
})
export class MyProfile implements OnInit {

  studentProfile!: IStudentProfileDTO | null;
  activeTab: string = 'activity';
  passwordData = {
    currentPassword: '',
    newPassword: ''
  };
  isPasswordLoading: boolean = false;
  passwordMessage: string = '';
  isPasswordSuccess: boolean = false;
  totalCourseCost = 0;
  totalPaid = 0;
  pendingAmount = 0;
  user = {
    name: '',
    enrollId: '',
    registrationDate: '',
    courseCode: '',
    batchCode: '',
    batchTiming: '',
    phone: '',
    email: '',
    address: '',
    city: '',

    firstName: '',
    lastName: '',
    mobile: '',
    dob: '',
    gender: '',
    state: '',
    objective: '',
    occupation: '',
    companyName: '',
    designation: ''
  };
  payments: any[] = [];
  activities: any[] = [];
  constructor(private studentService: StudentService,
    private paymentSer: StudentPaymentService,
    private userActivitySer: UserActivityService
  ) { }

  ngOnInit(): void {
    const profileStr = sessionStorage.getItem('studentProfile');

    if (profileStr) {
      const rawData = JSON.parse(profileStr);
      this.studentProfile = mapRawToStudentDTO(rawData);

      // console.log('Student Profile (Mapped DTO):', this.studentProfile.studentId);
      this.loadProfileData();
      this.loadUserActivities(this.studentProfile.studentId)
    } else {
      console.warn('No student profile found in session, redirecting to login');
    }
  }

  loadUserActivities(studentId: string) {
    this.userActivitySer.getUserActivities(studentId).subscribe({
      next: (res) => {
        // Get only the 5 most recent activities
        this.activities = (res || [])
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        console.log('✅ Loaded last 5 activities:', this.activities);
      },
      error: (err) => {
        console.error('❌ Error fetching activities:', err);
      }
    });
  }


  onTabChange(tab: string): void {
    this.activeTab = tab;

    if (tab === 'activity' && this.studentProfile) {
      this.loadUserActivities(this.studentProfile.studentId);
    } else if (tab === 'edit') {
      this.loadProfileData();
    } else if (tab === 'payments' && this.studentProfile) {
      this.loadPayments(this.studentProfile.studentId);
    }
  }


  loadPayments(studentId: string) {
    this.paymentSer.getPaymentsByStudent(studentId).subscribe({
      next: (res) => {
        if (res.success) {
          this.payments = res.payments || [];
          this.totalCourseCost = res.summary?.totalCourseCost || 0;
          this.totalPaid = res.summary?.totalPaid || 0;
          this.pendingAmount = res.summary?.pendingAmount || 0;
        } else {
          this.payments = [];
        }
      },
      error: (err) => console.error('Error loading payments:', err)
    });
  }

  loadProfileData() {
    const profile = this.studentProfile!;

    this.user.name = profile.fullName;
    this.user.firstName = profile.firstName || '';
    this.user.lastName = profile.lastName || '';
    this.user.email = profile.email || '';
    this.user.mobile = profile.mobileNo || '';
    this.user.phone = profile.phone || profile.mobileNo || '';

    this.user.dob = profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '';

    this.user.gender = profile.gender || '';
    this.user.state = profile.state || '';
    this.user.address = profile.address || '';

    this.user.city = profile.city || `${profile.address || ''}, ${profile.state || ''}`.trim();

    this.user.objective = profile.objectiveOfCourse || '';
    this.user.occupation = profile.occupation || '';
    this.user.companyName = profile.companyName || '';
    this.user.designation = profile.designation || '';

    this.user.registrationDate = profile.registrationDate
      ? new Date(profile.registrationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';

    this.user.enrollId = profile.enrollId || '';
    this.user.courseCode = profile.courseCode || '';
    this.user.batchCode = profile.batchCode || '';

    if (profile.batchTiming) {
      try {
        const batchTime = new Date(profile.batchTiming);
        if (!isNaN(batchTime.getTime())) {
          const hours = batchTime.getHours().toString().padStart(2, '0');
          const minutes = batchTime.getMinutes().toString().padStart(2, '0');
          this.user.batchTiming = `${hours}:${minutes}`;
        } else if (typeof profile.batchTiming === 'string' && profile.batchTiming.match(/^\d{2}:\d{2}$/)) {

          this.user.batchTiming = profile.batchTiming;
        } else {
          this.user.batchTiming = '';
        }
      } catch (e) {
        this.user.batchTiming = '';
      }
    } else {
      this.user.batchTiming = '';
    }
  }

  updateProfile(form: NgForm) {
    if (!this.studentProfile) {
      alert('Cannot update profile: Student data is missing.');
      return;
    }

    if (form.invalid) {
      alert('Please fill all required fields correctly.');
      return;
    }

    const formData = {
      StudentID: this.studentProfile.studentId,
      LoginID: this.studentProfile.loginID,
      FirstName: this.user.firstName,
      LastName: this.user.lastName,
      Email: this.user.email,
      MobileNo: this.user.mobile,
      DOB: this.user.dob,
      Gender: this.user.gender,
      Address: this.user.address,
      State: this.user.state,
      ObjectiveOfCourse: this.user.objective,
      Occupation: this.user.occupation,
      CompanyName: this.user.companyName,
      Designation: this.user.designation,
      Status: this.studentProfile.status,
      EnrollID: this.studentProfile.enrollId,
      CourseCode: this.studentProfile.courseCode,
      BatchCode: this.studentProfile.batchCode,
      BatchTiming: this.studentProfile.batchTiming
    };

    this.handleUpdate(formData);
  }
  private handleUpdate(formData: any): void {
    const studentID = formData.StudentID;

    if (!studentID) {
      console.error('Update aborted: StudentID is missing.');
      alert('Cannot update. Student ID is missing.');
      return;
    }

    const updatePayload: any = {
      // role: 'student',
      loginID: formData.LoginID,
      firstName: formData.FirstName,
      lastName: formData.LastName,
      email: formData.Email,
      mobileNo: formData.MobileNo,
      dob: formData.DOB,
      gender: formData.Gender,
      address: formData.Address,
      state: formData.State,
      occupation: formData.Occupation,
      companyName: formData.CompanyName,
      designation: formData.Designation,
      objectiveOfCourse: formData.ObjectiveOfCourse,
      status: formData.Status,
      enrollID: formData.EnrollID,
      courseCode: formData.CourseCode,
      batchCode: formData.BatchCode,
      batchTiming: formData.BatchTiming
    };

    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === null || updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    this.studentService.updateStudent(studentID, updatePayload).subscribe({
      next: () => {
        alert('Profile updated successfully ✅');

        const updatedProfile = { ...this.studentProfile, ...updatePayload };
        this.studentProfile = updatedProfile;

        sessionStorage.setItem('studentProfile', JSON.stringify(updatedProfile));

        this.loadProfileData();
      },
      error: (err) => {
        console.error('Profile update error:', err);
        alert(err.error?.message || 'Failed to update profile.');
      }
    });
  }
  updatePassword(form: NgForm) {
    if (form.invalid || !this.studentProfile) {
      this.passwordMessage = 'Please ensure all fields are filled correctly.';
      this.isPasswordSuccess = false;
      return;
    }

    this.isPasswordLoading = true;
    this.passwordMessage = '';

    const backendPayload = {
      studentID: this.studentProfile.studentId,
      oldPassword: this.passwordData.currentPassword,

      newPassword: this.passwordData.newPassword,
    };

    this.studentService.updateStudentPassword(backendPayload).subscribe({
      next: (response) => {
        this.isPasswordSuccess = true;
        this.passwordMessage = response.message || 'Password updated successfully! ✅';
        form.resetForm();
        this.passwordData = { currentPassword: '', newPassword: '' };
      },
      error: (err) => {
        this.isPasswordSuccess = false;
        this.passwordMessage = err.error?.message || 'Error: Could not update password. Please check your current password.';
      },
      complete: () => {
        this.isPasswordLoading = false;
      }
    });
  }

  getTotalAmount(): number {
    if (!this.payments || this.payments.length === 0) return 0;
    return this.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }


  onProfilePicSelected(event: any) {
    const file = event.target.files[0];
  }

  onResumeSelected(event: any) {
    const file = event.target.files[0];
  }

}