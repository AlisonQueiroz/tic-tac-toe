import { Directive, Input, ViewContainerRef, TemplateRef } from '@angular/core';

export interface NgLetContext<T> {
  $implicit: T;
  ngLet: T;
}

@Directive({
  selector: '[ngLet]'
})
export class NgLetDirective<T> {
  @Input()
  set ngLet(context: T) {
    this.context.$implicit = this.context.ngLet = context;
    this.updateView();
  }

  context = {
    $implicit: null,
    ngLet: null,
  };

  constructor(
    private vcRef: ViewContainerRef,
    private templateRef: TemplateRef<NgLetContext<T>>
  ) {}

  updateView() {
    this.vcRef.clear();
    this.vcRef.createEmbeddedView(this.templateRef, this.context);
  }
}
