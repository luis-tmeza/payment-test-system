import { NotFoundError } from './not-found.error';
import { ValidationError } from './validation.error';

describe('domain errors', () => {
  it('sets NotFoundError name and message', () => {
    const error = new NotFoundError('missing');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('NotFoundError');
    expect(error.message).toBe('missing');
  });

  it('sets ValidationError name and message', () => {
    const error = new ValidationError('invalid');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('invalid');
  });
});
