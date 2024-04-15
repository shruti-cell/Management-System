import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from '../services/snackbar.service';
import { UserService } from '../services/user.service';
import { GlobalCOnstants } from '../shared/global-constants';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-forgot-pwd',
  templateUrl: './forgot-pwd.component.html',
  styleUrls: ['./forgot-pwd.component.scss']
})
export class ForgotPwdComponent implements OnInit {
  forgotPwd:any = FormGroup;
  resMsg:any
    constructor(private formBuilder:FormBuilder,private router:Router,private userService:UserService,
      private snackbarService:SnackbarService,private dialogRef:MatDialogRef<ForgotPwdComponent>,private ngxService:NgxUiLoaderService) { }
  
    ngOnInit(): void {
      this.forgotPwd = this.formBuilder.group({
        email:[null,[Validators.required,Validators.pattern(GlobalCOnstants.emailRegex)]],
      })
    }
  
    handleSubmit(){
      this.ngxService.start();
      var formData = this.forgotPwd.value;
      var data ={
        email:formData.email,
      }
      this.userService.forgetPwd(data).subscribe((res:any)=>{
        this.ngxService.stop();
        this.dialogRef.close();
        this.resMsg = res?.message;
        this.snackbarService.openSnackBar(this.resMsg,'');
        this.router.navigate(['/']);
      },(error)=>{
        this.ngxService.stop();
        if(error?.error?.message){
          this.resMsg = error?.error?.message;
        }
        else{
          this.resMsg = GlobalCOnstants.genericError;
          this.snackbarService.openSnackBar(this.resMsg,GlobalCOnstants.error);
        }
      })
    }
}
