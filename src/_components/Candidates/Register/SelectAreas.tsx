"use client";

import { useState, useMemo } from "react";
import skillsData from "@/src/data/skills.json";
import { FiSearch } from "react-icons/fi";

export function SelectAreas() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    if (newSkill.trim()) {
      const skillName = newSkill.trim();
      if (!customSkills.includes(skillName) && !skillsData.Skills.includes(skillName)) {
        setCustomSkills((prev) => [...prev, skillName]);
        setSelectedSkills((prev) => [...prev, skillName]);
      }
      setNewSkill("");
      setIsModalOpen(false);
    }
  };

  const allSkills = useMemo(() => [...skillsData.Skills, ...customSkills].sort(), [customSkills]);

  const filteredSkills = allSkills.filter((skill) =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-7xl mx-auto">
      <div className="text-center align-center space-y-2">
        <h1 className="text-3xl text-gray-900 font-bold">
          Quais são suas especialidades?
        </h1>
        <p className="text-sm text-gray-500">
          Selecione as habilidades para adicionar ao seu perfil.
        </p>
      </div>

      <div className="w-full max-w-md flex gap-2 items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar habilidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Grid de habilidades */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full p-4">
        {filteredSkills.map((skill) => (
          <button
            key={skill}
            onClick={() => toggleSkill(skill)}
            className={`p-3 rounded-lg text-sm text-left transition-all duration-200 border cursor-pointer ${selectedSkills.includes(skill)
              ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
          >
            {skill}
          </button>
        ))}

        <button
          onClick={() => setIsModalOpen(true)}
          className="p-3 rounded-lg text-sm text-left transition-all duration-200 border bg-white text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50 font-medium"
        >
          + Outro
        </button>
      </div>

      {filteredSkills.length === 0 && searchTerm && (
        <p className="col-span-full text-center text-gray-500 py-8">
          Nenhuma habilidade encontrada para "{searchTerm}"
        </p>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Adicionar nova habilidade</h3>
              <p className="text-sm text-gray-500 mb-4">
                Digite o nome da habilidade que deseja adicionar.
              </p>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Ex: React, Design..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCustomSkill}
                  disabled={!newSkill.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-end px-10 z-40">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <span className="text-gray-600 font-medium">
            {selectedSkills.length} habilidades selecionadas
          </span>
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
              Continuar
            </button>
            {selectedSkills.length > 0 && (
              <button
                onClick={() => setSelectedSkills([])}
                className="px-6 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md font-medium transition-colors border border-red-200 cursor-pointer"
                title="Limpar seleção"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="h-20"></div>
    </div>
  );
}
