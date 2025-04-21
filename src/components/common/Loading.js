import React from "react";
import clsx from "clsx";

export default function Loading(
  {
    loading = true,
    variant = "center", // center, left, inline, fullscreen
    size = "md", // sm, md, lg
    color = "primary", // primary, secondary, danger
    children,
  }) {
  if (!loading) return <>{children}</>;

  const sizeMap = {
    sm: "spinner-border-sm",
    md: "",
    lg: "spinner-border-lg",
  };

  const spinner = (
    <div
      className={clsx("spinner-border", sizeMap[size], `text-${color}`)}
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
        style={{zIndex: 1050}}
      >
        {spinner}
      </div>
    );
  }

  if (variant === "inline") {
    return <span className="align-middle">{spinner}</span>;
  }

  return (
    <div
      className={clsx("d-flex", {
        "justify-content-center": variant === "center",
        "justify-content-start": variant === "left",
      })}
    >
      {spinner}
    </div>
  );
}
