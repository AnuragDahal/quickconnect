"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gender } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
const HomePage = () => {
  const [userGender, setUserGender] = useState<Gender>("male");
  const [preferredGender, setPreferredGender] = useState<Gender>("female");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/matching");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Video Call Platform
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userGender">Your Gender</Label>
            <Select
              onValueChange={(value) => setUserGender(value as Gender)}
              defaultValue={userGender}
            >
              <SelectTrigger id="userGender">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredGender">Preferred Match Gender</Label>
            <Select
              onValueChange={(value) => setPreferredGender(value as Gender)}
              defaultValue={preferredGender}
            >
              <SelectTrigger id="preferredGender">
                <SelectValue placeholder="Select preferred gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="any">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Start Call
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
export default HomePage;
