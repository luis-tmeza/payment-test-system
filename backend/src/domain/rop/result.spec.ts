import { andThen, andThenAsync, err, map, mapError, ok } from './result';

describe('result helpers', () => {
  it('maps ok values', () => {
    const result = map(ok(2), (value) => value + 1);
    expect(result).toEqual({ ok: true, value: 3 });
  });

  it('skips map for errors', () => {
    const result = map(err('fail'), (value: number) => value + 1);
    expect(result).toEqual({ ok: false, error: 'fail' });
  });

  it('maps error values', () => {
    const result = mapError(err('fail'), (error) => `${error}!`);
    expect(result).toEqual({ ok: false, error: 'fail!' });
  });

  it('keeps ok values for mapError', () => {
    const result = mapError(ok('value'), () => 'noop');
    expect(result).toEqual({ ok: true, value: 'value' });
  });

  it('andThen executes when ok', () => {
    const result = andThen(ok(2), (value) => ok(value * 2));
    expect(result).toEqual({ ok: true, value: 4 });
  });

  it('andThen keeps errors', () => {
    const result = andThen(err('boom'), () => ok('skip'));
    expect(result).toEqual({ ok: false, error: 'boom' });
  });

  it('andThenAsync executes when ok', async () => {
    const result = await andThenAsync(ok(2), async (value) => ok(value * 3));
    expect(result).toEqual({ ok: true, value: 6 });
  });

  it('andThenAsync keeps errors', async () => {
    const result = await andThenAsync(err('boom'), async () => ok('skip'));
    expect(result).toEqual({ ok: false, error: 'boom' });
  });
});
