export interface Task {
  title: string;
  startTime: string;
  endTime: string;
}

export interface DayTasks{
  date:string;
  tasks: Task[];
}
