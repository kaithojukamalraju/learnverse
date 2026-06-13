"use client";

import { CertificatePage } from "@/components/certificate/CertificatePage";

export default function Certificate() {
  return (
    <div className="max-w-4xl mx-auto">
      <CertificatePage
        userName="Alex Johnson"
        moduleName="Cell Explorer - Biology Fundamentals"
        completedAt="June 12, 2026"
        score={92}
      />
    </div>
  );
}
