import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../services/dbservice.service';
import { DayTasks, Task } from '../model';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { EditTaskModalComponent } from '../edit-task-modal/edit-task-modal.component';


@Component({
  selector: 'app-habit-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, EditTaskModalComponent],
  templateUrl: './habit-tracker.component.html',
  styleUrls: ['./habit-tracker.component.scss']
})
export class HabitTrackerComponent implements OnInit {

  tasks: Task[] = [];
  visibleTasks: Task[] = [];
  currentTaskIndex: number = 0;
  updatedCurrentTaskIndex = 0;
  currentDate: Date = new Date();
  currentDateIndex: number = 0;
  root: any;
  dayTasks: DayTasks[]=[];
  editingTask: Task | null = null; // This is for the modal
  editingDate: string = "";
  constructor(private dbService: DbService){
  }

  async ngOnInit() {
    this.dayTasks = await this.dbService.getTasks();
    this.visibleTasks = this.getVisibleTasks();
    this.updatedCurrentTaskIndex = this.visibleTasks.findIndex(task => this.isCurrentTask(task));
    this.currentDateIndex = this.dayTasks.findIndex(elem => elem.date == this.formatDate(this.currentDate));
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

  fillMonthDummy(){
    this.dbService.addTasksForCurrentMonthDummy();
  }

  async deleteTask(task: Task, date: string) {
    console.log('Deleting task:', task);
    await this.dbService.deleteTaskByDateAndTitle(date, task.title);
    this.dayTasks = await this.dbService.getTasks(); // Refresh tasks from the database
    this.updateVisibleTasks(); // Update visible tasks after deletion
  }


  editTask(selectedTask: Task, selectedDate: string) {
    this.editingTask = { ...selectedTask };
    this.editingDate = selectedDate;
    console.log(this.editingTask)
  }

  closeModal() {
    this.editingTask = null;
  }

  async onTaskSaved(event: {task: Task, date: string}) {
    if (this.editingTask) {
      await this.dbService.updateTask(event.date, event.task);
      this.dayTasks = await this.dbService.getTasks(); // Refresh tasks
      this.updateVisibleTasks(); // Reorder tasks
      this.closeModal();
    }
  }

  getTasksById(){
    this.dbService.getTasksById("2025-05-20")
  }

  addTask(){
    
  }

}


