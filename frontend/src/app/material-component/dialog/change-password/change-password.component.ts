import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { GlobalCOnstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
changePasswordForm:any=FormGroup;
responseMessage:any;

  constructor(private formbuilder:FormBuilder,
    private userService:UserService, public dialogRef: MatDialogRef<ChangePasswordComponent>,
    private ngxService:NgxUiLoaderService, private snackbarService:SnackbarService) { }

  ngOnInit(): void {
    this.changePasswordForm = this.formbuilder.group({
      oldPassword:[null,[Validators.required]],
      newPassword:[null,[Validators.required]],
      confirmPassword:[null,[Validators.required]],

    })
  }

  validateSubmit(){
    if(this.changePasswordForm.controls['newPassword'].value != this.changePasswordForm.controls['confirmPassword'].value){
      return true;
    }
    else{
      return false;
    }
  }

  handleChangePasswordSubmit(){
    this.ngxService.start();
    var formData = this.changePasswordForm.value;
    var data = {
      oldPassword: formData.oldPassword,
      newPassword:formData.newPassword,
      confirmPassword: formData.confirmPassword,
    }

    this.userService.login(data).subscribe((res:any)=>{
      this.ngxService.stop();
      this.responseMessage = res?.message;
      this.dialogRef.close();
      this.snackbarService.openSnackBar(this.responseMessage,"success");
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
