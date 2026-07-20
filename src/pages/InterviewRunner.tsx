// InterviewRunner.tsx
import { useState } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useInterviewSession } from "../hooks/useInterviewSession";

import ConfirmModal from "../components/ConfirmModal";
import InterviewHeader from "../components/InterviewHeader";
import QuestionSection from "../components/QuestionSection";
import VerbalRecorder from "../components/VerbalRecorder";
import CodeEditorSection from "../components/CodeEditorSection";
import CodeOutputPanel from "../components/CodeOutputPanel";
import AIFeedbackSection from "../components/AIFeedbackSection";
import InterviewLoading from "../components/InterviewLoading";
import WhiteboardModal from "../components/WhiteboardModal";

const InterviewRunner = () => {
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);

    const {
        isRecording,
        recordingTime,
        startRecording,
        stopRecording,
        setRecordingTime
    } = useAudioRecorder();

    const {
        activeSession,
        isLoading,
        sessionMessage,
        currentQuestionIndex,
        currentQuestion,
        selectedLanguage,
        setSelectedLanguage,
        drafts,
        isQuestionLocked,
        isProcessing,
        submittedLocal,
        handleNavigation,
        updateDraftCode,
        updateDraftAudio,
        updateDraftDiagram,
        deleteDraftAudio,
        handleSubmitAnswer,
        confirmFinishInterview
    } = useInterviewSession(stopRecording, setRecordingTime);

    const handleConfirmFinish = async () => {
        if (isFinishing) return;
        setIsFinishing(true);
        setIsFinishModalOpen(false);
        try {
            await confirmFinishInterview();
        } catch (error) {
            console.error("Failed to finish interview:", error);
            setIsFinishing(false);
            alert("Failed to finalize session. Please try again or refresh.");
        }
    };

    if (!activeSession || !activeSession.questions || activeSession.questions.length === 0 || isFinishing) {
        return <InterviewLoading sessionMessage={isFinishing ? "Finalizing Interview..." : sessionMessage} />;
    }

    const currentDraft = drafts[currentQuestionIndex] || {};
    const isCodingQuestion = currentQuestion?.questionType === 'coding';

    return (
        <div className="max-w-7xl mx-auto px-4 pb-32">
            <InterviewHeader
                role={activeSession.role}
                startTime={activeSession.createdAt || activeSession.updatedAt || new Date().toISOString()}
                questions={activeSession.questions}
                currentQuestionIndex={currentQuestionIndex}
                submittedLocal={submittedLocal}
                handleNavigation={handleNavigation}
                handleFinishInterview={() => setIsFinishModalOpen(true)}
                isLoading={isLoading}
                questionsCount={activeSession.questions.length}
                company={activeSession.company}
            />

            <QuestionSection
                index={currentQuestionIndex}
                text={currentQuestion?.questionText || ""}
            />

            {isCodingQuestion ? (
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200/50 p-4">
                        <CodeEditorSection
                            language={selectedLanguage}
                            code={currentDraft.code || ""}
                            isQuestionLocked={isQuestionLocked}
                            setLanguage={setSelectedLanguage}
                            updateCode={updateDraftCode}
                        />
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200/50 p-4">
                        <CodeOutputPanel
                            language={selectedLanguage}
                            code={currentDraft.code || ""}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200/50 p-6">
                        <VerbalRecorder
                            isRecording={isRecording}
                            recordingTime={recordingTime}
                            hasAudio={!!currentDraft.audio}
                            isQuestionLocked={isQuestionLocked}
                            startRecording={() => startRecording(updateDraftAudio)}
                            stopRecording={stopRecording}
                            deleteDraftAudio={deleteDraftAudio}
                        />
                    </div>
                    {currentQuestion?.questionType === 'system-design' && (
                        <div className="flex justify-center mt-2">
                            <button
                                onClick={() => setIsWhiteboardOpen(true)}
                                disabled={isQuestionLocked}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 text-sm font-bold text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
                            >
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                {currentDraft.diagram ? 'Edit Whiteboard Diagram' : 'Open System Design Whiteboard'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isWhiteboardOpen && (
                <WhiteboardModal
                    initialElements={currentDraft.diagramElements}
                    onClose={() => setIsWhiteboardOpen(false)}
                    onSubmit={(blob, elements) => {
                        updateDraftDiagram(blob, elements);
                        setIsWhiteboardOpen(false);
                    }}
                />
            )}

            <div className="mt-8">
                <AIFeedbackSection
                    isEvaluated={!!currentQuestion?.isEvaluated}
                    feedback={currentQuestion?.aiFeedback || ""}
                    score={currentQuestion?.technicalScore || 0}
                    speechMetrics={currentQuestion?.speechMetrics}
                />
            </div>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl p-4 px-6 md:px-12 flex justify-between items-center z-50">
                <button
                    onClick={() => handleNavigation(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="text-gray-500 font-bold text-xs uppercase tracking-wider hover:text-gray-700 disabled:opacity-30 cursor-pointer transition-colors"
                >
                    ← Back
                </button>

                <div className="flex flex-col items-center">
                    {isProcessing && sessionMessage && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-4 py-2 rounded-full animate-pulse border border-blue-200 shadow-sm">
                            {sessionMessage}...
                        </div>
                    )}

                    <button
                        onClick={handleSubmitAnswer}
                        disabled={isQuestionLocked}
                        className={`px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] ${
                            isProcessing 
                                ? 'bg-gray-200 text-gray-500 cursor-wait' 
                                : currentQuestion?.isEvaluated 
                                ? 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600' 
                                : isQuestionLocked 
                                ? 'bg-gray-200 text-gray-500' 
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
                        }`}
                    >
                        {isProcessing ? 'Analyzing...' : currentQuestion?.isEvaluated ? '✓ Submitted' : isQuestionLocked ? 'Locked' : 'Submit Answer'}
                    </button>
                </div>

                <button
                    onClick={() => handleNavigation(currentQuestionIndex + 1)}
                    disabled={currentQuestionIndex === (activeSession?.questions?.length || 0) - 1}
                    className="text-gray-500 font-bold text-xs uppercase tracking-wider hover:text-gray-700 disabled:opacity-30 cursor-pointer transition-colors"
                >
                    Next →
                </button>
            </div>

            <ConfirmModal
                isOpen={isFinishModalOpen}
                title="Finish Interview?"
                message="Are you sure you want to end this interview session? You won't be able to change your answers after this."
                confirmText="Finish"
                cancelText="Keep Going"
                onConfirm={handleConfirmFinish}
                onCancel={() => setIsFinishModalOpen(false)}
                isDanger={false}
            />
        </div>
    );
};

export default InterviewRunner;