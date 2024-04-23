import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { GlobalCOnstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss']
})
export class ManageUserComponent implements OnInit {
  displayColumns:string[] = ['name','email','contactNumber','status'];
  dataSource:any;
  responseMessage : any

  constructor(private userService:UserService,
    private ngxService:NgxUiLoaderService, private snackbarService:SnackbarService) { }

  ngOnInit(): void {
    this.ngxService.start()
  }
  tableData(){
    this.userService.getUsers().subscribe((res:any)=>{
      this.ngxService.stop();
      this.dataSource = new MatTableDataSource(res);
    },(error:any)=>{
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
  applyFilter(event:Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  handleChangeAction(status:any,id:any){
    var data = {
      status:status.toString(),
      id:id
    }
    this.userService.update(data).subscribe((res:any)=>{
      this.ngxService.stop();
      this.responseMessage = res?.message;
      this.snackbarService.openSnackBar(this.responseMessage,"success")
    },(error:any)=>{
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
