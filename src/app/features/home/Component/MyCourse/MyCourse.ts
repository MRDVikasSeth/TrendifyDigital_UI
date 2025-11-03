import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CourseSectionDTO } from '../../../../core/DTOs/courseSection.dto';
import { CourseSectionService } from '../../Service/courseSection.service';
import { StudentAccessService } from '../../Service/studentAccess.service';
import { StudentAccessDTO } from '../../../../core/DTOs/studentAccess.dto';
import { IStudentProfileDTO } from '../../../../core/DTOs/IStudentProfileDTO';
import { MyCourseService } from '../../Service/myCourse.service';


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
  selector: 'app-my-course',
  standalone: false,
  templateUrl: './MyCourse.html',
  styleUrls: ['./MyCourse.css']
})
export class MyCourse implements OnInit {

  studentProfile!: IStudentProfileDTO | null;
  activeSection: number | null = null;
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

  isLoading = true;
  userAccessibleSections: number[] = [];
  sectionsData: CourseSectionDTO[] = [];
  constructor(private router: Router,
    private courseService: CourseSectionService,
      private myCourseSer: MyCourseService,
    private studentAccessService: StudentAccessService
  ) { }

  ngOnInit(): void {
    const profileStr = sessionStorage.getItem('studentProfile');

    if (profileStr) {
      const rawData = JSON.parse(profileStr);
      this.studentProfile = mapRawToStudentDTO(rawData);


      this.loadProfileData();
      // this.loadSections();
      this.loadSection();
      this.loadUserAccess(this.studentProfile.studentId);

    } else {
      console.warn('No student profile found in session, redirecting to login');
    }


  }

  // loadSections(): void {
  //   this.courseService.getAllSections().subscribe({
  //     next: (data) => {
  //       this.sectionsData = data;

  //       this.isLoading = false;

  //       console.log(this.sectionsData, 'test mu cource');

  //     },
  //     error: (err) => {
  //       this.isLoading = false;
  //       console.error('Error loading course sections:', err);
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Error loading course data',
  //         text: 'Please try again later.',
  //       });
  //     },
  //   });
  // }

   loadSection(): void {
    this.myCourseSer.getAllSections().subscribe({
      next: (data) => {
        this.sectionsData = data;
        this.isLoading = false;

          console.log(data, 'sections Data');
          
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading course sections:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error loading course data',
          text: 'Please try again later.',
        });
      },
    });
  }

 loadUserAccess(studentId: string): void {
  this.studentAccessService.getAccessByStudent(studentId).subscribe({
    next: (accessList: StudentAccessDTO[]) => {
      console.log(accessList, 'access list new');

      // ✅ Use sectionId (which now stores _id)
      this.userAccessibleSections = accessList
        .filter(a => a.accessGranted)
        .map(a => a.sectionId);

      console.log('Accessible Sections:', this.userAccessibleSections);
      this.isLoading = false;
    },
    error: (err) => {
      this.isLoading = false;
      console.error('Error fetching access info:', err);
    }
  });
}


  handleSectionClick(sectionId: number) {
     console.log(sectionId,'payload id ');
    if (!this.userAccessibleSections.includes(sectionId)) {
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'This section is not accessible for you.',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    this.activeSection = this.activeSection === sectionId ? null : sectionId;
  }

  toggleSection(id: number) {
    this.activeSection = this.activeSection === id ? null : id;
  }

  onModuleClick(sectionId: number, module: any) {
    if (this.userAccessibleSections.includes(sectionId)) {
      this.router.navigate(['/home/view-module'], { queryParams: { id: module.id } });
    } else {
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'This section is not accessible for you.',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
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

}
