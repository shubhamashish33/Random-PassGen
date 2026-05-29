import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  readonly name = signal('random password generator');
  readonly generatedPassword = signal('');
  readonly passwordLength = signal(12);
  readonly buttonText = signal('Copy');
  readonly isUpperCase = signal(true);
  readonly isLowerCase = signal(true);
  readonly isNumber = signal(true);
  readonly isSpecialChar = signal(false);
  readonly isDisabled = signal(false);
  readonly tag = signal('');
  readonly colorname = signal('');
  readonly showToastMessage = signal(false);
  readonly rangeValue = signal(this.passwordLength());
  readonly timeStamp = signal('');
  readonly previousSavedPass = signal<string[]>([]);
  readonly upperCaseChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  readonly lowerCaseChar = 'abcdefghijklmnopqrstuvwxyz';
  readonly numberChar = '1234567890';
  readonly specialChar = "!@#$%^&*()_+-=[]{}|\\:;<>?/~,.'`";
  readonly minLengthValue = 4;
  readonly maximumLengthValue = 20;

  ngOnInit(): void {
    this.generateRandomChar();
  }

  generateRandomChar(): void {
    if (!(this.isUpperCase() || this.isLowerCase() || this.isNumber() || this.isSpecialChar())) {
      this.generatedPassword.set('Please select one value');
      this.isDisabled.set(true);
      this.tag.set('NA');
      this.colorname.set('#ddd');
      this.timeStamp.set('NA');
      return;
    }

    let availableChar = '';
    if (this.isUpperCase()) {
      availableChar += this.upperCaseChar;
    }
    if (this.isLowerCase()) {
      availableChar += this.lowerCaseChar;
    }
    if (this.isNumber()) {
      availableChar += this.numberChar;
    }
    if (this.isSpecialChar()) {
      availableChar += this.specialChar;
    }

    this.onGeneratePassword(availableChar);
    this.getTag();
    this.isDisabled.set(false);
  }

  onGeneratePassword(password: string): void {
    let generatedPassword = '';
    for (let i = 0; i < this.passwordLength(); i++) {
      generatedPassword += password.charAt(this.secureRandomIndex(password.length));
    }

    this.generatedPassword.set(generatedPassword);
    this.timeToBreakPassword(generatedPassword);
  }

  secureRandomIndex(max: number): number {
    const randomValues = new Uint32Array(1);
    const maxValid = Math.floor(0xffffffff / max) * max;
    let value: number;
    do {
      crypto.getRandomValues(randomValues);
      value = randomValues[0]
    } while (value >= maxValid);
    return value % max;
  }

  timeToBreakPassword(password: string, attemptsPerSecond: number = 1e9): void {
    let charset = '';
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
    this.timeStamp.set(`${years} years, ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
  }

  getTag(): void {
    const passwordLength = this.passwordLength();

    if (passwordLength >= this.minLengthValue && passwordLength <= 5) {
      this.tag.set('Very Weak');
      this.colorname.set('#FFDAB9');
    }
    if (passwordLength > 5 && passwordLength < 8) {
      this.tag.set('Weak');
      this.colorname.set('#FFA07A');
    }
    if (passwordLength >= 8 && passwordLength < 10) {
      this.tag.set('Good');
      this.colorname.set('#FFD700');
    }
    if (passwordLength >= 10 && passwordLength < 12) {
      this.tag.set('Strong');
      this.colorname.set('#66CDAA');
    }
    if (passwordLength >= 12) {
      this.tag.set('Very Strong');
      this.colorname.set('#32CD32');
    }
  }

  valueChanged(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.passwordLength.set(value);
    this.rangeValue.set(value);
    this.generateRandomChar();
  }

  updateOption(option: 'number' | 'uppercase' | 'lowercase' | 'special', event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (option === 'number') {
      this.isNumber.set(checked);
    }
    if (option === 'uppercase') {
      this.isUpperCase.set(checked);
    }
    if (option === 'lowercase') {
      this.isLowerCase.set(checked);
    }
    if (option === 'special') {
      this.isSpecialChar.set(checked);
    }

    this.generateRandomChar();
  }

  copyText(requiredParam?: ['savedPassword', number]): void {
    if (requiredParam) {
      navigator.clipboard.writeText(this.previousSavedPass()[requiredParam[1]]).then(() => {
        this.showToast();
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
      return;
    }

    this.buttonText.set('Copied');
    this.isDisabled.set(true);
    navigator.clipboard.writeText(this.generatedPassword()).then(() => {
      this.previousSavedPass.update(passwords => [...passwords, this.generatedPassword()]);
      this.showToast();
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

  decreaseLength(): void {
    if (this.rangeValue() > this.minLengthValue && this.passwordLength() > this.minLengthValue) {
      this.passwordLength.update(length => length - 1);
      this.rangeValue.update(length => length - 1);
      this.generateRandomChar();
    }
  }

  increaseLength(): void {
    if (this.rangeValue() < this.maximumLengthValue && this.passwordLength() < this.maximumLengthValue) {
      this.passwordLength.update(length => length + 1);
      this.rangeValue.update(length => length + 1);
      this.generateRandomChar();
    }
  }

  private showToast(): void {
    this.showToastMessage.set(true);
    setTimeout(() => {
      this.showToastMessage.set(false);
      this.buttonText.set('Copy');
      this.isDisabled.set(false);
    }, 3000);
  }
}
