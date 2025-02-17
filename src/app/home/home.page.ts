import {Component} from '@angular/core';
import {IonHeader, IonToolbar, IonTitle, IonContent, IonButton} from '@ionic/angular/standalone';
import {NgForOf} from "@angular/common";
import {SpeechRecognition} from "@capacitor-community/speech-recognition";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, NgForOf, IonButton],
})
export class HomePage {
  displayValue = '0';
  firstValue: number | null = null;
  operator: string | null = null;
  waitingForSecondValue = false;
  history: string[] = [];
  currentCalculation: string = '';
  isListening: boolean = false;


  numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'];
  operations = ['+', '-', '*', '/', '%', '(', ')'];

  constructor() {
    this.requestPermissions();
  }
  async requestPermissions() {
    const permissionStatus = await SpeechRecognition.requestPermissions();
    console.log('Statut de la permission:', permissionStatus);
  }
  appendNumber(num: string) {
    if (this.waitingForSecondValue) {
      this.displayValue = num;
      this.waitingForSecondValue = false;
    } else {
      this.displayValue = this.displayValue === '0' ? num : this.displayValue + num;
    }
    this.currentCalculation += num;
  }
  async startListening() {
    this.isListening = true;

    // Lancement de la reconnaissance vocale
    const available = await SpeechRecognition.available();
    if (!available) {
      alert("La reconnaissance vocale n'est pas disponible sur cet appareil.");
      return;
    }

    SpeechRecognition.start({
      language: 'fr-FR',
      maxResults: 1,
      prompt: 'Parlez pour calculer...',
      partialResults: true,
    }).then(result => {
      if (result.matches && result.matches.length > 0) {
        this.processVoiceCommand(result.matches[0]);
      }
    }).catch(error => {
      console.error('Erreur de reconnaissance vocale', error);
    });

    this.isListening = false;
  }
  processVoiceCommand(command: string) {
    console.log('Commande détectée:', command);
    const text = command.toLowerCase();

    // Convertir les mots en opérateurs
    let expression = text
      .replace(/plus/g, '+')
      .replace(/moins/g, '-')
      .replace(/multiplié par/g, '*')
      .replace(/divisé par/g, '/');

    // Mettre à jour l'affichage et calculer
    this.currentCalculation = expression;
    try {
      const result = eval(expression); // ⚠️ Vérifie bien l'entrée pour éviter des erreurs de sécurité
      this.displayValue = result.toString();
      this.history.unshift(`${expression} = ${result}`);
    } catch (error) {
      this.displayValue = "Erreur";
    }
  }
  setOperation(op: string) {
    if (this.operator !== null && !this.waitingForSecondValue) {
      this.calculate();
    }
    this.firstValue = parseFloat(this.displayValue);
    this.operator = op;
    this.waitingForSecondValue = true;
    this.currentCalculation += ' ' + op + ' ';
  }

  calculate() {
    if (this.firstValue === null || this.operator === null) return;
    const secondValue = parseFloat(this.displayValue);
    let result: number;
    switch (this.operator) {
      case '+':
        result = this.firstValue + secondValue;
        break;
      case '-':
        result = this.firstValue - secondValue;
        break;
      case '*':
        result = this.firstValue * secondValue;
        break;
      case '/':
        result = secondValue !== 0 ? this.firstValue / secondValue : NaN;
        break;
      default:
        return;
    }
    const operationString = `${this.firstValue} ${this.operator} ${secondValue} = ${result}`;
    this.history.unshift(operationString);
    if (this.history.length > 200) this.history.pop();

    this.displayValue = result.toString();
    this.currentCalculation = result.toString();
    this.firstValue = null;
    this.operator = null;
    this.waitingForSecondValue = false;
  }

  clear() {
    this.displayValue = '0';
    this.firstValue = null;
    this.operator = null;
    this.waitingForSecondValue = false;
    this.history = [];
    this.currentCalculation = '';
  }
}
