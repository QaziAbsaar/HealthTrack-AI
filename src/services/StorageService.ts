import * as SQLite from 'expo-sqlite';
import { MedicalReport, CalendarReminder, ChatMessage, AppSettings } from '../types';

class StorageService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('medical_reports.db');
      await this.createTables();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Medical Reports table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS medical_reports (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          date_created TEXT NOT NULL,
          date_of_report TEXT,
          original_image_uri TEXT,
          extracted_text TEXT NOT NULL,
          parsed_data TEXT,
          summary TEXT,
          tags TEXT,
          is_bookmarked INTEGER DEFAULT 0,
          corrected_text TEXT
        );
      `);

      // Calendar Reminders table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS calendar_reminders (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          is_completed INTEGER DEFAULT 0,
          related_report_id TEXT
        );
      `);

      // Chat Messages table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          is_user INTEGER NOT NULL,
          timestamp TEXT NOT NULL,
          related_report_id TEXT
        );
      `);

      // App Settings table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  // Medical Reports CRUD operations
  async saveReport(report: MedicalReport): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO medical_reports 
        (id, title, type, date_created, date_of_report, original_image_uri, 
         extracted_text, parsed_data, summary, tags, is_bookmarked, corrected_text)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          report.id,
          report.title,
          report.type,
          report.dateCreated.toISOString(),
          report.dateOfReport?.toISOString() || null,
          report.originalImageUri || null,
          report.extractedText,
          JSON.stringify(report.parsedData) || null,
          report.summary || null,
          JSON.stringify(report.tags),
          report.isBookmarked ? 1 : 0,
          report.correctedText || null,
        ]
      );
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  }

  async getAllReports(): Promise<MedicalReport[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM medical_reports ORDER BY date_created DESC'
      );
      
      return result.map(row => this.mapRowToReport(row));
    } catch (error) {
      console.error('Error getting all reports:', error);
      throw error;
    }
  }

  async getReportById(id: string): Promise<MedicalReport | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM medical_reports WHERE id = ?',
        [id]
      );
      
      return result ? this.mapRowToReport(result) : null;
    } catch (error) {
      console.error('Error getting report by ID:', error);
      throw error;
    }
  }

  async deleteReport(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.runAsync('DELETE FROM medical_reports WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  // Calendar Reminders CRUD operations
  async saveReminder(reminder: CalendarReminder): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO calendar_reminders 
        (id, title, description, date, type, is_completed, related_report_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          reminder.id,
          reminder.title,
          reminder.description || null,
          reminder.date.toISOString(),
          reminder.type,
          reminder.isCompleted ? 1 : 0,
          reminder.relatedReportId || null,
        ]
      );
    } catch (error) {
      console.error('Error saving reminder:', error);
      throw error;
    }
  }

  async getAllReminders(): Promise<CalendarReminder[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM calendar_reminders ORDER BY date ASC'
      );
      
      return result.map(row => {
        const r = row as any;
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          date: new Date(r.date),
          type: r.type,
          isCompleted: r.is_completed === 1,
          relatedReportId: r.related_report_id,
        };
      });
    } catch (error) {
      console.error('Error getting all reminders:', error);
      throw error;
    }
  }

  // Chat Messages CRUD operations
  async saveChatMessage(message: ChatMessage): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.runAsync(
        `INSERT INTO chat_messages 
        (id, text, is_user, timestamp, related_report_id)
        VALUES (?, ?, ?, ?, ?)`,
        [
          message.id,
          message.text,
          message.isUser ? 1 : 0,
          message.timestamp.toISOString(),
          message.relatedReportId || null,
        ]
      );
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  async getAllChatMessages(): Promise<ChatMessage[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM chat_messages ORDER BY timestamp ASC'
      );
      
      return result.map(row => {
        const r = row as any;
        return {
          id: r.id,
          text: r.text,
          isUser: r.is_user === 1,
          timestamp: new Date(r.timestamp),
          relatedReportId: r.related_report_id,
        };
      });
    } catch (error) {
      console.error('Error getting all chat messages:', error);
      throw error;
    }
  }

  // Settings CRUD operations
  async saveSetting(key: string, value: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    } catch (error) {
      console.error('Error saving setting:', error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<string | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.getFirstAsync(
        'SELECT value FROM app_settings WHERE key = ?',
        [key]
      );
      
      return result ? (result as any).value : null;
    } catch (error) {
      console.error('Error getting setting:', error);
      throw error;
    }
  }

  private mapRowToReport(row: any): MedicalReport {
    return {
      id: row.id,
      title: row.title,
      type: row.type,
      dateCreated: new Date(row.date_created),
      dateOfReport: row.date_of_report ? new Date(row.date_of_report) : undefined,
      originalImageUri: row.original_image_uri,
      extractedText: row.extracted_text,
      parsedData: row.parsed_data ? JSON.parse(row.parsed_data) : undefined,
      summary: row.summary,
      tags: JSON.parse(row.tags),
      isBookmarked: row.is_bookmarked === 1,
      correctedText: row.corrected_text,
    };
  }
}

export default new StorageService();
