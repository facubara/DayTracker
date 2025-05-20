import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../model'; // Adjust the import based on how you've structured your models
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-task-modal',
  standalone: true,
  imports: [FormsModule], // Make sure FormsModule is included here
  templateUrl: './edit-task-modal.component.html',
  styleUrls: ['./edit-task-modal.component.scss']
})
export class EditTaskModalComponent {
  @Input() task: Task = { id: 0, title: '', startTime: '', endTime: '' }; // Initialized with default Task
  @Input() date: string = "";
  @Output() taskSaved = new EventEmitter<{task: Task, date: string}>();
  @Output() modalClosed = new EventEmitter<void>();

  closeModal() {
    this.modalClosed.emit();
  }

  saveTask() {
    this.taskSaved.emit({task: this.task, date: this.date});
  }
}