"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Users, Activity, Menu, X, ArrowRight, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const currentUser = useAppStore((state) => state.currentUser);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  if (!mounted) return null;

  if (currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* Navbar Premium */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                RedGeográfica.
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#caracteristicas" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Características
              </a>
              <a href="#como-funciona" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                ¿Cómo funciona?
              </a>

              <div className="flex items-center gap-4 ml-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-full text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Ingreso a Plataforma
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-4 duration-200">
            <a href="#caracteristicas" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 bg-gray-50 rounded-md">
              Características
            </a>
            <a href="#como-funciona" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 bg-gray-50 rounded-md">
              ¿Cómo funciona?
            </a>
            <div className="pt-4 flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full flex justify-center py-3 text-base font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-xl"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="w-full flex justify-center py-3 text-base font-medium text-white bg-gray-900 rounded-xl shadow-md"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white opacity-70"></div>
          {/* Decorative mesh pattern (Using SVG data URI for simplicity) */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100/50 text-blue-700 text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            Plataforma lista para líderes comunitarios
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            Construye tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">red de influencia</span> en todo Panamá.
          </h1>

          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Registra, organiza y escala tu base de personas organizadas jerárquicamente por Provincias, Distritos y Corregimientos con un solo enlace.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-1 group"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="caracteristicas" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Diseñado para la escala organizativa</h2>
            <p className="mt-4 text-lg text-gray-500">Herramientas poderosas empaquetadas en una interfaz simple.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="group relative p-8 bg-gray-50 rounded-3xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors duration-300">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Jerarquía Automática</h3>
              <p className="text-gray-500 leading-relaxed">
                Tus afiliados heredan tu ubicación geopolítica automáticamente al registrarse usando tu enlace único.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 bg-gray-50 rounded-3xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors duration-300">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Geolocalización Precise</h3>
              <p className="text-gray-500 leading-relaxed">
                Estructura de bases de datos nacional que cubre todas las provincias, distritos y corregimientos de Panamá.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 bg-gray-50 rounded-3xl hover:bg-teal-50 border border-transparent hover:border-teal-100 transition-colors duration-300">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-7 w-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Métricas en Tiempo Real</h3>
              <p className="text-gray-500 leading-relaxed">
                Visualiza el crecimiento de tu red desde tu panel de control con indicadores de rendimiento instantáneos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works Section - Split Layout */}
      <div id="como-funciona" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">

            <div className="mb-12 lg:mb-0">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-6">
                Crece tu estructura en <br /><span className="text-blue-600">tres simples pasos</span>.
              </h2>
              <p className="text-lg text-gray-500 mb-8">
                El sistema se encarga de organizar los datos mientras tú te concentras en traer a más personas.
              </p>

              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Crea tu cuenta base</h4>
                    <p className="mt-1 text-gray-500">Regístrate como líder seleccionando tu ubicación exacta en el país.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Comparte tu Link</h4>
                    <p className="mt-1 text-gray-500">Copia tu código de afiliación único desde tu Dashboard y envíalo.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Revisa tus métricas</h4>
                    <p className="mt-1 text-gray-500">Monitorea a los nuevos afiliados listados en tu Directorio de Red.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Visual Dashboard Mockup placeholder */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-indigo-200 transform rounded-3xl -rotate-6 scale-105 opacity-50 blur-lg"></div>
              <div className="relative rounded-3xl bg-white border border-gray-200 shadow-2xl p-2">
                <div className="h-8 flex items-center border-b border-gray-100 px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="flex-1 bg-gray-50 rounded text-[10px] text-center py-1 text-gray-400 ml-4 font-mono">dashboard / afiliados</div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-24 bg-blue-600 rounded-lg shadow-sm"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col justify-center px-4">
                      <div className="h-4 w-16 bg-blue-200 rounded mb-2"></div>
                      <div className="h-8 w-8 bg-blue-600 rounded"></div>
                    </div>
                    <div className="h-24 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-center px-4">
                      <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 w-12 bg-gray-400 rounded"></div>
                    </div>
                  </div>
                  <div className="h-40 bg-gray-50 border border-gray-100 rounded-2xl mt-4"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer minimalista */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-gray-400" />
            <span className="font-semibold text-gray-900 tracking-tight">RedGeográfica.</span>
          </div>
          <p className="text-gray-500 text-sm text-center">
            Versión 1.0 (MVP) • Diseñado para la acción comunitaria de Panamá.
          </p>
        </div>
      </footer>
    </div>
  );
}
