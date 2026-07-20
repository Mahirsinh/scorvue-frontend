// EntityExtractionTab.tsx
import { useState } from "react";
import { Sparkles, Pencil, Check, X, Copy } from "lucide-react";

import { SiGithub, SiLinkerd } from "@icons-pack/react-simple-icons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { PDFDownloadLink } from "@react-pdf/renderer";
import type { ResumeData, ParsedProfile } from "../types";
import { ResumePDF } from "./ResumePDF";

interface EntityExtractionTabProps {
  resumeData: ResumeData;
  profile?: ParsedProfile;
  summary?: string;
  skills?: { technical?: string[]; soft?: string[] };
  personalInfo?: ParsedProfile["personal_info"];
  experience?: ParsedProfile["experience"];
  education?: ParsedProfile["education"];
}

export const EntityExtractionTab = ({
  resumeData,
  summary,
  skills,
  personalInfo,
  experience = [],
  education = [],
  profile,
}: EntityExtractionTabProps) => {
  const [rewritingBullet, setRewritingBullet] = useState<{ bullet: string; expIndex: number; bulletIndex: number } | null>(null);
  const [variations, setVariations] = useState<string[] | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ParsedProfile & { skills?: { technical?: string[]; soft?: string[] } }>(() => ({
    ...(profile || resumeData.parsedData?.parsedProfile || {}),
    personal_info: personalInfo || profile?.personal_info || {},
    summary: summary || profile?.summary || "",
    experience: experience.length ? experience : profile?.experience || [],
    education: education.length ? education : profile?.education || [],
    skills: skills || { technical: [], soft: [] }
  }));

  const handleRewrite = async (bullet: string, expIndex: number, bulletIndex: number) => {
    if (!resumeData._id) return;
    try {
      setRewritingBullet({ bullet, expIndex, bulletIndex });
      setVariations(null);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/resume/${resumeData._id}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bullet })
      });

      if (!response.ok || !response.body) {
        throw new Error("Error rewriting bullet point");
      }

      setVariations([]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      let text = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          text += chunk;
          const parsed = text
            .replace(/^\d+\.\s*/gm, "")
            .replace(/^-\s*/gm, "")
            .replace(/^\*\s*/gm, "")
            .split(/\n\s*\n/)
            .map(s => s.trim())
            .filter(Boolean);
          setVariations(parsed.length > 0 ? parsed : [text]);
        }
      }
    } catch (error) {
      toast.error("Error rewriting bullet point");
      console.error(error);
      setRewritingBullet(null);
    }
  };

  const applyVariation = (variation: string) => {
    if (!rewritingBullet) return;
    setEditedProfile(prev => {
      const newExp = [...(prev.experience || [])];
      const targetExp = { ...newExp[rewritingBullet.expIndex] };
      const bullets = (targetExp.description || "").split(/(?:\n|•)/).filter(b => b.trim().length > 3);
      bullets[rewritingBullet.bulletIndex] = variation;
      targetExp.description = bullets.map(b => `• ${b.trim()}`).join('\n');
      newExp[rewritingBullet.expIndex] = targetExp;
      return { ...prev, experience: newExp };
    });
    toast.success("Applied to experience section!");
    setRewritingBullet(null);
    setVariations(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const allText = (resumeData.parsedData?.rawText || "").toLowerCase();
  const industries = [
    { name: "Software Engineering", keywords: ["react", "node", "software", "developer", "python", "java", "code", "engineering", "api", "database", "sql"] },
    { name: "UI/UX Design", keywords: ["design", "figma", "ui", "ux", "user interface", "user experience", "wireframe", "prototype"] },
    { name: "Product Management", keywords: ["product", "agile", "scrum", "roadmap", "strategy", "stakeholder", "management", "lifecycle"] },
    { name: "Data Science", keywords: ["data", "machine learning", "ai", "analysis", "sql", "model", "python", "statistics"] },
    { name: "Cloud / DevOps", keywords: ["aws", "docker", "kubernetes", "ci/cd", "cloud", "azure", "deployment", "infrastructure", "devops"] },
    { name: "Cybersecurity", keywords: ["security", "penetration", "vulnerability", "firewall", "auth", "encryption", "threat"] },
  ];

  const industryScores = industries.map(ind => ({
    name: ind.name,
    score: ind.keywords.reduce((count, kw) => count + (allText.match(new RegExp(`\\b${kw}\\b`, 'g'))?.length || 0), 0)
  })).filter(ind => ind.score > 0).sort((a, b) => b.score - a.score);

  if (industryScores.length === 0) {
    industryScores.push({ name: "General/Other", score: 1 });
  }

  const primaryIndustry = industryScores[0];
  const secondaryIndustry = industryScores.length > 1 ? industryScores[1] : null;
  const maxIndScore = Math.max(...industryScores.map(i => i.score));

  return (
    <motion.div
      key="extraction"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-5 rounded-3xl border border-gray-200/50 shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer text-center ${
              isEditing 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isEditing ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Done Editing
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Pencil className="w-4 h-4" /> Edit Mode
              </span>
            )}
          </button>
        </div>

        <PDFDownloadLink
          document={<ResumePDF profile={editedProfile} />}
          fileName="Optimized_Resume.pdf"
          className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {({ loading }) => (loading ? "Preparing PDF..." : "Download ATS PDF")}
        </PDFDownloadLink>
      </div>

      {/* Profile Summary */}
      {editedProfile.summary !== undefined && (
        <section className="bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4">
            Profile Summary
          </h3>
          {isEditing ? (
            <textarea
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-h-[100px] transition-all"
              value={editedProfile.summary}
              onChange={(e) => setEditedProfile(p => ({ ...p, summary: e.target.value }))}
            />
          ) : (
            <p className="text-sm text-gray-700 font-medium leading-relaxed">{editedProfile.summary}</p>
          )}
        </section>
      )}

      {/* Detected Industry & Role */}
      <section>
        <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 ml-1">Detected Industry & Role</h3>

        <div className="bg-white border border-gray-200/50 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center mb-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 relative z-10">PRIMARY INDUSTRY</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-indigo-600 mb-4 relative z-10 font-display">{primaryIndustry.name}</h2>
          <span className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap relative z-10">
            High confidence
          </span>
        </div>

        <div className="bg-white border border-gray-200/50 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          {secondaryIndustry && (
            <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Secondary:</span>
              <span className="text-[13px] font-bold text-gray-700">{secondaryIndustry.name}</span>
            </div>
          )}

          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-6">Industry Scores</h4>
            <div className="space-y-4">
              {industryScores.map((ind, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="w-full sm:w-40 text-xs font-medium text-gray-600 truncate" title={ind.name}>{ind.name}</span>
                  <div className="flex items-center gap-4 w-full sm:flex-1">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                        style={{ width: `${(ind.score / maxIndScore) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-gray-500">{ind.score.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section>
        <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 ml-1">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">NAME</span>
            {isEditing ? (
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={editedProfile.personal_info?.name || ""}
                onChange={(e) => setEditedProfile(p => ({ ...p, personal_info: { ...p.personal_info, name: e.target.value } }))}
              />
            ) : (
              <p className="text-lg text-gray-900 font-bold font-display">{editedProfile.personal_info?.name || "Not Found"}</p>
            )}
          </div>
          <div className="bg-white border border-gray-200/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">EMAIL</span>
            {isEditing ? (
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={editedProfile.personal_info?.email || ""}
                onChange={(e) => setEditedProfile(p => ({ ...p, personal_info: { ...p.personal_info, email: e.target.value } }))}
              />
            ) : (
              <p className="text-[13px] text-gray-700 font-medium break-all">{editedProfile.personal_info?.email || "Not Found"}</p>
            )}
          </div>
          <div className="bg-white border border-gray-200/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">PHONE</span>
            {isEditing ? (
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={editedProfile.personal_info?.phone || ""}
                onChange={(e) => setEditedProfile(p => ({ ...p, personal_info: { ...p.personal_info, phone: e.target.value } }))}
              />
            ) : (
              <p className="text-[14.5px] text-gray-700 font-medium">{editedProfile.personal_info?.phone || "Not Found"}</p>
            )}
          </div>
        </div>

        {/* Links */}
        {isEditing ? (
          <div className="bg-white border border-gray-200/50 rounded-2xl p-6 mt-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">LINKS (COMMA SEPARATED)</span>
            <input
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={editedProfile.personal_info?.links?.join(", ") || ""}
              onChange={(e) => setEditedProfile(p => ({
                ...p,
                personal_info: {
                  ...p.personal_info,
                  links: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                }
              }))}
              placeholder="https://github.com/..., https://linkedin.com/in/..."
            />
          </div>
        ) : (
          editedProfile.personal_info?.links && editedProfile.personal_info.links.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {(() => {
                const links = editedProfile.personal_info.links || [];
                const linkedinLink = links.find(link => link.toLowerCase().includes('linkedin.com'));
                const githubLinks = links.filter(link => link.toLowerCase().includes('github.com'));
                let githubLink = githubLinks.find(link => {
                  try {
                    const urlStr = link.startsWith('http') ? link : `https://${link}`;
                    const urlObj = new URL(urlStr);
                    return urlObj.pathname.split('/').filter(Boolean).length === 1;
                  } catch {
                    return false;
                  }
                });
                if (!githubLink && githubLinks.length > 0) {
                  githubLink = githubLinks[0];
                }

                const displayLinks = [
                  githubLink ? { url: githubLink, type: 'github' } : null,
                  linkedinLink ? { url: linkedinLink, type: 'linkedin' } : null
                ].filter(Boolean) as { url: string, type: 'github' | 'linkedin' }[];

                return displayLinks.map((item, i) => (
                  <a
                    key={i}
                    href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-gray-100 rounded-xl transition-all shadow-sm"
                  >
                    {item.type === 'github' && <SiGithub className="w-5 h-5 text-gray-700" />}
                    {item.type === 'linkedin' && <SiLinkerd className="w-5 h-5 text-[#0A66C2]" />}
                    <span className="text-[13px] font-bold text-gray-700">
                      {item.type === 'github' ? "GitHub" : "LinkedIn"}
                    </span>
                  </a>
                ));
              })()}
            </div>
          )
        )}
      </section>

      {/* Technical Skills */}
      {editedProfile.skills?.technical && editedProfile.skills.technical.length > 0 && (
        <section>
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 ml-1">Technical Skills</h3>
          <div className="bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            {isEditing ? (
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-h-[80px] transition-all"
                value={editedProfile.skills.technical.join(", ")}
                onChange={(e) => setEditedProfile(p => ({
                  ...p,
                  skills: { ...p.skills, technical: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }
                }))}
              />
            ) : (
              <div className="flex flex-wrap gap-3">
                {editedProfile.skills.technical.map((s: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-[13px] font-bold text-indigo-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Extracted Keywords */}
      {editedProfile.skills?.soft && editedProfile.skills.soft.length > 0 && (
        <section>
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 ml-1">Extracted Keywords</h3>
          <div className="bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            {isEditing ? (
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-h-[80px] transition-all"
                value={editedProfile.skills.soft.join(", ")}
                onChange={(e) => setEditedProfile(p => ({
                  ...p,
                  skills: { ...p.skills, soft: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }
                }))}
              />
            ) : (
              <div className="flex flex-wrap gap-3">
                {editedProfile.skills.soft.map((s: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {editedProfile.experience && editedProfile.experience.length > 0 && (
        <section>
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 ml-1">Work Experience</h3>
          <div className="space-y-6">
            {editedProfile.experience.map((exp, i) => (
              <div
                key={i}
                className="relative bg-white border border-gray-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
                  <div className="min-w-0 flex-1 w-full order-2 sm:order-1">
                    {isEditing ? (
                      <div className="space-y-2 mb-3">
                        <input
                          type="text"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          value={exp.role || exp.title || ""}
                          onChange={(e) => {
                            const newExp = [...editedProfile.experience!];
                            newExp[i] = { ...newExp[i], role: e.target.value };
                            setEditedProfile(p => ({ ...p, experience: newExp }));
                          }}
                          placeholder="Role / Title"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-blue-600 font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={exp.company || ""}
                            onChange={(e) => {
                              const newExp = [...editedProfile.experience!];
                              newExp[i] = { ...newExp[i], company: e.target.value };
                              setEditedProfile(p => ({ ...p, experience: newExp }));
                            }}
                            placeholder="Company"
                          />
                          <input
                            type="text"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={exp.duration || ""}
                            onChange={(e) => {
                              const newExp = [...editedProfile.experience!];
                              newExp[i] = { ...newExp[i], duration: e.target.value };
                              setEditedProfile(p => ({ ...p, experience: newExp }));
                            }}
                            placeholder="Duration (e.g. Jan 2020 - Present)"
                          />
                        </div>
                        <textarea
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 min-h-[100px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          value={exp.description || ""}
                          onChange={(e) => {
                            const newExp = [...editedProfile.experience!];
                            newExp[i] = { ...newExp[i], description: e.target.value };
                            setEditedProfile(p => ({ ...p, experience: newExp }));
                          }}
                          placeholder="Bullet points"
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="text-xl font-bold text-gray-900 font-display">
                          {exp.role || exp.title || "Role"}
                        </h4>
                        {exp.company && (
                          <p className="text-[13px] text-blue-600 font-bold mt-2 mb-1">{exp.company}</p>
                        )}
                        {exp.location && (
                          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{exp.location}</p>
                        )}
                        {exp.description && (
                          <ul className="mt-6 space-y-3">
                            {exp.description.split(/(?:\n|•)/).filter(b => b.trim().length > 3).map((bullet, idx) => (
                              <li key={idx} className="group flex flex-col sm:flex-row items-start gap-3 text-[14.5px] text-gray-700 font-medium leading-relaxed hover:text-gray-900 transition-colors">
                                <div className="flex items-start gap-3 w-full">
                                  <Sparkles className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                                  <span className="flex-1">{bullet.trim()}</span>
                                </div>
                                <button
                                  onClick={() => handleRewrite(bullet.trim(), i, idx)}
                                  className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest shrink-0 sm:ml-2 mt-2 sm:mt-0 self-end sm:self-auto cursor-pointer"
                                >
                                  Rewrite
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                  {!isEditing && exp.duration && (
                    <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase bg-gray-50 rounded-full px-3 py-1.5 whitespace-nowrap shrink-0 border border-gray-200 order-1 sm:order-2 mb-2 sm:mb-0">
                      {exp.duration}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {editedProfile.projects && editedProfile.projects.length > 0 && (
        <section>
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 ml-1">Projects</h3>
          <div className="space-y-6">
            {editedProfile.projects.map((proj, i) => (
              <div
                key={i}
                className="relative bg-white border border-emerald-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
                  <div className="min-w-0 flex-1 w-full order-2 sm:order-1">
                    {isEditing ? (
                      <div className="space-y-2 mb-3">
                        <input
                          type="text"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          value={proj.title || ""}
                          onChange={(e) => {
                            const newProj = [...editedProfile.projects!];
                            newProj[i] = { ...newProj[i], title: e.target.value };
                            setEditedProfile(p => ({ ...p, projects: newProj }));
                          }}
                          placeholder="Project Title"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-emerald-600 font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            value={proj.link || ""}
                            onChange={(e) => {
                              const newProj = [...editedProfile.projects!];
                              newProj[i] = { ...newProj[i], link: e.target.value };
                              setEditedProfile(p => ({ ...p, projects: newProj }));
                            }}
                            placeholder="Link URL"
                          />
                          <input
                            type="text"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            value={proj.duration || ""}
                            onChange={(e) => {
                              const newProj = [...editedProfile.projects!];
                              newProj[i] = { ...newProj[i], duration: e.target.value };
                              setEditedProfile(p => ({ ...p, projects: newProj }));
                            }}
                            placeholder="Duration"
                          />
                        </div>
                        <textarea
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 min-h-[100px] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          value={proj.description || ""}
                          onChange={(e) => {
                            const newProj = [...editedProfile.projects!];
                            newProj[i] = { ...newProj[i], description: e.target.value };
                            setEditedProfile(p => ({ ...p, projects: newProj }));
                          }}
                          placeholder="Project description / bullet points"
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="text-xl font-bold text-gray-900 font-display">
                          {proj.title || "Project"}
                        </h4>
                        {proj.link && (
                          <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="text-[13px] text-emerald-600 font-bold mt-2 mb-1 block hover:underline truncate">
                            {proj.link}
                          </a>
                        )}
                        {proj.description && (
                          <ul className="mt-6 space-y-3">
                            {proj.description.split(/(?:\n|•)/).filter(b => b.trim().length > 3).map((bullet, idx) => (
                              <li key={idx} className="group flex items-start gap-3 text-[14.5px] text-gray-700 font-medium leading-relaxed hover:text-gray-900 transition-colors">
                                <Sparkles className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                                <span className="flex-1">{bullet.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                  {!isEditing && proj.duration && (
                    <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase bg-gray-50 rounded-full px-3 py-1.5 whitespace-nowrap shrink-0 border border-gray-200 order-1 sm:order-2 mb-2 sm:mb-0">
                      {proj.duration}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {editedProfile.education && editedProfile.education.length > 0 && (
        <section className="pb-8">
          <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 ml-1">Education</h3>
          <div className="space-y-6">
            {editedProfile.education.map((edu, i) => (
              <div
                key={i}
                className="bg-white border border-indigo-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-indigo-500 to-blue-500" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="space-y-2 mb-3">
                        <input
                          type="text"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          value={edu.institution || edu.school || ""}
                          onChange={(e) => {
                            const newEdu = [...editedProfile.education!];
                            newEdu[i] = { ...newEdu[i], institution: e.target.value };
                            setEditedProfile(p => ({ ...p, education: newEdu }));
                          }}
                          placeholder="Institution / School"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-indigo-600 font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={edu.degree || ""}
                            onChange={(e) => {
                              const newEdu = [...editedProfile.education!];
                              newEdu[i] = { ...newEdu[i], degree: e.target.value };
                              setEditedProfile(p => ({ ...p, education: newEdu }));
                            }}
                            placeholder="Degree"
                          />
                          <input
                            type="text"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={edu.year || ""}
                            onChange={(e) => {
                              const newEdu = [...editedProfile.education!];
                              newEdu[i] = { ...newEdu[i], year: e.target.value };
                              setEditedProfile(p => ({ ...p, education: newEdu }));
                            }}
                            placeholder="Year"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-xl font-bold text-gray-900 font-display">
                          {edu.institution || edu.school || "School"}
                        </h4>
                        {(edu.degree || edu.field) && (
                          <p className="text-[13px] text-indigo-600 font-bold mt-2 mb-1">
                            {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  {!isEditing && edu.year && (
                    <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase bg-gray-50 rounded-full px-3 py-1.5 whitespace-nowrap shrink-0 border border-gray-200">
                      {edu.year}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Rewrite Modal */}
      <AnimatePresence>
        {rewritingBullet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border border-blue-200 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => { setRewritingBullet(null); setVariations(null); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" /> AI STAR Rewriter
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-medium uppercase tracking-widest">
                Situation • Task • Action • Result
              </p>

              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">Original</span>
                <p className="text-sm text-gray-700">{rewritingBullet.bullet}</p>
              </div>

              {!variations ? (
                <div className="flex flex-col items-center justify-center py-12 text-blue-600">
                  <Sparkles className="w-8 h-8 mb-4 animate-pulse" />
                  <p className="text-sm font-bold animate-pulse">Generating high-impact variations...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest block mb-2">Select a Variation</span>
                  {variations.map((v, i) => (
                    <div key={i} className="group relative p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
                      <p className="text-sm text-gray-700 pr-32">{v}</p>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(v)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => applyVariation(v)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};