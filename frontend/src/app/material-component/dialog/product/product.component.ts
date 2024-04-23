import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from 'src/app/services/category.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalCOnstants } from 'src/app/shared/global-constants';
import { CategoryComponent } from '../category/category.component';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  onAddProduct = new EventEmitter();
  onEditProduct = new EventEmitter();
  productForm: any = FormGroup;
  dialogAction: any = "Add";
  action: any = "Add";
  responseMessage: any
  _categories: any = [];
  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: any, private formBuilder: FormBuilder, private productService: ProductService, private categoryService: CategoryService,
    public dialogRef: MatDialogRef<ProductComponent>, private snackbarService: SnackbarService) { }

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.pattern(GlobalCOnstants.nameRegex)]],
      categoryId: [null, Validators.required],
      price: [null, Validators.required],
      description: [null, Validators.required],

    });
    if (this.dialogData.action === 'Edit') {
      this.dialogAction = "Edit";
      this.action = "Update";
      this.productForm.patchValue(this.dialogData.data);
    }
    this.getCategories()
  }

  getCategories() {
    this.categoryService.getCategories().subscribe((res: any) => {
      this._categories = res
    },(error) => {
      if (error?.error?.message) {
        this.responseMessage = error?.error?.message;
      }
      else {
        this.responseMessage = GlobalCOnstants.genericError;
        this.snackbarService.openSnackBar(this.responseMessage, GlobalCOnstants.error);
      }
    })
  }


  handleSubmit() {
    if (this.dialogAction === 'Edit') {
      this.edit()
    }
    else {
      this.add()
    }

  }
  add() {
    var formData = this.productForm.value;
    var data = {
      name: formData.name,
      categoryId:formData.categoryId,
      price: formData.price,
      description : formData.description,
    }
    this.productService.add(data).subscribe((res: any) => {
      this.dialogRef.close();
      this.onAddProduct.emit();
      this.responseMessage = res.message;
      this.snackbarService.openSnackBar(this.responseMessage, "success")

    }, (error) => {
      this.dialogRef.close();
      if (error?.error?.message) {
        this.responseMessage = error?.error?.message;
      }
      else {
        this.responseMessage = GlobalCOnstants.genericError;
        this.snackbarService.openSnackBar(this.responseMessage, GlobalCOnstants.error);
      }
    })
  }
  edit() {
    var formData = this.productForm.value;
    var data = {
      id: this.dialogData.data.id,
      name: formData.name,
      categoryId:formData.categoryId,
      price: formData.price,
      description : formData.description,
    }
    this.categoryService.update(data).subscribe((res: any) => {
      this.dialogRef.close();
      this.onEditProduct.emit();
      this.responseMessage = res.message;
      this.snackbarService.openSnackBar(this.responseMessage, "success")

    }, (error) => {
      this.dialogRef.close();
      if (error?.error?.message) {
        this.responseMessage = error?.error?.message;
      }
      else {
        this.responseMessage = GlobalCOnstants.genericError;
        this.snackbarService.openSnackBar(this.responseMessage, GlobalCOnstants.error);
      }
    })
  }

}
