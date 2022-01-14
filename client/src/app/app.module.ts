import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SourceSelectorComponent } from './source-selector/source-selector.component';
import { BoxComponent } from './box/box.component';
import { TriggerSelectorComponent } from './trigger-selector/trigger-selector.component';

@NgModule({
  declarations: [
    AppComponent,
    SourceSelectorComponent,
    BoxComponent,
    TriggerSelectorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
