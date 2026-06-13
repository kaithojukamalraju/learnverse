"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play, RotateCcw, ChevronRight, Copy, Check } from "lucide-react";

const challenges = [
  {
    id: "reverse-array",
    label: "Reverse Array",
    code: `function reverseArray(arr) {\n  // Write your code here\n  return arr.reverse();\n}`,
    test: "reverseArray([1,2,3,4,5])",
    expected: "[5,4,3,2,1]",
  },
  {
    id: "fibonacci",
    label: "Fibonacci",
    code: `function fibonacci(n) {\n  // Return nth Fibonacci number\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}`,
    test: "fibonacci(7)",
    expected: "13",
  },
  {
    id: "binary-search",
    label: "Binary Search",
    code: `function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
    test: "binarySearch([1,3,5,7,9], 5)",
    expected: "2",
  },
];

export function CodePlayground() {
  const [activeId, setActiveId] = useState(challenges[0].id);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const active = challenges.find((c) => c.id === activeId)!;

  const runCode = () => {
    try {
      const fn = new Function(`return ${active.code.split("// Write your code here")[0].trim()}\n${active.code.split("// Write your code here")[1]?.trim() || ""}`);
      const result = fn();
      const testResult = new Function(`return (${active.test})`)();
      setOutput(`> ${active.test}\n< ${JSON.stringify(testResult)}\n\nExpected: ${active.expected}\n${JSON.stringify(testResult) === active.expected ? "✅ Pass" : "❌ Fail"}`);
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Code Playground</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copyCode}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button size="sm" onClick={runCode}>
              <Play className="w-4 h-4 mr-1" /> Run
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {challenges.map((c) => (
            <Badge key={c.id} variant={activeId === c.id ? "default" : "outline"} className="cursor-pointer" onClick={() => { setActiveId(c.id); setOutput(null); }}>
              {c.label}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg p-4 font-mono text-sm">
            <pre className="text-muted-foreground whitespace-pre-wrap">{active.code}</pre>
          </div>
          <div className="bg-card rounded-lg p-4 font-mono text-sm">
            <p className="text-xs text-muted-foreground mb-2">Output</p>
            {output ? (
              <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
            ) : (
              <span className="text-muted-foreground">Click Run to see output</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
