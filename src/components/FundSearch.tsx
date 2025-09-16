import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const FundSearch = () => {
  const [selectedFund, setSelectedFund] = useState(null);
  const [fundMetrics, setFundMetrics] = useState(null);
  const [fundRisk, setFundRisk] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [funds, setFunds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("ALL");
  const categories = [
    { value: "ALL", label: "All Categories" },
    { value: "SMALL_CAP", label: "Small Cap" },
    { value: "MID_CAP", label: "Mid Cap" },
    { value: "LARGE_CAP", label: "Large Cap" },
    { value: "FLEXI_CAP", label: "Flexi Cap" },
    { value: "MULTI_CAP", label: "Multi Cap" },
  ];
  const pageSize = 8;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(pageSize),
    });
    if (debouncedSearch.trim()) {
      params.append('search', debouncedSearch.trim());
    }
    if (category && category !== 'ALL') {
      params.append('category', category);
    }
    fetch(`http://localhost:3002/api/v1/mutual-funds?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setFunds(data.funds || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentPage, debouncedSearch, category]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Search className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fund Search</h1>
          <p className="text-muted-foreground">Discover and compare mutual funds for your investment goals</p>
        </div>
      </div>

      {/* Search Bar & Category Filter */}
      <div className="flex items-center mb-4 gap-2 w-full">
        <div className="flex-1 relative">
          <input
            type="text"
            className="w-full px-4 py-2 rounded-xl bg-background border border-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            placeholder="Search funds by name, category, or fund manager..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={0} />
        </div>
        <div className="relative">
          <select
            className="px-4 py-2 pr-8 rounded-xl bg-background border border-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 appearance-none cursor-pointer"
            value={category}
            onChange={e => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
            style={{ minWidth: 140 }}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            ▼
          </span>
        </div>
      </div>

      {/* Funds Table */}
      <Card className="shadow-soft">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>NAV</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funds.map((fund, idx) => (
                  <TableRow
                    key={fund.schemeCode || idx}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={async () => {
                      setSelectedFund(fund);
                      setDetailsLoading(true);
                      try {
                        const metricsRes = await fetch(`http://localhost:3002/api/v1/mutual-funds/${fund.schemeCode}/metrics-and-rating`);
                        const metrics = await metricsRes.json();
                        setFundMetrics(metrics);
                        const riskRes = await fetch(`http://localhost:3002/api/v1/mutual-funds/${fund.schemeCode}/risk`);
                        const risk = await riskRes.json();
                        setFundRisk(risk);
                      } catch {
                        setFundMetrics(null);
                        setFundRisk(null);
                      }
                      setDetailsLoading(false);
                    }}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{fund.schemeName}</p>
                        <p className="text-xs text-muted-foreground">{fund.fundHouse}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          fund.category === "SMALL_CAP" ? "bg-green-100 text-green-800 border-none" :
                          fund.category === "MID_CAP" ? "bg-blue-100 text-blue-800 border-none" :
                          fund.category === "LARGE_CAP" ? "bg-yellow-100 text-yellow-800 border-none" :
                          fund.category === "FLEXI_CAP" ? "bg-purple-100 text-purple-800 border-none" :
                          fund.category === "MULTI_CAP" ? "bg-pink-100 text-pink-800 border-none" :
                          "bg-gray-100 text-gray-800 border-none"
                        }
                      >
                        {fund.category.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{parseFloat(fund.nav).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
      {/* Fund Details Modal/Card */}
      {selectedFund && (
  <div className="fixed inset-0 bg-black/40 flex justify-center z-50" style={{ alignItems: 'flex-start', paddingTop: '8vh' }} onClick={() => setSelectedFund(null)}>
          <div className="bg-background rounded-3xl shadow-2xl p-12 min-w-[440px] max-w-[600px] w-full relative animate-fadeIn flex flex-col" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-extrabold mb-2 leading-tight">{selectedFund.schemeName}</h2>
            <div className="mb-4 text-lg text-muted-foreground">{selectedFund.fundHouse}</div>
            <div className="mb-6 flex gap-3 items-center">
              <Badge className={
                selectedFund.category === "SMALL_CAP" ? "bg-green-100 text-green-800 border-none text-base px-4 py-2" :
                selectedFund.category === "MID_CAP" ? "bg-blue-100 text-blue-800 border-none text-base px-4 py-2" :
                selectedFund.category === "LARGE_CAP" ? "bg-yellow-100 text-yellow-800 border-none text-base px-4 py-2" :
                selectedFund.category === "FLEXI_CAP" ? "bg-purple-100 text-purple-800 border-none text-base px-4 py-2" :
                selectedFund.category === "MULTI_CAP" ? "bg-pink-100 text-pink-800 border-none text-base px-4 py-2" :
                "bg-gray-100 text-gray-800 border-none text-base px-4 py-2"
              }>
                {selectedFund.category.replace(/_/g, " ")}
              </Badge>
              <span className="text-sm text-muted-foreground">Scheme Code: {selectedFund.schemeCode}</span>
            </div>
            <div className="mb-6 text-xl">NAV: <span className="font-bold">{parseFloat(selectedFund.nav).toFixed(2)}</span></div>
            {detailsLoading ? (
              <div className="py-8 text-center text-muted-foreground text-lg">Loading details...</div>
            ) : (
              <div className="flex flex-row gap-8 items-center justify-between w-full">
                {fundMetrics && (
                  <div className="flex flex-col gap-4 flex-1">
                    <div className="flex gap-3 items-center">
                      <span className="text-lg font-medium">1 Year CAGR:</span>
                      {typeof fundMetrics.cagr?.y1 === 'number' ? (
                        fundMetrics.cagr.y1 < 0 ? (
                          <Badge className="bg-red-100 text-red-800 border-none text-base px-4 py-2">{fundMetrics.cagr.y1}%</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-none text-base px-4 py-2">{fundMetrics.cagr.y1}%</Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground text-base">-</span>
                      )}
                    </div>
                    <div className="flex gap-3 items-center">
                      <span className="text-lg font-medium">3 Year CAGR:</span>
                      {typeof fundMetrics.cagr?.y3 === 'number' ? (
                        fundMetrics.cagr.y3 < 0 ? (
                          <Badge className="bg-red-100 text-red-800 border-none text-base px-4 py-2">{fundMetrics.cagr.y3}%</Badge>
                        ) : (
                            <Badge className="bg-green-100 text-green-800 border-none text-base px-4 py-2">{fundMetrics.cagr.y3}%</Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground text-base">-</span>
                      )}
                    </div>
                    <div className="flex gap-3 items-center">
                      <span className="text-lg font-medium">Rating:</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < (fundMetrics.rating?.stars ?? 0) ? 'text-yellow-400' : 'text-gray-400'}>
                            ⭐
                          </span>
                        ))}
                      </div> 
                    </div>
                  </div>
                )}
                {fundRisk && (
                  <div className="flex flex-col gap-3 items-center flex-1">
                    <span className="text-lg font-medium">Risk:</span>
                    {fundRisk.riskLabel ? (
                      <Badge className={
                        fundRisk.riskLabel === "Low" ? "bg-green-100 text-green-800 border-none text-base px-4 py-2" :
                        fundRisk.riskLabel === "Moderate" ? "bg-yellow-100 text-yellow-800 border-none text-base px-4 py-2" :
                        fundRisk.riskLabel === "High" ? "bg-orange-100 text-orange-800 border-none text-base px-4 py-2" :
                        fundRisk.riskLabel === "Very High" ? "bg-red-100 text-red-800 border-none text-base px-4 py-2" :
                        "bg-gray-100 text-gray-800 border-none text-base px-4 py-2"
                      }>
                        {fundRisk.riskLabel}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-base">-</span>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="mt-8 flex justify-end">
              <Button variant="outline" size="lg" onClick={() => setSelectedFund(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`px-3 py-1 rounded ${page === currentPage ? "bg-primary text-white" : "bg-background text-primary border border-muted"}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* No funds found */}
      {!loading && funds.length === 0 && (
        <Card className="shadow-soft">
          <CardContent className="py-16 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No funds found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find relevant funds.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

};

export default FundSearch;