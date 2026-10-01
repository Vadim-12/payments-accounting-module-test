export class PaymentAlreadyExistsError extends Error {
  constructor() {
    super('Платёж с таким внешним ID уже существует');
    this.name = 'PaymentAlreadyExistsError';
  }
}
