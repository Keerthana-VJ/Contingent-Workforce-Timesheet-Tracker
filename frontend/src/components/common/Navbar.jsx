import React, { useState, useEffect, useRef } from 'react';
import { Search, LogOut, User, Moon, Sun, Briefcase, Users, FileText, Flag, Building2, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../../api/projectApi';
import { getContractors } from '../../api/contractorApi';
import { getVendors } from '../../api/vendorApi';
import { getInvoices } from '../../api/invoiceApi';
import { getMilestones } from '../../api/milestoneApi';

export const Navbar = ({ toggleDarkMode, isDarkMode }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [allData, setAllData] = useState({
    projects: [],
    contractors: [],
    vendors: [],
    invoices: [],
    milestones: []
  });
  const searchRef = useRef(null);

  useEffect(() => {
    const loadGlobalIndex = async () => {
      try {
        const [p, c, v, i, m] = await Promise.allSettled([
          getProjects(),
          getContractors(),
          getVendors(),
          getInvoices(),
          getMilestones()
        ]);

        const extract = (res) => {
          if (res.status !== 'fulfilled') return [];
          const d = res.value;
          return Array.isArray(d) ? d : (d?.content || d?.data?.content || d?.data || []);
        };

        setAllData({
          projects: extract(p),
          contractors: extract(c),
          vendors: extract(v),
          invoices: extract(i),
          milestones: extract(m)
        });
      } catch (err) {
        console.error("Failed to preload global search index", err);
      }
    };

    loadGlobalIndex();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        if (input) input.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (val) => {
    setQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    const q = val.toLowerCase().trim();
    const results = [];

    allData.projects.forEach(proj => {
      const name = proj.projectName || proj.name || '';
      const client = proj.clientName || proj.client || '';
      if (name.toLowerCase().includes(q) || client.toLowerCase().includes(q)) {
        results.push({
          type: 'Project',
          title: name,
          subtitle: `Client: ${client}`,
          route: role === 'ADMIN' ? '/admin/projects' : (role === 'VENDOR' ? '/vendor/projects' : '/manager/projects'),
          icon: Briefcase,
          color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
        });
      }
    });

    allData.contractors.forEach(c => {
      const name = c.user?.name || c.name || '';
      const roleName = c.jobRole || '';
      const email = c.user?.email || c.email || '';
      if (name.toLowerCase().includes(q) || roleName.toLowerCase().includes(q) || email.toLowerCase().includes(q)) {
        results.push({
          type: 'Contractor',
          title: name,
          subtitle: `${roleName} • ${c.vendor?.vendorName || 'Vendor'}`,
          route: role === 'ADMIN' ? '/admin/contractors' : '/vendor/contractors',
          icon: Users,
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40'
        });
      }
    });

    if (role === 'ADMIN' || role === 'MANAGER') {
      allData.vendors.forEach(v => {
        const name = v.vendorName || v.name || '';
        const person = v.contactPerson || '';
        if (name.toLowerCase().includes(q) || person.toLowerCase().includes(q)) {
          results.push({
            type: 'Vendor',
            title: name,
            subtitle: `Contact: ${person}`,
            route: '/admin/vendors',
            icon: Building2,
            color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40'
          });
        }
      });
    }

    allData.invoices.forEach(inv => {
      const num = inv.invoiceNumber || '';
      const proj = inv.projectName || '';
      if (num.toLowerCase().includes(q) || proj.toLowerCase().includes(q)) {
        results.push({
          type: 'Invoice',
          title: num,
          subtitle: `${proj} • $${Number(inv.totalAmount || 0).toLocaleString()}`,
          route: role === 'ADMIN' ? '/admin/invoices' : (role === 'VENDOR' ? '/vendor/invoices' : '/manager/invoices'),
          icon: FileText,
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
        });
      }
    });

    allData.milestones.forEach(m => {
      const name = m.milestoneName || m.name || '';
      const proj = m.projectName || '';
      if (name.toLowerCase().includes(q) || proj.toLowerCase().includes(q)) {
        results.push({
          type: 'Milestone',
          title: name,
          subtitle: `${proj} • Status: ${m.status || 'Active'}`,
          route: role === 'ADMIN' ? '/admin/milestones' : (role === 'VENDOR' ? '/vendor/milestones' : '/manager/milestones'),
          icon: Flag,
          color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
        });
      }
    });

    setSearchResults(results.slice(0, 8));
  };

  const handleSelectResult = (route) => {
    setIsOpen(false);
    setQuery('');
    navigate(route);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm z-30">
      <div className="flex flex-1 items-center" ref={searchRef}>
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="global-search-input"
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full rounded-lg border-0 py-1.5 pl-9 pr-14 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-xs sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500"
            placeholder="Global search contractors, projects, invoices, vendors..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <kbd className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-sans font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Ctrl K
            </kbd>
          </div>

          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden z-50 animate-in fade-in-50 duration-150">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Quick Navigation Search</span>
                <span className="text-[11px] font-normal text-slate-400">
                  {searchResults.length > 0 ? `${searchResults.length} matches found` : 'Type to search across portal'}
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {query.trim() === '' ? (
                  <div className="p-5 text-center text-xs text-slate-400">
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Instant System-Wide Search</p>
                    <p className="text-[11px] leading-relaxed">
                      Locate contractors, vendor organizations, projects, draft/approved invoices, or sprint milestones from any view.
                    </p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                    No matching records found for "{query}".
                  </div>
                ) : (
                  searchResults.map((res, idx) => {
                    const Icon = res.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectResult(res.route)}
                        className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${res.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                {res.title}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {res.type}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {res.subtitle}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleDarkMode}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
        
        <div className="flex items-center space-x-3">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</span>
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">{user?.role}</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors ml-2"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
