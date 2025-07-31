// src/components/ScrollableText.tsx
import React, { useRef, useEffect, useCallback } from "react";
import styles from "./ScrollableText.module.css";

const RESISTANCE = 50;
const STIFFNESS = 20;
const VELOCITY_THRESHOLD = 1.0;
const POSITION_THRESHOLD = 1.0;
const SELECTION_OFFSET = 100;
const MAX_VELOCITY = 100;

interface ScrollableTextProps {
  children: React.ReactNode;
  selectionPos?: number;
  enableUserScrolling?: boolean;
  magnetizeInstanteniouslyTo?: HTMLElement;
}

function ScrollableText({
  children,
  selectionPos,
  enableUserScrolling = true,
  magnetizeInstanteniouslyTo,
}: ScrollableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastTimestampRef = useRef<DOMHighResTimeStamp | null>(null);
  const currentVelocityRef = useRef<number>(0);
  const currentPositionRef = useRef<number>(0);

  const animateScroll = useCallback(
    (timestamp: DOMHighResTimeStamp) => {
      const container = containerRef.current;
      if (!container || selectionPos == null) {
        // Если что-то не то, останавливаем всё
        animationFrameId.current = null;
        lastTimestampRef.current = null;
        currentVelocityRef.current = 0;
        currentPositionRef.current = 0;
        return;
      }

      if (lastTimestampRef.current === null) {
        // Инициализация метки времени для первого кадра
        currentPositionRef.current = container.scrollTop;
        lastTimestampRef.current = timestamp;
        animationFrameId.current = requestAnimationFrame(animateScroll);
        return;
      }

      // Вычисляем точные значения переменных
      const deltaTime = (timestamp - lastTimestampRef.current) / 1000; // Вычисляем deltaTime (время с последнего кадра) в секундах
      lastTimestampRef.current = timestamp;

      const displacement =
        selectionPos -
        container.clientHeight / 2 +
        SELECTION_OFFSET -
        currentPositionRef.current;

      // Вычисляем ускорение физически:
      // F = k * x - b * v
      // a = F / m
      const acceleration =
        (STIFFNESS * displacement - RESISTANCE * currentVelocityRef.current) /
        1; // масса равна единице, всё всё ещё можно контролировать при помощи остальных констант
      // Обновляем скорость и позицию
      currentVelocityRef.current +=
        Math.sign(acceleration * deltaTime) *
        Math.min(Math.abs(acceleration * deltaTime), MAX_VELOCITY);
      currentPositionRef.current += currentVelocityRef.current * deltaTime;
      container.scrollTop = currentPositionRef.current;

      if (
        Math.abs(displacement) < POSITION_THRESHOLD &&
        Math.abs(currentVelocityRef.current) < VELOCITY_THRESHOLD
      ) {
        // Условие остановки: если очень близко к цели И скорость очень низкая
        container.scrollTop =
          selectionPos - container.clientHeight / 2 + SELECTION_OFFSET;
        animationFrameId.current = null;
        lastTimestampRef.current = null;
        currentVelocityRef.current = 0;
      } else {
        // Иначе просто продолжаем анимацию
        animationFrameId.current = requestAnimationFrame(animateScroll);
      }
    },

    [selectionPos]
  );

  useEffect(() => {
    if (selectionPos != null) {
      // Запускаем анимацию, если есть целевая позиция
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (lastTimestampRef.current !== null) lastTimestampRef.current = null;
      if (containerRef.current)
        currentPositionRef.current = containerRef.current.scrollTop;
      animationFrameId.current = requestAnimationFrame(animateScroll);
    } else {
      // Останавливаем анимацию
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
        lastTimestampRef.current = null;
        currentVelocityRef.current = 0;
      }
    }
  }, [selectionPos, animateScroll]); // Зависимости: selectionPos и мемоизированная animateScroll

  useEffect(() => {
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
        lastTimestampRef.current = null;
        currentVelocityRef.current = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (magnetizeInstanteniouslyTo) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      magnetizeInstanteniouslyTo.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [magnetizeInstanteniouslyTo]);

  // Управление пользовательской прокруткой: определяем классы CSS для контейнера
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
