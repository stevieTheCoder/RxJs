import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ProductService } from './product.service';
import { EMPTY, combineLatest, BehaviorSubject, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  private errorMessageSubect = new Subject<string>();
  errorMessage$ = this.errorMessageSubect.asObservable();

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([
    this.productService.productsWithAdd$,
    this.categorySelectedAction$
  ])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product =>
          selectedCategoryId ? product.categoryId === selectedCategoryId : true
          )),
      catchError(err => {
        this.errorMessageSubect.next(err);
        return EMPTY;
      })
    );

  categories$ = this.productCateogryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessageSubect.next(err);
        return EMPTY;
      })
    );

  constructor(private productService: ProductService, private productCateogryService: ProductCategoryService) { }

  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
