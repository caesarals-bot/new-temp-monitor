import '@testing-library/jest-dom';

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = function hasPointerCapture(): boolean {
    return false;
  };
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = function releasePointerCapture(): void {
    /* noop */
  };
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView(): void {
    /* noop */
  };
}

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
