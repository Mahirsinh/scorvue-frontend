// components/NewInterviewForm.tsx
import React, { useState, useEffect, useMemo } from "react";
import { ROLE_CATEGORIES, LEVELS, TYPES, COUNTS } from "../constants/interview";
import CustomSelect from "./CustomSelect";
import { COMPANIES } from "../constants/companies";
import type { NewInterviewFormProps } from "../types/forms";
import type { ResumeData } from "../features/resume/types";
import { getUserResumes } from "../services/resumeApi";
import { toast } from "react-toastify";
import {
  RocketLaunchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CodeBracketIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  MegaphoneIcon,
  HeartIcon,
  ScaleIcon,
  AcademicCapIcon,
  UsersIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, any> = {
  coding: CodeBracketIcon,
  finance: CurrencyDollarIcon,
  business: BuildingOfficeIcon,
  marketing: MegaphoneIcon,
  healthcare: HeartIcon,
  legal: ScaleIcon,
  education: AcademicCapIcon,
  consulting: UsersIcon,
  hr: UserGroupIcon,
  engineering: WrenchScrewdriverIcon,
  architecture: HomeIcon,
};

// The one category treated as a technical / IT track. Every other stream
// is a conversational (oral) interview only — there is no code round to mix in.
const IT_CATEGORY_ID = "coding";

// Finds the "oral only" style option from the TYPES constant regardless of
// how it happens to be labeled/valued upstream, with a safe fallback so the
// form never breaks if TYPES changes shape.
const resolveOralOnlyOption = () => {
  const match = TYPES.find((t: { label: string; value: string }) =>
    `${t.label} ${t.value}`.toLowerCase().includes("oral")
  );
  return match ?? TYPES[0] ?? { label: "Oral Only", value: "oral-only" };
};

const NewInterviewForm: React.FC<NewInterviewFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isProcessing,
}) => {
  const handleCustomChange = (name: string, value: string | number) => {
    onChange({ target: { name, value } });
  };

  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(IT_CATEGORY_ID);
  const [resumesLoading, setResumesLoading] = useState(true);

  const oralOnlyOption = useMemo(() => resolveOralOnlyOption(), []);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const { data } = await getUserResumes();
        setResumes(data.filter((r: ResumeData) => r.status === "completed" || r.parsedData));
      } catch (error) {
        console.error("Failed to fetch resumes:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            setResumesLoading(false);
            return;
          }
        }
        toast.error("Failed to load your resumes. Please try again later.");
      } finally {
        setResumesLoading(false);
      }
    };
    fetchResumes();
  }, []);

  // Auto-select first category's first role as default
  useEffect(() => {
    if (!formData.role && ROLE_CATEGORIES.length > 0) {
      const defaultCategory = ROLE_CATEGORIES[0];
      if (defaultCategory.subRoles.length > 0) {
        handleCustomChange("role", defaultCategory.subRoles[0].value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resumeOptions = [
    { label: "None (Standard Interview)", value: "" },
    ...resumes.map((r) => ({ label: r.originalFilename || "Unnamed Resume", value: r._id })),
  ];

  const companyOptions = Object.values(COMPANIES).map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const selectedCompany = COMPANIES[formData.company || "general"];
  const trackOptions = selectedCompany?.tracks.map((t) => ({
    label: t.name,
    value: t.id,
  })) || [{ label: "General", value: "general" }];

  // Get all roles as flat options for the dropdown
  const allRoleOptions = useMemo(() => {
    return ROLE_CATEGORIES.flatMap((category) =>
      category.subRoles.map((role) => ({
        label: role.label,
        value: role.value,
        category: category.id,
        isCoding: role.isCoding,
      }))
    );
  }, []);

  // Get selected category
  const currentCategory = ROLE_CATEGORIES.find((c) => c.id === selectedCategory) || ROLE_CATEGORIES[0];

  // Check if selected role is coding
  const selectedRole = allRoleOptions.find((r) => r.value === formData.role);
  const isCodingRole = selectedRole?.isCoding ?? false;

  // Only the IT / coding track gets a format choice. Every other stream is a
  // pure conversational (oral) interview — there's nothing to "mix" a code
  // round into, so the selector is not just disabled, it never renders.
  const isItTrack = selectedCategory === IT_CATEGORY_ID && isCodingRole;

  // Determine if coding mix should be shown
  const showCodingMix = formData.interviewType === "coding-mix" && isCodingRole;

  // Keep the underlying interviewType in sync: force it to "oral only" the
  // moment the person is on a non-IT stream, so the field is always correct
  // even though it's hidden from view.
  useEffect(() => {
    if (!isItTrack && formData.interviewType !== oralOnlyOption.value) {
      handleCustomChange("interviewType", oralOnlyOption.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isItTrack, oralOnlyOption.value]);

  // Step icon chips reuse the dashboard's pastel-on-white palette: blue for
  // the field/role choice, purple for format, amber for the target/company step.
  const stepChip = (tone: "blue" | "purple" | "amber") => {
    const tones = {
      blue: "bg-blue-50 text-blue-600 ring-blue-100",
      purple: "bg-indigo-50 text-indigo-600 ring-indigo-100",
      amber: "bg-amber-50 text-amber-600 ring-amber-100",
    } as const;
    return `flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${tones[tone]}`;
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 opacity-0 blur-xl transition duration-700 group-hover:opacity-100" />

      <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-lg shadow-gray-200/50">
        {/* Gradient accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 shadow-lg shadow-blue-500/30">
              <RocketLaunchIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="flex flex-wrap items-center gap-2 text-xl font-bold text-gray-900">
                <span>Set up your interview</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  AI-Powered
                </span>
              </h2>
              <p className="text-sm text-gray-500">A few quick choices and your practice session is ready.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Free trial included
          </span>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-8">
          {/* Step 1 — Role */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <span className={stepChip("blue")}>
                <BuildingOfficeIcon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Choose your field</h3>
                <p className="text-xs text-gray-500">This decides which questions and format fit you.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ROLE_CATEGORIES.map((category) => {
                const Icon = CATEGORY_ICONS[category.id] || BuildingOfficeIcon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      if (category.subRoles.length > 0) {
                        handleCustomChange("role", category.subRoles[0].value);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-gray-400"}`} />
                    {category.label.split(" ").slice(1).join(" ")}
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              <CustomSelect
                label="Specific role"
                name="role"
                options={allRoleOptions.map((r) => ({
                  label: r.label,
                  value: r.value,
                  category: r.category,
                }))}
                value={formData.role}
                onChange={handleCustomChange}
                searchable={true}
                renderOption={(option, currentValue) => {
                  const roleData = allRoleOptions.find((r) => r.value === option.value);
                  const category = ROLE_CATEGORIES.find((c) => c.id === roleData?.category);
                  return (
                    <div
                      key={String(option.value)}
                      onClick={() => handleCustomChange("role", option.value)}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                        option.value === currentValue
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span>{option.label}</span>
                      {category && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                          {category.label.split(" ").slice(1).join(" ")}
                        </span>
                      )}
                    </div>
                  );
                }}
              />
            </div>
          </div>

          <div className="mb-8 h-px w-full bg-gray-100" />

          {/* Step 2 — Format */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <span className={stepChip("purple")}>
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Format &amp; length</h3>
                <p className="text-xs text-gray-500">
                  {isItTrack
                    ? "Technical roles can include a live coding round."
                    : "This track runs as a spoken, conversational interview."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <CustomSelect
                label="Experience level"
                name="level"
                options={LEVELS}
                value={formData.level}
                onChange={handleCustomChange}
              />

              <CustomSelect
                label="Question count"
                name="count"
                options={COUNTS.map((c) => ({ label: `${c} questions`, value: c }))}
                value={formData.count}
                onChange={handleCustomChange}
              />

              {/* Interview Type — only a real choice on the IT / coding track.
                  Every other field is spoken-only, so the control is fully
                  removed from the form rather than shown disabled. */}
              {isItTrack ? (
                <CustomSelect
                  label="Interview type"
                  name="interviewType"
                  options={TYPES}
                  value={formData.interviewType}
                  onChange={handleCustomChange}
                />
              ) : (
                <div>
                  <label className="ml-1 mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    Interview type
                  </label>
                  <div className="flex h-[46px] items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 px-4">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 shrink-0 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">{oralOnlyOption.label}</span>
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-blue-500 ring-1 ring-inset ring-blue-100">
                      <CheckCircleIcon className="h-3 w-3" />
                      Set automatically
                    </span>
                  </div>
                </div>
              )}

              {/* Coding Mix note — only shown when coding role AND coding-mix is selected */}
              {showCodingMix && (
                <div className="md:col-span-2 lg:col-span-1">
                  <div className="flex h-full items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                      <CodeBracketIcon className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-700">Coding round included</p>
                      <p className="mt-0.5 text-xs text-indigo-600/80">
                        Live technical questions will be mixed into your interview.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 h-px w-full bg-gray-100" />

          {/* Step 3 — Company & Resume */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <span className={stepChip("amber")}>
                <BuildingOfficeIcon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Target &amp; personalize</h3>
                <p className="text-xs text-gray-500">Tailor questions to a company, and add your resume if you'd like.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <CustomSelect
                label="Target company"
                name="company"
                options={companyOptions}
                value={formData.company || "general"}
                onChange={(_, value) => {
                  handleCustomChange("company", value);
                  const companyObj = COMPANIES[value as string];
                  if (companyObj && companyObj.tracks.length > 0) {
                    handleCustomChange("companyTrack", companyObj.tracks[0].id);
                  } else {
                    handleCustomChange("companyTrack", "general");
                  }
                }}
              />

              <CustomSelect
                label="Company track"
                name="companyTrack"
                options={trackOptions}
                value={formData.companyTrack || "general"}
                onChange={handleCustomChange}
              />

              <CustomSelect
                label="Resume (optional)"
                name="resumeId"
                options={resumeOptions}
                value={formData.resumeId || ""}
                onChange={handleCustomChange}
                placeholder={resumesLoading ? "Loading resumes…" : undefined}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isProcessing}
            className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 text-sm font-bold tracking-wide text-white transition-all duration-300 active:scale-[0.98] ${
              isProcessing
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : "cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-0.5"
            }`}
          >
            {isProcessing ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Preparing your session…</span>
              </>
            ) : (
              <>
                <RocketLaunchIcon className="h-5 w-5 text-white" />
                <span>Start interview</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          {!isProcessing && (
            <p className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-xs text-gray-500">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-gray-400" />
              <span>Your data is encrypted and never shared</span>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewInterviewForm;