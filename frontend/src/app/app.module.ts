import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BookingComponent } from './components/booking/booking.component';
import OwnerComponent from './components/owner/owner.component';
import { AdminComponent } from './components/admin/admin.component';
import { JwtInterceptor } from './interceptors/jwt.interceptors';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ToastComponent } from './components/toast/toast.component';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        RegisterComponent,
        DashboardComponent,
        BookingComponent,
        OwnerComponent,
        AdminComponent,
        AdminDashboardComponent,
        DateFormatPipe
    ],
    imports: [
        BrowserModule,
        CommonModule,
        AppRoutingModule,
        ReactiveFormsModule,
        HttpClientModule,
        ToastComponent
    ],
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideHttpClient(withInterceptorsFromDi()),
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

export default AppModule