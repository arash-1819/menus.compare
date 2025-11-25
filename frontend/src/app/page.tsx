"use client";

//------------------------------ imports --------------------------------
import React, { useMemo, useState, useEffect } from "react";
import {
  Filter,
  Upload,
  Search,
  TrendingUp,
  Pin,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Header from "@/components/Header";

//------------------------------ data types --------------------------------
type Venue = {
  id: string;
  name: string;
  address: string;
};

type MenuItem = {
  id: string;
  name: string;
  venueId: string;
  venueName: string;
  category: string;
  price: number;
};

//------------------------------ functions --------------------------------
function currency(n: number) { // to convert the price to 2 decimals
  return `$${n.toFixed(2)}`;
}

function computeStats(items: MenuItem[]) {
  if (items.length === 0)
    return { min: 0, max: 0, avg: 0, median: 0 };
  const prices = items.map((i) => i.price).sort((a, b) => a - b); // sort so it's easier to calculate the stats
  const min = prices[0];
  const max = prices[prices.length - 1];
  const avg = prices.reduce((s, v) => s + v, 0) / prices.length;
  const middle_index = Math.floor(prices.length / 2); // to calculate the median
  const median =
    prices.length % 2 === 0
      ? (prices[middle_index - 1] + prices[middle_index]) / 2
      : prices[middle_index];
  return { min, max, avg, median };
}

function byCategory(items: MenuItem[]) {
  const arr: Record<string, { sum: number; count: number; prices: number[] }> = {}; // arr as array. couldnt think of another name lol
  for (const i of items) { // go through every item
    // initialize category bucket if missing
    if (!arr[i.category]) {
      arr[i.category] = { sum: 0, count: 0, prices: [] }; // if the category is not initialized in the map yet, create it
    }
    arr[i.category].sum += i.price;
    arr[i.category].count += 1;
    arr[i.category].prices.push(i.price);
  }

  return Object.entries(arr).map(([category, r]) => {
    const sorted = [r.prices].sort((a, b) => a - b);
    const middle_index = Math.floor(sorted.length / 2); // to calculate the median
    const median =
      sorted.length % 2 === 0
        ? (sorted[middle_index - 1] + sorted[middle_index]) / 2
        : sorted[middle_index];

    return {
      category,
      avg: r.sum / r.count,
      count: r.count,
      median: median,
    };
  });
}


//------------------------------ to return --------------------------------
export default function MenuCompare() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeVenueIds, setActiveVenueIds] = useState<string[]>([]);

  // DEV DATA 
  // useEffect(() => {
  //   const demoVenues: Venue[] = [
  //     { id: "v1", name: "Bean & Bloom", address: "123 Walnut St" },
  //     { id: "v2", name: "Riverfront Roasters", address: "45 Schuylkill Ave" },
  //     { id: "v3", name: "Market Square Café", address: "9 Market St" },
  //   ];
  //   setVenues(demoVenues);
  //   setActiveVenueIds(demoVenues.map((v) => v.id));

  //   const demoItems: MenuItem[] = [
  //     { id: "i1", name: "Latte 12oz", venueId: "v1", venueName: "Bean & Bloom", category: "Coffee", price: 4.75 },
  //     { id: "i2", name: "Cappuccino 12oz", venueId: "v1", venueName: "Bean & Bloom", category: "Coffee", price: 4.50 },
  //     { id: "i3", name: "Cold Brew 16oz", venueId: "v2", venueName: "Riverfront Roasters", category: "Coffee", price: 4.25 },
  //     { id: "i4", name: "Matcha Latte 12oz", venueId: "v2", venueName: "Riverfront Roasters", category: "Tea", price: 5.25 },
  //     { id: "i5", name: "Croissant", venueId: "v1", venueName: "Bean & Bloom", category: "Pastry", price: 3.95 },
  //     { id: "i6", name: "Turkey Club", venueId: "v3", venueName: "Market Square Café", category: "Sandwich", price: 9.50 },
  //   ];
  //   setItems(demoItems);
  // }, []);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<number[]>([0, 20]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchesQuery = query
        ? `${i.name} ${i.venueName} ${i.category}`.toLowerCase().includes(query.toLowerCase())
        : true;

      const inCategory = category === "All" ? true : i.category === category;
      const inRange = i.price >= priceRange[0] && i.price <= priceRange[1];
      const inVenue = activeVenueIds.length === 0 || activeVenueIds.includes(i.venueId);

      return matchesQuery && inCategory && inRange && inVenue;
    });
  }, [items, query, category, priceRange, activeVenueIds]);

  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const catAgg = useMemo(() => byCategory(filtered), [filtered]);
  const compared = useMemo(() => filtered.filter((i) => compareIds.includes(i.id)), [filtered, compareIds]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 space-y-4">
          <Controls
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            categories={categories}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />

          <VenueSelector
            venues={venues}
            activeVenueIds={activeVenueIds}
            setActiveVenueIds={setActiveVenueIds}
            onAddVenue={(name, address) => {
              const id = crypto.randomUUID();
              setVenues((prev) => [...prev, { id, name, address }]);
              setActiveVenueIds((prev) => [...prev, id]);
            }}
          />
        </div>

        <div className="xl:col-span-7 space-y-4">
          <Stats stats={stats} />
          
          <Card>
            <CardHeader className="pb-3"> {/* if there is pinned data */}
              <CardTitle className="text-lg">Items ({filtered.length})</CardTitle>
              <CardDescription>?</CardDescription>
            </CardHeader>
            <CardContent>
              <ItemsTable items={filtered} toggleCompare={toggleCompare} compareIds={compareIds} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Average Price by Category</CardTitle>
              <CardDescription>Empty until items are added.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catAgg} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => currency(v)} />
                    <Legend />
                    <Bar dataKey="avg" name="Avg Price" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

