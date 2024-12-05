"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const MatchingPage=()=> {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    // Simulate finding a match after 10 seconds
    const matchTimer = setTimeout(() => {
      router.push("/call");
    }, 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(matchTimer);
    };
  }, [router]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center">
          Searching for a match...
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p>Looking for a match...</p>
        <p className="text-muted-foreground">
          Time elapsed: {timeElapsed} seconds
        </p>
        <Button variant="destructive" onClick={() => router.push("/")}>
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
export default MatchingPage;