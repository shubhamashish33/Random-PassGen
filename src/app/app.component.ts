import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  name: string = 'random password generator'
  generatedPassword: string = ''
  passwordLength: number = 12;
  isUpperCase: boolean = true;
  isLowerCase: boolean = true;
  isNumber: boolean = true;
  isSpecialChar: boolean = false;
  tag: string;
  colorname: string;
  showToastMessage: boolean = false;
  tagEle: HTMLLabelElement = document.getElementById('tag') as HTMLLabelElement;
  rangeValue: number = this.passwordLength;
  ngOnInit(): void {
    this.generateRandomChar();
  }
  generateRandomChar(): void {
    const upperCaseChar: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowerCaseChar: string = "abcdefghijklmnopqrstuvwxyz";
    const numberChar: string = "123456789";
    const specialChar: string = "!@#$%^&*()_+=[]{}|\:;<>?/~";
    let availableChar: string = "";
    if (this.isUpperCase) {
      availableChar += upperCaseChar
    }
    if (this.isLowerCase) {
      availableChar += lowerCaseChar
    }
    if (this.isNumber) {
      availableChar += numberChar
    }
    if (this.isSpecialChar) {
      availableChar += specialChar
    }
    this.generatePassword(availableChar);
    this.getTag();
  }
  generatePassword(password: string): void {
    this.generatedPassword = '';
    for (let i = 0; i < this.passwordLength; i++) {
      this.generatedPassword += password.charAt((Math.floor(Math.random() * password.length)))
    }
  }
  getTag(): void {
    if (this.passwordLength > 1 && this.passwordLength < 5) {
      this.tag = 'Very Weak';
      this.colorname = '#FF7800';
    }
    if (this.passwordLength >= 5 && this.passwordLength < 8) {
      this.tag = 'Weak'
      this.colorname = "#FFB370"
    }
    if (this.passwordLength >= 8 && this.passwordLength < 10) {
      this.tag = 'Good'
      this.colorname = "#FFDDBF"
    }
    if (this.passwordLength >= 10 && this.passwordLength < 12) {
      this.tag = 'Strong'
      this.colorname = "#D5F2A5";
    }
    if (this.passwordLength >= 12) {
      this.tag = 'Very Strong'
      this.colorname = "#9ae437"
    }
  }
  valueChanged(e): void {
    this.passwordLength = e.value;
    this.generateRandomChar();
  }
  copyText() {
    navigator.clipboard.writeText(this.generatedPassword).then(() => {
      console.log('Text copied to clipboard');
      this.showToastMessage = true;
      setTimeout(() => {
        this.showToastMessage = false;
      }, 3000)
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
  decreaseLength() {
    if (this.rangeValue > 1 && this.passwordLength > 1) {
      this.passwordLength--;
      this.rangeValue--;
      this.generateRandomChar();
    }
  }
  incraseLength() {
    if (this.rangeValue < 50 && this.passwordLength < 50) {
      this.passwordLength++;
      this.rangeValue++;
      this.generateRandomChar();
    }
  }
}
