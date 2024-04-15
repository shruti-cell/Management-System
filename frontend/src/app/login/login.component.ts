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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm:any = FormGroup;
  resMsg:any
    constructor(private formBuilder:FormBuilder,private router:Router,private userService:UserService,
      private snackbarService:SnackbarService,private dialogRef:MatDialogRef<LoginComponent>,private ngxService:NgxUiLoaderService) { }
  
    ngOnInit(): void {
      this.loginForm = this.formBuilder.group({
        email:[null,[Validators.required,Validators.pattern(GlobalCOnstants.emailRegex)]],
        password : [null,[Validators.required]],
      })
    }
  
    handleSubmit(){
      this.ngxService.start();
      var formData = this.loginForm.value;
      var data ={
        email:formData.email,
        password:formData.password
      }
      this.userService.login(data).subscribe((res:any)=>{
        this.ngxService.stop();
        this.dialogRef.close();
        // this.resMsg = res?.message;
        // this.snackbarService.openSnackBar(this.resMsg,'');
        localStorage.setItem('token',res.message)
        this.router.navigate(['/cafe/dashboard']);
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
  
