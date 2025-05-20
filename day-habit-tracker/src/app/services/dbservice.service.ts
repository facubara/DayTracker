import { Injectable } from '@angular/core';
import { DayTasks, Task } from '../model';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private db!: IDBDatabase;
  private dbReady: Promise<void>;
  tasksExample: Task[] = [
  { id:1, title: 'Wake up & have yerba mate', startTime: '09:30', endTime: '10:00' },
  { id:2, title: 'Light browsing / relaxation', startTime: '10:00', endTime: '10:30' },
  { id:3, title: 'Morning walk (get some steps in)', startTime: '10:30', endTime: '11:00' },
  { id:4, title: 'Focused work session', startTime: '11:00', endTime: '12:45' },
  { id:5, title: 'Short break (stretch, quick walk)', startTime: '12:45', endTime: '13:00' },
  { id:6, title: 'Lunch', startTime: '13:00', endTime: '13:30' },
  { id:7, title: 'Light walk (more steps)', startTime: '13:30', endTime: '14:00' },
  { id:8, title: 'Relax (browsing, music, power nap)', startTime: '14:00', endTime: '14:30' },
  { id:9, title: 'Focused work session', startTime: '14:30', endTime: '16:00' },
  { id:10, title: 'Break (snack, stretch)', startTime: '16:00', endTime: '16:15' },
  { id:11, title: 'Work session', startTime: '16:15', endTime: '18:00' },
  { id:12, title: 'Short break (move around)', startTime: '18:00', endTime: '18:15' },
  { id:13, title: 'Final work session', startTime: '18:15', endTime: '20:00' },
  { id:14, title: 'Dinner', startTime: '20:00', endTime: '20:30' },
  { id:15, title: 'Side projects / learning', startTime: '20:30', endTime: '21:30' },
  { id:16, title: 'Exercise (gym, jogging, or long walk)', startTime: '21:30', endTime: '22:30' },
  { id:17, title: 'Relaxation (watch something, play games, browse the internet)', startTime: '22:30', endTime: '23:30' },
  { id:18, title: 'Wind down (reading, light stretching)', startTime: '23:30', endTime: '00:00' }
  ];
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

    async addTasksForCurrentMonthDummy(): Promise<void> {
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
        tasks: this.tasksExample
      };

      await this.addTask(dateString, taskEntry);
    }
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
        console.log('results:', results);
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

    async getTasksById(id:any): Promise<DayTasks> {
    await this.dbReady; // Ensure the database is ready
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readonly');
      const objectStore = transaction.objectStore('tasks');
      const request = objectStore.get(id)

      request.onsuccess = (event) => {
        const results = request.result;
        console.log('results:', results);
        const dayTasks: DayTasks = {
          date: this.formatDate(new Date(results.date.split('-'))),
          tasks: results.value.tasks
        }
        console.log('Tasks retrieved and transformed:', dayTasks);
        resolve(dayTasks);
      };

      request.onerror = (event) => {
        console.error('Error retrieving tasks:', event);
        reject(event);
      };
    });
  }

  // updateTask(id: number, updatedTask: {title: string, startTime: string, endTime: string }): Promise<void> {
  //   console.log('id', id);
  //   console.log('updatedTask:', updatedTask);
  //   return new Promise((resolve, reject) => {
  //     const transaction = this.db.transaction(['tasks'], 'readwrite');
  //     const objectStore = transaction.objectStore('tasks');
  //     const request = objectStore.put({ ...updatedTask, id });

  //     request.onsuccess = () => {
  //       console.log('Task updated successfully');
  //       resolve();
  //     };

  //     request.onerror = (event) => {
  //       console.error('Error updating task:', event);
  //       reject(event);
  //     };
  //   });
  // }

  updateTask(date: string, updatedTask: { id: number, title: string, startTime: string, endTime: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = this.db.transaction(['tasks'], 'readwrite');
    const objectStore = transaction.objectStore('tasks');
    
    const request = objectStore.get(date);

    request.onsuccess = (event) => {
      const data = request.result;

      if (data && Array.isArray(data.value.tasks)) {
        // Find the index of the task to be updated
        const taskIndex = data.value.tasks.findIndex((task: Task) => task.id === updatedTask.id);

        if (taskIndex !== -1) {
          // Update the task
          data.value.tasks[taskIndex] = updatedTask;

          // Optionally sort tasks by startTime if needed
          data.value.tasks.sort((a: Task, b: Task) => a.startTime.localeCompare(b.startTime));

          // Store updated object
          const updateRequest = objectStore.put(data);

          updateRequest.onsuccess = () => {
            console.log('Task updated successfully');
            resolve();
          };

          updateRequest.onerror = (event) => {
            console.error('Error updating tasks:', event);
            reject(event);
          };
        } else {
          console.error('Task not found for update');
          reject('Task not found');
        }
      } else {
        console.error('Error: data structure invalid or tasks are not stored as an array');
        reject('Invalid data structure or storage format');
      }
    };

    request.onerror = (event) => {
      console.error('Error retrieving tasks for update:', event);
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
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure two digits
    const day = date.getDate().toString().padStart(2, '0'); // Ensure two digits
    return `${year}-${month}-${day}`;
  }

  async deleteTaskByDateAndTitle(date: string, title: string): Promise<void> {
  await this.dbReady; // Ensure the database is ready
  return new Promise((resolve, reject) => {
    const transaction = this.db.transaction(['tasks'], 'readwrite');
    const objectStore = transaction.objectStore('tasks');
    const request = objectStore.get(date);

    request.onsuccess = (event: any) => {
      const data = event.target.result;
      console.log('data.value.tasks:', data.value.tasks);
      data.value.tasks = data.value.tasks.filter((task: Task) => task.title !== title);
      console.log('data.value.tasks:', data.value.tasks);
      const updateRequest = objectStore.put(data);

      updateRequest.onsuccess = () => {
        console.log('Task deleted successfully');
        resolve();
      };

      updateRequest.onerror = (event) => {
        console.error('Error updating tasks:', event);
        reject(event);
      };
    };

    request.onerror = (event) => {
      console.error('Error retrieving tasks:', event);
      reject(event);
    };
  });
}
}