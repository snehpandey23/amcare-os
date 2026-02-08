/**
 * Usage Examples for Spruce Health API Client
 */

import { SpruceHealthClient } from './client/spruceClient';
import { RedisQueueManager } from './queue/redisQueue';

// Example: Get unpaid appointments
async function getUnpaidAppointments() {
  const client = new SpruceHealthClient();

  // Get unpaid appointments within 24 hours (default)
  const appointments = await client.getAppointments();

  console.log(`Found ${appointments.length} unpaid appointments`);

  for (const appointment of appointments) {
    console.log(`- ${appointment.patientName}: ${appointment.appointmentDate} at ${appointment.appointmentTime}`);
    console.log(`  Amount Due: ${appointment.currency} ${appointment.amountDue}`);
  }
}

// Example: Cancel unpaid appointment
async function cancelUnpaidAppointment() {
  const client = new SpruceHealthClient();

  const result = await client.cancelAppointment({
    appointmentId: 'apt_123',
    reason: 'Unpaid balance - 24 hour policy',
    notifyPatient: true,
    cancellationNotes: 'Please contact us to resolve payment and reschedule',
  });

  console.log(`Appointment cancelled: ${result.success}`);
  console.log(`Cancelled at: ${result.cancelledAt}`);
}

// Example: Get recent messages
async function getRecentMessages() {
  const client = new SpruceHealthClient();

  // Get messages from past 48 hours
  const messages = await client.getMessages();

  console.log(`Found ${messages.length} messages in past 48 hours`);

  for (const message of messages) {
    console.log(`- ${message.type} ${message.direction}: ${message.body.substring(0, 50)}...`);
  }
}

// Example: Lock note
async function lockNote() {
  const client = new SpruceHealthClient();

  const result = await client.lockNote({
    noteId: 'note_123',
    encounterId: 'enc_456',
    patientId: 'pat_789',
    lockedBy: 'user_123',
    lockReason: 'Note finalized after 4 hours - HIPAA compliance',
  });

  console.log(`Note locked: ${result.success}`);
  console.log(`Locked at: ${result.lockedAt}`);
}

// Example: Get tasks
async function getTasks() {
  const client = new SpruceHealthClient();

  // Get pending tasks
  const tasks = await client.getTasks({
    status: 'pending',
  });

  console.log(`Found ${tasks.length} pending tasks`);

  for (const task of tasks) {
    console.log(`- ${task.type}: ${task.title}`);
    if (task.patientName) {
      console.log(`  Patient: ${task.patientName}`);
    }
  }
}

// Example: Using queue system
async function useQueueSystem() {
  const queueManager = new RedisQueueManager();

  // Add job to queue
  await queueManager.addJob('spruce-webhooks', {
    type: 'appointment.created',
    payload: {
      event: 'appointment.created',
      timestamp: new Date().toISOString(),
      data: {
        appointment: {
          id: 'apt_123',
          patientId: 'pat_456',
          appointmentDate: '2024-01-20',
          paymentStatus: 'unpaid',
        },
      },
    },
  });

  // Subscribe to events
  queueManager.subscribeToEvents(['appointment.created'], (event) => {
    console.log('Event received:', event.eventType);
  });
}

// Export examples
export {
  getUnpaidAppointments,
  cancelUnpaidAppointment,
  getRecentMessages,
  lockNote,
  getTasks,
  useQueueSystem,
};
