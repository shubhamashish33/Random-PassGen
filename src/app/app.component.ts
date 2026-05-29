import { TitleCasePipe } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TitleCasePipe
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

    this.onGeneratePassword();
    this.getTag();
    this.isDisabled.set(false);
  }

  onGeneratePassword(): void {
    const selectedGroups = this.getSelectedCharacterGroups();
    const requiredChars = selectedGroups.map(group => this.secureRandomChar(group));
    const allChars = selectedGroups.join('');
    const passwordChars = [...requiredChars];

    while (passwordChars.length < this.passwordLength()) {
      passwordChars.push(this.secureRandomChar(allChars));
    }

    const generatedPassword = this.secureShuffle(passwordChars).join('');
    this.generatedPassword.set(generatedPassword);
    this.timeToBreakPassword(generatedPassword);
  }

  private secureRandomIndex(max: number): number {
    if (max <= 0) {
      throw new Error('max must be greater than 0');
    }

    const randomValues = new Uint32Array(1);
    const maxValid = Math.floor(0xffffffff / max) * max;
    let value: number;
    do {
      crypto.getRandomValues(randomValues);
      value = randomValues[0];
    } while (value >= maxValid);
    return value % max;
  }

  private secureRandomChar(charset: string): string {
    return charset.charAt(this.secureRandomIndex(charset.length));
  }

  private secureShuffle(chars: string[]): string[] {
    for (let i = chars.length - 1; i > 0; i--) {
      const j = this.secureRandomIndex(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars;
  }

  private getSelectedCharacterGroups(): string[] {
    const selectedGroups: string[] = [];

    if (this.isUpperCase()) {
      selectedGroups.push(this.upperCaseChar);
    }
    if (this.isLowerCase()) {
      selectedGroups.push(this.lowerCaseChar);
    }
    if (this.isNumber()) {
      selectedGroups.push(this.numberChar);
    }
    if (this.isSpecialChar()) {
      selectedGroups.push(this.specialChar);
    }

    return selectedGroups;
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
    } else if (passwordLength > 5 && passwordLength < 8) {
      this.tag.set('Weak');
      this.colorname.set('#FFA07A');
    } else if (passwordLength >= 8 && passwordLength < 10) {
      this.tag.set('Good');
      this.colorname.set('#FFD700');
    } else if (passwordLength >= 10 && passwordLength < 12) {
      this.tag.set('Strong');
      this.colorname.set('#66CDAA');
    } else {
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

    switch (option) {
      case 'number':
        this.isNumber.set(checked);
        break;
      case 'uppercase':
        this.isUpperCase.set(checked);
        break;
      case 'lowercase':
        this.isLowerCase.set(checked);
        break;
      case 'special':
        this.isSpecialChar.set(checked);
        break;
    }

    this.generateRandomChar();
  }

  copyText(): void {
    this.buttonText.set('Copied');
    this.isDisabled.set(true);
    navigator.clipboard.writeText(this.generatedPassword()).then(() => {
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
