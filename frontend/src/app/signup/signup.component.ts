import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { SnackbarService } from '../services/snackbar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GlobalCOnstants } from '../shared/global-constants';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
signUpForm:any = FormGroup;
resMsg:any
  constructor(private formBuilder:FormBuilder,private router:Router,private userService:UserService,
    private snackbarService:SnackbarService,private dialogRef:MatDialogRef<SignupComponent>,private ngxService:NgxUiLoaderService) { }

  ngOnInit(): void {
    this.signUpForm = this.formBuilder.group({
      name:[null,[Validators.required,Validators.pattern(GlobalCOnstants.nameRegex)]],
      email:[null,[Validators.required,Validators.pattern(GlobalCOnstants.emailRegex)]],
      contactNumber:[null,[Validators.required,Validators.pattern(GlobalCOnstants.contactNumberRegex)]],
      password : [null,[Validators.required]],
    })
  }

  handleSubmit(){
    this.ngxService.start();
    var formData = this.signUpForm.value;
    var data ={
      name :formData.name,
      email:formData.email,
      contactNumber: formData.contactNumber,
      password:formData.password
    }
    this.userService.signUp(data).subscribe((res:any)=>{
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
