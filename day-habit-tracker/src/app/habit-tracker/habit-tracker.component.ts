import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../services/dbservice.service';
import { DayTasks, Task } from '../model';


@Component({
  selector: 'app-habit-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-tracker.component.html',
  styleUrls: ['./habit-tracker.component.scss']
})
export class HabitTrackerComponent implements OnInit {
//   tasksExample: Task[] = [
//   { title: 'Wake up & have yerba mate', startTime: '09:30', endTime: '10:00' },
//   { title: 'Light browsing / relaxation', startTime: '10:00', endTime: '10:30' },
//   { title: 'Morning walk (get some steps in)', startTime: '10:30', endTime: '11:00' },
//   { title: 'Focused work session', startTime: '11:00', endTime: '12:45' },
//   { title: 'Short break (stretch, quick walk)', startTime: '12:45', endTime: '13:00' },
//   { title: 'Lunch', startTime: '13:00', endTime: '13:30' },
//   { title: 'Light walk (more steps)', startTime: '13:30', endTime: '14:00' },
//   { title: 'Relax (browsing, music, power nap)', startTime: '14:00', endTime: '14:30' },
//   { title: 'Focused work session', startTime: '14:30', endTime: '16:00' },
//   { title: 'Break (snack, stretch)', startTime: '16:00', endTime: '16:15' },
//   { title: 'Work session', startTime: '16:15', endTime: '18:00' },
//   { title: 'Short break (move around)', startTime: '18:00', endTime: '18:15' },
//   { title: 'Final work session', startTime: '18:15', endTime: '20:00' },
//   { title: 'Dinner', startTime: '20:00', endTime: '20:30' },
//   { title: 'Side projects / learning', startTime: '20:30', endTime: '21:30' },
//   { title: 'Exercise (gym, jogging, or long walk)', startTime: '21:30', endTime: '22:30' },
//   { title: 'Relaxation (watch something, play games, browse the internet)', startTime: '22:30', endTime: '23:30' },
//   { title: 'Wind down (reading, light stretching)', startTime: '23:30', endTime: '00:00' }
// ];

  tasks: Task[] = [];
  visibleTasks: Task[] = [];
  currentTaskIndex: number = 0;
  updatedCurrentTaskIndex = 0;
  currentDate: Date = new Date();
  currentDateIndex: number = 0;
  root: any;
  dayTasks: DayTasks[]=[];
  constructor(private dbService: DbService){
  }

  async ngOnInit() {
    this.dayTasks = await this.dbService.getTasks();
    this.visibleTasks = this.getVisibleTasks();
    this.updatedCurrentTaskIndex = this.visibleTasks.findIndex(task => this.isCurrentTask(task));
    this.currentDateIndex = this.dayTasks.findIndex(elem => elem.date == this.formatDate(this.currentDate));
    console.log(this.formatDate(this.currentDate));
    console.log(this.currentDateIndex)
    setInterval(() => this.tasks = [...this.tasks], 60000); // Refresh every minute
  }

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
    if (index < this.updatedCurrentTaskIndex) {
      return 1 - (this.updatedCurrentTaskIndex - index) * 0.3;
    }
    return 1;
  }

  getCurrentTaskIndex(): number {
    return this.tasks.findIndex(task => this.isCurrentTask(task));
  }

  getVisibleTasks(): Task[] {
    const currentIndex = this.getCurrentTaskIndex();
    this.currentTaskIndex = currentIndex;
    const tasks = this.tasks.slice(Math.max(0, currentIndex - 3));
    return tasks;
  }

  previousDay() {
    // let data = this.dbService.getTasks();
    // console.log('data: ', data);
    this.currentDate = new Date(this.currentDate);
    this.currentDate.setDate(this.currentDate.getDate() - 1);
    this.currentDateIndex--;
  }

  nextDay() {
    this.currentDate = new Date(this.currentDate);
    this.currentDate.setDate(this.currentDate.getDate() +1)
    this.currentDateIndex++;
  }

  updateVisibleTasks() {
    this.visibleTasks = this.getVisibleTasks();
    this.updatedCurrentTaskIndex = this.visibleTasks.findIndex(task => this.isCurrentTask(task));
  }

  isFocusedDay(date: string): boolean {
    return date === this.currentDate.toDateString();
  }

  isToday(date:string):boolean{
    return date === new Date().toDateString();
  }

  getCarouselTransform(): string {
    const containerWidth = 500; // Width of each task container
    const visibleItems = 3; // Number of items you want visible in the carousel
    const totalVisibleWidth = containerWidth * visibleItems;
    const offset = (this.currentDateIndex - Math.floor(visibleItems / 2)) * containerWidth;
    return `translateX(calc(50% - ${totalVisibleWidth / 2}px - ${offset}px))`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure two digits
    const day = date.getDate().toString().padStart(2, '0'); // Ensure two digits
    return `${year}-${month}-${day}`;
  }
}


