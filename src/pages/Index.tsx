import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { coffeeMethods } from "@/data/coffeeData";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, Coffee } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { MethodStatus } from '@/types/supabase';
import { fetchMethodStatuses } from '@/queries/admin';

const Index = () => {
  const { language, t, dir } = useLanguage();

  const { data: methodStatuses, isLoading } = useQuery<MethodStatus[]>({
      queryKey: ['methodStatuses'],
      queryFn: fetchMethodStatuses,
  });

  const activeMethods = useMemo(() => {
      if (!methodStatuses) return coffeeMethods.filter(m => !m.subMethods);

      const statusMap = new Map(methodStatuses.map(s => [s.method_id, s.is_active]));

      return coffeeMethods.filter(method => {
          const isActive = statusMap.get(method.id) ?? true;
          if (!isActive) return false;

        if (method.subMethods) {
            return method.subMethods.some(sm => statusMap.get(sm.id) ?? true);
        }
        return true;
    });
  }, [methodStatuses]);

  return (
      <div
          className="relative min-h-screen overflow-hidden bg-[#0f0a08] text-foreground"
          dir={dir}
      >
          <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />
              <div className="absolute top-40 left-[-80px] h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%),linear-gradient(to_bottom,rgba(15,10,8,0.65),rgba(15,10,8,0.92))]" />
          </div>

          <div className="relative z-10">
              <div className="container mx-auto px-4 sm:px-8">
                  <header className="page-enter relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-10 pt-10 pb-8 lg:flex-row lg:pt-16">
                      <div className="max-w-2xl text-center lg:text-start">
                          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 shadow-lg backdrop-blur-md">
                              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                              Crafted coffee experiences
                          </div>

                          <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl font-kufam">
                              {t('main_title')}
                              <sup className="ml-1 align-top">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-400/70 text-[10px] font-bold text-amber-300">
                                      TM
                                  </span>
                              </sup>
                          </h1>

                          <p className="mt-5 max-w-xl text-lg text-white/70 sm:text-xl">
                              {t('main_subtitle')}
                          </p>

                          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                              <a
                                  href="#methods"
                                  className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-[#1a120d] shadow-lg shadow-amber-400/20 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-amber-300"
                              >
                                  Explore coffee methods
                              </a>
                              <a
                                  href="#featured"
                                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white/90 backdrop-blur-md transition-colors duration-300 hover:bg-white/10"
                              >
                                  Discover the blend
                              </a>
                          </div>
                      </div>

                      <div className="relative flex w-full max-w-md items-center justify-center">
                          <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-2xl animate-pulse" />

                          <div className="relative w-full rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                              <div className="mb-6 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <div className="rounded-2xl bg-amber-400/15 p-3">
                                          <Coffee className="h-7 w-7 text-amber-300" />
                                      </div>
                                      <div>
                                          <p className="text-sm text-white/50">Brew signature</p>
                                          <h3 className="text-xl font-semibold text-white">Coffee Journey</h3>
                                      </div>
                                  </div>
                                  <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
                                      Live
                                  </div>
                              </div>

                              <div className="relative mx-auto flex h-72 items-center justify-center">
                                  <svg
                                      viewBox="0 0 320 320"
                                      className="absolute inset-0 h-full w-full"
                                      aria-hidden="true"
                                  >
                                      <defs>
                                          <linearGradient id="cupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                              <stop offset="0%" stopColor="#f5d0a2" />
                                              <stop offset="50%" stopColor="#c67c3a" />
                                              <stop offset="100%" stopColor="#7a3f18" />
                                          </linearGradient>
                                          <linearGradient id="steamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                                              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                          </linearGradient>
                                      </defs>

                                      <g opacity="0.95">
                                          <path
                                              d="M110 210c0 28 22 50 50 50s50-22 50-50v-54H110v54z"
                                              fill="url(#cupGradient)"
                                              opacity="0.95"
                                          />
                                          <path
                                              d="M95 160h150c0 30-17 55-42 68H137c-25-13-42-38-42-68z"
                                              fill="#2c1b12"
                                              opacity="0.95"
                                          />
                                          <path
                                              d="M92 160h156c7 0 12 5 12 12v3c0 7-5 12-12 12H92c-7 0-12-5-12-12v-3c0-7 5-12 12-12z"
                                              fill="#f2d3b1"
                                          />
                                          <path
                                              d="M250 175h12c15 0 28 12 28 28s-13 28-28 28h-14"
                                              fill="none"
                                              stroke="#f2d3b1"
                                              strokeWidth="12"
                                              strokeLinecap="round"
                                          />
                                          <path
                                              d="M88 236c0 8 6 14 14 14h116c8 0 14-6 14-14"
                                              fill="none"
                                              stroke="#f2d3b1"
                                              strokeWidth="10"
                                              strokeLinecap="round"
                                          />
                                      </g>

                                      <g>
                                          <path
                                              d="M127 92c12-12 10-27 0-39"
                                              fill="none"
                                              stroke="url(#steamGradient)"
                                              strokeWidth="7"
                                              strokeLinecap="round"
                                          >
                                              <animate
                                                  attributeName="d"
                                                  dur="2.8s"
                                                  repeatCount="indefinite"
                                                  values="
                            M127 92c12-12 10-27 0-39;
                            M127 92c16-12 8-27 0-39;
                            M127 92c12-12 10-27 0-39
                          "
                                              />
                                          </path>
                                          <path
                                              d="M160 82c12-12 10-27 0-39"
                                              fill="none"
                                              stroke="url(#steamGradient)"
                                              strokeWidth="7"
                                              strokeLinecap="round"
                                          >
                                              <animate
                                                  attributeName="d"
                                                  dur="3.2s"
                                                  repeatCount="indefinite"
                                                  values="
                            M160 82c12-12 10-27 0-39;
                            M160 82c18-11 8-27 0-39;
                            M160 82c12-12 10-27 0-39
                          "
                                              />
                                          </path>
                                          <path
                                              d="M193 92c12-12 10-27 0-39"
                                              fill="none"
                                              stroke="url(#steamGradient)"
                                              strokeWidth="7"
                                              strokeLinecap="round"
                                          >
                                              <animate
                                                  attributeName="d"
                                                  dur="2.9s"
                                                  repeatCount="indefinite"
                                                  values="
                            M193 92c12-12 10-27 0-39;
                            M193 92c15-11 8-27 0-39;
                            M193 92c12-12 10-27 0-39
                          "
                                              />
                                          </path>
                                      </g>
                                  </svg>

                                  <div className="absolute bottom-8 left-8 h-4 w-4 rounded-full bg-amber-300/90 shadow-[0_0_25px_rgba(251,191,36,0.7)] animate-bounce" />
                                  <div className="absolute right-10 top-10 h-3 w-3 rounded-full bg-orange-200/80 shadow-[0_0_25px_rgba(255,237,213,0.6)] animate-[ping_2.6s_ease-in-out_infinite]" />
                                  <div className="absolute left-10 top-16 h-2.5 w-2.5 rounded-full bg-white/70 shadow-[0_0_20px_rgba(255,255,255,0.6)] animate-[float_5s_ease-in-out_infinite]" />
                              </div>

                              <p className="mt-2 text-center text-sm text-white/60">
                                  A warm, immersive coffee experience designed to feel alive.
                              </p>
                          </div>
                      </div>
                  </header>

                  <main className="pb-16">
                      <section id="featured" className="mb-16">
                          <Link
                              to="/functional-blends"
                              className="group mx-auto flex w-full max-w-5xl items-center justify-between gap-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="rounded-2xl bg-amber-400/15 p-4">
                                      <Coffee className="h-8 w-8 text-amber-300 transition-transform duration-300 group-hover:scale-110" />
                                  </div>
                                  <div>
                                      <h2 className="text-2xl font-semibold text-white sm:text-3xl font-kufam">
                                          {t('functional_blends_link_title')}
                    </h2>
                                      <p className="mt-1 text-sm text-white/55">
                                          Open the signature functional blends experience
                                      </p>
                                  </div>
                              </div>

                              <div className="hidden h-12 w-12 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-2xl text-amber-300 sm:flex">
                                  →
                </div>
                          </Link>
                      </section>

                      <section id="methods">
                          <div className="mb-8 text-center">
                              <h2 className="text-3xl font-semibold text-white sm:text-4xl font-kufam">
                                  {t('main_choose_method')}
                              </h2>
                              <p className="mt-3 text-white/60">
                                  Choose the brewing path that matches your mood and ritual.
                              </p>
                          </div>

                          {isLoading ? (
                              <div className="flex justify-center items-center py-20">
                                  <Loader2 className="h-12 w-12 animate-spin text-amber-300" />
                              </div>
                          ) : (
                                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                      {activeMethods.map((method, index) => {
                                          const Icon = method.icon;

                      return (
                        <Link
                            to={`/method/${method.id}`}
                            key={method.id}
                            className="group focus:outline-none focus:ring-2 focus:ring-amber-300/70 rounded-[1.5rem]"
                            style={{
                                animationDelay: `${index * 80}ms`,
                            }}
                        >
                            <Card className="relative h-full overflow-hidden border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/10">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_40%),linear-gradient(to_bottom_right,rgba(255,255,255,0.08),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <CardHeader className="relative flex flex-col items-center p-6 text-center">
                                    <div className="mb-4 rounded-3xl border border-amber-400/15 bg-amber-400/10 p-5 shadow-lg shadow-amber-400/10 transition-transform duration-300 group-hover:scale-105">
                                        <Icon className="h-10 w-10 text-amber-300" />
                                    </div>
                                    <CardTitle className="text-2xl font-kufam text-white">
                                        {method.name[language]}
                                    </CardTitle>
                                </CardHeader>
                                  <CardContent className="relative px-6 pb-7 text-center">
                                      <p className="text-sm leading-7 text-white/65">
                                          {method.description[language]}
                                      </p>
                                  </CardContent>
                              </Card>
                          </Link>
                      );
                  })}
                              </div>
                          )}
                      </section>
                  </main>

                  <footer className="pb-10 text-center text-sm text-white/40">
                      {/* Made with Dyad component removed */}
                  </footer>
              </div>
          </div>

          <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default Index;