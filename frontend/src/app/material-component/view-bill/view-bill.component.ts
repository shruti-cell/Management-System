import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BillService } from 'src/app/services/bill.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalCOnstants } from 'src/app/shared/global-constants';
import { ViewBillProductsComponent } from '../dialog/view-bill-products/view-bill-products.component';
import { ConfirmationComponent } from '../dialog/confirmation/confirmation.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-view-bill',
  templateUrl: './view-bill.component.html',
  styleUrls: ['./view-bill.component.scss']
})
export class ViewBillComponent implements OnInit {
  displayColumns:string[] = ['name','email','contactNumber','paymentMethod','total', 'view'];
  dataSource:any;
  responseMessage : any

  constructor(private billService: BillService, private ngxService:NgxUiLoaderService,private dialog:MatDialog,
      private snackbarService:SnackbarService, private router:Router) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }

  tableData(){
    this.billService.getBills().subscribe((res:any)=>{
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

  handleViewAction(values:any){
    const dialogConfig = new MatDialogConfig();
      dialogConfig.data={
        action: values
      }
      dialogConfig.width = '100%';
      const dialogRef = this.dialog.open(ViewBillProductsComponent,dialogConfig);
      this.router.events.subscribe(()=>{
        dialogRef.close();
      });
  }
  downloadReportAction(values:any){
    this.ngxService.start();
    ['name','email','contactNumber','paymentMethod','total', 'view'];
    var data={
      name:values.name,
      email:values.email,
      uuid:values.uuid,
      contactNumber:values.contactNumber,
      paymentMethod:values.paymentMethod,
      totalAmount:values.total,
      productDetails:values.productDetails
    }
    this.billService.getPdf(data).subscribe((res)=>{
      saveAs(res,values.uuid+'.pdf')
      this.ngxService.stop();
    })
  }

  handleDeleteAction(values:any){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data={
      message: 'delete '+values.name+ ' bill'
    }
    
    const dialogRef = this.dialog.open(ConfirmationComponent,dialogConfig);
    this.router.events.subscribe(()=>{
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res=>{
      this.ngxService.start();
      this.deleteProduct(values.id);
      dialogRef.close();
    }))
  }

  deleteProduct(id:any){
    this.billService.delete(id).subscribe((res:any)=>{
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
}
