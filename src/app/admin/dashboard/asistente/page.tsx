"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function AsistentePage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Mensaje de bienvenida inicial
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: "welcome",
                    role: "assistant",
                    content: "¡Hola! Soy el asistente administrativo de Acción Comunitaria. Puedo ayudarte con:\n\n• Buscar personas por nombre o cédula\n• Ver estadísticas del sistema\n• Consultar información geográfica\n• Listar líderes y sus afiliados\n\n¿En qué puedo ayudarte?",
                    timestamp: new Date(),
                },
            ]);
        }
    }, [messages.length]);

    // Auto-scroll al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-resize del textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch("/api/agent/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: userMessage.content }],
                }),
            });

            if (!response.ok) {
                throw new Error("Error al conectar con el asistente");
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: data.response?.message || "No pude procesar tu solicitud.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            console.error("Chat error:", err);
            setError("No se pudo conectar con el asistente. Verifica que Ollama esté ejecutándose.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Asistente Administrativo</h1>
                        <p className="text-sm text-slate-500">Powered by AI - Ollama + Qwen2.5</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {message.role === "assistant" && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                    message.role === "user"
                                        ? "bg-slate-900 text-white rounded-tr-sm"
                                        : "bg-slate-100 text-slate-800 rounded-tl-sm"
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p
                                    className={`text-[10px] mt-1 ${
                                        message.role === "user" ? "text-slate-400" : "text-slate-400"
                                    }`}
                                >
                                    {message.timestamp.toLocaleTimeString("es-PA", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                            {message.role === "user" && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Pensando...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-100 p-4 bg-slate-50 rounded-b-2xl">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Escribe tu mensaje..."
                                rows={1}
                                className="w-full px-4 py-3 text-sm text-slate-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 resize-none transition-all"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="px-4 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <Send className="h-4 w-4" />
                            <span className="hidden sm:inline">Enviar</span>
                        </button>
                    </form>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                        Presiona Enter para enviar, Shift+Enter para nueva línea
                    </p>
                </div>
            </div>
        </div>
    );
}