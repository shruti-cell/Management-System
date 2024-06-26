import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BillService } from 'src/app/services/bill.service';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalCOnstants } from 'src/app/shared/global-constants';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-manage-order',
  templateUrl: './manage-order.component.html',
  styleUrls: ['./manage-order.component.scss']
})
export class ManageOrderComponent implements OnInit {
  displayColumns: string[] = ['name', 'category', 'price', 'quantity', 'total', 'edit'];
  dataSource: any;
  manageOrderForm: any = FormGroup;
  categories: any = []
  products: any = []
  price: any = []
  totalAmount: number = 0;
  responseMessage: any

  constructor(private productService: ProductService,
    private categoryService: CategoryService, private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService, private dialog: MatDialog, private billService: BillService,
    private snackbarService: SnackbarService, private router: Router) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.getCategories()
    this.manageOrderForm = this.formBuilder.group({
      name: [null, Validators.required, Validators.pattern(GlobalCOnstants.nameRegex)],
      email: [null, Validators.required, Validators.pattern(GlobalCOnstants.emailRegex)],
      contactNumber: [null, Validators.required, Validators.pattern(GlobalCOnstants.contactNumberRegex)],
      paymentMethod: [null, Validators.required],
      product: [null, Validators.required],
      category: [null, Validators.required],
      quantity: [null, Validators.required],
      price: [null, Validators.required],
      total: [0, Validators.required],

    })
  }

  getCategories() {
    this.categoryService.getCategories().subscribe((res: any) => {
      this.ngxService.stop();
      this.categories = res
    }, (error) => {
      if (error?.error?.message) {
        this.responseMessage = error?.error?.message;
      }
      else {
        this.responseMessage = GlobalCOnstants.genericError;

      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalCOnstants.error);
    })
  }

  getProductByCategory(value: any) {
    this.productService.getProductByCategory(value.id).subscribe((res: any) => {
      this.products = res;
      this.manageOrderForm.controls['price'].setValue('');
      this.manageOrderForm.controls['quantity'].setValue('');
      this.manageOrderForm.controls['total'].setValue(0);
    }, (error: any) => {
      if (error?.error?.message) {
        this.responseMessage = error?.error?.message;
      }
      else {
        this.responseMessage = GlobalCOnstants.genericError;

      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalCOnstants.error);
    })
  }

  getProductDetails(value: any) {
    this.productService.getById(value.id).subscribe((res: any) => {
      this.price = res;
      this.manageOrderForm.controls['price'].setValue(res.price);
      this.manageOrderForm.controls['quantity'].setValue('1');
      this.manageOrderForm.controls['total'].setValue(this.price * 1);
    }, (error: any) => {
      if (error?.error?.message) {
        this.responseMessage = error?.error?.message;
      }
      else {
        this.responseMessage = GlobalCOnstants.genericError;

      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalCOnstants.error);
    })
  }

  setQuantity(value: any) {
    var temp = this.manageOrderForm.controls['quantity'].value;
    if (temp > 0) {
      this.manageOrderForm.controls['total'].setValue(this.manageOrderForm.controls['quantity'].value * this.manageOrderForm.controls['price'].value)
    }
    else if (temp != 0) {
      this.manageOrderForm.controls['quantity'].setValue('1');
      this.manageOrderForm.controls['total'].setValue(this.manageOrderForm.controls['quantity'].value * this.manageOrderForm.controls['price'].value)
    }
  }

  validateProductAdd() {
    if (this.manageOrderForm.controls['total'].value === 0 || this.manageOrderForm.controls['total'].value == null || this.manageOrderForm.controls['quantity'].value <= 0)
      return true;

    else
      return false;
  }

  validateSubmit() {
    if (this.totalAmount == 0 || this.manageOrderForm.controls['name'].value === null
      || this.manageOrderForm.controls['email'].value == null ||
      this.manageOrderForm.controls['contactumber'].value == null ||
      this.manageOrderForm.controls['paymentMethod'].value == null || !(this.manageOrderForm.controls['contactNumber'].valid) || !(this.manageOrderForm.controls['email'].valid))
      return true;
    else
      return false;
  }

  add(){
    var formData = this.manageOrderForm.value;
    var productName = this.dataSource.find((e:{id:number;}) => e.id == formData.product.id );

    if(productName == undefined){
      this.totalAmount = this.totalAmount + formData.total;
      this.dataSource.push({id:formData.product.id,name:formData.product.name, category:formData.category.name, quantity: formData.quantity , price:formData.price,total:formData.price});
      this.dataSource = [...this.dataSource];
      this.snackbarService.openSnackBar(GlobalCOnstants.productAdded , "success")
    }
    else{
      this.snackbarService.openSnackBar(this.responseMessage, GlobalCOnstants.error);
    }
  }

  handleDeleteAction(value:any,element:any){
    this.totalAmount = this.totalAmount  - element.total;
    this.dataSource.splice(value,1);
    this.dataSource = [...this.dataSource];
  }

  submitAction(){
    var formData = this.manageOrderForm.value;
    var data = {
      name:formData.name,
      email:formData.email,
      contactNumber:formData.contactNumber,
      paymentMethod:formData.paymentMethod,
      totalAmount: this.totalAmount,
      productDetails : JSON.stringify(this.dataSource)
    }
    this.billService.generateReport(data).subscribe((res:any)=>{
      this.downloadFile(res?.uuid);
      this.dataSource = [];
      this.totalAmount = 0 ; 
    },(error:any)=>{
      if (error?.error?.message) {
        this.responseMessage = error?.error?.message;
      }
      else {
        this.responseMessage = GlobalCOnstants.genericError;

      }
      this.snackbarService.openSnackBar(this.responseMessage, GlobalCOnstants.error);
    })
  }

  downloadFile(fileName:any){
    var data ={
      uuid:fileName
    }
    this.billService.getPdf(data).subscribe((res:any)=>{
      saveAs(res,fileName+'.pdf');
      this.ngxService.stop();
    })

  }
}
