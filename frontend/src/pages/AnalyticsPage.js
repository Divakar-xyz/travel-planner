import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { analyticsAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import Spinner from '../components/ui/Spinner';
import { TrendingUp, Map, DollarSign, Users, Award } from 'lucide-react';

const COLORS = ['#38bdf8','#10b981','#f59e0b','#a855f7','#ef4444','#06b6d4','#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'0.75rem', fontSize:'0.82rem' }}>
      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, marginBottom:'0.25rem' }}>{label}</div>
      {payload.map((p,i) => <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 100 ? formatCurrency(p.value) : p.value}</div>)}
    </div>
  );
};

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard().then(({ data }) => setData(data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}><Spinner size={40}/></div>;
  if (!data) return <div style={{ padding:'2rem', color:'var(--text-2)' }}>No analytics data available.</div>;

  const { summary, topCategories, destinations, monthlyData } = data;

  const pieData = topCategories.map((c,i) => ({ name:c.name, value:c.count, fill:COLORS[i%COLORS.length] }));

  return (
    <div style={{ padding:'2rem', maxWidth:1100, margin:'0 auto' }}>
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.75rem', fontWeight:800, letterSpacing:'-0.02em' }}>Travel Analytics</h1>
        <p style={{ color:'var(--text-2)', fontSize:'0.875rem' }}>Insights from your journey data</p>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
        {[
          { label:'Total Trips', value:summary.totalTrips, icon:Map, color:'var(--accent)' },
          { label:'Completed', value:summary.completedTrips, icon:Award, color:'var(--green)' },
          { label:'Total Budget', value:formatCurrency(summary.totalBudget), icon:DollarSign, color:'var(--amber)' },
          { label:'Collaborations', value:summary.collaboratedTrips, icon:Users, color:'var(--purple)' },
          { label:'Budget Used', value:`${summary.budgetUtilization}%`, icon:TrendingUp, color:'var(--red)' }
        ].map(({ label, value, icon:Icon, color }) => (
          <div key={label} className="card" style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
            <div style={{ width:40,height:40,borderRadius:10,background:`${color}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <Icon size={20} color={color}/>
            </div>
            <div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-3)', fontFamily:'Syne,sans-serif', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
              <div style={{ fontSize:'1.5rem', fontFamily:'Syne,sans-serif', fontWeight:800 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {/* Monthly trips */}
        {monthlyData.length > 0 && (
          <div className="card">
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, marginBottom:'1.25rem', fontSize:'0.95rem' }}>Trips Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fill:'var(--text-3)', fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:'var(--text-3)', fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="count" name="Trips" fill="var(--accent)" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category pie */}
        {pieData.length > 0 && (
          <div className="card">
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, marginBottom:'1.25rem', fontSize:'0.95rem' }}>Place Categories</h3>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={35} dataKey="value" stroke="none">
                    {pieData.map((entry,i) => <Cell key={i} fill={entry.fill}/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex:1 }}>
                {pieData.map((d,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.4rem' }}>
                    <div style={{ width:10,height:10,borderRadius:'50%',background:d.fill,flexShrink:0 }}/>
                    <span style={{ fontSize:'0.78rem', textTransform:'capitalize', flex:1 }}>{d.name}</span>
                    <span style={{ fontSize:'0.78rem', color:'var(--text-3)', fontFamily:'Syne,sans-serif', fontWeight:700 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Destinations */}
        {destinations.length > 0 && (
          <div className="card" style={{ gridColumn:'span 2' }}>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, marginBottom:'1.25rem', fontSize:'0.95rem' }}>Destinations by Budget</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={destinations.slice(0,10)} layout="vertical">
                <XAxis type="number" tick={{ fill:'var(--text-3)', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>formatCurrency(v)}/>
                <YAxis type="category" dataKey="name" tick={{ fill:'var(--text-2)', fontSize:11 }} axisLine={false} tickLine={false} width={100}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="budget" name="Budget" fill="var(--green)" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {destinations.length === 0 && monthlyData.length === 0 && (
        <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
          <TrendingUp size={48} color="var(--text-3)" style={{ margin:'0 auto 1rem' }}/>
          <h3 style={{ fontFamily:'Syne,sans-serif', marginBottom:'0.5rem' }}>No data yet</h3>
          <p style={{ color:'var(--text-2)', fontSize:'0.875rem' }}>Create some trips to see your analytics here.</p>
        </div>
      )}
    </div>
  );
};
export default AnalyticsPage;
