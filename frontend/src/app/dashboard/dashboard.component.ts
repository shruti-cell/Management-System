import { Component, AfterViewInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from '../services/snackbar.service';
import { GlobalCOnstants } from '../shared/global-constants';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
responseMessage:any;
data:any;
	ngAfterViewInit() { }

	constructor(private dashboardService:DashboardService, private ngxService:NgxUiLoaderService, private snackbarService: SnackbarService) {
		this.ngxService.start();
		this.dashboardData()
	}

	dashboardData(){
		this.dashboardService.getDetails().subscribe((res:any)=>{
			this.ngxService.stop();
			debugger
			this.data = res;
			
		  },(error)=>{
			this.ngxService.stop();
			if(error?.error?.message){
			  this.responseMessage = error?.error?.message;
			}
			else{
			  this.responseMessage = GlobalCOnstants.genericError;
			  this.snackbarService.openSnackBar(this.responseMessage,GlobalCOnstants.error);
			}
		  })
	}
}
