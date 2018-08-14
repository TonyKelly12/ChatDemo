import { ElementRef, HostListener, Directive, OnInit, Inject, EventEmitter, Output } from '@angular/core';

@Directive({
  selector: 'ion-textarea[autosize]'
})
export class Autosize implements OnInit {
  @HostListener('input', ['$event.target'])
  onInput(textArea:HTMLTextAreaElement):void {
    this.adjust();
  }

  @Output() resized = new EventEmitter<boolean>();

  constructor(@Inject(ElementRef) public element:ElementRef) {
  }

  ngOnInit():void {
    setTimeout(() => this.adjust(), 0);
  }

  adjust():void {
    let textArea = this.element.nativeElement.getElementsByTagName('textarea')[0];
    textArea.style.overflow = 'hidden';
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + "px";

    this.resized.emit(true);
  }
}
