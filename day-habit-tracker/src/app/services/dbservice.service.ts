import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private db!: IDBDatabase;

  constructor() {
    this.openDatabase();
  }

  private openDatabase() {
    const request = indexedDB.open('MyTestDatabase', 1);

    request.onerror = (event) => {
      console.error("Why didn't you allow my web app to use IndexedDB?!");
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
      console.log('Database opened successfully');
    };

    request.onupgradeneeded = (event: any) => {
      this.db = event.target.result;
      if (!this.db.objectStoreNames.contains('tasks')) {
        const objectStore = this.db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('date', 'date', { unique: false });
      }
    };
  }

  addTask(task: { date: string, title: string, startTime: string, endTime: string }): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readwrite');
      const objectStore = transaction.objectStore('tasks');
      const request = objectStore.add(task);

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

  getTasks(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readonly');
      const objectStore = transaction.objectStore('tasks');
      const request = objectStore.getAll();

      request.onsuccess = (event) => {
        console.log('Tasks retrieved:', request.result);
        resolve(request.result);
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
}