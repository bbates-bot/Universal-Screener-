import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { School, Student, StudentResult, User, ExtendedQuestion } from '../types';

// Collection references
const schoolsCol = collection(db, 'schools');
const studentsCol = collection(db, 'students');
const resultsCol = collection(db, 'results');
const usersCol = collection(db, 'users');

// Subscribe to schools
export const subscribeToSchools = (callback: (schools: School[]) => void): Unsubscribe => {
  return onSnapshot(schoolsCol, (snapshot) => {
    const schools = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as School[];
    callback(schools);
  });
};

// Subscribe to students
export const subscribeToStudents = (callback: (students: Student[]) => void): Unsubscribe => {
  return onSnapshot(studentsCol, (snapshot) => {
    const students = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Student[];
    callback(students);
  });
};

// Subscribe to results
export const subscribeToResults = (callback: (results: StudentResult[]) => void): Unsubscribe => {
  return onSnapshot(resultsCol, (snapshot) => {
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StudentResult[];
    callback(results);
  });
};

// Subscribe to users
export const subscribeToUsers = (callback: (users: User[]) => void): Unsubscribe => {
  return onSnapshot(usersCol, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    callback(users);
  });
};

// Add school
export const addSchool = async (school: Omit<School, 'id'>): Promise<string> => {
  const docRef = await addDoc(schoolsCol, school);
  return docRef.id;
};

// Update school
export const updateSchool = async (school: School): Promise<void> => {
  const { id, ...data } = school;
  await updateDoc(doc(db, 'schools', id), data);
};

// Add student
export const addStudent = async (student: Omit<Student, 'id'>): Promise<string> => {
  const docRef = await addDoc(studentsCol, student);
  return docRef.id;
};

// Update student
export const updateStudent = async (student: Student): Promise<void> => {
  const { id, ...data } = student;
  await updateDoc(doc(db, 'students', id), data);
};

// Delete student
export const deleteStudent = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'students', id));
};

// Add result
export const addResult = async (result: Omit<StudentResult, 'id'>): Promise<string> => {
  const docRef = await addDoc(resultsCol, result);
  return docRef.id;
};

// Add user
export const addUser = async (user: Omit<User, 'id'>): Promise<string> => {
  const docRef = await addDoc(usersCol, user);
  return docRef.id;
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', id));
};

// Update question
export const updateQuestion = async (question: ExtendedQuestion): Promise<void> => {
  const { id, ...data } = question;
  await updateDoc(doc(db, 'questions', id), data as any);
};

// Initialize data if collections are empty
export const initializeData = async (
  schools: Omit<School, 'id'>[],
  students: Omit<Student, 'id'>[],
  results: Omit<StudentResult, 'id'>[],
  users: Omit<User, 'id'>[]
): Promise<void> => {
  // Check if schools collection is empty
  const schoolsSnapshot = await getDocs(query(schoolsCol));
  if (schoolsSnapshot.empty) {
    // Add initial data
    for (const school of schools) {
      await addDoc(schoolsCol, school);
    }
    for (const student of students) {
      await addDoc(studentsCol, student);
    }
    for (const result of results) {
      await addDoc(resultsCol, result);
    }
    for (const user of users) {
      await addDoc(usersCol, user);
    }
    console.log('Initial data loaded into Firestore');
  }
};
