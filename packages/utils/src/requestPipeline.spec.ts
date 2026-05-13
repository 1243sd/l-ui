import { describe, expect, it } from 'vitest';
import { createRequestPipeline, isAbortError } from './requestPipeline';

describe('request pipeline', () => {
  it('runs lifecycle hooks in order', async () => {
    const sequence: string[] = [];
    const pipeline = createRequestPipeline({
      beforeQuery: async (params: { keyword: string }) => {
        sequence.push('beforeQuery');
        return { keyword: params.keyword.trim() };
      },
      query: async (params: { keyword: string }) => {
        sequence.push(`query:${params.keyword}`);
        return { list: [params.keyword] };
      },
      transform: async (result: { list: string[] }) => {
        sequence.push('transform');
        return result.list.join(',');
      },
      afterQuery: async (result: string) => {
        sequence.push(`afterQuery:${result}`);
      }
    });

    const execution = pipeline.execute({ keyword: '  cute  ' });
    await expect(execution.promise).resolves.toBe('cute');
    expect(sequence).toEqual(['beforeQuery', 'query:cute', 'transform', 'afterQuery:cute']);
  });

  it('retries failed requests and eventually resolves', async () => {
    let attempts = 0;
    const pipeline = createRequestPipeline({
      retry: { retries: 2 },
      query: async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error('temporary');
        }
        return 'ok';
      }
    });

    const execution = pipeline.execute(undefined);
    await expect(execution.promise).resolves.toBe('ok');
    expect(attempts).toBe(3);
  });

  it('aborts active request', async () => {
    const pipeline = createRequestPipeline({
      query: async (_params, context) => {
        return new Promise<string>((resolve, reject) => {
          const timer = setTimeout(() => resolve('late'), 100);
          context.signal.addEventListener(
            'abort',
            () => {
              clearTimeout(timer);
              reject(new DOMException('The operation was aborted.', 'AbortError'));
            },
            { once: true }
          );
        });
      }
    });

    const execution = pipeline.execute(undefined);
    execution.abort();
    await expect(execution.promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('cancels previous request by default', async () => {
    const pipeline = createRequestPipeline({
      query: async (params: { value: string }, context) => {
        return new Promise<string>((resolve, reject) => {
          const timer = setTimeout(() => resolve(params.value), 50);
          context.signal.addEventListener(
            'abort',
            () => {
              clearTimeout(timer);
              reject(new DOMException('The operation was aborted.', 'AbortError'));
            },
            { once: true }
          );
        });
      }
    });

    const first = pipeline.execute({ value: 'first' });
    const second = pipeline.execute({ value: 'second' });

    await expect(first.promise).rejects.toSatisfy((error) => isAbortError(error));
    await expect(second.promise).resolves.toBe('second');
  });
});
