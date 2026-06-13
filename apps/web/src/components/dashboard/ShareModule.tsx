"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Share2, Copy, Check, Twitter, Linkedin, Mail } from "lucide-react";
import { toast } from "sonner";

interface ShareModuleProps {
  title: string;
  slug: string;
}

export function ShareModule({ title, slug }: ShareModuleProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/modules/${slug}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm"><Share2 className="w-4 h-4" /></Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="end">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Share {title}</p>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={copyLink}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            Copy Link
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out ${title} on LearnVerse AI!&url=${url}`, "_blank")}>
            <Twitter className="w-4 h-4 mr-2" /> Twitter
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank")}>
            <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => window.open(`mailto:?subject=${title} on LearnVerse AI&body=${url}`, "_blank")}>
            <Mail className="w-4 h-4 mr-2" /> Email
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
