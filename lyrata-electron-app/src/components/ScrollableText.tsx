// src/components/ScrollableText.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import styles from "./ScrollableText.module.css"; // Импортируем CSS-модуль

interface ScrollableTextProps {
  children: React.ReactNode; // Содержимое, которое будет скроллиться
  programmaticScrollTo?: number; // Опциональная позиция для программной прокрутки (например, 0, 100, 500)
  enableUserScrolling: boolean; // Пропс для включения/выключения пользовательской прокрутки
}

function ScrollableText({
  children,
  programmaticScrollTo,
  enableUserScrolling,
}: ScrollableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // --- 1. Программная прокрутка ---
  useEffect(() => {
    if (containerRef.current && typeof programmaticScrollTo === "number") {
      // Используем behavior: 'smooth' для плавной прокрутки, если нужно
      containerRef.current.scrollTo({
        top: programmaticScrollTo,
        behavior: "smooth",
      });
      // Или просто: containerRef.current.scrollTop = programmaticScrollTo; для мгновенной прокрутки
    }
  }, [programmaticScrollTo]); // Эффект срабатывает при изменении programmaticScrollTo

  // --- 2. Управление пользовательской прокруткой ---
  // Определяем классы CSS для контейнера
  const containerClasses = [
    styles.scrollableContainer, // Базовые стили и скрытие скроллбара
    enableUserScrolling ? styles.userScrollEnabled : styles.userScrollDisabled,
  ].join(" ");

  return (
    <div ref={containerRef} className={containerClasses}>
      {children}
    </div>
  );
}

export default ScrollableText;
