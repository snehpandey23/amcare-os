export type Medication = {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
};

export type PrescriptionFormData = {
  doctorName: string;
  degree: string;
  regNo: string;
  clinicContact: string;
  clinicAddress: string;
  patientName: string;
  dob: string;
  gender: string;
  briefHistory: string;
  medications: Medication[];
  lifestyleAdvice: string;
};
