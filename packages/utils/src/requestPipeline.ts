export interface RequestContext {
  signal: AbortSignal;
  attempt: number;
}

export interface RetryOptions {
  retries?: number;
  delayMs?: number | ((attempt: number, error: unknown) => number);
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

export interface CreateRequestPipelineOptions<TParams, TRawResult, TResult = TRawResult> {
  beforeQuery?: (params: TParams) => Promise<TParams> | TParams;
  query: (params: TParams, context: RequestContext) => Promise<TRawResult>;
  transform?: (rawResult: TRawResult, params: TParams) => Promise<TResult> | TResult;
  afterQuery?: (result: TResult, params: TParams) => Promise<void> | void;
  retry?: RetryOptions;
  cancelPrevious?: boolean;
}

export interface RequestExecution<TResult> {
  promise: Promise<TResult>;
  signal: AbortSignal;
  abort: () => void;
}

export interface RequestPipeline<TParams, TResult> {
  execute: (params: TParams) => RequestExecution<TResult>;
  abortActive: () => void;
}

const clampRetries = (retries?: number): number => {
  if (!Number.isFinite(retries)) {
    return 0;
  }
  return Math.max(0, Math.trunc(Number(retries)));
};

const resolveDelay = (delayMs: RetryOptions['delayMs'], attempt: number, error: unknown): number => {
  if (typeof delayMs === 'function') {
    return Math.max(0, Math.trunc(delayMs(attempt, error)));
  }
  if (Number.isFinite(delayMs)) {
    return Math.max(0, Math.trunc(Number(delayMs)));
  }
  return 0;
};

export const isAbortError = (error: unknown): boolean => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }
  return Boolean(
    error &&
      typeof error === 'object' &&
      'name' in error &&
      (error as { name?: string }).name === 'AbortError'
  );
};

const waitForRetry = (delayMs: number, signal: AbortSignal): Promise<void> => {
  if (delayMs <= 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('The operation was aborted.', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, delayMs);

    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      reject(new DOMException('The operation was aborted.', 'AbortError'));
    };

    signal.addEventListener('abort', onAbort, { once: true });
  });
};

export const createRequestPipeline = <TParams, TRawResult, TResult = TRawResult>(
  options: CreateRequestPipelineOptions<TParams, TRawResult, TResult>
): RequestPipeline<TParams, TResult> => {
  const retries = clampRetries(options.retry?.retries);
  const cancelPrevious = options.cancelPrevious ?? true;
  let activeController: AbortController | null = null;

  const abortActive = (): void => {
    if (activeController) {
      activeController.abort();
      activeController = null;
    }
  };

  const execute = (initialParams: TParams): RequestExecution<TResult> => {
    if (cancelPrevious) {
      abortActive();
    }

    const controller = new AbortController();
    activeController = controller;

    const promise = (async () => {
      const params = options.beforeQuery ? await options.beforeQuery(initialParams) : initialParams;
      let attempt = 0;

      while (true) {
        attempt += 1;

        try {
          const rawResult = await options.query(params, {
            signal: controller.signal,
            attempt
          });
          const transformedResult = options.transform
            ? await options.transform(rawResult, params)
            : (rawResult as unknown as TResult);

          if (options.afterQuery) {
            await options.afterQuery(transformedResult, params);
          }

          return transformedResult;
        } catch (error) {
          if (controller.signal.aborted || isAbortError(error)) {
            throw error;
          }

          const shouldRetry = options.retry?.shouldRetry ? options.retry.shouldRetry(error, attempt) : true;
          const canRetry = shouldRetry && attempt <= retries;

          if (!canRetry) {
            throw error;
          }

          const delay = resolveDelay(options.retry?.delayMs, attempt, error);
          await waitForRetry(delay, controller.signal);
        }
      }
    })().finally(() => {
      if (activeController === controller) {
        activeController = null;
      }
    });

    return {
      promise,
      signal: controller.signal,
      abort: () => controller.abort()
    };
  };

  return {
    execute,
    abortActive
  };
};
