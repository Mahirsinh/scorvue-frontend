import type { Session, Question } from "./session";
import type { MouseEvent as ReactMouseEvent } from "react";

/**
 * Props for the confirmation modal dialog.
 */
export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

/**
 * Props for the dashboard session card.
 */
export interface SessionCardProps {
    session: Session;
    onClick: (session: Session) => void;
    onDelete: (e: ReactMouseEvent<HTMLButtonElement | HTMLDivElement>, sessionId: string) => void;
}

/**
 * Props for the individual feedback item in the review page.
 */
export interface FeedbackItemProps {
    question: Question;
    index: number;
}

/**
 * Standard generic option for select components.
 */
export interface Option {
    label: string;
    value: string | number;
    category?: string;
    isCoding?: boolean;
}


/**
 * Props for the specialized CustomSelect UI component.
 */
export interface CustomSelectProps {
    options: (string | Option)[];
    value: string | number;
    onChange: (name: string, value: string | number) => void;
    name: string;
    label?: string;
    placeholder?: string;
    searchable?: boolean;
    onSearchChange?: (term: string) => void;
    showAllOptions?: boolean;
    renderOption?: (option: Option, currentValue: string | number) => React.ReactNode;
}
