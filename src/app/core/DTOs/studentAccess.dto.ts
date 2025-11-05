export interface StudentAccessDTO {
  _id?: string;
  studentId: string;
  sectionId: number;
  sectionCost?:number;
  accessGranted: boolean;
  grantedBy?: string;
  grantedAt?: Date;
}
