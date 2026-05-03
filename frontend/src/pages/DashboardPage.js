import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Plus, TrendingUp, MapPin, Calendar, DollarSign, Users, Award } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { formatCurrency, formatDate, getDaysUntil } from '../utils/helpers';
import Spinner from '../components/ui/Spinner';

const StatCard = ({ icon: Icon, label, value, sub, color = 'var(--accent)' }) => (
  <div className="card" style={{ display:'flex', alignItems:'flex-start', gap:'1rem' }}>
    <div style={{ width:48, height:48, borderRadius:12, background:`rgba(${color === 'var(--accent)' ? '56,189,248' : color === 'var(--green)' ? '16,185,129' : color === 'var(--amber)' ? '245,158,11' : '168,85,247'},0.15)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ color:'var(--text-2)', fontSize:'0.8rem', fontFamily:'Syne,sans-serif', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.35rem' }}>{label}</div>
      <div style={{ fontSize:'1.75rem', fontFamily:'Syne,sans-serif', fontWeight:800, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ color:'var(--text-3)', fontSize:'0.8rem', marginTop:'0.25rem' }}>{sub}</div>}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { trips, fetchTrips, loading } = useTrip();
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetchTrips({ limit: 5 });
    analyticsAPI.getDashboard().then(({ data }) => setAnalytics(data)).catch(() => {}).finally(() => setAnalyticsLoading(false));
  }, [fetchTrips]);

  const upcoming = trips.filter(t => new Date(t.dates?.start) > new Date()).sort((a,b) => new Date(a.dates.start) - new Date(b.dates.start));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding:'2rem', maxWidth:1200, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:'2rem', animation:'fadeIn 0.4s ease' }}>
        <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:'0.25rem' }}>{greeting} 👋</p>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'2rem', fontWeight:800, letterSpacing:'-0.02em' }}>{user?.name?.split(' ')[0]}, ready to explore?</h1>
      </div>

      {/* Stats */}
      {analyticsLoading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}><Spinner /></div>
      ) : analytics ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1rem', marginBottom:'2rem', animation:'fadeIn 0.5s ease' }}>
          <StatCard icon={Compass} label="Total Trips" value={analytics.summary.totalTrips} sub={`${analytics.summary.completedTrips} completed`} color="var(--accent)" />
          <StatCard icon={Calendar} label="Upcoming" value={analytics.summary.upcomingTrips} sub="planned trips" color="var(--green)" />
          <StatCard icon={DollarSign} label="Total Budget" value={formatCurrency(analytics.summary.totalBudget)} sub={`${analytics.summary.budgetUtilization}% utilized`} color="var(--amber)" />
          <StatCard icon={Users} label="Collaborations" value={analytics.summary.collaboratedTrips} sub="shared trips" color="var(--purple)" />
        </div>
      ) : null}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'1.5rem', alignItems:'start' }}>
        {/* Upcoming trips */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.1rem', fontWeight:700 }}>Your Trips</h2>
            <Link to="/trips/new" className="btn btn-primary" style={{ fontSize:'0.8rem', padding:'0.5rem 1rem' }}>
              <Plus size={14} /> New Trip
            </Link>
          </div>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><Spinner /></div>
          ) : trips.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
              <Compass size={48} color="var(--text-3)" style={{ margin:'0 auto 1rem' }} />
              <h3 style={{ fontFamily:'Syne,sans-serif', marginBottom:'0.5rem' }}>No trips yet</h3>
              <p style={{ color:'var(--text-2)', marginBottom:'1.5rem', fontSize:'0.9rem' }}>Plan your first adventure</p>
              <Link to="/trips/new" className="btn btn-primary">Create Trip</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {trips.map((trip, i) => {
                const daysUntil = getDaysUntil(trip.dates?.start);
                const isUpcoming = daysUntil > 0;
                const isOngoing = daysUntil <= 0 && getDaysUntil(trip.dates?.end) >= 0;
                return (
                  <Link key={trip._id} to={`/trips/${trip._id}`} style={{ textDecoration:'none', animation:`fadeIn ${0.3 + i*0.1}s ease` }}>
                    <div className="card" style={{ display:'flex', alignItems:'center', gap:'1rem', cursor:'pointer', transition:'all 0.2s', borderColor:'var(--border)' }}
                      onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; }}>
                      <div style={{ width:52, height:52, borderRadius:12, background:'var(--bg-3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>
                        🗺️
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, marginBottom:'0.2rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{trip.title}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--text-2)', fontSize:'0.8rem' }}>
                          <MapPin size={12} /> {trip.destination?.name}
                          <span style={{ color:'var(--border-2)' }}>·</span>
                          <Calendar size={12} /> {formatDate(trip.dates?.start)}
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        {isOngoing ? (
                          <span className="badge badge-green">Ongoing</span>
                        ) : isUpcoming ? (
                          <span className="badge badge-blue">In {daysUntil}d</span>
                        ) : (
                          <span className="badge badge-amber">Completed</span>
                        )}
                        <div style={{ color:'var(--text-3)', fontSize:'0.78rem', marginTop:'0.3rem' }}>{formatCurrency(trip.budget?.total)}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              <Link to="/trips" style={{ textAlign:'center', display:'block', color:'var(--accent)', fontSize:'0.875rem', fontFamily:'Syne,sans-serif', fontWeight:600, padding:'0.5rem', textDecoration:'none' }}>View all trips →</Link>
            </div>
          )}
        </div>

        {/* Top categories + tips */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {analytics?.topCategories?.length > 0 && (
            <div className="card">
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'0.95rem', fontWeight:700, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <Award size={16} color="var(--amber)" /> Top Categories
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                {analytics.topCategories.map((cat, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-3)', width:16, textAlign:'right' }}>{i+1}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.2rem' }}>
                        <span style={{ fontSize:'0.8rem', textTransform:'capitalize', fontWeight:500 }}>{cat.name}</span>
                        <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>{cat.count}</span>
                      </div>
                      <div style={{ height:4, background:'var(--bg-3)', borderRadius:2 }}>
                        <div style={{ height:'100%', width:`${(cat.count / analytics.topCategories[0].count) * 100}%`, background:'var(--accent)', borderRadius:2, transition:'width 0.6s ease' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick tip */}
          <div className="card" style={{ background:'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(168,85,247,0.08))', border:'1px solid rgba(56,189,248,0.2)' }}>
            <div style={{ fontSize:'1.5rem', marginBottom:'0.75rem' }}>💡</div>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'0.9rem', fontWeight:700, marginBottom:'0.5rem' }}>Smart Planning Tip</h3>
            <p style={{ color:'var(--text-2)', fontSize:'0.8rem', lineHeight:1.6 }}>
              Use the AI Itinerary Generator to auto-plan your trip using real map data. It groups nearby places and optimizes your route automatically.
            </p>
            <Link to="/trips/new" style={{ display:'inline-block', marginTop:'0.75rem', color:'var(--accent)', fontSize:'0.8rem', fontFamily:'Syne,sans-serif', fontWeight:600, textDecoration:'none' }}>Plan a Trip →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
