// components/CustomSelect.tsx
import React, { useState, useRef, useEffect } from "react";
import type { Option, CustomSelectProps } from "../types/components";

const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    value,
    onChange,
    name,
    label,
    placeholder,
    searchable = false,
    onSearchChange,
    showAllOptions = false,
    renderOption,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const normalizedOptions: Option[] = options.map(opt => {
        if (typeof opt === 'object') return opt;
        return { label: String(opt), value: opt };
    });

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    // Filter options based on search
    const filteredOptions = normalizedOptions.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val: string | number) => {
        onChange(name, val);
        setIsOpen(false);
        setSearchTerm("");
        if (onSearchChange) onSearchChange("");
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearchChange) onSearchChange(value);
    };

    return (
        <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={containerRef}>
            {label && (
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] ml-1 block mb-2">
                    {label}
                </label>
            )}
            
            <div className="relative">
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 cursor-pointer transition-all hover:border-gray-300 flex items-center justify-between ${
                        isOpen ? 'ring-2 ring-blue-500/30 border-blue-500' : ''
                    }`}
                >
                    <span className="truncate text-gray-900">
                        {selectedOption?.label || placeholder || 'Select...'}
                    </span>
                    <div className={`flex-shrink-0 ml-2 text-gray-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
                    </div>
                </div>

                {isOpen && (
                    <div className="absolute z-50 top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Search Input */}
                        {searchable && (
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 py-2">
                                <div className="relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        placeholder="Search roles..."
                                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSearchTerm("");
                                                if (onSearchChange) onSearchChange("");
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="max-h-60 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    renderOption ? (
                                        renderOption(opt, value)
                                    ) : (
                                        <div
                                            key={String(opt.value)}
                                            onClick={() => handleSelect(opt.value)}
                                            className={`px-4 py-3 text-sm font-medium cursor-pointer transition-colors ${
                                                opt.value === value 
                                                    ? 'bg-blue-50 text-blue-600' 
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            {opt.label}
                                        </div>
                                    )
                                ))
                            ) : (
                                <div className="px-4 py-6 text-center text-sm text-gray-400">
                                    No matching roles found
                                    <button
                                        onClick={() => {
                                            const customValue = `custom-${searchTerm}`;
                                            // Add custom option
                                            const newOption = { label: `Add "${searchTerm}"`, value: customValue };
                                            // @ts-ignore - we're extending options
                                            options.push(newOption);
                                            handleSelect(customValue);
                                        }}
                                        className="block mx-auto mt-2 text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Add "{searchTerm}" as custom role
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomSelect;