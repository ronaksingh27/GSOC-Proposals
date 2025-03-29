import { GalleryVerticalEnd } from "lucide-react"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Shorten({
  
  className,
  ...props
}: React.ComponentProps<"div">) {

    const [url, setUrl] = useState("");
    const [shortUrl, setShortUrl] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
  
    useEffect(() => {
      // Check if the user is authenticated
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login"); // Redirect to login if no token
      }
    }, [navigate]);
  
    const handleShorten = async () => {
      setError(null);
      setShortUrl(null);
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/");
        return;
      }
  
      try {
        console.log("request sent");
        const response = await fetch("https://short-it.litrunner55.workers.dev/shorten", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url, expiresIn: 3600 }),
        });

        console.log(response);
  
        const data = await response.json();
  
        if (response.ok) {
          setShortUrl(data.shortUrl);
        } else {
          setError(data.error || "Failed to shorten URL");
          if (response.status === 401) {
            localStorage.removeItem("authToken"); // Clear invalid token
            navigate("/"); // Redirect to login
          }
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong!");
      }
    };
  
    const copyToClipboard = () => {
      navigator.clipboard.writeText(shortUrl);
    };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-bold">URL Shortner</h1>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">URL</Label>
              <input
                type="text"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button  className="w-full px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
  onClick={(e) => {
    e.preventDefault();  // Prevents the form from submitting
    handleShorten();
  }} >
              Enter
            </button>
            { shortUrl && (
        <div className="flex items-center space-x-4">
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-green-600 bg-green-100 px-4 py-2 rounded-lg border border-green-400 shadow-md cursor-pointer hover:bg-green-200"
        >
          {shortUrl}
        </a>
        <button
          onClick={ (e) =>{e.preventDefault();
            copyToClipboard()}}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default Shorten;