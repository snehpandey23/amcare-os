#!/usr/bin/env node

/**
 * CLI tool for generating audit reports
 */

import { AuditReportGenerator } from './reportGenerator';
import { AuditService } from './auditService';
import dotenv from 'dotenv';
import { Command } from 'commander';

dotenv.config();

const program = new Command();

program
  .name('audit-report')
  .description('Generate HIPAA-compliant audit reports')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate comprehensive audit report')
  .requiredOption('-s, --start <date>', 'Start date (YYYY-MM-DD)')
  .requiredOption('-e, --end <date>', 'End date (YYYY-MM-DD)')
  .option('-u, --user <userId>', 'Filter by user ID')
  .option('-p, --patient <patientId>', 'Filter by patient ID')
  .option('-t, --type <type>', 'Report type (summary|detailed|compliance)', 'detailed')
  .option('-o, --output <path>', 'Output directory', './reports')
  .option('-f, --format <format>', 'Export format (pdf|csv|json|all)', 'all')
  .action(async (options) => {
    try {
      const startDate = new Date(options.start);
      const endDate = new Date(options.end);
      endDate.setHours(23, 59, 59, 999); // End of day

      console.log(`Generating audit report from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}...`);

      const filters: any = {};
      if (options.user) filters.userId = options.user;
      if (options.patient) filters.patientId = options.patient;

      const report = await AuditReportGenerator.generateReport(
        startDate,
        endDate,
        process.env.USER || 'system',
        {
          includeLogs: options.type !== 'summary',
          reportType: options.type,
          filters,
        }
      );

      console.log(`Report generated: ${report.reportId}`);
      console.log(`Total logs: ${report.summary.totalLogs}`);
      console.log(`Total users: ${report.summary.totalUsers}`);
      console.log(`Total patients: ${report.summary.totalPatients}`);

      // Ensure output directory exists
      const fs = await import('fs');
      const path = await import('path');
      if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseName = `audit-report-${timestamp}`;

      if (options.format === 'pdf' || options.format === 'all') {
        const pdfPath = path.join(options.output, `${baseName}.pdf`);
        await AuditReportGenerator.exportToPDF(report, pdfPath);
        console.log(`PDF exported: ${pdfPath}`);
      }

      if (options.format === 'csv' || options.format === 'all') {
        const csvPath = path.join(options.output, `${baseName}.csv`);
        await AuditReportGenerator.exportToCSV(report, csvPath);
        console.log(`CSV exported: ${csvPath}`);
      }

      if (options.format === 'json' || options.format === 'all') {
        const jsonPath = path.join(options.output, `${baseName}.json`);
        await AuditReportGenerator.exportToJSON(report, jsonPath);
        console.log(`JSON exported: ${jsonPath}`);
      }

      console.log('Report generation completed successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      process.exit(1);
    }
  });

program
  .command('patient')
  .description('Generate patient access report')
  .requiredOption('-p, --patient <patientId>', 'Patient ID')
  .option('-s, --start <date>', 'Start date (YYYY-MM-DD)')
  .option('-e, --end <date>', 'End date (YYYY-MM-DD)')
  .option('-o, --output <path>', 'Output directory', './reports')
  .option('-f, --format <format>', 'Export format (pdf|csv|json|all)', 'all')
  .action(async (options) => {
    try {
      const startDate = options.start ? new Date(options.start) : undefined;
      const endDate = options.end ? new Date(options.end) : undefined;

      console.log(`Generating patient access report for patient ${options.patient}...`);

      const report = await AuditReportGenerator.generatePatientAccessReport(
        options.patient,
        startDate,
        endDate
      );

      console.log(`Report generated: ${report.reportId}`);
      console.log(`Total accesses: ${report.summary.totalLogs}`);

      const fs = await import('fs');
      const path = await import('path');
      if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseName = `patient-access-${options.patient}-${timestamp}`;

      if (options.format === 'pdf' || options.format === 'all') {
        const pdfPath = path.join(options.output, `${baseName}.pdf`);
        await AuditReportGenerator.exportToPDF(report, pdfPath);
        console.log(`PDF exported: ${pdfPath}`);
      }

      if (options.format === 'csv' || options.format === 'all') {
        const csvPath = path.join(options.output, `${baseName}.csv`);
        await AuditReportGenerator.exportToCSV(report, csvPath);
        console.log(`CSV exported: ${csvPath}`);
      }

      if (options.format === 'json' || options.format === 'all') {
        const jsonPath = path.join(options.output, `${baseName}.json`);
        await AuditReportGenerator.exportToJSON(report, jsonPath);
        console.log(`JSON exported: ${jsonPath}`);
      }

      console.log('Report generation completed successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      process.exit(1);
    }
  });

program
  .command('user')
  .description('Generate user activity report')
  .requiredOption('-u, --user <userId>', 'User ID')
  .option('-s, --start <date>', 'Start date (YYYY-MM-DD)')
  .option('-e, --end <date>', 'End date (YYYY-MM-DD)')
  .option('-o, --output <path>', 'Output directory', './reports')
  .option('-f, --format <format>', 'Export format (pdf|csv|json|all)', 'all')
  .action(async (options) => {
    try {
      const startDate = options.start ? new Date(options.start) : undefined;
      const endDate = options.end ? new Date(options.end) : undefined;

      console.log(`Generating user activity report for user ${options.user}...`);

      const report = await AuditReportGenerator.generateUserActivityReport(
        options.user,
        startDate,
        endDate
      );

      console.log(`Report generated: ${report.reportId}`);
      console.log(`Total actions: ${report.summary.totalLogs}`);

      const fs = await import('fs');
      const path = await import('path');
      if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseName = `user-activity-${options.user}-${timestamp}`;

      if (options.format === 'pdf' || options.format === 'all') {
        const pdfPath = path.join(options.output, `${baseName}.pdf`);
        await AuditReportGenerator.exportToPDF(report, pdfPath);
        console.log(`PDF exported: ${pdfPath}`);
      }

      if (options.format === 'csv' || options.format === 'all') {
        const csvPath = path.join(options.output, `${baseName}.csv`);
        await AuditReportGenerator.exportToCSV(report, csvPath);
        console.log(`CSV exported: ${csvPath}`);
      }

      if (options.format === 'json' || options.format === 'all') {
        const jsonPath = path.join(options.output, `${baseName}.json`);
        await AuditReportGenerator.exportToJSON(report, jsonPath);
        console.log(`JSON exported: ${jsonPath}`);
      }

      console.log('Report generation completed successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
