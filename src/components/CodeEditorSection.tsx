// CodeEditorSection.tsx
import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { SUPPORTED_LANGUAGES } from "../constants/interview";
import CustomSelect from "./CustomSelect";
import { Code2, Lock, Unlock } from "lucide-react";

interface CodeEditorSectionProps {
    language: string;
    code: string;
    isQuestionLocked: boolean;
    setLanguage: (lang: string) => void;
    updateCode: (code: string | undefined) => void;
}

const CodeEditorSection: React.FC<CodeEditorSectionProps> = ({
    language,
    code,
    isQuestionLocked,
    setLanguage,
    updateCode
}) => {
    // Local state for immediate feedback
    const [localCode, setLocalCode] = useState(code);
    const debounceTimerRef = useRef<number | null>(null);

    // Update local state when the prop changes (e.g. navigation between questions)
    useEffect(() => {
        setLocalCode(code);
    }, [code]);

    const handleCodeChange = (newVal: string | undefined) => {
        if (isQuestionLocked) return;
        
        // 1. Update local state immediately for zero-latency typing
        setLocalCode(newVal ?? "");

        // 2. Clear existing timer
        if (debounceTimerRef.current !== null) {
            window.clearTimeout(debounceTimerRef.current);
        }

        // 3. Set a new timer to update parent state (and localStorage) after 500ms
        debounceTimerRef.current = window.setTimeout(() => {
            updateCode(newVal);
        }, 500);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current !== null) {
                window.clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return (
        <div className="bg-white rounded-3xl border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-300 h-[500px] flex flex-col relative overflow-hidden">
            {/* Status Bar - Locked/Unlocked indicator */}
            <div className={`absolute top-2 right-2 z-20 px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isQuestionLocked 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
                {isQuestionLocked ? (
                    <><Lock size={10} /> Locked</>
                ) : (
                    <><Unlock size={10} /> Editable</>
                )}
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200">
                        <Code2 size={14} className="text-blue-600" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Code Workspace</span>
                    {isQuestionLocked && (
                        <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Read Only
                        </span>
                    )}
                </div>
                <div className="w-44">
                    <CustomSelect 
                        label="" 
                        name="language" 
                        options={SUPPORTED_LANGUAGES} 
                        value={language} 
                        onChange={(_, val) => setLanguage(String(val))} 
                    />
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 relative">
                <MonacoEditor
                    height="100%"
                    language={language}
                    theme="vs-light"
                    value={localCode}
                    onChange={handleCodeChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        readOnly: isQuestionLocked,
                        domReadOnly: isQuestionLocked,
                        automaticLayout: true,
                        fontFamily: 'JetBrains Mono, "Fira Code", monospace',
                        fontLigatures: true,
                        lineNumbers: 'on',
                        renderWhitespace: 'selection',
                        tabSize: 2,
                        insertSpaces: true,
                        bracketPairColorization: { enabled: true },
                        guides: { bracketPairs: true },
                        renderLineHighlight: 'all',
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                        },
                    }}
                />
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between px-5 py-1.5 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-4 text-[9px] text-gray-400 font-medium">
                    <span>Lines: {localCode.split('\n').length}</span>
                    <span>Chars: {localCode.length}</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-400 font-medium">
                    <div className={`w-1.5 h-1.5 rounded-full ${isQuestionLocked ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span>{isQuestionLocked ? 'Locked' : 'Active'}</span>
                </div>
            </div>
        </div>
    );
};

export default CodeEditorSection;