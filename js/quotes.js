const QUOTE_API_URL = "https://quoteslate.vercel.app/api/quotes/random?maxLength=140";

export async function getRandomQuote() {
  const response = await fetch(QUOTE_API_URL);

  if (!response.ok) {
    throw new Error(`Quote request failed with status ${response.status}`);
  }

  const data = await response.json();

  return {
    text: data.quote || "Keep showing up. Small progress still counts.",
    author: data.author || "Unknown"
  };
}