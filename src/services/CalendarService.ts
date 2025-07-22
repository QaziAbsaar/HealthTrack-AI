import * as Notifications from 'expo-notifications';
import { CalendarReminder, ReminderType } from '../types';

class CalendarService {

  async initialize(): Promise<void> {
    try {
      await this.setupNotifications();
    } catch (error) {
      console.error('Error initializing calendar service:', error);
    }
  }

  /**
   * Setup notification permissions and handler
   */
  private async setupNotifications(): Promise<void> {
    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
      return;
    }

    // Configure notification channel for Android
    await Notifications.setNotificationChannelAsync('medical-reminders', {
      name: 'Medical Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0ea5e9',
    });

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  /**
   * Schedule a notification for a reminder
   */
  async scheduleNotification(reminder: CalendarReminder): Promise<string | null> {
    try {
      const trigger = new Date(reminder.date);
      const now = new Date();
      
      if (trigger <= now) {
        console.warn('Cannot schedule notification for past date');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: this.getNotificationTitle(reminder.type),
          body: reminder.title,
          data: {
            reminderId: reminder.id,
            type: reminder.type,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: trigger,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Generate upcoming reminders for the next 30 days
   */
  getUpcomingReminders(reminders: CalendarReminder[]): CalendarReminder[] {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return reminders
      .filter(reminder => {
        const reminderDate = new Date(reminder.date);
        return reminderDate >= now && reminderDate <= thirtyDaysFromNow && !reminder.isCompleted;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get reminders for a specific date
   */
  getRemindersForDate(reminders: CalendarReminder[], date: Date): CalendarReminder[] {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.date);
      reminderDate.setHours(0, 0, 0, 0);
      return reminderDate >= targetDate && reminderDate < nextDay;
    });
  }

  /**
   * Get overdue reminders
   */
  getOverdueReminders(reminders: CalendarReminder[]): CalendarReminder[] {
    const now = new Date();
    
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.date);
      return reminderDate < now && !reminder.isCompleted;
    });
  }

  /**
   * Create a new reminder
   */
  createReminder(
    title: string,
    date: Date,
    type: ReminderType,
    description?: string,
    relatedReportId?: string
  ): CalendarReminder {
    return {
      id: this.generateId(),
      title,
      description,
      date,
      type,
      isCompleted: false,
      relatedReportId,
    };
  }

  /**
   * Get default reminders based on report type
   */
  getDefaultRemindersForReport(reportType: string, reportDate: Date): Partial<CalendarReminder>[] {
    const baseReminders: Partial<CalendarReminder>[] = [];
    const reportDateTime = new Date(reportDate);

    switch (reportType) {
      case 'blood_test':
        // Follow-up in 3 months for blood tests
        const followUpDate = new Date(reportDateTime);
        followUpDate.setMonth(followUpDate.getMonth() + 3);
        baseReminders.push({
          title: 'Follow-up Blood Test',
          type: ReminderType.TEST,
          date: followUpDate,
          description: 'Schedule follow-up blood test to monitor health markers',
        });
        break;

      case 'prescription':
        // Medication refill reminder in 30 days
        const refillDate = new Date(reportDateTime);
        refillDate.setDate(refillDate.getDate() + 30);
        baseReminders.push({
          title: 'Medication Refill',
          type: ReminderType.MEDICATION,
          date: refillDate,
          description: 'Check if prescription needs refilling',
        });
        break;

      case 'consultation':
        // Follow-up appointment in 2 weeks
        const appointmentDate = new Date(reportDateTime);
        appointmentDate.setDate(appointmentDate.getDate() + 14);
        baseReminders.push({
          title: 'Follow-up Appointment',
          type: ReminderType.FOLLOW_UP,
          date: appointmentDate,
          description: 'Schedule follow-up appointment with doctor',
        });
        break;

      case 'diagnostic':
      case 'xray':
      case 'mri':
      case 'ct_scan':
        // Review results with doctor in 1 week
        const reviewDate = new Date(reportDateTime);
        reviewDate.setDate(reviewDate.getDate() + 7);
        baseReminders.push({
          title: 'Review Test Results',
          type: ReminderType.APPOINTMENT,
          date: reviewDate,
          description: 'Discuss test results with healthcare provider',
        });
        break;

      default:
        // General follow-up in 1 month
        const generalFollowUp = new Date(reportDateTime);
        generalFollowUp.setMonth(generalFollowUp.getMonth() + 1);
        baseReminders.push({
          title: 'General Health Follow-up',
          type: ReminderType.FOLLOW_UP,
          date: generalFollowUp,
          description: 'General health check-up or follow-up',
        });
        break;
    }

    return baseReminders;
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format time for display
   */
  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get time until reminder
   */
  getTimeUntilReminder(date: Date): string {
    const now = new Date();
    const targetDate = new Date(date);
    const diffMs = targetDate.getTime() - now.getTime();

    if (diffMs < 0) {
      return 'Overdue';
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'Now';
    }
  }

  /**
   * Get notification title based on reminder type
   */
  private getNotificationTitle(type: ReminderType): string {
    switch (type) {
      case ReminderType.APPOINTMENT:
        return '🏥 Medical Appointment';
      case ReminderType.MEDICATION:
        return '💊 Medication Reminder';
      case ReminderType.TEST:
        return '🔬 Medical Test';
      case ReminderType.FOLLOW_UP:
        return '👩‍⚕️ Follow-up Reminder';
      default:
        return '📅 Health Reminder';
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default new CalendarService();
