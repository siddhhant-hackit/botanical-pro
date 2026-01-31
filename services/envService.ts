
import { LocationData, ConnectivityMode } from "../types";

export const getEnvironmentMode = (): ConnectivityMode => {
  const host = window.location.hostname;
  if (host.includes('localhost') || host.includes('127.0.0.1')) return 'LOCAL';
  if (host.includes('web-container') || host.includes('stackblitz')) return 'STANDALONE';
  if (window.matchMedia('(display-mode: standalone)').matches) return 'APP';
  return 'ONLINE';
};

// Adding EXCHANGE_RATES for multi-currency simulation in NetworkDashboard
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.5,
  SAR: 3.75,
  EUR: 0.92,
  GBP: 0.79
};

// Adding getEnvironmentContext to provide unified mode and location data
export const getEnvironmentContext = async () => {
  const mode = getEnvironmentMode();
  const location = await fetchMarketContext();
  return {
    mode,
    location,
    currencyCode: location.currency,
    hardwareNodes: 8
  };
};

export const fetchMarketContext = async (searchCity?: string): Promise<LocationData> => {
  // Defaulting to India/INR as requested core
  let loc: LocationData = {
    city: 'Mumbai',
    country: 'India',
    currency: 'INR',
    symbol: '₹',
    rate: 83.5
  };

  if (searchCity) {
    const s = searchCity.toLowerCase();
    if (s.includes('london') || s.includes('europe')) {
      loc = { city: 'London', country: 'UK', currency: 'GBP', symbol: '£', rate: 105.2 };
    } else if (s.includes('riyadh') || s.includes('saudi')) {
      loc = { city: 'Riyadh', country: 'Saudi Arabia', currency: 'SAR', symbol: 'SR', rate: 22.3 };
    } else if (s.includes('usa') || s.includes('new york')) {
      loc = { city: 'New York', country: 'USA', currency: 'USD', symbol: '$', rate: 1.0 };
    }
  }

  return loc;
};
