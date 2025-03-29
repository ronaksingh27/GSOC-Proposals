import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import axios from "axios";

export function LoginForm({
  
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleRequestMagicLink = async () => {
    try {
      const response = await axios.post("https://short-it.litrunner55.workers.dev/auth/request", { email });
      console.log(response);
      setMessage("Magic link sent! Check your email.");
    } catch (error) {
      setMessage("Error requesting magic link.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-bold">Please enter you email</h1>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button  className="w-full px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
  onClick={(e) =>{
    e.preventDefault();
    handleRequestMagicLink();
  }} >
              Send Magic Link
            </button>
            { message && (
        <p className="text-lg font-semibold text-green-600 bg-green-100 px-4 py-2 rounded-lg border border-green-400 shadow-md">
          {message}
        </p>
      )}
          </div>
        </div>
      </form>
    </div>
  )
}