//------------------------------ sub component --------------------------------
// These components will be only used in this page. If otherwise, dedicate their own .tsx to them!

// so the user can flter by searching names, selecting category , and changing price range
function Controls({ query, setQuery, category, setCategory, categories, priceRange, setPriceRange }: any) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2"><Filter className="h-5 w-5"/> Filters</CardTitle>
        <CardDescription>Search, select category, and set price range</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"/>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items, venues, categories" className="pl-9" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c: string) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 text-sm text-neutral-600">
            <span>Price range</span>
            <span>{currency(priceRange[0])} – {currency(priceRange[1])}</span>
          </div>
          <Slider value={priceRange} onValueChange={(v) => setPriceRange([Math.min(v[0], v[1]), Math.max(v[0], v[1])])} min={0} max={20} step={0.25} />
        </div>
      </CardContent>
    </Card>
  );
}

// users can add venues by name and address, select, and deselect them
function VenueSelector({ venues, activeVenueIds, setActiveVenueIds, onAddVenue }: any) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const toggleVenue = (id: string) => {
    setActiveVenueIds((prev: string[]) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleAdd = () => {
    if (!name.trim() || !address.trim()) return;
    onAddVenue(name.trim(), address.trim());
    setName("");
    setAddress("");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Venues</CardTitle>
        <CardDescription>Add cafés by name & address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input placeholder="Café name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-2">
            <Input className="flex-1" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {venues.map((v: any) => (
            <Button key={v.id} size="sm" variant={activeVenueIds.includes(v.id) ? "default" : "outline"} className="rounded-full text-xs" onClick={() => toggleVenue(v.id)}>
              {v.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// simple card to show a lable with its value (used in StatRow)
function StatCard({ label, value }: any) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wide text-neutral-500">{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

// simple card to show the min, max, avg, and median of items filtered through the search bar
function Stats({ stats }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Minimum" value={currency(stats.min)} />
      <StatCard label="Maximum" value={currency(stats.max)} />
      <StatCard label="Average" value={currency(stats.avg)} />
      <StatCard label="Median" value={currency(stats.median)} />
    </div>
  );
}

// the very main table to list all the items
// users can pin items to compare
function ItemsTable({ items, compareIds, toggleCompare }: any) {
  return (
    <Table>
      <TableCaption>
        {items.length === 0 ? "No items!" : `${items.length} items`}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Venue</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((i: any) => (
          <TableRow key={i.id} className="hover:bg-neutral-50">
            <TableCell className="font-medium">{i.name}</TableCell>
            <TableCell>{i.venueName}</TableCell>
            <TableCell>
              <Badge variant="outline">{i.category}</Badge>
            </TableCell>
            <TableCell className="text-right font-semibold">
              {currency(i.price)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}