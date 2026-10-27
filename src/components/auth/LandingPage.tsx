import React from 'react';
import { Music, Shield, Volume2, FileText, ArrowRight, Check } from 'lucide-react';

interface LandingPageProps {
  onGoToSignUp: () => void;
  onGoToLogIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToSignUp,
  onGoToLogIn,
}) => {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <Music className="h-4 w-4" />
            </div>
            <span className="font-cinzel text-lg font-bold tracking-wider text-neutral-900">
              CANTORIA
            </span>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onGoToLogIn}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGoToSignUp}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col items-center text-center">
        {/* Subtle Category Kicker */}
        <div className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3 font-mono-num">
          Multi-Tenant Choral Platform
        </div>

        {/* Hero Title */}
        <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 max-w-3xl leading-[1.15]">
          The Digital Repertoire Hub for Church Choirs
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-neutral-600 max-w-2xl leading-relaxed">
          Manage, search, and rehearse your sacred choir catalog with pure clarity.
          Strict tenant isolation ensures every congregation’s sheet music, audio tracks, and favorites remain entirely private.
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onGoToSignUp}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
          >
            <span>Register Your Choir</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onGoToLogIn}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-medium text-sm transition-colors cursor-pointer"
          >
            Sign In with Existing Account
          </button>
        </div>

        {/* Quick Feature Badges */}
        <div className="mt-10 pt-8 border-t border-neutral-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-neutral-600 w-full max-w-3xl">
          <div className="flex items-center justify-center gap-1.5">
            <Check className="h-4 w-4 text-neutral-900 shrink-0" />
            <span>Strict Tenant Isolation</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Check className="h-4 w-4 text-neutral-900 shrink-0" />
            <span>Originals vs External</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Check className="h-4 w-4 text-neutral-900 shrink-0" />
            <span>Scanned Sheet Lightbox</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Check className="h-4 w-4 text-neutral-900 shrink-0" />
            <span>Audio Speed Controls</span>
          </div>
        </div>

        {/* 3 Core Value Pillars */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-3">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="font-cinzel text-base font-bold text-neutral-900">
              Multi-Tenant Architecture
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Every church operates as an isolated organization. Choirmasters manage their own library, while choristers access only their parish’s music.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-3">
              <Volume2 className="h-4 w-4" />
            </div>
            <h3 className="font-cinzel text-base font-bold text-neutral-900">
              Audio Rehearsal Tracks
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Upload voice notes and rehearsal recordings, or rehearse with built-in four-part choral harmonies with 0.75x slow rehearsal speeds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-3">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="font-cinzel text-base font-bold text-neutral-900">
              Scores & Pulpit Lyrics
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Dual-mode lyric viewer supporting clean formatted stanzas with text sizing, alongside high-resolution pinch-and-zoom sheet music manuscripts.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-cinzel font-bold text-neutral-700">CANTORIA</span>
          <span>Soli Deo Gloria · Multi-Tenant Choir Library & Repertoire Platform</span>
        </div>
      </footer>
    </div>
  );
};
