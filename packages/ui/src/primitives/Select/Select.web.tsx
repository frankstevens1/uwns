import * as React from "react";
import { createPortal } from "react-dom";
import { Check, Search } from "lucide-react";
import type { SelectProps, SelectOption } from "./Select.types";
import { inputTokens } from "../../theme";
import { cx } from "../../utils/cx";
import { useFocusVisible } from "../../utils/focusVisible";
import { px } from "../../utils/platform.web";

function ChevronDownIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path
        d="M5 7.5l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  search = false,
  size = "md",
  className = "",
  style,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showScrollHint, setShowScrollHint] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const [menuReady, setMenuReady] = React.useState(false);
  const [menuPlacement, setMenuPlacement] = React.useState<"top" | "bottom">(
    "bottom"
  );
  const [listMaxHeight, setListMaxHeight] = React.useState(240);
  const [menuFrame, setMenuFrame] = React.useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
  } | null>(null);
  const { isFocusVisible, onFocus, onBlur } = useFocusVisible();
  const [activeIndex, setActiveIndex] = React.useState<number>(() => {
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : 0;
  });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Map<string, HTMLButtonElement | null>>(
    new Map()
  );

  const current = options.find((o) => o.value === value);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOptions = React.useMemo(() => {
    if (!search || !normalizedQuery) return options;
    return options.filter((opt) => {
      const label = opt.label.toLowerCase();
      const optionValue = opt.value.toLowerCase();
      return label.includes(normalizedQuery) || optionValue.includes(normalizedQuery);
    });
  }, [normalizedQuery, options, search]);
  const t = inputTokens.base;
  const triggerHeight = size === "sm" ? t.height.sm : t.height.md;
  const hasOptions = filteredOptions.length > 0;
  const menuGap = 3;
  const minListHeight = 96;
  const openAbove = menuPlacement === "top";
  const hasDom = typeof document !== "undefined";
  const visualOptions = React.useMemo(() => {
    if (!openAbove) return filteredOptions;
    // For upward-opening menus, mirror order so the first options sit next to the trigger.
    return [...filteredOptions].reverse();
  }, [filteredOptions, openAbove]);

  const computeMenuMetrics = React.useCallback(
    (lockedPlacement?: "top" | "bottom") => {
      const triggerEl = triggerRef.current;
      if (!triggerEl) return null;

      const rect = triggerEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = Math.max(0, viewportHeight - rect.bottom - menuGap);
      const spaceAbove = Math.max(0, rect.top - menuGap);

      const headerReserve = search ? triggerHeight + 22 : 12;
      const defaultListCap = search
        ? Math.min(320, Math.floor(viewportHeight * 0.55))
        : Math.min(384, Math.floor(viewportHeight * 0.6));
      const placement =
        lockedPlacement ??
        (spaceBelow < defaultListCap + headerReserve && spaceAbove > spaceBelow
          ? "top"
          : "bottom");

      const availableSpace = placement === "top" ? spaceAbove : spaceBelow;
      const adaptiveListHeight = Math.min(
        defaultListCap,
        Math.max(minListHeight, availableSpace - headerReserve)
      );

      return { placement, listMax: adaptiveListHeight };
    },
    [search, triggerHeight]
  );

  const computeMenuFrame = React.useCallback(
    (placement: "top" | "bottom") => {
      const triggerEl = triggerRef.current;
      if (!triggerEl) return null;
      const rect = triggerEl.getBoundingClientRect();

      const minInset = 8;
      const maxLeft = Math.max(
        minInset,
        window.innerWidth - rect.width - minInset
      );
      const left = Math.min(Math.max(rect.left, minInset), maxLeft);

      if (placement === "bottom") {
        return {
          left,
          width: rect.width,
          top: rect.bottom + menuGap,
        };
      }

      return {
        left,
        width: rect.width,
        bottom: window.innerHeight - rect.top + menuGap,
      };
    },
    [menuGap]
  );

  const closeMenu = React.useCallback(() => {
    setOpen(false);
    setMenuReady(false);
    setMenuFrame(null);
  }, []);

  const openMenu = React.useCallback(() => {
    const metrics = computeMenuMetrics();
    if (metrics) {
      setMenuPlacement(metrics.placement);
      setListMaxHeight(metrics.listMax);
      setMenuFrame(computeMenuFrame(metrics.placement));
    }
    setMenuReady(false);
    setOpen(true);
  }, [computeMenuFrame, computeMenuMetrics]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      closeMenu();
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [closeMenu, open]);

  React.useEffect(() => {
    if (!open) return;
    const selectedIdx = filteredOptions.findIndex((o) => o.value === value);
    if (selectedIdx >= 0) {
      setActiveIndex(selectedIdx);
      return;
    }
    setActiveIndex((idx) => {
      if (filteredOptions.length === 0) return -1;
      if (idx < 0 || idx >= filteredOptions.length) return 0;
      return idx;
    });
  }, [filteredOptions, open, value]);

  React.useEffect(() => {
    if (open || !searchQuery) return;
    setSearchQuery("");
  }, [open, searchQuery]);

  React.useEffect(() => {
    if (!open || !search) return;
    // Keep focus behavior consistent for both above/below placements.
    searchInputRef.current?.focus();
  }, [open, search]);

  React.useLayoutEffect(() => {
    if (!open) return;
    const metrics = computeMenuMetrics(menuPlacement);
    if (metrics) {
      setListMaxHeight(metrics.listMax);
      setMenuFrame(computeMenuFrame(metrics.placement));
    }
    setMenuReady(true);
  }, [computeMenuFrame, computeMenuMetrics, menuPlacement, open]);

  React.useEffect(() => {
    if (!open) return;
    const SCROLL_CLOSE_FROM_START = 24;
    const SCROLL_CLOSE_STEP = 12;
    const WHEEL_CLOSE_ACCUM = 42;
    const WHEEL_NOISE_FLOOR = 3;
    const WHEEL_RESET_MS = 140;

    let startX = window.scrollX;
    let startY = window.scrollY;
    let lastX = startX;
    let lastY = startY;
    let wheelAccum = 0;
    let wheelResetTimer: number | null = null;

    const clearWheelResetTimer = () => {
      if (wheelResetTimer !== null) {
        window.clearTimeout(wheelResetTimer);
        wheelResetTimer = null;
      }
    };

    const isFromInsideMenu = (target: EventTarget | null) => {
      if (!(target instanceof Node)) return false;
      return Boolean(
        containerRef.current?.contains(target) || menuRef.current?.contains(target)
      );
    };

    const onScroll = (event: Event) => {
      if (isFromInsideMenu(event.target)) return;
      const nextX = window.scrollX;
      const nextY = window.scrollY;
      const fromStart = Math.abs(nextX - startX) + Math.abs(nextY - startY);
      const step = Math.abs(nextX - lastX) + Math.abs(nextY - lastY);
      lastX = nextX;
      lastY = nextY;

      if (fromStart >= SCROLL_CLOSE_FROM_START || step >= SCROLL_CLOSE_STEP) {
        closeMenu();
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (isFromInsideMenu(event.target)) return;
      const delta = Math.abs(event.deltaX) + Math.abs(event.deltaY);
      if (delta <= WHEEL_NOISE_FLOOR) return;

      wheelAccum += delta;
      clearWheelResetTimer();
      wheelResetTimer = window.setTimeout(() => {
        wheelAccum = 0;
        wheelResetTimer = null;
      }, WHEEL_RESET_MS);

      if (wheelAccum >= WHEEL_CLOSE_ACCUM) {
        closeMenu();
      }
    };

    const onResize = () => closeMenu();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("wheel", onWheel, { capture: true, passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      clearWheelResetTimer();
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("resize", onResize);
    };
  }, [closeMenu, open]);

  React.useEffect(() => {
    const keyframesId = "ui-select-scroll-hint-keyframes";
    if (typeof document === "undefined") return;
    if (document.getElementById(keyframesId)) return;
    const styleTag = document.createElement("style");
    styleTag.id = keyframesId;
    styleTag.textContent = `
      @keyframes ui-select-scroll-hint-bounce {
        0% { transform: translateY(0); opacity: 0.2; }
        30% { transform: translateY(2px); opacity: 0.72; }
        100% { transform: translateY(0); opacity: 0; }
      }
    `;
    document.head.appendChild(styleTag);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(query.matches);
    syncPreference();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", syncPreference);
      return () => query.removeEventListener("change", syncPreference);
    }
    query.addListener(syncPreference);
    return () => query.removeListener(syncPreference);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setShowScrollHint(false);
      return;
    }

    let timeoutId: number | null = null;
    const rafId = window.requestAnimationFrame(() => {
      const list = listRef.current;
      if (!list) return;
      const isScrollable = list.scrollHeight > list.clientHeight + 1;
      if (!isScrollable) {
        setShowScrollHint(false);
        return;
      }
      setShowScrollHint(true);
      timeoutId = window.setTimeout(() => {
        setShowScrollHint(false);
      }, 1600);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [open, visualOptions.length]);

  React.useEffect(() => {
    if (!open) return;
    const opt = filteredOptions[activeIndex];
    if (!opt) return;
    const el = itemRefs.current.get(opt.value);
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, filteredOptions]);

  const pick = (opt: SelectOption) => {
    onChange(opt.value);
    closeMenu();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "Escape") {
      if (search && searchQuery) {
        setSearchQuery("");
      } else {
        closeMenu();
      }
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        const opt = filteredOptions[activeIndex];
        if (opt) pick(opt);
      } else {
        openMenu();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) openMenu();
      if (!hasOptions) return;
      setActiveIndex((idx) => Math.min(idx + 1, filteredOptions.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) openMenu();
      if (!hasOptions) return;
      setActiveIndex((idx) => Math.max(idx - 1, 0));
    }
  };

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (searchQuery) {
        setSearchQuery("");
      } else {
        closeMenu();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!hasOptions) return;
      setActiveIndex((idx) => Math.min(idx + 1, filteredOptions.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!hasOptions) return;
      setActiveIndex((idx) => Math.max(idx - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      const opt = filteredOptions[activeIndex];
      if (opt) {
        event.preventDefault();
        pick(opt);
      }
    }
  };

  const searchNode = search ? (
    <div
      className={cx(
        "z-10 bg-(--ui-bg)",
        openAbove ? "sticky bottom-0 border-t" : "sticky top-0 border-b"
      )}
      style={{
        borderColor: "var(--ui-border)",
        padding: px(6),
      }}
    >
      <div
        className="flex items-center gap-1.5 border bg-(--ui-bg) text-(--ui-fg)"
        style={{
          borderColor: "var(--ui-border)",
          borderRadius: px(t.radius),
          paddingLeft: px(8),
          paddingRight: px(8),
          height: px(triggerHeight),
        }}
      >
        <Search
          size={14}
          className="shrink-0 text-(--ui-muted-fg)"
          aria-hidden="true"
        />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={onSearchKeyDown}
          placeholder="Search"
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-(--ui-muted-fg)"
          style={{ color: "var(--ui-fg)", fontSize: px(t.fontSize) }}
        />
      </div>
    </div>
  ) : null;

  const menuNode =
    open && menuFrame ? (
      <div
        ref={menuRef}
        role="listbox"
        className="fixed overflow-hidden border bg-(--ui-bg) text-(--ui-fg) shadow-sm pointer-events-auto"
        style={{
          zIndex: 70,
          left: menuFrame.left,
          width: menuFrame.width,
          top: menuPlacement === "bottom" ? menuFrame.top : undefined,
          bottom: menuPlacement === "top" ? menuFrame.bottom : undefined,
          borderColor: "var(--ui-border)",
          borderRadius: px(t.radius),
          visibility: menuReady ? "visible" : "hidden",
        }}
      >
        {openAbove ? null : searchNode}
        <div
          ref={listRef}
          className="no-scrollbar"
          style={{
            maxHeight: px(listMaxHeight),
            overflowY: "auto",
          }}
        >
          {hasOptions ? (
            visualOptions.map((opt, index) => {
              const selected = opt.value === value;
              const logicalIndex = openAbove
                ? filteredOptions.length - 1 - index
                : index;
              const active = logicalIndex === activeIndex;
              return (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  type="button"
                  onClick={() => pick(opt)}
                  onMouseEnter={() => setActiveIndex(logicalIndex)}
                  title={opt.label}
                  ref={(node) => {
                    itemRefs.current.set(opt.value, node);
                  }}
                  className={cx(
                    "flex w-full min-w-0 items-center gap-1.5 text-left",
                    active ? "bg-(--ui-subtle-bg)" : "",
                    selected ? "font-semibold" : ""
                  )}
                  style={{
                    paddingLeft: px(t.paddingX),
                    paddingRight: px(t.paddingX),
                    paddingTop: px(7),
                    paddingBottom: px(7),
                    fontSize: px(t.fontSize),
                  }}
                >
                  <span className="flex w-4 shrink-0 justify-center">
                    {selected ? (
                      <Check
                        size={14}
                        strokeWidth={2.2}
                        aria-hidden="true"
                        className="text-(--ui-fg)"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                </button>
              );
            })
          ) : (
            <div
              className="text-(--ui-muted-fg)"
              style={{
                paddingLeft: px(t.paddingX),
                paddingRight: px(t.paddingX),
                paddingTop: px(8),
                paddingBottom: px(8),
                fontSize: px(t.fontSize),
              }}
            >
              No results
            </div>
          )}
        </div>
        {openAbove ? searchNode : null}
        {showScrollHint ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 z-20 flex items-center justify-center border"
            style={{
              bottom: openAbove && search ? px(triggerHeight + 14) : px(8),
              width: px(18),
              height: px(18),
              borderRadius: 999,
              borderColor: "var(--ui-border)",
              backgroundColor: "var(--ui-bg)",
              transform: "translateX(-50%)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                transform: "translateY(0)",
                opacity: prefersReducedMotion ? 0.72 : 0.2,
                animation: prefersReducedMotion
                  ? undefined
                  : "ui-select-scroll-hint-bounce 620ms ease-out 2",
              }}
            >
              <ChevronDownIcon
                style={{
                  width: px(12),
                  height: px(12),
                  color: "var(--ui-muted-fg)",
                }}
              />
            </span>
          </div>
        ) : null}
      </div>
    ) : null;

  return (
    <div
      ref={containerRef}
      className={cx("relative w-full min-w-0", className)}
      style={style}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cx(
          "flex w-full min-w-0 items-center border outline-none",
          "bg-(--ui-bg) text-(--ui-fg) border-(--ui-border)",
          disabled ? "opacity-70" : ""
        )}
        style={{
          height: px(triggerHeight),
          borderRadius: px(t.radius),
          borderWidth: px(t.borderWidth),
          paddingLeft: px(t.paddingX),
          paddingRight: px(32),
          fontSize: px(t.fontSize),
          boxShadow: isFocusVisible
            ? "0 0 0 3px var(--ui-ring, rgba(0,0,0,0.25))"
            : undefined,
        }}
      >
        <span
          title={current?.label ?? undefined}
          className={cx(
            "min-w-0 flex-1 truncate text-left",
            current ? "text-(--ui-fg)" : "text-(--ui-muted-fg)"
          )}
        >
          {current?.label ?? placeholder}
        </span>

        <span
          className="pointer-events-none absolute flex items-center justify-center"
          style={{
            top: "50%",
            right: px(t.paddingX),
            transform: "translateY(-50%)",
            width: px(18),
            height: px(18),
            color: open ? "var(--ui-fg)" : "var(--ui-muted-fg)",
          }}
        >
          <ChevronDownIcon
            style={{
              width: px(16),
              height: px(16),
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 140ms ease",
            }}
          />
        </span>
      </button>

      {hasDom && menuNode ? createPortal(menuNode, document.body) : null}
    </div>
  );
}
