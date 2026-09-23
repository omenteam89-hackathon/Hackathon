import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import CategoryIcon from '../../shared/CategoryIcon';
import { loadAppData } from '../../data/loaders';
import { repository } from '../../data/repository';
import { useClockStore } from '../../store/useClockStore';
import { generateComplaintId } from '../../domain/ids';
import { useNotificationStore } from '../../store/useNotificationStore';
import type { Category, RouteDepotMap, CategoryId, SlaRule, Depot } from '../../domain/types';

const formSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  routeNo: z.string().min(1, 'Route number is required'),
  busNo: z.string().optional(),
  location: z.string().min(1, 'Stop / location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  phone: z.string().trim().regex(/^([6-9]\d{9})?$/, 'Enter a 10-digit mobile number or leave it empty').optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReportPage() {
  const navigate = useNavigate();
  const simNow = useClockStore(s => s.simNow);
  const [categories, setCategories] = useState<Category[]>([]);
  const [routes, setRoutes] = useState<RouteDepotMap[]>([]);
  const [slaRules, setSlaRules] = useState<SlaRule[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);

  const [routeSearch, setRouteSearch] = useState('');
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const routeInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      routeNo: '',
      busNo: '',
      location: '',
      description: '',
      phone: '',
    }
  });

  useEffect(() => {
    loadAppData().then(res => {
      setCategories(res.data.categories);
      setRoutes(res.data.routeMap);
      setSlaRules(res.data.slaRules);
      setDepots(res.data.depots);
      setLoading(false);
    });
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (routeInputRef.current && !routeInputRef.current.contains(e.target as Node)) {
        setShowRouteDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredRoutes = useMemo(() => {
    if (!routeSearch) return [];
    const search = routeSearch.toLowerCase();
    return routes.filter(r => 
      r.routeNo.toLowerCase().includes(search) || 
      (r.routeName && r.routeName.toLowerCase().includes(search))
    ).slice(0, 5); // Limit to 5 results
  }, [routeSearch, routes]);

  const onSubmit = async (data: FormValues) => {
    // Determine depot based on route
    const matchedRoute = routes.find(r => r.routeNo === data.routeNo);
    const depotId = matchedRoute ? matchedRoute.depotId : null;
    const status = depotId ? 'ASSIGNED_TO_DEPOT' : 'UNROUTED';

    // Compute SLA deadlines
    const rule = slaRules.find(r => r.category === data.category) || slaRules[0];
    const ackDeadline = new Date(new Date(simNow).getTime() + (rule?.ackWithinHours || 12) * 60 * 60 * 1000).toISOString();
    const resolveDeadline = new Date(new Date(simNow).getTime() + (rule?.resolveWithinHours || 72) * 60 * 60 * 1000).toISOString();

    const id = generateComplaintId();
    
    repository.create({
      id,
      createdAt: simNow,
      incidentAt: simNow, // For simplicity
      routeNo: data.routeNo,
      busNo: data.busNo ? data.busNo.toUpperCase() : undefined,
      category: data.category as CategoryId,
      location: { stopName: data.location },
      description: data.description,
      evidence: [],
      complainant: data.phone ? { lang: 'en', phone: data.phone.trim() } : { lang: 'en' },
      depotId,
      status,
      escalationLevel: 0,
      ackDeadline,
      resolveDeadline,
      slaPausedTotalMs: 0,
      verified: false,
      timeline: [
        {
          at: simNow,
          actor: 'PASSENGER',
          type: 'CREATED',
          message: 'Complaint submitted'
        },
        ...(depotId ? [{
          at: simNow,
          actor: 'SYSTEM' as const,
          type: 'ROUTED' as const,
          message: `Routed to ${depots.find(d => d.id === depotId)?.name || depotId} depot using route ${matchedRoute?.routeName || data.routeNo}`
        }] : [])
      ]
    });

    if (data.phone) {
      const depotName = depots.find(d => d.id === depotId)?.name;
      useNotificationStore.getState().addNotification({
        id: Math.random().toString(36).substring(2, 9),
        at: simNow,
        channel: 'SMS',
        to: data.phone.trim(),
        audience: 'PASSENGER',
        complaintId: id,
        template: 'CREATED',
        body: depotName
          ? `KSRTC Grievance: complaint ${id} received and sent to ${depotName} depot. Track it with this reference number.`
          : `KSRTC Grievance: complaint ${id} received. We are finding the right depot.`,
      });
    }
    navigate(`/report/success/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-4 sm:p-6 rounded-lg border border-border">
      <h1 className="text-2xl font-semibold text-ink mb-1">Report a problem</h1>
      <p className="text-sm text-muted mb-6">Please provide details about the incident.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Category Grid */}
        <div>
          <label className="block text-sm font-medium mb-2">Category <span className="text-brand">*</span></label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const isSelected = field.value === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => field.onChange(cat.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 border rounded-lg text-center transition-colors",
                        isSelected 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-border bg-surface hover:bg-muted/5 text-ink"
                      )}
                    >
                      <CategoryIcon category={cat.id as CategoryId} className={cn("mb-2", isSelected ? "" : "bg-transparent")} />
                      <span className="text-sm font-medium">{cat.label.en}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.category && <p className="text-brand text-xs mt-1">{errors.category.message}</p>}
        </div>

        {/* Route Combobox */}
        <div className="relative" ref={routeInputRef}>
          <label className="block text-sm font-medium mb-1">Route <span className="text-brand">*</span></label>
          <Controller
            name="routeNo"
            control={control}
            render={({ field }) => {
              const selectedRoute = routes.find(r => r.routeNo === field.value);
              const displayValue = selectedRoute 
                ? (showRouteDropdown ? routeSearch : `${selectedRoute.routeName} · ${selectedRoute.serviceType}`) 
                : routeSearch;

              return (
                <>
                  <input
                    type="text"
                    className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    placeholder="Search route by name or number (e.g. East Fort)"
                    value={displayValue}
                    onChange={(e) => {
                      setRouteSearch(e.target.value);
                      if (field.value) field.onChange(''); // Clear actual value when typing
                      setShowRouteDropdown(true);
                    }}
                    onFocus={() => setShowRouteDropdown(true)}
                    autoComplete="off"
                  />
                  {showRouteDropdown && filteredRoutes.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                      {filteredRoutes.map((r, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 text-sm hover:bg-muted/10 cursor-pointer flex flex-col"
                          onClick={() => {
                            field.onChange(r.routeNo);
                            setRouteSearch('');
                            setShowRouteDropdown(false);
                          }}
                        >
                          <span className="font-medium text-ink">{r.routeName}</span>
                          <span className="text-xs text-muted">{r.serviceType} ({r.routeNo})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            }}
          />
          {errors.routeNo && <p className="text-brand text-xs mt-1">{errors.routeNo.message}</p>}
        </div>

        {/* Bus Number */}
        <div>
          <label className="block text-sm font-medium mb-1">Bus number (optional)</label>
          <input
            {...register('busNo')}
            type="text"
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary uppercase"
            placeholder="e.g. KL-15-A-1234"
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              setValue('busNo', e.target.value);
            }}
          />
        </div>

        {/* Stop / Location */}
        <div>
          <label className="block text-sm font-medium mb-1">Stop / location <span className="text-brand">*</span></label>
          <input
            {...register('location')}
            type="text"
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
            placeholder="e.g. Pattom"
          />
          {errors.location && <p className="text-brand text-xs mt-1">{errors.location.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description <span className="text-brand">*</span></label>
          <textarea
            {...register('description')}
            className="w-full border border-border rounded px-3 py-2 text-sm h-24 focus:outline-none focus:border-primary"
            placeholder="Briefly describe what happened..."
          />
          {errors.description && <p className="text-brand text-xs mt-1">{errors.description.message}</p>}
        </div>

        {/* Phone (optional) */}
        <div>
          <label className="block text-sm font-medium mb-1">Mobile number for updates (optional)</label>
          <input
            {...register('phone')}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
            placeholder="10-digit mobile number"
          />
          <p className="text-muted-foreground text-xs mt-1">Only used to send you SMS updates. Never shown publicly.</p>
          {errors.phone && <p className="text-brand text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <button 
          disabled={isSubmitting}
          className="w-full py-2.5 bg-primary text-white font-medium rounded hover:opacity-90 disabled:opacity-50 flex justify-center items-center"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
