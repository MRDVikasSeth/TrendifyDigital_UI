import { Component, OnInit } from '@angular/core';
import { ThemeService } from './core/Service/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone:false
})
export class AppComponent implements OnInit {

   constructor(private themeService: ThemeService) {}

   ngOnInit() {
    this.themeService.loadSavedTheme();
  }
  
  title = 'TrendifyDigital';
}
