import {Component} from '@angular/core';
import {IonHeader, IonToolbar, IonTitle, IonContent} from '@ionic/angular/standalone';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, NgForOf],
})
export class HomePage {
  displayValue = '0';
  firstValue: number | null = null;
  operator: string | null = null;
  waitingForSecondValue = false;

  numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'];
  operations = ['+', '-', '*', '/', '%', '(', ')'];

  appendNumber(num: string) {
    if (this.waitingForSecondValue) {
      this.displayValue = num;
      this.waitingForSecondValue = false;
    } else {
      this.displayValue = this.displayValue === '0' ? num : this.displayValue + num;
    }
  }

  setOperation(op: string) {
    if (this.operator !== null && !this.waitingForSecondValue) {
      this.calculate();
    }
    this.firstValue = parseFloat(this.displayValue);
    this.operator = op;
    this.waitingForSecondValue = true;
  }

  calculate() {
    if (this.firstValue === null || this.operator === null) return;
    const secondValue = parseFloat(this.displayValue);
    let result: number;
    switch (this.operator) {
      case '+': result = this.firstValue + secondValue; break;
      case '-': result = this.firstValue - secondValue; break;
      case '*': result = this.firstValue * secondValue; break;
      case '/': result = secondValue !== 0 ? this.firstValue / secondValue : NaN; break;
      case '%': result = this.firstValue % secondValue; break;
      default: return;
    }
    this.displayValue = result.toString();
    this.firstValue = null;
    this.operator = null;
    this.waitingForSecondValue = false;
  }

  clear() {
    this.displayValue = '0';
    this.firstValue = null;
    this.operator = null;
    this.waitingForSecondValue = false;
  }
}
