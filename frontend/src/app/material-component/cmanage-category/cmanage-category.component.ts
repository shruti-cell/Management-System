import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CategoryService } from 'src/app/services/category.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalCOnstants } from 'src/app/shared/global-constants';
import { CategoryComponent } from '../dialog/category/category.component';

@Component({
  selector: 'app-cmanage-category',
  templateUrl: './cmanage-category.component.html',
  styleUrls: ['./cmanage-category.component.scss']
})
export class CmanageCategoryComponent implements OnInit {
displayColumns:string[] = ['name','edit'];
dataSource:any;
responseMessage : any
  constructor(private categoryService: CategoryService, private ngxService:NgxUiLoaderService,private dialog:MatDialog,
    private snackbarService:SnackbarService, private router:Router
  ) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }
  tableData(){
    this.categoryService.getCategories().subscribe((res:any)=>{
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

  handleAddAction(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data={
      action:'Add'
    }
    dialogConfig.width = '850px';
    const dialogRef = this.dialog.open(CategoryComponent,dialogConfig);
    this.router.events.subscribe(()=>{
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onAddCategory.subscribe((res=>{
      this.tableData();
    }))
  }
  handleEditAction(value:any){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data={
      action:'Edit',
      data:value
    }
    dialogConfig.width = '850px';
    const dialogRef = this.dialog.open(CategoryComponent,dialogConfig);
    this.router.events.subscribe(()=>{
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onEditCategory.subscribe((res=>{
      this.tableData();
    }))
  }
}
