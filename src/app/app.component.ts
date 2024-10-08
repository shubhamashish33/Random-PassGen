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
  upperCaseChar: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  lowerCaseChar: string = "abcdefghijklmnopqrstuvwxyz";
  numberChar: string = "1234567890";
  specialChar: string = "!@#$%^&*()_+-=[]{}|\:;<>?/~,.'`";
  isUpperCase: boolean = true;
  buttonText = 'Copy';
  isLowerCase: boolean = true;
  isNumber: boolean = true;
  isSpecialChar: boolean = false;
  isDisabled: boolean = false;
  tag: string;
  colorname: string;
  showToastMessage: boolean = false;
  rangeValue: number = this.passwordLength;
  minLengthValue: number = 4;
  maximumLengthValue: number = 20;
  timeStamp: string;
  previousSavedPass: any = [];
  showStoredPass: boolean = false;
  ngOnInit(): void {
    this.generateRandomChar();
    this.getSavedPasswordOnLoad();
  }
  getSavedPasswordOnLoad() {
    if (this.showStoredPass) {
      const savedLocalPass: string = localStorage.getItem('password');
      if (savedLocalPass) {
        const storedPass: string[] = savedLocalPass.split(",");
        this.previousSavedPass = [...storedPass];
      }
      else if (this.previousSavedPass.length > 0) {
        this.previousSavedPass;
      }
      else {
        this.previousSavedPass = [];
      }
    }
  }
  generateRandomChar(): void {
    if (!(this.isUpperCase || this.isLowerCase || this.isNumber || this.isSpecialChar)) {
      this.generatedPassword = "Please select one value";
      this.isDisabled = true;
      this.tag = "NA";
      this.colorname = "#ddd";
      this.timeStamp = "NA";
      return;
    }
    else {
      let availableChar: string = "";
      if (this.isUpperCase) {
        availableChar += this.upperCaseChar
      }
      if (this.isLowerCase) {
        availableChar += this.lowerCaseChar
      }
      if (this.isNumber) {
        availableChar += this.numberChar
      }
      if (this.isSpecialChar) {
        availableChar += this.specialChar
      }
      this.onGeneratePassword(availableChar);
      this.getTag();
      this.isDisabled = false;
    }
  }
  onGeneratePassword(password: string): void {
    this.generatedPassword = '';
    for (let i = 0; i < this.passwordLength; i++) {
      this.generatedPassword += password.charAt((Math.floor(Math.random() * password.length)))
    }
    this.timeToBreakPassword(this.generatedPassword);
  }
  timeToBreakPassword(password: string, attemptsPerSecond: number = 1e9) {
    let charset = "";
    if (password.split('').some(char => this.lowerCaseChar.includes(char))) {
      charset += this.lowerCaseChar;
    }
    if (password.split('').some(char => this.upperCaseChar.includes(char))) {
      charset += this.upperCaseChar;
    }
    if (password.split('').some(char => this.numberChar.includes(char))) {
      charset += this.numberChar;
    }
    if (password.split('').some(char => this.specialChar.includes(char))) {
      charset += this.specialChar;
    }
    const charsetSize = charset.length;
    const possibleCombinations = Math.pow(charsetSize, password.length);
    const secondsToBreak = possibleCombinations / attemptsPerSecond;
    const years = Math.floor(secondsToBreak / (60 * 60 * 24 * 365));
    const days = Math.floor((secondsToBreak % (60 * 60 * 24 * 365)) / (60 * 60 * 24));
    const hours = Math.floor((secondsToBreak % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((secondsToBreak % (60 * 60)) / 60);
    const seconds = Math.floor(secondsToBreak % 60);
    this.timeStamp = `${years} years, ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  }
  getTag(): void {
    if (this.passwordLength >= this.minLengthValue && this.passwordLength <= 5) {
      this.tag = 'Very Weak';
      this.colorname = '#FFDAB9';
    }
    if (this.passwordLength > 5 && this.passwordLength < 8) {
      this.tag = 'Weak'
      this.colorname = "#FFA07A"
    }
    if (this.passwordLength >= 8 && this.passwordLength < 10) {
      this.tag = 'Good'
      this.colorname = "#FFD700"
    }
    if (this.passwordLength >= 10 && this.passwordLength < 12) {
      this.tag = 'Strong'
      this.colorname = "#66CDAA";
    }
    if (this.passwordLength >= 12) {
      this.tag = 'Very Strong'
      this.colorname = "#32CD32"
    }
  }
  valueChanged(e): void {
    this.passwordLength = e.value;
    this.generateRandomChar();
  }
  removeSavedPassword(index: any) {
    if (this.showStoredPass) {
      this.previousSavedPass.splice(index, 1);
      localStorage.setItem('password', this.previousSavedPass);
    }
  }
  copyText(requiredParam?: string) {
    if (requiredParam) {
      navigator.clipboard.writeText(this.previousSavedPass[requiredParam[1]]).then(() => {
        this.showToastMessage = true;
        setTimeout(() => {
          this.showToastMessage = false;
          this.buttonText = 'Copy';
          this.isDisabled = false;
        }, 3000)
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
      return;
    }
    this.buttonText = 'Copied';
    this.isDisabled = true;
    navigator.clipboard.writeText(this.generatedPassword).then(() => {
      this.previousSavedPass.push(this.generatedPassword);
      if (this.showStoredPass) {
        localStorage.setItem('password', this.previousSavedPass);
      }
      this.showToastMessage = true;
      setTimeout(() => {
        this.showToastMessage = false;
        this.buttonText = 'Copy';
        this.isDisabled = false;
      }, 3000)
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
  decreaseLength() {
    if (this.rangeValue > this.minLengthValue && this.passwordLength > this.minLengthValue) {
      this.passwordLength--;
      this.rangeValue--;
      this.generateRandomChar();
    }
  }
  increaseLength() {
    if (this.rangeValue < this.maximumLengthValue && this.passwordLength < this.maximumLengthValue) {
      this.passwordLength++;
      this.rangeValue++;
      this.generateRandomChar();
    }
  }
}
