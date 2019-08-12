import { observable } from 'mobx';

import axios from 'axios';

export class LoggingService {
  constructor() {
    (window as any).test = () => this.test();
  }

  test = async () => {
    (<HTMLTextAreaElement>document.getElementById('logging-data')).value =
      'testing';
    var form = <HTMLFormElement>document.getElementById('logging-form');
    form.submit();
  };
}

export default new LoggingService();
