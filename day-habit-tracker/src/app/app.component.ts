import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HabitTrackerComponent } from './habit-tracker/habit-tracker.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HabitTrackerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'day-habit-tracker';
}
