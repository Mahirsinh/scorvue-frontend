// SessionCard.tsx
import {
    Layout,
    Server,
    Cloud,
    BarChart3,
    Palette,
    Smartphone,
    Cpu,
    ShieldCheck,
    Gamepad2,
    Database,
    Infinity,
    Code2,
    Box,
    Atom,
    Hexagon,
    Terminal,
    Coffee,
    Workflow,
    X
} from "lucide-react";

import type { SessionCardProps } from "../types/components";

const SessionCard = ({ session, onClick, onDelete }: SessionCardProps) => {
    const isDeletable = session.status !== 'pending';

    const renderIcon = () => {
        const role = session.role || '';
        const size = 28;
        const className = "transition-transform group-hover:scale-110 duration-500";

        if (role.includes('Python')) return <Code2 size={size} className={className} />
        if (role.includes('Java')) return <Coffee size={size} className={className} />
        if (role.includes('C++') || role.includes('C#')) return <Terminal size={size} className={className} />
        if (role.includes('JavaScript') || role.includes('TypeScript')) return <Code2 size={size} className={className} />
        if (role.includes('React')) return <Atom size={size} className={className} />
        if (role.includes('Node')) return <Hexagon size={size} className={className} />
        if (role.includes('SQL') || role.includes('MongoDB') || role.includes('Database')) return <Database size={size} className={className} />
        if (role.includes('Docker')) return <Box size={size} className={className} />
        if (role.includes('Kubernetes')) return <Infinity size={size} className={className} />
        if (role.includes('AWS') || role.includes('Azure') || role.includes('Cloud')) return <Cloud size={size} className={className} />
        if (role.includes('Mobile') || role.includes('Android') || role.includes('iOS')) return <Smartphone size={size} className={className} />
        if (role.includes('Game')) return <Gamepad2 size={size} className={className} />
        if (role.includes('Security') || role.includes('Cyber')) return <ShieldCheck size={size} className={className} />
        if (role.includes('ML') || role.includes('Machine Learning') || role.includes('AI')) return <Cpu size={size} className={className} />
        if (role.includes('Data')) return <BarChart3 size={size} className={className} />
        if (role.includes('DevOps')) return <Infinity size={size} className={className} />
        if (role.includes('Frontend') || role.includes('Web')) return <Layout size={size} className={className} />
        if (role.includes('Backend')) return <Server size={size} className={className} />
        if (role.includes('Full Stack') || role.includes('MERN') || role.includes('MEAN')) return <Workflow size={size} className={className} />
        if (role.includes('Design') || role.includes('UI/UX')) return <Palette size={size} className={className} />

        return <Terminal size={size} className={className} />
    }

    const statusColor = session.status === 'completed' 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : session.status === 'in-progress' 
        ? 'bg-amber-50 text-amber-700 border-amber-200' 
        : session.status === 'cancelled' 
        ? 'bg-red-50 text-red-700 border-red-200' 
        : 'bg-blue-50 text-blue-700 border-blue-200';

    const iconBg = session.status === 'completed' 
        ? 'bg-emerald-50 text-emerald-600' 
        : session.status === 'cancelled' 
        ? 'bg-red-50 text-red-600' 
        : 'bg-blue-50 text-blue-600';

    const scoreColor = session.status === 'completed' 
        ? ((session.overallScore ?? 0) > 75 ? 'text-emerald-600' : 'text-orange-600') 
        : session.status === 'cancelled' 
        ? 'text-red-600' 
        : 'text-gray-400';

    const cardBorder = session.status === 'completed' 
        ? 'border-emerald-200 hover:border-emerald-300' 
        : session.status === 'in-progress' 
        ? 'border-amber-200 hover:border-amber-300' 
        : session.status === 'cancelled' 
        ? 'border-red-200 hover:border-red-300' 
        : 'border-gray-200 hover:border-blue-300';

    return (
        <div
            onClick={() => onClick(session)}
            className={`group bg-white border ${cardBorder} rounded-3xl shadow-sm hover:shadow-lg p-6 flex flex-col items-stretch gap-6 transition-all hover:-translate-y-1 active:scale-[0.99] cursor-pointer relative will-change-transform`}
        >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-8 -mt-8"></div>

            <div className="flex items-center gap-5 relative z-10">
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border ${iconBg}`}>
                    {renderIcon()}
                </div>
                <div className="overflow-hidden grow">
                    <h3 className="font-extrabold text-gray-900 text-lg truncate tracking-tight group-hover:text-blue-600 transition-colors">
                        {session.role}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
                        <span>{session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'N/A'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-gray-600">
                            {session.level}
                        </span>
                        {session.company && session.company !== 'general' && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span className="text-blue-600 px-2 py-0.5 rounded-md border border-blue-200 bg-blue-50 text-[9px] font-bold">
                                    {session.company.toUpperCase()}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); if (isDeletable) onDelete(e, session._id) }}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-200"
                >
                    <X size={18} strokeWidth={2.5} />
                </button>
            </div>

            <div className="flex items-center justify-between mt-2 pt-5 border-t border-gray-100 relative z-10">
                <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Overall Proficiency</p>
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                            <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-gray-200" strokeWidth="4" />
                                <circle cx="18" cy="18" r="15.9155" fill="none" className={`stroke-current ${scoreColor} transition-all duration-1000 ease-out`} strokeWidth="4" strokeDasharray={`${session.status === 'completed' ? (session.overallScore || 0) : 0}, 100`} strokeLinecap="round" />
                            </svg>
                            <span className={`absolute text-[9px] font-bold tracking-tighter ${scoreColor}`}>
                                {session.status === 'completed' ? Math.round(session.overallScore || 0) : '--'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-base leading-none font-bold ${scoreColor}`}>
                                {session.status === 'completed' ? session.overallScore?.toFixed(1) : '0.0'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${statusColor}`}>
                        {session.status === 'in-progress' ? 'In Progress' : session.status}
                    </span>
                    <div className="text-blue-600 font-bold text-[10px] flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-widest">
                        {session.status === 'completed' ? 'View Analytics' : session.status === 'cancelled' ? 'Abandoned' : 'Continue'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SessionCard;