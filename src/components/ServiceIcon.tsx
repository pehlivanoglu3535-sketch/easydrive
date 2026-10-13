import {
  Briefcase, Calculator, Plane, Code2, TrendingUp, Scale, Users, LineChart,
  ShieldCheck, Globe, Building2, Lightbulb, Target, FileText,
} from "lucide-react";

/**
 * Hizmet ikonunu adına göre statik olarak render eder.
 * (Dinamik `const Icon = getIcon(); <Icon/>` deseni Next'in
 * react-hooks/static-components kuralını ihlal ettiği için switch kullanılır.)
 */
export function ServiceIcon({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  switch (name) {
    case "Calculator": return <Calculator size={size} className={className} />;
    case "Plane": return <Plane size={size} className={className} />;
    case "Code2": return <Code2 size={size} className={className} />;
    case "TrendingUp": return <TrendingUp size={size} className={className} />;
    case "Scale": return <Scale size={size} className={className} />;
    case "Users": return <Users size={size} className={className} />;
    case "LineChart": return <LineChart size={size} className={className} />;
    case "ShieldCheck": return <ShieldCheck size={size} className={className} />;
    case "Globe": return <Globe size={size} className={className} />;
    case "Building2": return <Building2 size={size} className={className} />;
    case "Lightbulb": return <Lightbulb size={size} className={className} />;
    case "Target": return <Target size={size} className={className} />;
    case "FileText": return <FileText size={size} className={className} />;
    default: return <Briefcase size={size} className={className} />;
  }
}

export const SERVICE_ICON_NAMES = [
  "Briefcase", "Calculator", "Plane", "Code2", "TrendingUp", "Scale", "Users",
  "LineChart", "ShieldCheck", "Globe", "Building2", "Lightbulb", "Target", "FileText",
];
