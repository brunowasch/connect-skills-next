import React, { useState, useRef, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
    defaultOpen?: boolean;
    inline?: boolean;
    direction?: 'up' | 'down';
    disablePastDates?: boolean;
}

export function DatePicker({ value, onChange, placeholder, className = "", defaultOpen = false, inline = false, direction = 'down', disablePastDates = false }: DatePickerProps) {
    const { t } = useTranslation();

    const daysOfWeek = t('datepicker_days_short', { defaultValue: ["D", "S", "T", "Q", "Q", "S", "S"], returnObjects: true }) as string[];
    const monthNames = t('datepicker_months', { defaultValue: [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ], returnObjects: true }) as string[];
    const dayNames = t('datepicker_days', { defaultValue: [
        "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
        "Quinta-feira", "Sexta-feira", "Sábado"
    ], returnObjects: true }) as string[];

    const finalPlaceholder = placeholder || t('datepicker_placeholder', "Selecione a data");

    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    // Convert YYYY-MM-DD to Date object safely
    const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        const [year, month, day] = dateStr.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };

    const initialDate = parseDate(value);
    const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (value) {
            const date = parseDate(value);
            setCurrentMonth(date.getMonth());
            setCurrentYear(date.getFullYear());
        }
    }, [value]);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((prev) => prev - 1);
        } else {
            setCurrentMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((prev) => prev + 1);
        } else {
            setCurrentMonth((prev) => prev + 1);
        }
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(currentYear, currentMonth, day);
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        onChange(`${yyyy}-${mm}-${dd}`);
        setIsOpen(false);
    };

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

    // Format selected date for display
    let displayDate = finalPlaceholder;
    let selectedDayName = "";
    let selectedMonthName = "";
    let selectedYearNum = currentYear;
    let selectedDayNum = 1;

    if (value) {
        const d = parseDate(value);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        displayDate = `${dd}/${mm}/${yyyy}`;
        
        selectedDayName = dayNames[d.getDay()];
        selectedMonthName = monthNames[d.getMonth()];
        selectedYearNum = yyyy;
        selectedDayNum = d.getDate();
    }

    const panel = (
        <div className={`p-4 rounded-2xl bg-white border border-slate-200 w-full max-w-[320px] mx-auto animate-in fade-in zoom-in-95 duration-200 ${inline ? 'shadow-sm' : `absolute z-[9999] left-0 shadow-2xl ${direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`}`}>
            <div className="mb-4 pb-4 border-b border-slate-100">
                <div className="text-slate-500 text-sm font-medium">{selectedDayName || t('datepicker_select', 'Selecione')}</div>
                <div className="text-slate-900 text-2xl font-bold mt-1">
                    {selectedMonthName || t('datepicker_date', 'Data')} {value ? `${selectedDayNum}, ${selectedYearNum}` : ''}
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <button 
                    type="button" 
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                    <FiChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-slate-900 font-bold text-[15px]">
                    {monthNames[currentMonth]} {currentYear}
                </span>
                <button 
                    type="button" 
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                    <FiChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {daysOfWeek.map((day, i) => (
                    <div key={i} className="text-center text-xs font-bold text-slate-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
                {blanksArray.map((_, i) => (
                    <div key={`blank-${i}`} className="w-9 h-9 mx-auto" />
                ))}
                {daysArray.map((day) => {
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = value === dateStr;
                    
                    const today = new Date();
                    const isToday = 
                        day === today.getDate() && 
                        currentMonth === today.getMonth() && 
                        currentYear === today.getFullYear();

                    const todayZeros = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const currentBtnDate = new Date(currentYear, currentMonth, day);
                    const isPast = disablePastDates && currentBtnDate < todayZeros;

                    return (
                        <button
                            key={day}
                            type="button"
                            disabled={isPast}
                            onClick={() => !isPast && handleDateClick(day)}
                            className={`
                                w-9 h-9 mx-auto flex items-center justify-center rounded-full text-sm font-semibold transition-all
                                ${isPast
                                    ? 'text-slate-300 cursor-not-allowed opacity-50'
                                    : 'cursor-pointer'
                                }
                                ${!isPast && isSelected 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold scale-105 hover:bg-blue-700' 
                                    : !isPast && isToday
                                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                        : !isPast
                                            ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            : ''
                                }
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    if (inline) return panel;

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 outline-none transition-all cursor-pointer flex items-center justify-between shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-slate-400" />
                    <span>{value ? displayDate : finalPlaceholder}</span>
                </div>
            </div>

            {isOpen && panel}
        </div>
    );
}
