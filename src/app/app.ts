import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapViewComponent } from './components/map-view/map-view.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ProgressHudComponent } from './components/progress-hud/progress-hud.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MapViewComponent, SidebarComponent, ProgressHudComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
