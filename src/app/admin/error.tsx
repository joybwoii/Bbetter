"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
      padding: "2rem",
      textAlign: "center"
    }}>
      <div style={{
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        color: "var(--error)",
        padding: "1rem",
        borderRadius: "50%",
        marginBottom: "1.5rem"
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
        {error.message.includes("Unauthorized") ? "Access Denied" : "Something went wrong!"}
      </h2>
      
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem", maxWidth: "400px" }}>
        {error.message.includes("Unauthorized") 
          ? "You do not have permission to view this page. Only authorized administrators can access this area." 
          : "An unexpected error occurred while loading the admin dashboard."}
      </p>
      
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          className="btn btn-outline"
          onClick={() => reset()}
        >
          Try again
        </button>
        <Link href="/" className="btn btn-primary">
          Return to Store
        </Link>
      </div>
    </div>
  );
}
