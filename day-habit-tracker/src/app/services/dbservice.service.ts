import { Injectable } from '@angular/core';
import { DayTasks, Task } from '../model';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private db!: IDBDatabase;
  private dbReady: Promise<void>;

  constructor() {
    this.dbReady = this.openDatabase();
  }

  private openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TasksDatabase', 1);

      request.onerror = (event) => {
        console.error("Why didn't you allow my web app to use IndexedDB?!");
        reject(event);
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        console.log('Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        this.db = event.target.result;
        if (!this.db.objectStoreNames.contains('tasks')) {
          // Use 'date' as the keyPath
          const objectStore = this.db.createObjectStore('tasks', { keyPath: 'date' });
          // objectStore.createIndex('title', 'title', { unique: false });
        }
      };
    });
  }

  async addTask(key: any, value: any): Promise<number> {
    await this.dbReady; // Ensure the database is ready
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readwrite');
      const objectStore = transaction.objectStore('tasks');
      const request = objectStore.add({date: key, value: value})
      // const request = objectStore.add(value, key);

      request.onsuccess = () => {
        console.log('Task added to the store', request.result);
        resolve(request.result as number);
      };

      request.onerror = (event) => {
        console.error('Error adding task:', event);
        reject(event);
      };
    });
  }

  async addTasksForCurrentMonth(tasks:any): Promise<void> {
    await this.dbReady; // Ensure the database is ready

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based index for months

    // Get the number of days in the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = this.formatDate(date); // Format as YYYY-MM-DD

      const taskEntry = {
        // date: dateString,
        tasks: tasks
      };

      await this.addTask(dateString, taskEntry);
    }
  }

  async getTasks(): Promise<DayTasks[]> {
    await this.dbReady; // Ensure the database is ready
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readonly');
      const objectStore = transaction.objectStore('tasks');
      const request = objectStore.getAll();

      request.onsuccess = (event) => {
        const results = request.result;
        console.log(results)
        const dayTasks: DayTasks[] = results.map((entry: any) => ({
          date: this.formatDate(new Date(entry.date.split('-'))), // Convert date string to Date object
          tasks: entry.value.tasks as Task[] // Ensure tasks are in the correct format
        }));
        console.log('Tasks retrieved and transformed:', dayTasks);
        resolve(dayTasks);
      };

      request.onerror = (event) => {
        console.error('Error retrieving tasks:', event);
        reject(event);
      };
    });
  }

  updateTask(id: number, updatedTask: { date: string, title: string, startTime: string, endTime: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readwrite');
      const objectStore = transaction.objectStore('tasks');
      const request = objectStore.put({ ...updatedTask, id });

      request.onsuccess = () => {
        console.log('Task updated successfully');
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error updating task:', event);
        reject(event);
      };
    });
  }

  deleteTask(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readwrite');
      const objectStore = transaction.objectStore('tasks');
      const request = objectStore.delete(id);

      request.onsuccess = () => {
        console.log('Task deleted successfully');
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error deleting task:', event);
        reject(event);
      };
    });
  }

  private formatDate(date: Date): string {
    console.log('date: ', date)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure two digits
    const day = date.getDate().toString().padStart(2, '0'); // Ensure two digits
    console.log(`${year}-${month}-${day}`)
    return `${year}-${month}-${day}`;
  }
}