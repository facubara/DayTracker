import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Task {
  title: string;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-habit-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header">
        <h1>My Daily Schedule</h1>
        <h2>{{ currentDate | date: 'fullDate' }}</h2>
    </div>
    <div class="task-container">
      <div *ngFor="let task of visibleTasks; let i = index" class="task-card" 
           [class.focus]="isCurrentTask(task)" 
           [style.opacity]="getOpacity(i)">
        <div class="progress" *ngIf="isCurrentTask(task)" [style.width]="getProgress(task) + '%'">
        </div>
        <h2>{{ task.title }}</h2>
        <p>{{ task.startTime }} - {{ task.endTime }}</p>
      </div>
    </div>
  `,
  styles: [
    `@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
  

      .header {
        text-align: center;
        margin-bottom: 20px;
        font-family: 'Roboto', sans-serif;
        color: #333;
      }
      .header h1 {
        font-size: 2em;
        margin: 0;
        color: #333;
      }
      .header h2 {
        font-size: 1.2em;
        margin: 0;
        color: #666;
      }
     .task-container { 
       display: flex; 
       flex-direction: column; 
       gap: 15px; 
       width: 320px; 
       margin: auto;
       align-items: center;
       font-family: 'Roboto', sans-serif;
     }
     .task-card {
       position: relative;
       padding: 20px;
       border: 1px solid #e0e0e0;
       border-radius: 12px;
       background-color: #f9f9f9;
       box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
       transition: transform 0.3s ease-in-out, background-color 0.3s, opacity 0.5s ease-in-out, box-shadow 0.3s;
       overflow: hidden;
       width: 100%;
       text-align: center;
     }
     .task-card h2 {
       font-size: 1.2em;
       margin: 0 0 10px;
       color: #333;
     }
     .task-card p {
       font-size: 0.9em;
       color: #666;
     }
     .focus {
       transform: scale(1.05);
       font-weight: bold;
       background-color: #e3f2fd;
       border-color: #2196f3;
       box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
     }
     .progress {
       position: absolute;
       top: 0;
       left: 0;
       height: 100%;
       background-color: rgba(33, 150, 243, 0.3);
       transition: width 1s linear;
     }`
  ]
})
export class HabitTrackerComponent implements OnInit {
  tasks: Task[] = [
  { title: 'Wake up & have yerba mate', startTime: '09:30', endTime: '10:00' },
  { title: 'Light browsing / relaxation', startTime: '10:00', endTime: '10:30' },
  { title: 'Morning walk (get some steps in)', startTime: '10:30', endTime: '11:00' },
  { title: 'Focused work session', startTime: '11:00', endTime: '12:45' },
  { title: 'Short break (stretch, quick walk)', startTime: '12:45', endTime: '13:00' },
  { title: 'Lunch', startTime: '13:00', endTime: '13:30' },
  { title: 'Light walk (more steps)', startTime: '13:30', endTime: '14:00' },
  { title: 'Relax (browsing, music, power nap)', startTime: '14:00', endTime: '14:30' },
  { title: 'Focused work session', startTime: '14:30', endTime: '16:00' },
  { title: 'Break (snack, stretch)', startTime: '16:00', endTime: '16:15' },
  { title: 'Work session', startTime: '16:15', endTime: '18:00' },
  { title: 'Short break (move around)', startTime: '18:00', endTime: '18:15' },
  { title: 'Final work session', startTime: '18:15', endTime: '20:00' },
  { title: 'Dinner', startTime: '20:00', endTime: '20:30' },
  { title: 'Side projects / learning', startTime: '20:30', endTime: '21:30' },
  { title: 'Exercise (gym, jogging, or long walk)', startTime: '21:30', endTime: '22:30' },
  { title: 'Relaxation (watch something, play games, browse the internet)', startTime: '22:30', endTime: '23:30' },
  { title: 'Wind down (reading, light stretching)', startTime: '23:30', endTime: '00:00' }
];
  currentDate: Date = new Date();
  visibleTasks: Task[] = [];
  updatedCurrentIndex = 0;

  isCurrentTask(task: Task): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return task.startTime <= currentTime && task.endTime > currentTime;
  }

  getProgress(task: Task): number {
    const now = new Date();
    const [startHour, startMinute] = task.startTime.split(':').map(Number);
    const [endHour, endMinute] = task.endTime.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    return ((currentTime - startTime) / (endTime - startTime)) * 100;
  }

  getOpacity(index: number): number {
    //const currentTaskIndex = this.getCurrentTaskIndex();
    // If the task is before the current task, reduce its opacity
    if (index < this.updatedCurrentIndex) {
      return 1 - (this.updatedCurrentIndex - index) * 0.3;
    }
    // If the task is the current task or after, set full opacity
    return 1;
  }

  getCurrentTaskIndex(): number {
    return this.tasks.findIndex(task => this.isCurrentTask(task));
  }

  getVisibleTasks(): Task[] {
    const currentIndex = this.getCurrentTaskIndex();
    console.log('currentIndex: ', currentIndex);
    const tasks = this.tasks.slice(Math.max(0, currentIndex - 3));
    return tasks;
  }

  ngOnInit() {
    console.log('this.tasks: ', this.tasks);
    this.visibleTasks = this.getVisibleTasks();
    console.log('visibleTasks: ', this.visibleTasks);
    this.updatedCurrentIndex = this.visibleTasks.findIndex(task => this.isCurrentTask(task));
    console.log('this.updatedCurrentIndex: ', this.updatedCurrentIndex);
    setInterval(() => this.tasks = [...this.tasks], 60000); // Refresh every minute
  }
}
