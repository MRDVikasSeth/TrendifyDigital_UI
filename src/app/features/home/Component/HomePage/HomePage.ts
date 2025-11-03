import { Component, OnInit } from '@angular/core';
import { IStudentProfileDTO } from '../../../../core/DTOs/IStudentProfileDTO';
import { Router } from '@angular/router';
import { StudentService } from '../../Service/student.service';
import { ThemeService } from '../../../../core/Service/theme.service';


function mapRawToStudentDTO(rawData: any): IStudentProfileDTO {
  if (!rawData) return {} as IStudentProfileDTO;

  return {
    firstName: rawData.FirstName || '',
    lastName: rawData.LastName || '',
    fullName: `${rawData.FirstName || ''} ${rawData.LastName || ''}`.trim(),
    studentId: rawData.StudentID,
    role: rawData.Role, // default to 'student'
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
    phone: rawData.MobileNo || null,
    city: rawData.City || null,
    profilePicture: rawData.ProfilePicture || null,
    resume: rawData.Resume || null,
  } as IStudentProfileDTO;
}

@Component({
  selector: 'app-home-page',
  standalone: false,
  templateUrl: './HomePage.html',
  styleUrls: ['./HomePage.css']
})
export class HomePage implements OnInit {
  studentProfile!: IStudentProfileDTO | null;
  studentName: string = '';
  registrationDate: any;
  userRole: any;

  isAdminFlag: boolean = false;
  isStudentFlag: boolean = false;

  constructor(private studentService: StudentService,
    private router: Router,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    const profileStr = sessionStorage.getItem('studentProfile');

    const role = JSON.parse(sessionStorage.getItem('studentRole') || '""').toLowerCase();

    this.isAdminFlag = role === 'admin';
    this.isStudentFlag = role === 'student';



    if (profileStr) {
      const rawData = JSON.parse(profileStr);
      this.studentProfile = mapRawToStudentDTO(rawData);
    } else {
      console.warn('No profile found in sessionStorage');
    }

    this.loadProfile();
  }

  switchTheme(theme: string) {
    this.themeService.setTheme(theme);
  }

  loadProfile() {
    if (this.studentProfile) {
      this.studentName = this.studentProfile.fullName || `${this.studentProfile.firstName} ${this.studentProfile.lastName}`.trim();
      this.registrationDate = this.studentProfile.registrationDate
        ? new Date(this.studentProfile.registrationDate).toLocaleDateString()
        : 'N/A';
    }
  }

  goToProfile(): void {
    if (this.studentProfile) {
      this.router.navigate(['/home/my-Profile'], { state: { profile: this.studentProfile } });
    }
  }

  signOut(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.studentProfile = null;
    this.router.navigate(['/login']);
  }

  // isAdmin(): boolean {
  //   console.log(this.userRole,'isadmin');    
  //   return this.userRole?.toLowerCase() === 'admin';
  // }

  // isStudent(): boolean {
  //   return this.userRole?.toLowerCase() === 'student';
  // }
}
