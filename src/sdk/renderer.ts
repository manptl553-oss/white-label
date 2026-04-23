/**
 * ChainItAuth SDK — DOM Renderer
 * Manages ReactDOM roots for all active SDK mounts.
 * @internal
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SDKAppShell } from "./SDKAppShell";
import { core } from "./core";
import { logger } from "../core/logger";
import type { RenderOptions } from "./types";

/** Tracks every active ReactDOM root by its host container element. */
const _mounts = new Map<HTMLElement, Root>();

/**
 * Tracks containers that were auto-created by the SDK (not provided by the
 * consumer). Only these are removed from the DOM on destroy().
 */
const _ownedContainers = new Set<HTMLElement>();

/** Default container id used when the consumer doesn't provide one. */
const DEFAULT_CONTAINER_ID = "chainit-root";

/**
 * Resolve a CSS selector or HTMLElement to a real HTMLElement.
 * @throws If the selector doesn't match any element, or the resolved element
 *         is not an HTMLElement (e.g. SVGElement).
 */
function resolveContainer(container: string | HTMLElement): HTMLElement {
  if (typeof container === "string") {
    const el = document.querySelector(container);
    if (!el) {
      throw new Error(
        `[ChainItAuth] render() — container not found: "${container}". ` +
          `Make sure the element exists in the DOM before calling render().`,
      );
    }
    if (!(el instanceof HTMLElement)) {
      throw new Error(
        `[ChainItAuth] render() — container "${container}" resolved to a non-HTMLElement node. ` +
          `Provide a selector that targets an HTML element (div, section, etc.).`,
      );
    }
    return el;
  }
  if (!(container instanceof HTMLElement)) {
    throw new Error(
      "[ChainItAuth] render() — container must be an HTMLElement or a CSS selector string.",
    );
  }
  return container;
}

/**
 * Get or create the default `#chainit-root` container.
 * Appends to `<body>` if it doesn't already exist, and marks it as
 * SDK-owned so destroy() can remove it from the DOM.
 */
function getOrCreateDefaultContainer(): HTMLElement {
  let el = document.getElementById(DEFAULT_CONTAINER_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = DEFAULT_CONTAINER_ID;
    document.body.appendChild(el);
    _ownedContainers.add(el);
  }
  return el;
}

/**
 * Check if a value is a plain RenderOptions object, not a string or Element.
 * Both RenderOptions and Element are `typeof "object"` at runtime — `instanceof HTMLElement`
 * is the only reliable way to tell them apart.
 */
function isRenderOptions(value: unknown): value is RenderOptions {
  return (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof HTMLElement)
  );
}

/**
 * Resolve the overloaded render() arguments into a concrete element + options pair.
 *
 * Supports all four call signatures:
 *   render()                          → auto-container, no options
 *   render({ screen })                → auto-container, with options
 *   render('#selector' | domElement)  → explicit container, no options
 *   render('#selector' | domElement, { screen }) → explicit container + options
 */
function parseRenderArgs(
  containerOrOptions?: string | HTMLElement | RenderOptions,
  maybeOptions?: RenderOptions,
): { el: HTMLElement; options: RenderOptions | undefined } {
  if (containerOrOptions === undefined) {
    return { el: getOrCreateDefaultContainer(), options: undefined };
  }
  if (isRenderOptions(containerOrOptions)) {
    return { el: getOrCreateDefaultContainer(), options: containerOrOptions };
  }
  return { el: resolveContainer(containerOrOptions), options: maybeOptions };
}

export const renderer = {
  /**
   * Mount the onboarding widget.
   *
   * @overload render() — auto-creates `#chainit-root`, no options.
   * @overload render(options) — auto-creates container, applies options.
   * @overload render(container) — renders into given container.
   * @overload render(container, options) — renders into container with options.
   */
  render(
    containerOrOptions?: string | HTMLElement | RenderOptions,
    maybeOptions?: RenderOptions,
  ): void {
    const { el, options } = parseRenderArgs(containerOrOptions, maybeOptions);
    const sdkOptions = core.getOptions();

    if (_mounts.has(el)) {
      logger.warn(
        "[ChainItAuth] render() called on an already-mounted container. " +
          "Call destroy() first if you want to re-render.",
      );
      return;
    }

    const root = createRoot(el);
    root.render(
      createElement(SDKAppShell, {
        options: sdkOptions,
        initialScreen: options?.screen,
      }),
    );
    _mounts.set(el, root);
  },

  /**
   * Unmount the widget and, for auto-created containers, remove the element
   * from the DOM entirely.
   *
   * @param container - Specific container to unmount. If omitted, unmounts ALL.
   */
  destroy(container?: string | HTMLElement): void {
    if (container === undefined) {
      _mounts.forEach((root, el) => {
        root.unmount();
        if (_ownedContainers.has(el)) {
          el.remove();
          _ownedContainers.delete(el);
        }
      });
      _mounts.clear();
      return;
    }

    const el = resolveContainer(container);
    const root = _mounts.get(el);
    if (root) {
      root.unmount();
      _mounts.delete(el);
      if (_ownedContainers.has(el)) {
        el.remove();
        _ownedContainers.delete(el);
      }
    }
  },

  /** @internal — for testing */
  _getMountCount(): number {
    return _mounts.size;
  },
};
