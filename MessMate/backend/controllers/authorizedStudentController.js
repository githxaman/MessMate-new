import mongoose from 'mongoose';
import { parse } from 'csv-parse/sync';
import AuthorizedStudent from '../models/AuthorizedStudent.js';

const emailPattern = /^[^\s@]+@giet\.edu$/i;
const requiredColumns = ['studentId', 'name', 'collegeEmail', 'department', 'semester', 'hostel', 'roomNumber', 'status'];

export const importAuthorizedStudents = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'MongoDB is unavailable. CSV import requires the database.' });
  }
  if (!req.file) return res.status(400).json({ message: 'Upload a CSV file.' });

  const invalidRecords = [];
  let rows;
  try {
    rows = parse(req.file.buffer, { columns: true, skip_empty_lines: true, bom: true, trim: true });
  } catch (error) {
    return res.status(400).json({ message: `Invalid CSV: ${error.message}` });
  }

  const seenIds = new Set();
  const seenEmails = new Set();
  const candidates = [];
  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const studentId = row.studentId?.trim().toUpperCase();
    const collegeEmail = row.collegeEmail?.trim().toLowerCase();
    const missing = requiredColumns.filter((column) => !row[column]?.trim());
    const errors = [];
    if (missing.length) errors.push(`Missing: ${missing.join(', ')}`);
    if (collegeEmail && !emailPattern.test(collegeEmail)) errors.push('College email must use the @giet.edu domain');
    if (studentId && seenIds.has(studentId)) errors.push('Duplicate Student ID in CSV');
    if (collegeEmail && seenEmails.has(collegeEmail)) errors.push('Duplicate college email in CSV');
    if (errors.length) {
      invalidRecords.push({ row: rowNumber, data: row, errors });
      return;
    }
    seenIds.add(studentId);
    seenEmails.add(collegeEmail);
    candidates.push({
      studentId,
      name: row.name.trim(),
      collegeEmail,
      department: row.department.trim(),
      semester: row.semester.trim(),
      hostel: row.hostel.trim(),
      roomNumber: row.roomNumber.trim(),
      status: row.status.trim() === 'Inactive' ? 'Inactive' : 'Active',
    });
  });

  const existing = await AuthorizedStudent.find({
    $or: [
      { studentId: { $in: candidates.map((item) => item.studentId) } },
      { collegeEmail: { $in: candidates.map((item) => item.collegeEmail) } },
    ],
  }).select('studentId collegeEmail');
  const existingIds = new Set(existing.map((item) => item.studentId));
  const existingEmails = new Set(existing.map((item) => item.collegeEmail));
  const newStudents = [];
  candidates.forEach((student) => {
    if (existingIds.has(student.studentId) || existingEmails.has(student.collegeEmail)) {
      invalidRecords.push({ data: student, errors: ['Student ID or college email already exists'], duplicate: true });
    } else {
      newStudents.push(student);
    }
  });

  if (newStudents.length) await AuthorizedStudent.insertMany(newStudents, { ordered: false });
  const duplicates = invalidRecords.filter((record) => record.duplicate || record.errors.some((error) => error.includes('Duplicate'))).length;
  return res.status(201).json({
    message: 'Student import completed',
    summary: {
      totalRows: rows.length,
      successfullyImported: newStudents.length,
      duplicates,
      invalidRecords: invalidRecords.length - duplicates,
    },
    invalidRecords,
  });
};
