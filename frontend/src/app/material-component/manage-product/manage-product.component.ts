import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalCOnstants } from 'src/app/shared/global-constants';
import { CategoryComponent } from '../dialog/category/category.component';
import { ProductComponent } from '../dialog/product/product.component';
import { ConfirmationComponent } from '../dialog/confirmation/confirmation.component';

@Component({
  selector: 'app-manage-product',
  templateUrl: './manage-product.component.html',
  styleUrls: ['./manage-product.component.scss']
})
export class ManageProductComponent implements OnInit {
  displayColumns:string[] = ['name','categoryName','description','price','edit'];
  dataSource:any;
  responseMessage : any
    constructor(private productService: ProductService, private ngxService:NgxUiLoaderService,private dialog:MatDialog,
      private snackbarService:SnackbarService, private router:Router
    ) { }
  
    ngOnInit(): void {
      this.ngxService.start();
      this.tableData();
    }

    tableData(){
      this.productService.getProducts().subscribe((res:any)=>{
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
      const dialogRef = this.dialog.open(ProductComponent,dialogConfig);
      this.router.events.subscribe(()=>{
        dialogRef.close();
      });
      const sub = dialogRef.componentInstance.onAddProduct.subscribe((res=>{
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
      const dialogRef = this.dialog.open(ProductComponent,dialogConfig);
      this.router.events.subscribe(()=>{
        dialogRef.close();
      });
      const sub = dialogRef.componentInstance.onEditProduct.subscribe((res=>{
        this.tableData();
      }))
    }

    handleDeleteAction(values:any){
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data={
        message:'delete '+values.name+' product'
      };
      const dialogRef = this.dialog.open(ConfirmationComponent,dialogConfig)
      const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res=>{
        this.ngxService.start();
        this.deleteProduct(values.id);
        dialogRef.close();
      }))
    }

    deleteProduct(id:any){
      this.productService.delete(id).subscribe((res:any)=>{
        this.ngxService.stop();
        this.tableData();
        this.responseMessage = res?.message;
        this.snackbarService.openSnackBar(this.responseMessage,"success");
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
    onChange(status:any,id:any){
      var data = {
        status:status.toString(),
        id:id
      }
      this.productService.updateStatus(data).subscribe((res:any)=>{
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
