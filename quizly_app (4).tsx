import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Home, Play, Compass, PlusCircle, ShoppingBag, User, Settings,
  Coins, Star, Flame, Trophy, Zap, Search, Heart, Clock, Check,
  Lock, Sparkles, Shield, Bell, HelpCircle, LogOut, Award,
  BookOpen, Layers, Users, Megaphone, Send, Trash2,
  Sliders, KeyRound, ChevronRight, X, AlertTriangle,
  Crown, Gift, UserCheck, Radio, Palette, Frame, Tag, Package,
  Image, Upload, Globe, GraduationCap, ClipboardList, Link2, Calendar, Copy, ExternalLink,
  Bookmark, MessageSquare, Flag, Share2, Edit3, CheckCircle2, Database, UserPlus, UserMinus, ArrowLeft
} from 'lucide-react';

// --- SUPABASE CLIENT LOADER (NO LOCALSTORAGE FALLBACK FOR USER CONTENT) ---
const SUPABASE_CONFIG_KEY = 'quizly_supabase_endpoint_v1';

const getInitialSupabaseConfig = () => {
  const envUrl =
    (typeof window !== 'undefined' && window.__SUPABASE_CONFIG__?.url) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    '';
  const envKey =
    (typeof window !== 'undefined' && window.__SUPABASE_CONFIG__?.anonKey) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    '';
  if (envUrl && envKey) return { url: envUrl, anonKey: envKey };
  try {
    const raw = sessionStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.url && parsed?.anonKey) return parsed;
    }
  } catch (e) {
    // Ignore sessionStorage read error
  }
  return { url: '', anonKey: '' };
};

const loadSupabaseSdk = () => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.supabase?.createClient) return Promise.resolve(window.supabase);
  return new Promise((resolve) => {
    const existing = document.getElementById('quizly-supabase-sdk');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.supabase || null));
      existing.addEventListener('error', () => resolve(null));
      return;
    }
    const script = document.createElement('script');
    script.id = 'quizly-supabase-sdk';
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.async = true;
    script.onload = () => resolve(window.supabase || null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
};

// --- ACHIEVEMENTS CATALOG ---
const ACHIEVEMENTS_CATALOG = [
  { id: 'first_quiz', name: 'First Quiz', desc: 'Published your first quiz.', target: 1, metric: 'publishedQuizzes', color: 'text-emerald-600 bg-emerald-100', icon: Sparkles },
  { id: 'quiz_creator', name: 'Quiz Creator', desc: 'Published 5 quizzes.', target: 5, metric: 'publishedQuizzes', color: 'text-blue-600 bg-blue-100', icon: PlusCircle },
  { id: 'popular_creator', name: 'Popular Creator', desc: 'Reached 100 quiz plays.', target: 100, metric: 'totalPlaysReceived', color: 'text-amber-600 bg-amber-100', icon: Flame },
  { id: 'community_member', name: 'Community Member', desc: 'Followed your first creator.', target: 1, metric: 'followingCount', color: 'text-purple-600 bg-purple-100', icon: Users },
  { id: 'quiz_explorer', name: 'Quiz Explorer', desc: 'Played 10 quizzes.', target: 10, metric: 'completedAttempts', color: 'text-sky-600 bg-sky-100', icon: Compass },
  { id: 'quiz_master', name: 'Quiz Master', desc: 'Completed 25 quizzes.', target: 25, metric: 'completedAttempts', color: 'text-yellow-600 bg-yellow-100', icon: Trophy },
];

const SEASON_THEMES = {
  skyward: {
    id: 'skyward',
    heroGradient: 'from-sky-500 via-blue-600 to-indigo-700',
    heroBorder: 'border-indigo-900',
    badgeBg: 'bg-amber-400 text-amber-950',
    progressGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    trackSurface: 'bg-gradient-to-b from-sky-50/95 via-white to-indigo-50/90 border-sky-300 shadow-[0_6px_0_rgb(125,211,252)]',
    trackBarBg: 'bg-sky-200/80',
    stemActive: 'bg-blue-500',
    stemInactive: 'bg-sky-200',
    cardBg: 'bg-sky-50/90 border-sky-200',
    minorUnlockedBg: 'bg-gradient-to-b from-sky-100 to-blue-100/90 border-sky-400 text-sky-950',
    minorLockedBg: 'bg-sky-50/60 border-sky-200/80 text-slate-600',
    unlockedBg: 'bg-gradient-to-br from-sky-500 to-indigo-600 border-sky-300 text-white',
    nodeActiveRing: 'ring-sky-300',
    accentText: 'text-sky-700',
    accentPill: 'bg-sky-100 text-sky-800 border border-sky-200',
    navBtn: 'bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-200',
  },
  cosmic: {
    id: 'cosmic',
    heroGradient: 'from-indigo-900 via-purple-700 to-fuchsia-600',
    heroBorder: 'border-purple-950',
    badgeBg: 'bg-fuchsia-300 text-purple-950',
    progressGradient: 'from-indigo-500 via-purple-500 to-fuchsia-500',
    trackSurface: 'bg-gradient-to-b from-purple-50/95 via-white to-fuchsia-50/90 border-purple-300 shadow-[0_6px_0_rgb(216,180,254)]',
    trackBarBg: 'bg-purple-200/80',
    stemActive: 'bg-purple-500',
    stemInactive: 'bg-purple-200',
    cardBg: 'bg-purple-50/90 border-purple-200',
    minorUnlockedBg: 'bg-gradient-to-b from-purple-100 to-fuchsia-100/90 border-purple-400 text-purple-950',
    minorLockedBg: 'bg-purple-50/60 border-purple-200/80 text-slate-600',
    unlockedBg: 'bg-gradient-to-br from-purple-600 to-indigo-800 border-fuchsia-300 text-white',
    nodeActiveRing: 'ring-fuchsia-300',
    accentText: 'text-purple-700',
    accentPill: 'bg-purple-100 text-purple-800 border border-purple-200',
    navBtn: 'bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-200',
  },
  emerald: {
    id: 'emerald',
    heroGradient: 'from-emerald-500 via-green-600 to-teal-800',
    heroBorder: 'border-emerald-950',
    badgeBg: 'bg-lime-300 text-emerald-950',
    progressGradient: 'from-emerald-400 via-green-500 to-teal-600',
    trackSurface: 'bg-gradient-to-b from-emerald-50/95 via-white to-teal-50/90 border-emerald-300 shadow-[0_6px_0_rgb(110,231,183)]',
    trackBarBg: 'bg-emerald-200/80',
    stemActive: 'bg-emerald-500',
    stemInactive: 'bg-emerald-200',
    cardBg: 'bg-emerald-50/90 border-emerald-200',
    minorUnlockedBg: 'bg-gradient-to-b from-emerald-100 to-teal-100/90 border-emerald-400 text-emerald-950',
    minorLockedBg: 'bg-emerald-50/60 border-emerald-200/80 text-slate-600',
    unlockedBg: 'bg-gradient-to-br from-emerald-500 to-teal-700 border-lime-300 text-white',
    nodeActiveRing: 'ring-lime-300',
    accentText: 'text-emerald-700',
    accentPill: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    navBtn: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200',
  },
  inferno: {
    id: 'inferno',
    heroGradient: 'from-red-600 via-orange-500 to-amber-500',
    heroBorder: 'border-red-900',
    badgeBg: 'bg-yellow-300 text-red-950',
    progressGradient: 'from-red-500 via-orange-500 to-amber-400',
    trackSurface: 'bg-gradient-to-b from-orange-50/95 via-white to-red-50/90 border-orange-300 shadow-[0_6px_0_rgb(253,186,116)]',
    trackBarBg: 'bg-orange-200/80',
    stemActive: 'bg-orange-500',
    stemInactive: 'bg-orange-200',
    cardBg: 'bg-orange-50/90 border-orange-200',
    minorUnlockedBg: 'bg-gradient-to-b from-orange-100 to-amber-100/90 border-orange-400 text-orange-950',
    minorLockedBg: 'bg-orange-50/60 border-orange-200/80 text-slate-600',
    unlockedBg: 'bg-gradient-to-br from-orange-500 to-red-700 border-amber-300 text-white',
    nodeActiveRing: 'ring-amber-300',
    accentText: 'text-orange-700',
    accentPill: 'bg-orange-100 text-orange-800 border border-orange-200',
    navBtn: 'bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-200',
  },
  arctic: {
    id: 'arctic',
    heroGradient: 'from-cyan-400 via-sky-600 to-blue-800',
    heroBorder: 'border-blue-950',
    badgeBg: 'bg-cyan-200 text-sky-950',
    progressGradient: 'from-cyan-400 via-sky-500 to-blue-600',
    trackSurface: 'bg-gradient-to-b from-cyan-50/95 via-white to-sky-50/90 border-cyan-300 shadow-[0_6px_0_rgb(103,232,249)]',
    trackBarBg: 'bg-cyan-200/80',
    stemActive: 'bg-cyan-500',
    stemInactive: 'bg-cyan-200',
    cardBg: 'bg-cyan-50/90 border-cyan-200',
    minorUnlockedBg: 'bg-gradient-to-b from-cyan-100 to-sky-100/90 border-cyan-400 text-cyan-950',
    minorLockedBg: 'bg-cyan-50/60 border-cyan-200/80 text-slate-600',
    unlockedBg: 'bg-gradient-to-br from-cyan-500 to-blue-700 border-cyan-200 text-white',
    nodeActiveRing: 'ring-cyan-300',
    accentText: 'text-cyan-700',
    accentPill: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    navBtn: 'bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border border-cyan-200',
  },
  royal: {
    id: 'royal',
    heroGradient: 'from-amber-400 via-yellow-500 to-orange-600',
    heroBorder: 'border-amber-900',
    badgeBg: 'bg-white text-amber-950',
    progressGradient: 'from-yellow-400 via-amber-500 to-orange-500',
    trackSurface: 'bg-gradient-to-b from-amber-50/95 via-white to-yellow-50/90 border-amber-300 shadow-[0_6px_0_rgb(252,211,77)]',
    trackBarBg: 'bg-amber-200/80',
    stemActive: 'bg-amber-500',
    stemInactive: 'bg-amber-200',
    cardBg: 'bg-amber-50/90 border-amber-200',
    minorUnlockedBg: 'bg-gradient-to-b from-amber-100 to-yellow-100/90 border-amber-400 text-amber-950',
    minorLockedBg: 'bg-amber-50/60 border-amber-200/80 text-slate-600',
    unlockedBg: 'bg-gradient-to-br from-amber-500 to-orange-600 border-yellow-200 text-white',
    nodeActiveRing: 'ring-yellow-300',
    accentText: 'text-amber-800',
    accentPill: 'bg-amber-100 text-amber-900 border border-amber-200',
    navBtn: 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200',
  },
};

const INITIAL_SEASON = {
  number: 1,
  name: 'Season 1: Skyward Scholars',
  tagline: 'Soar through cloudtop trivia academies and unlock sky-high scholar rewards!',
  themeKey: 'skyward',
  endsIn: '30 Days Left',
  maxLevel: 100,
  milestones: [
    { level: 1, label: 'Sky Cadet', reward: 'Cloud Starter Title', type: 'Title' },
    { level: 5, label: '75 Sky Coins', reward: '+75 QuizCoins', type: 'Coins' },
    { level: 10, label: 'Breeze Trail', reward: 'Zephyr Avatar Frame', type: 'Frame' },
    { level: 15, label: '125 Sky Coins', reward: '+125 QuizCoins', type: 'Coins' },
    { level: 20, label: 'Cloud Hopper', reward: 'Skyward Title', type: 'Title' },
    { level: 25, label: 'Stratosphere Frame', reward: 'Skyward Avatar Frame', type: 'Frame' },
    { level: 30, label: '200 Sky Coins', reward: '+200 QuizCoins', type: 'Coins' },
    { level: 35, label: 'Cumulus Crest', reward: 'Cloud Emblem Badge', type: 'Badge' },
    { level: 40, label: '300 Sky Coins', reward: '+300 QuizCoins', type: 'Coins' },
    { level: 45, label: 'Windrunner', reward: 'Gale Scholar Title', type: 'Title' },
    { level: 50, label: 'Cloudtop Horizon', reward: 'Animated Sky Banner', type: 'Banner' },
    { level: 55, label: '400 Sky Coins', reward: '+400 QuizCoins', type: 'Coins' },
    { level: 60, label: 'Aero Voyager', reward: 'Nimbus Avatar Skin', type: 'Skin' },
    { level: 65, label: '500 Sky Coins', reward: '+500 QuizCoins', type: 'Coins' },
    { level: 70, label: 'Sunbeam Halo', reward: 'Radiant Sky Frame', type: 'Frame' },
    { level: 75, label: '650 Windfall Coins', reward: '+650 QuizCoins', type: 'Coins' },
    { level: 80, label: 'Celestial Ace', reward: 'Starlight Title', type: 'Title' },
    { level: 85, label: '800 Sky Coins', reward: '+800 QuizCoins', type: 'Coins' },
    { level: 90, label: 'Aurora Sanctum', reward: 'Mythic Sky Banner', type: 'Banner' },
    { level: 95, label: '1,000 Sky Coins', reward: '+1,000 QuizCoins', type: 'Coins' },
    { level: 100, label: 'Skyward Grand Scholar', reward: 'Season 1 Crown & Skin', type: 'Grand Prize' },
  ],
};

// AI Season Theme & Rewards Generator using Gemini API
const generateSeasonWithAI = async ({ nextNumber, seasonName, endsIn }) => {
  const lower = seasonName.toLowerCase();
  const fallbackThemeKey =
    lower.includes('space') || lower.includes('galactic') || lower.includes('cosmic')
      ? 'cosmic'
      : lower.includes('forest') || lower.includes('jungle') || lower.includes('emerald')
      ? 'emerald'
      : lower.includes('fire') || lower.includes('volcano') || lower.includes('inferno')
      ? 'inferno'
      : lower.includes('ice') || lower.includes('winter') || lower.includes('arctic')
      ? 'arctic'
      : 'royal';

  const targetLevels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
  const apiKey = '';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const prompt = `You are the game designer for Quizly, an educational trivia game.
A new season is launching: "${seasonName}" (Season ${nextNumber}, duration: "${endsIn}").
Generate a cohesive visual theme and 21 themed Season Pass milestone rewards (for levels ${targetLevels.join(', ')}) that match the exact theme of "${seasonName}".
Choose themeKey from ONLY one of: "skyward", "cosmic", "emerald", "inferno", "arctic", "royal".`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          themeKey: { type: 'STRING', enum: ['skyward', 'cosmic', 'emerald', 'inferno', 'arctic', 'royal'] },
          tagline: { type: 'STRING' },
          milestones: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                level: { type: 'INTEGER' },
                label: { type: 'STRING' },
                reward: { type: 'STRING' },
                type: { type: 'STRING' },
              },
              required: ['level', 'label', 'reward', 'type'],
            },
          },
        },
        required: ['themeKey', 'tagline', 'milestones'],
      },
    },
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('API request failed');
      const result = await response.json();
      const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        const validTheme = SEASON_THEMES[parsed.themeKey] ? parsed.themeKey : fallbackThemeKey;
        const normalizedMilestones = targetLevels.map((lvl, idx) => {
          const item = parsed.milestones?.[idx] || {};
          return {
            level: lvl,
            label: item.label || `Tier ${lvl} Reward`,
            reward: item.reward || `${seasonName} Item`,
            type: item.type || (lvl === 100 ? 'Grand Prize' : lvl % 10 === 5 ? 'Coins' : 'Cosmetic'),
          };
        });
        return {
          themeKey: validTheme,
          tagline: parsed.tagline || `Embark on ${seasonName} and unlock exclusive themed rewards!`,
          milestones: normalizedMilestones,
        };
      }
    } catch (err) {
      if (attempt < 2) {
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  const shortTheme = seasonName.split(':').pop().trim();
  return {
    themeKey: fallbackThemeKey,
    tagline: `Master quizzes in ${seasonName} to unlock 21 exclusive themed rewards up to Tier 100!`,
    milestones: targetLevels.map((lvl) => ({
      level: lvl,
      label: lvl === 100 ? `Season ${nextNumber} Grand Champion` : `${shortTheme} Tier ${lvl}`,
      reward: lvl % 10 === 5 ? `+${lvl * 10} QuizCoins` : `${shortTheme} Reward`,
      type: lvl === 100 ? 'Grand Prize' : lvl % 10 === 5 ? 'Coins' : 'Cosmetic',
    })),
  };
};

// EST Shop Rotation Helpers
const getEstTimeInfo = (nowMs) => {
  const estMs = nowMs - 5 * 3600 * 1000;
  const estDate = new Date(estMs);
  const year = estDate.getUTCFullYear();
  const month = estDate.getUTCMonth();
  const day = estDate.getUTCDate();
  const hour = estDate.getUTCHours();

  let resetDay = day;
  if (hour >= 12) resetDay += 1;
  const nextDailyEstMs = Date.UTC(year, month, resetDay, 12, 0, 0, 0);
  const msUntilDailyReset = Math.max(0, nextDailyEstMs - estMs);
  const daySeed = Math.floor((nextDailyEstMs - 24 * 3600 * 1000) / (24 * 3600 * 1000));

  const dayOfWeek = estDate.getUTCDay();
  let daysUntilSunday = (7 - dayOfWeek) % 7;
  if (daysUntilSunday === 0 && hour >= 12) daysUntilSunday = 7;
  const nextWeeklyEstMs = Date.UTC(year, month, day + daysUntilSunday, 12, 0, 0, 0);
  const msUntilWeeklyReset = Math.max(0, nextWeeklyEstMs - estMs);
  const weekSeed = Math.floor((nextWeeklyEstMs - 7 * 24 * 3600 * 1000) / (7 * 24 * 3600 * 1000));

  return { msUntilDailyReset, msUntilWeeklyReset, daySeed, weekSeed };
};

const formatCountdown = (ms, includeDays = false) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (includeDays && days > 0) return `${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
  return `${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
};

const pickRotatedItems = (allItems, starterIds, count, seed) => {
  const pool = allItems.filter(item => !starterIds.includes(item.id));
  if (pool.length <= count) return allItems;
  const startIdx = ((seed * 3) % pool.length + pool.length) % pool.length;
  const rotated = [];
  for (let i = 0; i < count; i++) {
    rotated.push(pool[(startIdx + i) % pool.length]);
  }
  return rotated;
};

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Welcome to Quizly Community & Classroom!',
    date: '2 days ago',
    tag: 'New Update',
    body: 'Publish quizzes, follow creators, customize your public profile (/profile/username), and climb the Season Pass!',
  },
];

const GRANTABLE_POWERS = [
  { id: 'double_xp', label: '2x XP Boost', desc: 'Double Season Pass XP on every answer' },
  { id: 'double_coins', label: '2x Coin Multiplier', desc: 'Earn double QuizCoins in games' },
  { id: 'vip_crown', label: 'VIP Golden Crown + 1,000 Coins', desc: 'Grants Golden King skin & +1,000 Coins' },
  { id: 'all_skins', label: 'Full Locker Unlock', desc: 'Unlocks every Avatar Skin in the Shop' },
];

const SHOP_BUNDLES = [
  {
    id: 'galaxy_explorer',
    name: 'Galaxy Explorer Pack',
    tagline: 'Blast off with cosmic style!',
    price: 950,
    originalPrice: 1300,
    rarity: 'Epic',
    accent: 'from-indigo-600 via-purple-600 to-fuchsia-600',
    skinId: 'astro_cat',
    bannerId: 'cosmic_nebula',
    frameId: 'cyber_cyan',
    titleId: 'brainiac',
  },
  {
    id: 'royal_champion',
    name: 'Royal Champion Bundle',
    tagline: 'Rule the classroom leaderboard!',
    price: 2200,
    originalPrice: 2950,
    rarity: 'Legendary',
    accent: 'from-amber-400 via-yellow-500 to-orange-600',
    skinId: 'golden_king',
    bannerId: 'champion_gold',
    frameId: 'golden_laurel',
    titleId: 'legend',
  },
  {
    id: 'arcane_scholar',
    name: 'Arcane Scholar Set',
    tagline: 'Master every trivia subject!',
    price: 850,
    originalPrice: 1150,
    rarity: 'Rare',
    accent: 'from-blue-600 via-indigo-600 to-violet-600',
    skinId: 'pixel_wizard',
    bannerId: 'emerald_matrix',
    frameId: 'royal_purple',
    titleId: 'grandmaster',
  },
];

const makeStaticSvgUrl = (bgStart, bgEnd, label, accent) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
    </defs>
    <rect width="500" height="500" fill="url(#g)"/>
    <circle cx="250" cy="210" r="95" fill="${accent}" fill-opacity="0.22"/>
    <circle cx="250" cy="210" r="62" fill="${accent}" fill-opacity="0.35"/>
    <text x="250" y="365" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="900" font-size="34" letter-spacing="2">${label}</text>
    <text x="250" y="405" text-anchor="middle" fill="${accent}" font-family="sans-serif" font-weight="700" font-size="18">QUIZLY 500x500 STATIC</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const GOOGLE_STATIC_GALLERY = [
  { id: 'g_space', title: 'Solar System', category: 'Science', tags: 'space planet mars', url: makeStaticSvgUrl('#1E1B4B', '#3B82F6', 'SOLAR SYSTEM', '#38BDF8') },
  { id: 'g_math', title: 'Geometry & Algebra', category: 'Math', tags: 'math numbers addition multiplication', url: makeStaticSvgUrl('#D97706', '#F59E0B', 'MATH CHALLENGE', '#FEF08A') },
  { id: 'g_dna', title: 'Biology & DNA', category: 'Science', tags: 'dna biology cell', url: makeStaticSvgUrl('#065F46', '#10B981', 'BIOLOGY & DNA', '#A7F3D0') },
  { id: 'g_globe', title: 'World Geography', category: 'Geography', tags: 'globe map world', url: makeStaticSvgUrl('#0369A1', '#06B6D4', 'WORLD GLOBE', '#BAE6FD') },
  { id: 'g_egypt', title: 'Ancient History', category: 'History', tags: 'egypt pyramid ancient', url: makeStaticSvgUrl('#9A3412', '#EA580C', 'ANCIENT WORLD', '#FED7AA') },
  { id: 'g_books', title: 'Literature & Reading', category: 'English', tags: 'books reading story', url: makeStaticSvgUrl('#5B21B6', '#8B5CF6', 'LITERATURE', '#DDD6FE') },
];

const QuizlyLogo = ({ size = 40, showWordmark = false }) => (
  <div className="inline-flex flex-col items-center gap-1 select-none">
    <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0 drop-shadow-xs">
      <defs>
        <linearGradient id="quizlyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="55%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect x="8" y="12" width="84" height="82" rx="24" fill="#064E3B" />
      <rect x="8" y="6" width="84" height="82" rx="24" fill="url(#quizlyGrad)" />
      <rect x="12" y="10" width="76" height="74" rx="20" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
      <text x="50" y="64" textAnchor="middle" fill="white" fontFamily="sans-serif" fontWeight="900" fontSize="52">
        Q
      </text>
      <circle cx="74" cy="26" r="7" fill="#FACC15" />
    </svg>
    {showWordmark && (
      <span className="font-black text-2xl tracking-wider text-emerald-600">
        QUIZLY
      </span>
    )}
  </div>
);

const NAV_ITEMS = [
  { id: 'home', label: 'My Dashboard', icon: Home, group: 'Menu', color: 'bg-blue-500 border-blue-700' },
  { id: 'explore', label: 'Explore', icon: Compass, group: 'Menu', color: 'bg-indigo-500 border-indigo-700' },
  { id: 'search', label: 'Search', icon: Search, group: 'Menu', color: 'bg-emerald-600 border-emerald-800' },
  { id: 'play', label: 'Play Quiz', icon: Play, group: 'Menu', color: 'bg-green-500 border-green-700' },
  { id: 'create', label: 'Create Quiz', icon: PlusCircle, group: 'Menu', color: 'bg-orange-500 border-orange-700' },
  { id: 'season', label: 'Season Pass', icon: Trophy, group: 'Menu', color: 'bg-purple-600 border-purple-800' },
  { id: 'classes', label: 'Teacher Hub', icon: GraduationCap, group: 'Menu', color: 'bg-teal-600 border-teal-800', teacherOnly: true },
  { id: 'saved', label: 'Saved Quizzes', icon: Bookmark, group: 'Personal', color: 'bg-rose-500 border-rose-700' },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'Personal', color: 'bg-amber-500 border-amber-700' },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, group: 'Personal', color: 'bg-yellow-500 border-yellow-700' },
  { id: 'profile', label: 'My Profile', icon: User, group: 'Personal', color: 'bg-sky-500 border-sky-700' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'Personal', color: 'bg-slate-600 border-slate-800' },
];

const SKINS = [
  { id: 'red_cube', name: 'Red Cube', price: 0, rarity: 'Starter', color: '#EF4444', light: '#FCA5A5', dark: '#991B1B', accessory: 'none' },
  { id: 'blue_bot', name: 'Cyber Bot', price: 150, rarity: 'Common', color: '#3B82F6', light: '#93C5FD', dark: '#1E3A8A', accessory: 'antenna' },
  { id: 'sunny_slime', name: 'Sunset Slime', price: 200, rarity: 'Common', color: '#F59E0B', light: '#FDE68A', dark: '#92400E', accessory: 'droplet' },
  { id: 'chilly_penguin', name: 'Chilly Penguin', price: 250, rarity: 'Common', color: '#0284C7', light: '#7DD3FC', dark: '#0C4A6E', accessory: 'beak' },
  { id: 'dino_rex', name: 'Pixel Dino', price: 300, rarity: 'Rare', color: '#10B981', light: '#6EE7B7', dark: '#065F46', accessory: 'spikes' },
  { id: 'neon_fox', name: 'Neon Fox', price: 350, rarity: 'Rare', color: '#F97316', light: '#FDBA74', dark: '#9A3412', accessory: 'ears' },
  { id: 'pixel_wizard', name: 'Pixel Wizard', price: 450, rarity: 'Rare', color: '#6366F1', light: '#A5B4FC', dark: '#312E81', accessory: 'wizard_hat' },
  { id: 'emerald_golem', name: 'Emerald Golem', price: 480, rarity: 'Rare', color: '#059669', light: '#6EE7B7', dark: '#064E3B', accessory: 'spikes' },
  { id: 'astro_cat', name: 'Astro Cat', price: 500, rarity: 'Epic', color: '#8B5CF6', light: '#C4B5FD', dark: '#4C1D95', accessory: 'visor' },
  { id: 'magma_drake', name: 'Magma Drake', price: 650, rarity: 'Epic', color: '#DC2626', light: '#FCA5A5', dark: '#7F1D1D', accessory: 'horns' },
  { id: 'ninja_shadow', name: 'Shadow Ninja', price: 750, rarity: 'Epic', color: '#334155', light: '#94A3B8', dark: '#0F172A', accessory: 'headband' },
  { id: 'sun_pharaoh', name: 'Sun Pharaoh', price: 900, rarity: 'Legendary', color: '#EAB308', light: '#FEF08A', dark: '#854D0E', accessory: 'pharaoh' },
  { id: 'golden_king', name: 'Golden King', price: 1200, rarity: 'Legendary', color: '#F59E0B', light: '#FDE047', dark: '#78350F', accessory: 'crown' },
];

const BANNERS = [
  { id: 'default_blue', name: 'Classic Sky', price: 0, rarity: 'Starter', gradient: 'from-sky-400 via-blue-500 to-indigo-600', artType: 'clouds' },
  { id: 'sunset_arcade', name: 'Sunset Arcade', price: 200, rarity: 'Common', gradient: 'from-amber-500 via-rose-500 to-fuchsia-600', artType: 'synthwave' },
  { id: 'frost_glacier', name: 'Frost Glacier', price: 250, rarity: 'Common', gradient: 'from-cyan-300 via-sky-500 to-blue-700', artType: 'clouds' },
  { id: 'emerald_matrix', name: 'Emerald Matrix', price: 300, rarity: 'Rare', gradient: 'from-emerald-400 via-teal-600 to-cyan-800', artType: 'circuit' },
  { id: 'forest_canopy', name: 'Emerald Canopy', price: 380, rarity: 'Rare', gradient: 'from-lime-400 via-emerald-600 to-teal-900', artType: 'circuit' },
  { id: 'volcanic_ember', name: 'Volcanic Ember', price: 460, rarity: 'Epic', gradient: 'from-red-600 via-orange-500 to-amber-500', artType: 'synthwave' },
  { id: 'cosmic_nebula', name: 'Cosmic Nebula', price: 500, rarity: 'Epic', gradient: 'from-indigo-900 via-purple-700 to-pink-600', artType: 'nebula' },
  { id: 'champion_gold', name: 'Champion Gold', price: 850, rarity: 'Legendary', gradient: 'from-amber-300 via-yellow-500 to-orange-600', artType: 'royal' },
];

const FRAMES = [
  { id: 'none', name: 'Clean Studio', price: 0, rarity: 'Starter', wrapperClass: 'p-1 bg-gradient-to-b from-slate-100 to-slate-300 shadow-md', innerClass: 'border-2 border-white', ornament: 'none' },
  { id: 'cyber_cyan', name: 'Cyber Circuit', price: 150, rarity: 'Common', wrapperClass: 'p-1.5 bg-gradient-to-tr from-cyan-500 via-sky-300 to-blue-600 shadow-[0_0_16px_rgba(6,182,212,0.45)]', innerClass: 'border-2 border-cyan-100', ornament: 'cyber' },
  { id: 'arctic_frost', name: 'Arctic Prism', price: 220, rarity: 'Common', wrapperClass: 'p-1.5 bg-gradient-to-tr from-sky-200 via-cyan-400 to-indigo-500 shadow-[0_0_16px_rgba(56,189,248,0.45)]', innerClass: 'border-2 border-sky-100', ornament: 'cyber' },
  { id: 'royal_purple', name: 'Arcane Amethyst', price: 300, rarity: 'Rare', wrapperClass: 'p-1.5 bg-gradient-to-br from-fuchsia-400 via-purple-600 to-indigo-800 shadow-[0_0_18px_rgba(168,85,247,0.45)]', innerClass: 'border-2 border-purple-200', ornament: 'gems' },
  { id: 'emerald_vine', name: 'Emerald Crest', price: 360, rarity: 'Rare', wrapperClass: 'p-1.5 bg-gradient-to-br from-lime-300 via-emerald-500 to-teal-800 shadow-[0_0_18px_rgba(16,185,129,0.45)]', innerClass: 'border-2 border-emerald-100', ornament: 'gems' },
  { id: 'inferno_blaze', name: 'Solar Flare', price: 500, rarity: 'Epic', wrapperClass: 'p-1.5 bg-gradient-to-t from-red-600 via-orange-500 to-amber-300 shadow-[0_0_20px_rgba(249,115,22,0.55)]', innerClass: 'border-2 border-amber-200', ornament: 'flame' },
  { id: 'golden_laurel', name: 'Grand Champion', price: 800, rarity: 'Legendary', wrapperClass: 'p-2 bg-gradient-to-br from-yellow-200 via-amber-400 to-orange-600 shadow-[0_0_24px_rgba(251,191,36,0.65)]', innerClass: 'border-2 border-yellow-100', ornament: 'crown' },
];

const TITLES = [
  { id: 'apprentice', name: 'Quiz Apprentice', price: 0, rarity: 'Starter', badgeStyle: 'bg-gradient-to-r from-slate-100 via-white to-slate-200 text-slate-700 border-slate-300 shadow-[0_2px_0_rgb(203,213,225)]', iconType: 'dot', animClass: '', iconAnim: '', shimmer: false },
  { id: 'brainiac', name: 'Super Brainiac', price: 150, rarity: 'Common', badgeStyle: 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white border-blue-700 shadow-[0_2px_10px_rgba(14,165,233,0.45)]', iconType: 'zap', animClass: 'title-gradient-flow', iconAnim: 'animate-pulse', shimmer: true },
  { id: 'scholar_ace', name: 'Honor Scholar', price: 220, rarity: 'Common', badgeStyle: 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white border-teal-700 shadow-[0_2px_10px_rgba(16,185,129,0.45)]', iconType: 'sparkles', animClass: 'title-gradient-flow', iconAnim: 'animate-pulse', shimmer: true },
  { id: 'speedster', name: 'Lightning Mind', price: 300, rarity: 'Rare', badgeStyle: 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white border-orange-700 shadow-[0_2px_12px_rgba(249,115,22,0.5)]', iconType: 'flame', animClass: 'title-gradient-flow', iconAnim: 'animate-bounce', shimmer: true },
  { id: 'quiz_prodigy', name: 'Quiz Prodigy', price: 420, rarity: 'Rare', badgeStyle: 'bg-gradient-to-r from-lime-400 via-emerald-500 to-green-700 text-white border-emerald-800 shadow-[0_2px_12px_rgba(16,185,129,0.5)]', iconType: 'zap', animClass: 'title-gradient-flow', iconAnim: 'animate-bounce', shimmer: true },
  { id: 'grandmaster', name: 'Trivia Grandmaster', price: 550, rarity: 'Epic', badgeStyle: 'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 text-white border-purple-900 shadow-[0_2px_14px_rgba(168,85,247,0.55)]', iconType: 'sparkles', animClass: 'title-gradient-flow', iconAnim: 'animate-spin', shimmer: true },
  { id: 'legend', name: 'Quizly Legend', price: 900, rarity: 'Legendary', badgeStyle: 'bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 text-amber-950 border-amber-600 shadow-[0_3px_16px_rgba(251,191,36,0.75)] ring-2 ring-yellow-200', iconType: 'crown', animClass: 'title-gradient-flow title-legend-float', iconAnim: 'animate-bounce', shimmer: true },
];

// Official starter curriculum sets (0 plays, 0 likes — no fake user records)
const INITIAL_QUIZZES = [
  {
    id: 'official-solar-system',
    title: 'Solar System & Space Exploration',
    description: 'Test your astronomy knowledge across planets, moons, and our Milky Way galaxy.',
    category: 'Science',
    subject: 'Astronomy',
    creatorId: 'quizly-official',
    creator: 'Quizly Official',
    plays: 0,
    likes: 0,
    difficulty: 'Medium',
    visibility: 'public',
    status: 'published',
    commentsEnabled: true,
    allowDuplicate: true,
    color: 'from-indigo-500 to-blue-600',
    createdAt: '2026-11-01T12:00:00Z',
    updatedAt: '2026-11-01T12:00:00Z',
    questions: [
      { id: 'q1', q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 1 },
      { id: 'q2', q: 'What is the largest planet in our solar system?', options: ['Earth', 'Neptune', 'Jupiter', 'Uranus'], answer: 2 },
      { id: 'q3', q: 'Which planet has the most prominent ring system?', options: ['Saturn', 'Mars', 'Mercury', 'Venus'], answer: 0 },
      { id: 'q4', q: 'What is the name of the galaxy that contains our Solar System?', options: ['Andromeda', 'Whirlpool', 'Milky Way', 'Sombrero'], answer: 2 },
    ],
  },
  {
    id: 'official-world-capitals',
    title: 'World Capitals & Landmarks',
    description: 'Explore capital cities and famous landmarks from around the globe.',
    category: 'Geography',
    subject: 'World Geography',
    creatorId: 'quizly-official',
    creator: 'Quizly Official',
    plays: 0,
    likes: 0,
    difficulty: 'Easy',
    visibility: 'public',
    status: 'published',
    commentsEnabled: true,
    allowDuplicate: true,
    color: 'from-emerald-500 to-teal-600',
    createdAt: '2026-11-02T12:00:00Z',
    updatedAt: '2026-11-02T12:00:00Z',
    questions: [
      { id: 'q5', q: 'What is the capital city of Japan?', options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'], answer: 2 },
      { id: 'q6', q: 'In which country would you find the Eiffel Tower?', options: ['Italy', 'Spain', 'Germany', 'France'], answer: 3 },
      { id: 'q7', q: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], answer: 2 },
    ],
  },
  {
    id: 'official-mental-math',
    title: 'Mental Math Speed Challenge',
    description: 'Sharpen your arithmetic speed with multiplication, square roots, and multi-step sums.',
    category: 'Math',
    subject: 'Arithmetic',
    creatorId: 'quizly-official',
    creator: 'Quizly Official',
    plays: 0,
    likes: 0,
    difficulty: 'Medium',
    visibility: 'public',
    status: 'published',
    commentsEnabled: true,
    allowDuplicate: true,
    color: 'from-amber-500 to-orange-600',
    createdAt: '2026-11-03T12:00:00Z',
    updatedAt: '2026-11-03T12:00:00Z',
    questions: [
      { id: 'q8', q: 'What is 14 × 6?', options: ['74', '84', '94', '64'], answer: 1 },
      { id: 'q9', q: 'What is the square root of 144?', options: ['11', '12', '13', '14'], answer: 1 },
      { id: 'q10', q: 'Solve: 45 + 38 - 13', options: ['60', '70', '80', '65'], answer: 1 },
    ],
  },
  {
    id: 'official-ancient-civilizations',
    title: 'Ancient Civilizations',
    description: 'Journey back to Ancient Egypt, Greece, and early empires.',
    category: 'History',
    subject: 'World History',
    creatorId: 'quizly-official',
    creator: 'Quizly Official',
    plays: 0,
    likes: 0,
    difficulty: 'Hard',
    visibility: 'public',
    status: 'published',
    commentsEnabled: true,
    allowDuplicate: true,
    color: 'from-rose-500 to-pink-600',
    createdAt: '2026-11-04T12:00:00Z',
    updatedAt: '2026-11-04T12:00:00Z',
    questions: [
      { id: 'q11', q: 'Which river was essential to Ancient Egyptian civilization?', options: ['Amazon', 'Nile', 'Danube', 'Yangtze'], answer: 1 },
      { id: 'q12', q: 'Who was the famous Macedonian king who created a vast empire?', options: ['Julius Caesar', 'Alexander the Great', 'Pericles', 'Leonidas'], answer: 1 },
    ],
  },
];

// --- DESIGNER AVATAR FRAME, BANNER ART & TITLE BADGE COMPONENTS ---
const AvatarFrameBox = ({ frame = FRAMES[0], sizeClass = 'w-24 h-24 sm:w-28 sm:h-28', roundedClass = 'rounded-3xl', children }) => (
  <div className={`relative inline-flex items-center justify-center ${sizeClass} ${roundedClass} ${frame.wrapperClass} shrink-0`}>
    {frame.ornament === 'cyber' && (
      <>
        <span className="absolute -top-1 -left-1 w-3 h-3 rounded-tl-lg border-t-2 border-l-2 border-cyan-300" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-tr-lg border-t-2 border-r-2 border-cyan-300" />
        <span className="absolute -bottom-1 -left-1 w-3 h-3 rounded-bl-lg border-b-2 border-l-2 border-cyan-300" />
        <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-br-lg border-b-2 border-r-2 border-cyan-300" />
      </>
    )}
    {frame.ornament === 'gems' && (
      <>
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-fuchsia-300 border border-purple-800 shadow-xs" />
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-purple-300 border border-purple-800" />
      </>
    )}
    {frame.ornament === 'flame' && (
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-t from-orange-500 to-yellow-200 text-red-900 rounded-full p-0.5 shadow-sm">
        <Flame size={12} className="fill-current" />
      </span>
    )}
    {frame.ornament === 'crown' && (
      <>
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-b from-yellow-200 to-amber-500 text-amber-950 border border-amber-700 rounded-full px-1.5 py-0.5 shadow-md">
          <Crown size={12} className="fill-current" />
        </span>
        <span className="absolute -bottom-1.5 left-3 w-2.5 h-2.5 rotate-45 bg-yellow-200 border border-amber-600" />
        <span className="absolute -bottom-1.5 right-3 w-2.5 h-2.5 rotate-45 bg-yellow-200 border border-amber-600" />
      </>
    )}
    <div className={`w-full h-full bg-white ${roundedClass} ${frame.innerClass} flex items-center justify-center overflow-hidden`}>
      {children}
    </div>
  </div>
);

const BannerBackdrop = ({ banner = BANNERS[0], className = 'h-32 sm:h-40 rounded-2xl', children }) => (
  <div className={`relative overflow-hidden bg-gradient-to-r ${banner.gradient} ${className}`}>
    {banner.artType === 'clouds' && (
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 600 180" preserveAspectRatio="none">
        <circle cx="90" cy="45" r="55" fill="white" />
        <circle cx="145" cy="55" r="42" fill="white" />
        <circle cx="480" cy="35" r="65" fill="white" />
        <circle cx="540" cy="50" r="45" fill="white" />
        <path d="M0 150 Q150 110 300 145 T600 135 L600 180 L0 180 Z" fill="white" fillOpacity="0.35" />
      </svg>
    )}
    {banner.artType === 'synthwave' && (
      <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 600 180" preserveAspectRatio="none">
        <circle cx="300" cy="95" r="62" fill="#FDE047" />
        <rect x="0" y="105" width="600" height="6" fill="#BE185D" />
        <rect x="0" y="122" width="600" height="8" fill="#9D174D" />
      </svg>
    )}
    {banner.artType === 'circuit' && (
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 600 180" preserveAspectRatio="none">
        <path d="M20 40 H140 L170 70 H290 M580 50 H440 L410 80 H320 M60 140 H210 L240 110 H380 L410 140 H550" stroke="#A7F3D0" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    )}
    {banner.artType === 'nebula' && (
      <svg className="absolute inset-0 w-full h-full opacity-45" viewBox="0 0 600 180" preserveAspectRatio="none">
        <ellipse cx="460" cy="75" rx="110" ry="26" fill="none" stroke="#F0ABFC" strokeWidth="6" transform="rotate(-14 460 75)" />
        <circle cx="460" cy="75" r="32" fill="#E879F9" fillOpacity="0.6" />
      </svg>
    )}
    {banner.artType === 'royal' && (
      <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 600 180" preserveAspectRatio="none">
        <polygon points="300,0 220,180 265,180" fill="white" />
        <polygon points="300,0 335,180 380,180" fill="white" />
      </svg>
    )}
    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
    {children}
  </div>
);

const TitlePill = ({ title = TITLES[0], size = 'sm' }) => {
  const padClass = size === 'lg' ? 'px-4 py-1.5 text-xs' : 'px-3 py-0.5 text-[11px]';
  return (
    <span className={`relative overflow-hidden inline-flex items-center gap-1.5 rounded-full border-2 font-black tracking-wide ${padClass} ${title.badgeStyle} ${title.animClass || ''}`}>
      {title.shimmer && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent title-shimmer-sweep" />
      )}
      {title.iconType === 'crown' && <Crown size={12} className={`fill-current shrink-0 ${title.iconAnim || ''}`} />}
      {title.iconType === 'sparkles' && <Sparkles size={12} className={`shrink-0 ${title.iconAnim || ''}`} style={{ animationDuration: '5s' }} />}
      {title.iconType === 'flame' && <Flame size={12} className={`fill-current shrink-0 ${title.iconAnim || ''}`} />}
      {title.iconType === 'zap' && <Zap size={12} className={`fill-current shrink-0 ${title.iconAnim || ''}`} />}
      {title.iconType === 'dot' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />}
      <span className="relative z-10">{title.name}</span>
    </span>
  );
};

// --- DESIGNER BLOCKY AVATAR SVG ---
const SkinIcon = ({ color = '#EF4444', light = '#FCA5A5', dark = '#B91C1C', accessory = 'none', size = 48 }) => {
  const uid = `${accessory}_${color.replace('#', '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="select-none shrink-0 drop-shadow-xs">
      <defs>
        <linearGradient id={`body_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={light} stopOpacity="0.35" />
          <stop offset="30%" stopColor={color} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`gold_${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="92" rx="30" ry="5" fill="#0F172A" fillOpacity="0.14" />
      <rect x="15" y="25" width="70" height="65" rx="20" fill={dark} />
      <rect x="15" y="18" width="70" height="65" rx="20" fill={color} />
      <rect x="15" y="18" width="70" height="65" rx="20" fill={`url(#body_${uid})`} />
      <rect x="17" y="20" width="66" height="61" rx="18" fill="none" stroke="white" strokeOpacity="0.28" strokeWidth="2" />
      <rect x="23" y="22" width="54" height="12" rx="6" fill="white" fillOpacity="0.32" />
      <circle cx="28" cy="28" r="3" fill="white" fillOpacity="0.55" />

      {accessory === 'antenna' && (
        <g>
          <rect x="46" y="6" width="8" height="14" rx="4" fill="#64748B" />
          <circle cx="50" cy="6" r="5" fill="#38BDF8" />
        </g>
      )}
      {accessory === 'crown' && (
        <polygon points="28,20 34,6 50,15 66,6 72,20" fill={`url(#gold_${uid})`} stroke="#B45309" strokeWidth="2.5" strokeLinejoin="round" />
      )}
      {accessory === 'ears' && (
        <g>
          <polygon points="20,22 26,4 38,20" fill={color} />
          <polygon points="80,22 74,4 62,20" fill={color} />
        </g>
      )}
      {accessory === 'horns' && (
        <g>
          <polygon points="22,22 14,6 34,18" fill="#FDE047" />
          <polygon points="78,22 86,6 66,18" fill="#FDE047" />
        </g>
      )}
      {accessory === 'spikes' && (
        <g>
          <polygon points="34,18 40,6 46,18" fill={light} />
          <polygon points="54,18 60,6 66,18" fill={light} />
        </g>
      )}
      {accessory === 'wizard_hat' && (
        <g>
          <ellipse cx="50" cy="19" rx="34" ry="6" fill="#312E81" />
          <polygon points="26,19 50,2 74,19" fill="#4F46E5" />
          <circle cx="50" cy="11" r="3" fill="#FDE047" />
        </g>
      )}
      {accessory === 'headband' && (
        <rect x="15" y="28" width="70" height="8" fill="#EF4444" />
      )}
      {accessory === 'pharaoh' && (
        <path d="M14 24 L50 6 L86 24 L82 48 L18 48 Z" fill={`url(#gold_${uid})`} opacity="0.45" />
      )}
      {accessory === 'droplet' && (
        <circle cx="50" cy="11" r="6" fill={light} />
      )}

      {accessory === 'visor' ? (
        <g>
          <rect x="22" y="38" width="56" height="22" rx="11" fill="#0F172A" />
          <rect x="25" y="40" width="50" height="18" rx="9" fill="#38BDF8" fillOpacity="0.85" />
        </g>
      ) : (
        <g>
          <circle cx="36" cy="48" r="7.5" fill="white" />
          <circle cx="64" cy="48" r="7.5" fill="white" />
          <circle cx="37.5" cy="48" r="4" fill="#0F172A" />
          <circle cx="65.5" cy="48" r="4" fill="#0F172A" />
        </g>
      )}

      {accessory === 'beak' ? (
        <polygon points="43,58 57,58 50,68" fill="#F97316" />
      ) : (
        <path d="M 41 62 Q 50 70 59 62" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
};

// User Avatar Renderer (Supports uploaded profile picture URL or equipped blocky Skin)
const UserAvatarDisplay = ({ profile, size = 48, className = '' }) => {
  const skin = SKINS.find(s => s.id === (profile?.equippedSkin || 'red_cube')) || SKINS[0];
  if (profile?.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt={profile.displayName || profile.username || 'User avatar'}
        style={{ width: size, height: size }}
        className={`object-cover rounded-2xl shrink-0 ${className}`}
      />
    );
  }
  return <SkinIcon {...skin} size={size} />;
};

// --- SEASON-THEMED DECORATIVE STICKERS ---
const SeasonStickers = ({ themeKey = 'skyward', variant = 'hero' }) => {
  const isTrack = variant === 'track';
  if (themeKey === 'cosmic') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
        <svg className={`absolute ${isTrack ? 'right-4 bottom-2 w-16 h-16 opacity-30' : 'right-8 top-4 w-24 h-24 opacity-35'} rotate-12`} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="24" fill="#E879F9" />
          <ellipse cx="50" cy="50" rx="44" ry="12" fill="none" stroke="#FDE047" strokeWidth="5" transform="rotate(-18 50 50)" />
        </svg>
      </div>
    );
  }
  if (themeKey === 'emerald') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
        <svg className={`absolute ${isTrack ? 'right-4 bottom-2 w-14 h-14 opacity-30' : 'right-10 top-5 w-20 h-20 opacity-35'} rotate-12`} viewBox="0 0 80 80">
          <polygon points="40,6 68,26 56,70 24,70 12,26" fill="#A7F3D0" stroke="#059669" strokeWidth="4" />
        </svg>
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
      <svg className={`absolute ${isTrack ? 'right-4 bottom-2 w-16 h-12 opacity-35' : 'right-10 top-5 w-24 h-16 opacity-35'}`} viewBox="0 0 120 75">
        <circle cx="38" cy="44" r="22" fill="white" />
        <circle cx="64" cy="36" r="26" fill="white" />
        <circle cx="88" cy="46" r="19" fill="white" />
        <rect x="26" y="42" width="72" height="24" rx="12" fill="white" />
      </svg>
    </div>
  );
};

// --- REUSABLE QUIZ CARD COMPONENT ---
const QuizCardItem = ({
  quiz,
  currentUserId,
  likedQuizIds,
  favoriteQuizIds,
  onToggleLike,
  onToggleFavorite,
  onOpenQuiz,
  onOpenProfile,
  onDuplicateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onTogglePublishQuiz,
}) => {
  const isOwner = currentUserId && quiz.creatorId === currentUserId;
  const isLiked = likedQuizIds.includes(quiz.id);
  const isSaved = favoriteQuizIds.includes(quiz.id);

  return (
    <div className="bg-white rounded-3xl overflow-hidden border-2 border-slate-200 hover:border-emerald-400 shadow-[0_4px_0_rgb(226,232,240)] transition-all flex flex-col justify-between">
      <div>
        <div
          onClick={() => onOpenQuiz(quiz.id)}
          className={`h-28 bg-gradient-to-r ${quiz.color || 'from-emerald-500 to-teal-600'} p-4 flex flex-col justify-between text-white relative overflow-hidden cursor-pointer`}
        >
          {quiz.coverImage && (
            <img
              src={quiz.coverImage}
              alt={quiz.title}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
              {quiz.category} {quiz.subject ? `• ${quiz.subject}` : ''}
            </span>
            <div className="flex items-center gap-1.5">
              {quiz.status === 'draft' && (
                <span className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                  Draft
                </span>
              )}
              {quiz.visibility === 'private' && (
                <span className="bg-slate-900/80 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase inline-flex items-center gap-1">
                  <Lock size={10} /> Private
                </span>
              )}
              {quiz.status === 'unpublished' && (
                <span className="bg-rose-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                  Unpublished
                </span>
              )}
              <span className="bg-black/35 px-2 py-0.5 rounded-md text-[10px] font-extrabold">
                {quiz.difficulty || 'Medium'}
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] font-black">
            <span>{quiz.questions?.length || 0} Questions</span>
            <span>{Number(quiz.plays || 0).toLocaleString()} plays</span>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <h3
            onClick={() => onOpenQuiz(quiz.id)}
            className="font-black text-base text-slate-800 hover:text-emerald-600 cursor-pointer line-clamp-1"
          >
            {quiz.title}
          </h3>
          {quiz.description && (
            <p className="text-xs text-slate-500 font-medium line-clamp-2">{quiz.description}</p>
          )}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => onOpenProfile(quiz.creator)}
              className="text-xs font-extrabold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <User size={13} />
              <span>@{quiz.creator}</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleLike(quiz.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 border transition-all cursor-pointer ${
                  isLiked
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-rose-300'
                }`}
                title={isLiked ? 'Unlike quiz' : 'Like quiz'}
              >
                <Heart size={13} className={isLiked ? 'fill-current' : ''} />
                <span>{Number(quiz.likes || 0)}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleFavorite(quiz.id)}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-amber-300'
                }`}
                title={isSaved ? 'Remove from Saved Quizzes' : 'Save to Favorites'}
              >
                <Bookmark size={13} className={isSaved ? 'fill-current' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenQuiz(quiz.id)}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer active:border-b-0 active:translate-y-0.5"
        >
          <Play size={13} className="fill-current" /> Open &amp; Play
        </button>

        {isOwner ? (
          <>
            <button
              type="button"
              onClick={() => onTogglePublishQuiz(quiz)}
              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[11px] cursor-pointer"
              title={quiz.status === 'published' && quiz.visibility === 'public' ? 'Unpublish' : 'Publish'}
            >
              {quiz.status === 'published' && quiz.visibility === 'public' ? 'Unpublish' : 'Publish'}
            </button>
            <button
              type="button"
              onClick={() => onEditQuiz(quiz)}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer"
              title="Edit quiz"
            >
              <Edit3 size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDeleteQuiz(quiz.id)}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
              title="Delete quiz"
            >
              <Trash2 size={14} />
            </button>
          </>
        ) : (
          quiz.allowDuplicate !== false && (
            <button
              type="button"
              onClick={() => onDuplicateQuiz(quiz)}
              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[11px] flex items-center gap-1 cursor-pointer"
              title="Duplicate quiz to your drafts"
            >
              <Copy size={12} /> Copy
            </button>
          )
        )}
      </div>
    </div>
  );
};

// --- USER DASHBOARD VIEW (MY QUIZZES, DRAFTS, SAVED, LIKED, FOLLOWERS, ACHIEVEMENTS, REAL STATS) ---
const UserDashboardView = ({
  currentUser,
  allQuizzes,
  allProfiles,
  follows,
  likes,
  favorites,
  attempts,
  unlockedAchievementIds,
  season,
  seasonLevel,
  seasonXp,
  coins,
  setView,
  onOpenQuiz,
  onOpenProfile,
  onToggleLike,
  onToggleFavorite,
  onDuplicateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onTogglePublishQuiz,
  onToggleFollow,
  showToast,
}) => {
  const [dashTab, setDashTab] = useState('published');
  const theme = SEASON_THEMES[season.themeKey] || SEASON_THEMES.skyward;

  const myQuizzes = useMemo(
    () => allQuizzes.filter(q => q.creatorId === currentUser.id),
    [allQuizzes, currentUser.id]
  );
  const myPublishedQuizzes = useMemo(
    () => myQuizzes.filter(q => q.status === 'published' && q.visibility === 'public'),
    [myQuizzes]
  );
  const myDraftQuizzes = useMemo(
    () => myQuizzes.filter(q => q.status !== 'published' || q.visibility !== 'public'),
    [myQuizzes]
  );
  const mySavedQuizzes = useMemo(
    () => allQuizzes.filter(q => favorites.includes(q.id)),
    [allQuizzes, favorites]
  );
  const myLikedQuizzes = useMemo(
    () => allQuizzes.filter(q => likes.includes(q.id)),
    [allQuizzes, likes]
  );

  const myFollowers = useMemo(() => {
    const followerIds = follows.filter(f => f.followingId === currentUser.id).map(f => f.followerId);
    return allProfiles.filter(p => followerIds.includes(p.id));
  }, [follows, allProfiles, currentUser.id]);

  const myFollowing = useMemo(() => {
    const followingIds = follows.filter(f => f.followerId === currentUser.id).map(f => f.followingId);
    return allProfiles.filter(p => followingIds.includes(p.id));
  }, [follows, allProfiles, currentUser.id]);

  // Real statistics from database state
  const totalQuizzesCreated = myQuizzes.length;
  const totalQuizPlaysReceived = myQuizzes.reduce((acc, q) => acc + (Number(q.plays) || 0), 0);
  const totalLikesReceived = myQuizzes.reduce((acc, q) => acc + (Number(q.likes) || 0), 0);
  const totalFollowersCount = myFollowers.length;

  const myAttempts = useMemo(
    () => attempts.filter(a => a.userId === currentUser.id),
    [attempts, currentUser.id]
  );

  const shareProfileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${encodeURIComponent(currentUser.username)}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Creator & Season Hero */}
      <div className={`bg-gradient-to-br ${theme.heroGradient} rounded-3xl p-6 text-white border-b-4 ${theme.heroBorder} shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5`}>
        <SeasonStickers themeKey={season.themeKey} variant="hero" />
        <div className="space-y-2.5 relative z-10 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className={`${theme.badgeBg} text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5`}>
              <Sparkles size={13} /> {season.name}
            </span>
            <span className="bg-black/25 text-white text-xs font-black px-3 py-1 rounded-full">
              @{currentUser.username}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">
            Welcome back, {currentUser.displayName || currentUser.username}!
          </h1>
          <p className="text-white/90 text-xs sm:text-sm font-medium max-w-xl">
            Manage your published quizzes, drafts, saved favorites, followers, achievements, and Season Pass progress.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setView('create')}
              className="bg-yellow-400 hover:bg-yellow-300 text-yellow-950 border-b-4 border-yellow-600 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={15} /> Create Quiz
            </button>
            <button
              type="button"
              onClick={() => onOpenProfile(currentUser.username)}
              className="bg-white/20 hover:bg-white/30 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <User size={15} /> My Public Profile
            </button>
            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard) navigator.clipboard.writeText(shareProfileUrl).catch(() => {});
                showToast(`Copied profile link: /profile/${currentUser.username}`);
              }}
              className="bg-black/25 hover:bg-black/35 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 size={14} /> Share Profile
            </button>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-xs border border-white/25 rounded-3xl p-4 text-center shrink-0 min-w-[180px] relative z-10">
          <UserAvatarDisplay profile={currentUser} size={64} className="mx-auto" />
          <span className="font-black text-sm block mt-2">Season Tier {seasonLevel} / {season.maxLevel}</span>
          <span className="text-[11px] font-bold text-white/85 block">{seasonXp % 100}% to Tier {Math.min(100, seasonLevel + 1)}</span>
          <span className="text-[11px] font-black text-amber-200 block mt-0.5">{coins.toLocaleString()} QuizCoins</span>
        </div>
      </div>

      {/* Real Database Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-[0_4px_0_rgb(226,232,240)]">
          <span className="text-[10px] font-black uppercase text-slate-400 block">Total Quizzes Created</span>
          <span className="text-2xl font-black text-slate-800 mt-1 block">{totalQuizzesCreated}</span>
          <span className="text-[11px] font-bold text-emerald-600">{myPublishedQuizzes.length} Published &bull; {myDraftQuizzes.length} Drafts/Private</span>
        </div>
        <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-[0_4px_0_rgb(226,232,240)]">
          <span className="text-[10px] font-black uppercase text-slate-400 block">Total Quiz Plays</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{totalQuizPlaysReceived.toLocaleString()}</span>
          <span className="text-[11px] font-bold text-slate-500">Across your created quizzes</span>
        </div>
        <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-[0_4px_0_rgb(226,232,240)]">
          <span className="text-[10px] font-black uppercase text-slate-400 block">Total Likes Received</span>
          <span className="text-2xl font-black text-rose-500 mt-1 block">{totalLikesReceived.toLocaleString()}</span>
          <span className="text-[11px] font-bold text-slate-500">Community appreciation</span>
        </div>
        <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-[0_4px_0_rgb(226,232,240)]">
          <span className="text-[10px] font-black uppercase text-slate-400 block">Total Followers</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{totalFollowersCount}</span>
          <span className="text-[11px] font-bold text-slate-500">Following {myFollowing.length} creators</span>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'published', label: `Published Quizzes (${myPublishedQuizzes.length})` },
          { id: 'drafts', label: `Drafts & Private (${myDraftQuizzes.length})` },
          { id: 'saved', label: `Saved Quizzes (${mySavedQuizzes.length})` },
          { id: 'liked', label: `Liked Quizzes (${myLikedQuizzes.length})` },
          { id: 'attempts', label: `My Quiz History (${myAttempts.length})` },
          { id: 'followers', label: `Followers (${myFollowers.length})` },
          { id: 'following', label: `Following (${myFollowing.length})` },
          { id: 'achievements', label: `Achievements (${unlockedAchievementIds.length}/${ACHIEVEMENTS_CATALOG.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setDashTab(tab.id)}
            className={`px-3.5 py-2 rounded-2xl font-black text-xs transition-all cursor-pointer ${
              dashTab === tab.id
                ? 'bg-emerald-600 text-white border-b-4 border-emerald-800 shadow-xs'
                : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-emerald-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {dashTab === 'published' && (
        myPublishedQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 text-center space-y-3">
            <p className="font-black text-slate-800">You haven't published any public quizzes yet.</p>
            <button
              type="button"
              onClick={() => setView('create')}
              className="bg-orange-500 text-white border-b-4 border-orange-700 font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Create Your First Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myPublishedQuizzes.map(q => (
              <QuizCardItem
                key={q.id}
                quiz={q}
                currentUserId={currentUser.id}
                likedQuizIds={likes}
                favoriteQuizIds={favorites}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                onOpenQuiz={onOpenQuiz}
                onOpenProfile={onOpenProfile}
                onDuplicateQuiz={onDuplicateQuiz}
                onEditQuiz={onEditQuiz}
                onDeleteQuiz={onDeleteQuiz}
                onTogglePublishQuiz={onTogglePublishQuiz}
              />
            ))}
          </div>
        )
      )}

      {dashTab === 'drafts' && (
        myDraftQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 text-center">
            <p className="font-black text-slate-700 text-sm">No drafts, private, or unpublished quizzes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myDraftQuizzes.map(q => (
              <QuizCardItem
                key={q.id}
                quiz={q}
                currentUserId={currentUser.id}
                likedQuizIds={likes}
                favoriteQuizIds={favorites}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                onOpenQuiz={onOpenQuiz}
                onOpenProfile={onOpenProfile}
                onDuplicateQuiz={onDuplicateQuiz}
                onEditQuiz={onEditQuiz}
                onDeleteQuiz={onDeleteQuiz}
                onTogglePublishQuiz={onTogglePublishQuiz}
              />
            ))}
          </div>
        )
      )}

      {dashTab === 'saved' && (
        mySavedQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 text-center space-y-2">
            <p className="font-black text-slate-700 text-sm">No saved quizzes in your private collection yet.</p>
            <p className="text-xs text-slate-500">Click the bookmark icon on any quiz card to save it here privately.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {mySavedQuizzes.map(q => (
              <QuizCardItem
                key={q.id}
                quiz={q}
                currentUserId={currentUser.id}
                likedQuizIds={likes}
                favoriteQuizIds={favorites}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                onOpenQuiz={onOpenQuiz}
                onOpenProfile={onOpenProfile}
                onDuplicateQuiz={onDuplicateQuiz}
                onEditQuiz={onEditQuiz}
                onDeleteQuiz={onDeleteQuiz}
                onTogglePublishQuiz={onTogglePublishQuiz}
              />
            ))}
          </div>
        )
      )}

      {dashTab === 'liked' && (
        myLikedQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 text-center">
            <p className="font-black text-slate-700 text-sm">You haven't liked any quizzes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myLikedQuizzes.map(q => (
              <QuizCardItem
                key={q.id}
                quiz={q}
                currentUserId={currentUser.id}
                likedQuizIds={likes}
                favoriteQuizIds={favorites}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                onOpenQuiz={onOpenQuiz}
                onOpenProfile={onOpenProfile}
                onDuplicateQuiz={onDuplicateQuiz}
                onEditQuiz={onEditQuiz}
                onDeleteQuiz={onDeleteQuiz}
                onTogglePublishQuiz={onTogglePublishQuiz}
              />
            ))}
          </div>
        )
      )}

      {dashTab === 'attempts' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-3">
          <h3 className="font-black text-base text-slate-800">Completed Quiz Attempts</h3>
          {myAttempts.length === 0 ? (
            <p className="text-xs text-slate-500 font-medium">Complete a quiz to record your scores and review past attempts.</p>
          ) : (
            <div className="space-y-2.5">
              {myAttempts.map(att => {
                const qObj = allQuizzes.find(q => q.id === att.quizId);
                return (
                  <div key={att.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-black text-sm text-slate-800 block">{qObj?.title || att.quizTitle || 'Quiz'}</span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {new Date(att.completedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-3 py-1 rounded-full">
                        {att.score}/{att.totalQuestions} ({att.percentage}%)
                      </span>
                      {qObj && (
                        <button
                          type="button"
                          onClick={() => onOpenQuiz(qObj.id)}
                          className="text-xs font-black text-blue-600 hover:underline cursor-pointer"
                        >
                          Replay
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {(dashTab === 'followers' || dashTab === 'following') && (
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-4">
          <h3 className="font-black text-base text-slate-800">
            {dashTab === 'followers' ? `Your Followers (${myFollowers.length})` : `Creators You Follow (${myFollowing.length})`}
          </h3>
          {(dashTab === 'followers' ? myFollowers : myFollowing).length === 0 ? (
            <p className="text-xs text-slate-500 font-medium">
              {dashTab === 'followers'
                ? 'No followers yet. Publish helpful quizzes to grow your community!'
                : 'You are not following anyone yet. Explore creators and click Follow!'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(dashTab === 'followers' ? myFollowers : myFollowing).map(person => {
                const isFollowingPerson = follows.some(
                  f => f.followerId === currentUser.id && f.followingId === person.id
                );
                return (
                  <div key={person.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div
                      onClick={() => onOpenProfile(person.username)}
                      className="flex items-center gap-3 cursor-pointer min-w-0"
                    >
                      <UserAvatarDisplay profile={person} size={42} />
                      <div className="min-w-0">
                        <span className="font-black text-sm text-slate-800 block truncate">{person.displayName || person.username}</span>
                        <span className="text-xs font-bold text-emerald-700">@{person.username}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleFollow(person.id)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer ${
                        isFollowingPerson
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {isFollowingPerson ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {dashTab === 'achievements' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-4">
          <h3 className="font-black text-base text-slate-800">Community &amp; Learning Achievements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENTS_CATALOG.map(ach => {
              const Icon = ach.icon;
              const unlocked = unlockedAchievementIds.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border-2 flex items-start gap-3 ${
                    unlocked ? 'bg-white border-emerald-300 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-65'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${ach.color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-xs text-slate-800">{ach.name}</h4>
                      {unlocked && <CheckCircle2 size={14} className="text-emerald-500" />}
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">{ach.desc}</p>
                    <span className="text-[10px] font-black uppercase text-slate-400 mt-1 block">
                      {unlocked ? 'Unlocked!' : `Goal: ${ach.target}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- EXPLORE PAGE (ALL SECTIONS, FILTERS, SORTING & PAGINATION) ---
const ExploreView = ({
  allQuizzes,
  allProfiles,
  currentUser,
  likes,
  favorites,
  onToggleLike,
  onToggleFavorite,
  onOpenQuiz,
  onOpenProfile,
  onDuplicateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onTogglePublishQuiz,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [subject, setSubject] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('trending');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Only public, published quizzes appear in Explore
  const publicQuizzes = useMemo(
    () => allQuizzes.filter(q => q.visibility === 'public' && q.status === 'published'),
    [allQuizzes]
  );

  const categories = ['All', 'Science', 'Math', 'History', 'Geography', 'English', 'Computer Science'];
  const subjects = useMemo(() => {
    const set = new Set(['All']);
    publicQuizzes.forEach(q => {
      if (q.subject) set.add(q.subject);
    });
    return Array.from(set);
  }, [publicQuizzes]);

  const filteredQuizzes = useMemo(() => {
    return publicQuizzes
      .filter(q => {
        const matchesSearch =
          !search.trim() ||
          q.title.toLowerCase().includes(search.toLowerCase()) ||
          (q.description || '').toLowerCase().includes(search.toLowerCase()) ||
          (q.subject || '').toLowerCase().includes(search.toLowerCase()) ||
          (q.creator || '').toLowerCase().includes(search.toLowerCase());
        const matchesCat = category === 'All' || q.category === category;
        const matchesSub = subject === 'All' || q.subject === subject;
        const matchesDiff = difficulty === 'All' || q.difficulty === difficulty;
        return matchesSearch && matchesCat && matchesSub && matchesDiff;
      })
      .sort((a, b) => {
        if (sortBy === 'most_played') return (b.plays || 0) - (a.plays || 0);
        if (sortBy === 'most_liked') return (b.likes || 0) - (a.likes || 0);
        if (sortBy === 'recent') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        return ((b.plays || 0) + (b.likes || 0) * 3) - ((a.plays || 0) + (a.likes || 0) * 3);
      });
  }, [publicQuizzes, search, category, subject, difficulty, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / pageSize));
  const paginatedQuizzes = filteredQuizzes.slice((page - 1) * pageSize, page * pageSize);

  const featuredQuizzes = useMemo(() => publicQuizzes.slice(0, 2), [publicQuizzes]);
  const trendingQuizzes = useMemo(
    () => [...publicQuizzes].sort((a, b) => ((b.plays || 0) + (b.likes || 0) * 2) - ((a.plays || 0) + (a.likes || 0) * 2)).slice(0, 2),
    [publicQuizzes]
  );
  const recentQuizzes = useMemo(
    () => [...publicQuizzes].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 2),
    [publicQuizzes]
  );
  const publicCreators = useMemo(
    () => allProfiles.filter(p => p.isPublic !== false).slice(0, 6),
    [allProfiles]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-[0_4px_0_rgb(226,232,240)] space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search public quizzes by title, description, subject, or creator..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={subject}
            onChange={e => { setSubject(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-700 outline-none focus:border-emerald-500"
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={e => { setDifficulty(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-700 outline-none focus:border-emerald-500"
          >
            {['All', 'Easy', 'Medium', 'Hard', 'Custom'].map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="trending">Sort: Trending</option>
            <option value="recent">Sort: Recently Published</option>
            <option value="most_played">Sort: Most Played</option>
            <option value="most_liked">Sort: Most Liked</option>
          </select>
        </div>

        {/* Popular Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-black uppercase text-slate-400 shrink-0">Popular Categories:</span>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                category === cat
                  ? 'bg-emerald-600 text-white border-b-2 border-emerald-800'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* New Creators Strip */}
      {publicCreators.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Users size={16} className="text-emerald-600" /> Community Creators
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {publicCreators.map(creator => (
              <button
                key={creator.id}
                type="button"
                onClick={() => onOpenProfile(creator.username)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer"
              >
                <UserAvatarDisplay profile={creator} size={44} />
                <span className="font-black text-xs text-slate-800 truncate w-full">{creator.displayName || creator.username}</span>
                <span className="text-[10px] font-bold text-emerald-700 truncate w-full">@{creator.username}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Curated Highlights (Featured / Trending / Recently Published) */}
      {!search && category === 'All' && subject === 'All' && difficulty === 'All' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Featured Quizzes', items: featuredQuizzes, badge: 'Featured', color: 'text-amber-600' },
            { title: 'Trending Quizzes', items: trendingQuizzes, badge: 'Hot', color: 'text-rose-600' },
            { title: 'Recently Published', items: recentQuizzes, badge: 'New', color: 'text-emerald-600' },
          ].map(sec => (
            <div key={sec.title} className="bg-white rounded-3xl p-4 border-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-800">{sec.title}</h3>
                <span className={`text-[10px] font-black uppercase ${sec.color}`}>{sec.badge}</span>
              </div>
              <div className="space-y-2">
                {sec.items.map(q => (
                  <div
                    key={q.id}
                    onClick={() => onOpenQuiz(q.id)}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 cursor-pointer transition-colors"
                  >
                    <span className="font-black text-xs text-slate-800 block truncate">{q.title}</span>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mt-1">
                      <span>@{q.creator}</span>
                      <span>{q.plays || 0} plays &bull; {q.likes || 0} likes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Filtered & Sorted Public Quizzes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800">
            Public Community Quizzes ({filteredQuizzes.length})
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Page {page} of {totalPages}
          </span>
        </div>

        {paginatedQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border-2 border-slate-200 text-center space-y-2">
            <p className="font-black text-slate-700">No public quizzes match your current filters.</p>
            <p className="text-xs text-slate-500">Try clearing your search or choosing another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {paginatedQuizzes.map(quiz => (
              <QuizCardItem
                key={quiz.id}
                quiz={quiz}
                currentUserId={currentUser?.id}
                likedQuizIds={likes}
                favoriteQuizIds={favorites}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                onOpenQuiz={onOpenQuiz}
                onOpenProfile={onOpenProfile}
                onDuplicateQuiz={onDuplicateQuiz}
                onEditQuiz={onEditQuiz}
                onDeleteQuiz={onDeleteQuiz}
                onTogglePublishQuiz={onTogglePublishQuiz}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl bg-white border-2 border-slate-200 font-black text-xs disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs disabled:opacity-40 cursor-pointer"
            >
              Next Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- GLOBAL SEARCH VIEW ---
const GlobalSearchView = ({
  allQuizzes,
  allProfiles,
  currentUser,
  follows,
  likes,
  favorites,
  onToggleFollow,
  onToggleLike,
  onToggleFavorite,
  onOpenQuiz,
  onOpenProfile,
  onDuplicateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onTogglePublishQuiz,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'users' | 'quizzes'
  const [isSearching, setIsSearching] = useState(false);

  const handleQueryChange = (val) => {
    setQuery(val);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 180);
  };

  const trimmed = query.trim().toLowerCase();

  const matchedUsers = useMemo(() => {
    return allProfiles.filter(p => {
      if (p.isPublic === false && p.id !== currentUser?.id) return false;
      if (!trimmed) return true;
      return (
        (p.username || '').toLowerCase().includes(trimmed) ||
        (p.displayName || '').toLowerCase().includes(trimmed) ||
        (p.bio || '').toLowerCase().includes(trimmed)
      );
    });
  }, [allProfiles, trimmed, currentUser?.id]);

  const matchedQuizzes = useMemo(() => {
    return allQuizzes.filter(q => {
      if (q.visibility !== 'public' || q.status !== 'published') return false;
      if (!trimmed) return true;
      return (
        (q.title || '').toLowerCase().includes(trimmed) ||
        (q.description || '').toLowerCase().includes(trimmed) ||
        (q.subject || '').toLowerCase().includes(trimmed) ||
        (q.category || '').toLowerCase().includes(trimmed) ||
        (q.creator || '').toLowerCase().includes(trimmed)
      );
    });
  }, [allQuizzes, trimmed]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-[0_4px_0_rgb(226,232,240)] space-y-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Global Search</h2>
          <p className="text-xs text-slate-500 font-medium">
            Search across usernames, display names, quiz titles, descriptions, subjects, and categories.
          </p>
        </div>

        <div className="relative">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Type a username, display name, quiz title, subject, or category..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          {[
            { id: 'all', label: `All Results (${matchedUsers.length + matchedQuizzes.length})` },
            { id: 'users', label: `Users (${matchedUsers.length})` },
            { id: 'quizzes', label: `Quizzes (${matchedQuizzes.length})` },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer transition-all ${
                filterType === f.id
                  ? 'bg-emerald-600 text-white border-b-2 border-emerald-800'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isSearching && (
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 text-center text-xs font-black text-emerald-700 animate-pulse">
          Searching Quizly community...
        </div>
      )}

      {!isSearching && (filterType === 'all' || filterType === 'users') && (
        <div className="space-y-3">
          <h3 className="text-base font-black text-slate-800">Users ({matchedUsers.length})</h3>
          {matchedUsers.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 text-center text-xs font-bold text-slate-500">
              No public users matched "{query}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedUsers.map(person => {
                const isSelf = currentUser?.id === person.id;
                const isFollowing = follows.some(
                  f => f.followerId === currentUser?.id && f.followingId === person.id
                );
                return (
                  <div key={person.id} className="bg-white rounded-3xl p-4 border-2 border-slate-200 flex items-center justify-between gap-3">
                    <div
                      onClick={() => onOpenProfile(person.username)}
                      className="flex items-center gap-3 cursor-pointer min-w-0"
                    >
                      <UserAvatarDisplay profile={person} size={46} />
                      <div className="min-w-0">
                        <span className="font-black text-sm text-slate-800 block truncate">
                          {person.displayName || person.username}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 block truncate">@{person.username}</span>
                        {person.bio && (
                          <span className="text-[11px] text-slate-500 line-clamp-1 block">{person.bio}</span>
                        )}
                      </div>
                    </div>
                    {!isSelf && currentUser && (
                      <button
                        type="button"
                        onClick={() => onToggleFollow(person.id)}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs shrink-0 cursor-pointer ${
                          isFollowing
                            ? 'bg-slate-100 text-slate-700 border border-slate-300'
                            : 'bg-emerald-500 text-white border-b-2 border-emerald-700'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!isSearching && (filterType === 'all' || filterType === 'quizzes') && (
        <div className="space-y-3">
          <h3 className="text-base font-black text-slate-800">Quizzes ({matchedQuizzes.length})</h3>
          {matchedQuizzes.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 text-center text-xs font-bold text-slate-500">
              No public quizzes matched "{query}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {matchedQuizzes.map(q => (
                <QuizCardItem
                  key={q.id}
                  quiz={q}
                  currentUserId={currentUser?.id}
                  likedQuizIds={likes}
                  favoriteQuizIds={favorites}
                  onToggleLike={onToggleLike}
                  onToggleFavorite={onToggleFavorite}
                  onOpenQuiz={onOpenQuiz}
                  onOpenProfile={onOpenProfile}
                  onDuplicateQuiz={onDuplicateQuiz}
                  onEditQuiz={onEditQuiz}
                  onDeleteQuiz={onDeleteQuiz}
                  onTogglePublishQuiz={onTogglePublishQuiz}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- INDIVIDUAL QUIZ DETAIL, COMMENTS, REPORTING & PLAY VIEW (/quiz/:quizId) ---
const QuizDetailAndPlayView = ({
  quiz,
  currentUser,
  allProfiles,
  likes,
  favorites,
  attempts,
  comments,
  onBack,
  onToggleLike,
  onToggleFavorite,
  onDuplicateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onTogglePublishQuiz,
  onOpenProfile,
  onCompleteQuizAttempt,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onSubmitReport,
  doubleCoins,
  doubleXp,
  showToast,
}) => {
  const [mode, setMode] = useState('overview'); // 'overview' | 'playing' | 'results'
  const [qIndex, setQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [currentChoice, setCurrentChoice] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const [reportCategory, setReportCategory] = useState('Inappropriate content');
  const [reportDetails, setReportDetails] = useState('');

  useEffect(() => {
    setMode('overview');
    setQIndex(0);
    setSelectedAnswers([]);
    setCurrentChoice(null);
    setLastResult(null);
  }, [quiz?.id]);

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border-2 border-slate-200 text-center space-y-4">
        <AlertTriangle size={36} className="text-amber-500 mx-auto" />
        <h2 className="text-xl font-black text-slate-800">Quiz Not Found or Private</h2>
        <p className="text-xs text-slate-500 font-medium">
          This quiz may be private, unpublished, or removed by its creator.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="bg-emerald-600 text-white font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const isOwner = currentUser && quiz.creatorId === currentUser.id;
  if (quiz.visibility === 'private' && !isOwner && !currentUser?.isTeamAdmin) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border-2 border-slate-200 text-center space-y-4">
        <Lock size={36} className="text-slate-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-800">Private Quiz</h2>
        <p className="text-xs text-slate-500 font-medium">
          Only the creator of this quiz can view or play it.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="bg-emerald-600 text-white font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const isLiked = likes.includes(quiz.id);
  const isSaved = favorites.includes(quiz.id);
  const quizComments = comments.filter(c => c.quizId === quiz.id);
  const myPreviousAttempts = currentUser
    ? attempts.filter(a => a.userId === currentUser.id && a.quizId === quiz.id)
    : [];

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/quiz/${quiz.id}`;

  const startPlay = () => {
    setQIndex(0);
    setSelectedAnswers([]);
    setCurrentChoice(null);
    setMode('playing');
  };

  const handleSelectOption = (optIdx) => {
    if (currentChoice !== null) return;
    setCurrentChoice(optIdx);
    const updatedAnswers = [...selectedAnswers, optIdx];
    setSelectedAnswers(updatedAnswers);

    setTimeout(() => {
      if (qIndex + 1 < quiz.questions.length) {
        setQIndex(q => q + 1);
        setCurrentChoice(null);
      } else {
        // Calculate final score and record completed attempt (opening never counts!)
        let correctCount = 0;
        quiz.questions.forEach((question, idx) => {
          if (updatedAnswers[idx] === question.answer) correctCount += 1;
        });
        const totalQuestions = quiz.questions.length;
        const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        const coinMult = doubleCoins ? 2 : 1;
        const xpMult = doubleXp ? 2 : 1;
        const coinsEarned = correctCount * 25 * coinMult;
        const xpEarned = correctCount * 20 * xpMult;

        onCompleteQuizAttempt({
          quiz,
          selectedAnswers: updatedAnswers,
          score: correctCount,
          totalQuestions,
          percentage,
          coinsEarned,
          xpEarned,
        });

        setLastResult({
          score: correctCount,
          totalQuestions,
          percentage,
          selectedAnswers: updatedAnswers,
          coinsEarned,
          xpEarned,
        });
        setMode('results');
      }
    }, 750);
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) {
      showToast('Please type a comment before posting.');
      return;
    }
    const success = onAddComment(quiz.id, trimmed);
    if (success) setCommentText('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Report Modal */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setReportTarget(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-slate-200 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                <Flag size={18} className="text-rose-500" /> Report {reportTarget.type}
              </h3>
              <button type="button" onClick={() => setReportTarget(null)} className="p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">Report Category</label>
              <select
                value={reportCategory}
                onChange={e => setReportCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-800"
              >
                <option>Inappropriate content</option>
                <option>Spam</option>
                <option>Harassment</option>
                <option>Impersonation</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">Additional Details</label>
              <textarea
                rows={3}
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
                placeholder="Describe why you are reporting this..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-medium text-slate-800"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                onSubmitReport({
                  targetType: reportTarget.type,
                  targetId: reportTarget.id,
                  category: reportCategory,
                  details: reportDetails.trim(),
                });
                setReportTarget(null);
                setReportDetails('');
              }}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white border-b-4 border-rose-800 font-black py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Submit Report to Moderators
            </button>
          </div>
        </div>
      )}

      {/* Top Back & URL Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <span className="text-[11px] font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          URL: <strong className="text-emerald-700">/quiz/{quiz.id}</strong>
        </span>
      </div>

      {/* PLAYING MODE */}
      {mode === 'playing' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border-2 border-slate-200">
            <span className="text-xs font-black uppercase text-slate-500">
              Question {qIndex + 1} of {quiz.questions.length}
            </span>
            <span className="font-black text-sm text-emerald-700">{quiz.title}</span>
            <button
              type="button"
              onClick={() => setMode('overview')}
              className="text-xs font-black text-rose-500 hover:underline cursor-pointer"
            >
              Exit Quiz
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-[0_5px_0_rgb(226,232,240)] text-center space-y-4">
            {quiz.questions[qIndex].image && (
              <img
                src={quiz.questions[qIndex].image}
                alt="Question illustration"
                className="w-44 h-44 object-cover rounded-2xl border-2 border-slate-200 mx-auto"
              />
            )}
            <h2 className="text-xl md:text-2xl font-black text-slate-800">{quiz.questions[qIndex].q}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quiz.questions[qIndex].options.map((opt, idx) => {
              const btnColors = [
                'bg-red-500 hover:bg-red-600 border-red-700',
                'bg-blue-500 hover:bg-blue-600 border-blue-700',
                'bg-amber-500 hover:bg-amber-600 border-amber-700',
                'bg-emerald-500 hover:bg-emerald-600 border-emerald-700',
              ];
              let extra = '';
              if (currentChoice !== null) {
                if (idx === quiz.questions[qIndex].answer) extra = 'ring-4 ring-emerald-300 scale-[1.02]';
                else if (idx === currentChoice) extra = 'opacity-60';
                else extra = 'opacity-50';
              }
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`${btnColors[idx % 4]} ${extra} text-white font-black text-base p-5 rounded-2xl border-b-4 transition-all cursor-pointer text-left flex items-center justify-between`}
                >
                  <span>{opt}</span>
                  {currentChoice !== null && idx === quiz.questions[qIndex].answer && <Check size={20} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* RESULTS MODE (WITH CORRECT ANSWERS BREAKDOWN) */}
      {mode === 'results' && lastResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border-2 border-emerald-300 shadow-[0_6px_0_rgb(167,243,208)] text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trophy size={34} />
            </div>
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase px-3 py-1 rounded-full">
                Quiz Results
              </span>
              <h2 className="text-3xl font-black text-slate-800 mt-2">
                {lastResult.score} / {lastResult.totalQuestions} Correct ({lastResult.percentage}%)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Attempt saved! Play count updated for @{quiz.creator}.
              </p>
            </div>

            {currentUser && (
              <div className="flex justify-center gap-4">
                <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-amber-700 block">QuizCoins Earned</span>
                  <span className="text-xl font-black text-amber-600">+{lastResult.coinsEarned}</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 px-4 py-3 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-purple-700 block">Season Pass XP</span>
                  <span className="text-xl font-black text-purple-600">+{lastResult.xpEarned} XP</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={startPlay}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800 font-black px-6 py-3 rounded-xl text-xs cursor-pointer"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={() => setMode('overview')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black px-5 py-3 rounded-xl text-xs cursor-pointer"
              >
                Back to Quiz Details
              </button>
            </div>
          </div>

          {/* Correct Answers Review */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-4">
            <h3 className="font-black text-base text-slate-800">Answer Review &amp; Correct Solutions</h3>
            <div className="space-y-3">
              {quiz.questions.map((question, idx) => {
                const picked = lastResult.selectedAnswers[idx];
                const isRight = picked === question.answer;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 space-y-2 ${
                      isRight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-sm text-slate-800">
                        {idx + 1}. {question.q}
                      </span>
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${isRight ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {isRight ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <div className="text-xs font-bold space-y-1">
                      <p className="text-slate-600">
                        Your Answer: <span className={isRight ? 'text-emerald-700' : 'text-rose-700'}>{question.options[picked] ?? 'None'}</span>
                      </p>
                      {!isRight && (
                        <p className="text-emerald-700">
                          Correct Answer: <strong>{question.options[question.answer]}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* OVERVIEW MODE */}
      {mode === 'overview' && (
        <>
          <div className="bg-white rounded-3xl overflow-hidden border-2 border-slate-200 shadow-[0_5px_0_rgb(226,232,240)]">
            <div className={`bg-gradient-to-r ${quiz.color || 'from-emerald-500 to-teal-700'} p-6 md:p-8 text-white relative`}>
              {quiz.coverImage && (
                <img src={quiz.coverImage} alt={quiz.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
              )}
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-black/35 px-3 py-1 rounded-full text-xs font-black uppercase">
                      {quiz.category} {quiz.subject ? `• ${quiz.subject}` : ''}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black">
                      {quiz.difficulty || 'Medium'}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black capitalize">
                      {quiz.visibility} &bull; {quiz.status}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black">{quiz.title}</h1>
                  {quiz.description && (
                    <p className="text-white/90 text-sm font-medium max-w-2xl">{quiz.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/90 pt-1">
                    <button
                      type="button"
                      onClick={() => onOpenProfile(quiz.creator)}
                      className="bg-black/25 hover:bg-black/40 px-3 py-1 rounded-full font-black cursor-pointer"
                    >
                      Created by @{quiz.creator}
                    </button>
                    <span>&bull; {quiz.questions.length} Questions</span>
                    <span>&bull; {Number(quiz.plays || 0).toLocaleString()} Plays</span>
                    <span>&bull; {Number(quiz.likes || 0).toLocaleString()} Likes</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startPlay}
                  className="bg-yellow-400 hover:bg-yellow-300 text-yellow-950 border-b-4 border-yellow-600 font-black px-7 py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 active:border-b-0 active:translate-y-0.5"
                >
                  <Play size={18} className="fill-current" /> Start Quiz
                </button>
              </div>
            </div>

            {/* Social & Creator Action Bar */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleLike(quiz.id)}
                  className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 border-2 cursor-pointer ${
                    isLiked
                      ? 'bg-rose-50 border-rose-400 text-rose-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300'
                  }`}
                >
                  <Heart size={15} className={isLiked ? 'fill-current' : ''} />
                  <span>{isLiked ? 'Liked' : 'Like'} ({quiz.likes || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(quiz.id)}
                  className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 border-2 cursor-pointer ${
                    isSaved
                      ? 'bg-amber-50 border-amber-400 text-amber-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
                  }`}
                >
                  <Bookmark size={15} className={isSaved ? 'fill-current' : ''} />
                  <span>{isSaved ? 'Saved' : 'Save Quiz'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) navigator.clipboard.writeText(shareUrl).catch(() => {});
                    showToast(`Copied quiz share link: /quiz/${quiz.id}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-white border-2 border-slate-200 hover:border-emerald-400 font-black text-xs text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 size={14} /> Share Link
                </button>

                {!isOwner && quiz.allowDuplicate !== false && (
                  <button
                    type="button"
                    onClick={() => onDuplicateQuiz(quiz)}
                    className="px-4 py-2 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-400 font-black text-xs text-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy size={14} /> Duplicate Quiz
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onTogglePublishQuiz(quiz)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs cursor-pointer"
                    >
                      {quiz.status === 'published' && quiz.visibility === 'public' ? 'Unpublish' : 'Publish Publicly'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditQuiz(quiz)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-black text-xs cursor-pointer"
                    >
                      Edit Quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteQuiz(quiz.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-black text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReportTarget({ type: 'quiz', id: quiz.id })}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 font-black text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Flag size={13} /> Report
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Previous Attempts for Account Owner */}
          {currentUser && myPreviousAttempts.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 space-y-3">
              <h3 className="font-black text-sm text-slate-800">Your Previous Attempts ({myPreviousAttempts.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {myPreviousAttempts.slice(0, 6).map(att => (
                  <div key={att.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                      {new Date(att.completedAt).toLocaleDateString()}
                    </span>
                    <span className="font-black text-xs text-emerald-700">
                      {att.score}/{att.totalQuestions} ({att.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments & Community Interaction */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-emerald-600" />
                <span>Comments ({quizComments.length})</span>
              </h3>
              {quiz.commentsEnabled === false && (
                <span className="text-xs font-black text-slate-400">Comments disabled by creator</span>
              )}
            </div>

            {quiz.commentsEnabled !== false && (
              currentUser ? (
                <form onSubmit={handlePostComment} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    maxLength={280}
                    placeholder="Write a helpful comment or feedback..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800 font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer shrink-0"
                  >
                    Post Comment
                  </button>
                </form>
              ) : (
                <p className="text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl">
                  Sign in to leave a comment on this quiz.
                </p>
              )
            )}

            {quizComments.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">No comments yet. Start the discussion!</p>
            ) : (
              <div className="space-y-3">
                {quizComments.map(c => {
                  const commenterProfile = allProfiles.find(p => p.id === c.userId) || { username: c.username };
                  const canEdit = currentUser && c.userId === currentUser.id;
                  const canDelete = currentUser && (c.userId === currentUser.id || isOwner || currentUser.isTeamAdmin);

                  return (
                    <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div onClick={() => onOpenProfile(c.username)} className="cursor-pointer">
                          <UserAvatarDisplay profile={commenterProfile} size={36} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenProfile(c.username)}
                              className="font-black text-xs text-slate-800 hover:text-emerald-700 cursor-pointer"
                            >
                              @{c.username}
                            </button>
                            <span className="text-[10px] font-bold text-slate-400">
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
                          </div>

                          {editingCommentId === c.id ? (
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                value={editingCommentText}
                                onChange={e => setEditingCommentText(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (editingCommentText.trim()) {
                                    onEditComment(c.id, editingCommentText.trim());
                                    setEditingCommentId(null);
                                  }
                                }}
                                className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-700 font-medium mt-1 break-words">{c.content}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(c.id);
                              setEditingCommentText(c.content);
                            }}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                            title="Edit comment"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => onDeleteComment(c.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete comment"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                        {currentUser && c.userId !== currentUser.id && (
                          <button
                            type="button"
                            onClick={() => setReportTarget({ type: 'comment', id: c.id })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Report comment"
                          >
                            <Flag size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// --- PUBLIC & OWN USER PROFILE VIEW (/profile/:username) ---
const PublicProfileView = ({
  profile,
  currentUser,
  allQuizzes,
  allProfiles,
  follows,
  likes,
  favorites,
  userAchievementsMap,
  season,
  coins,
  ownedSkins,
  onBack,
  onToggleFollow,
  onUpdateProfile,
  onUploadAvatar,
  onOpenQuiz,
  onOpenProfile,
  onToggleLike,
  onToggleFavorite,
  onDuplicateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onTogglePublishQuiz,
  onSubmitReport,
  showToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(profile?.displayName || profile?.username || '');
  const [bioInput, setBioInput] = useState(profile?.bio || '');
  const [isPublicInput, setIsPublicInput] = useState(profile?.isPublic !== false);
  const [listModal, setListModal] = useState(null); // 'followers' | 'following' | null
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCat, setReportCat] = useState('Inappropriate content');
  const [reportNote, setReportNote] = useState('');

  useEffect(() => {
    setDisplayNameInput(profile?.displayName || profile?.username || '');
    setBioInput(profile?.bio || '');
    setIsPublicInput(profile?.isPublic !== false);
    setIsEditing(false);
    setListModal(null);
  }, [profile?.id]);

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border-2 border-slate-200 text-center space-y-4">
        <User size={36} className="text-slate-400 mx-auto" />
        <h2 className="text-xl font-black text-slate-800">Profile Not Found</h2>
        <p className="text-xs text-slate-500">No user profile exists at this URL.</p>
        <button type="button" onClick={onBack} className="bg-emerald-600 text-white font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer">
          Back to Explore
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === profile.id;

  // Enforce private profile privacy!
  if (profile.isPublic === false && !isOwnProfile && !currentUser?.isTeamAdmin) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border-2 border-slate-200 text-center space-y-4">
        <Lock size={38} className="text-slate-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-800">@{profile.username} has a Private Profile</h2>
        <p className="text-xs text-slate-500 font-medium">
          This user has chosen to keep their profile details, quizzes, and followers private.
        </p>
        <button type="button" onClick={onBack} className="bg-emerald-600 text-white font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer">
          Back to Explore
        </button>
      </div>
    );
  }

  const userQuizzes = allQuizzes.filter(q => q.creatorId === profile.id);
  const visibleQuizzes = isOwnProfile
    ? userQuizzes
    : userQuizzes.filter(q => q.visibility === 'public' && q.status === 'published');
  const totalPlays = userQuizzes.reduce((acc, q) => acc + (Number(q.plays) || 0), 0);

  const followersList = allProfiles.filter(p =>
    follows.some(f => f.followingId === profile.id && f.followerId === p.id)
  );
  const followingList = allProfiles.filter(p =>
    follows.some(f => f.followerId === profile.id && f.followingId === p.id)
  );
  const isFollowing = currentUser
    ? follows.some(f => f.followerId === currentUser.id && f.followingId === profile.id)
    : false;

  const unlockedAchIds = userAchievementsMap[profile.id] || [];
  const bannerData = BANNERS.find(b => b.id === (profile.equippedBanner || 'default_blue')) || BANNERS[0];
  const frameData = FRAMES.find(f => f.id === (profile.equippedFrame || 'none')) || FRAMES[0];
  const titleData = TITLES.find(t => t.id === (profile.equippedTitle || 'apprentice')) || TITLES[0];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const canEditDisplayName = Boolean(currentUser?.isTeamAdmin);
    onUpdateProfile({
      ...(canEditDisplayName ? { displayName: displayNameInput.trim() || profile.username } : {}),
      bio: bioInput.trim(),
      isPublic: isPublicInput,
    });
    setIsEditing(false);
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === 'image/gif') {
      showToast('GIFs are not supported for profile avatars. Choose a PNG or JPG.');
      return;
    }
    onUploadAvatar(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Followers / Following Modal */}
      {listModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setListModal(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-slate-200 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800 capitalize">
                @{profile.username}'s {listModal} ({(listModal === 'followers' ? followersList : followingList).length})
              </h3>
              <button type="button" onClick={() => setListModal(null)} className="p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            {(listModal === 'followers' ? followersList : followingList).length === 0 ? (
              <p className="text-xs text-slate-500">No users to show yet.</p>
            ) : (
              <div className="space-y-2.5">
                {(listModal === 'followers' ? followersList : followingList).map(person => (
                  <div
                    key={person.id}
                    onClick={() => {
                      setListModal(null);
                      onOpenProfile(person.username);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 flex items-center gap-3 cursor-pointer"
                  >
                    <UserAvatarDisplay profile={person} size={38} />
                    <div>
                      <span className="font-black text-xs text-slate-800 block">{person.displayName || person.username}</span>
                      <span className="text-[11px] font-bold text-emerald-700">@{person.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Profile Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setReportOpen(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-slate-200 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
              <Flag size={18} className="text-rose-500" /> Report @{profile.username}
            </h3>
            <select
              value={reportCat}
              onChange={e => setReportCat(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold"
            >
              <option>Inappropriate content</option>
              <option>Spam</option>
              <option>Harassment</option>
              <option>Impersonation</option>
              <option>Other</option>
            </select>
            <textarea
              rows={3}
              value={reportNote}
              onChange={e => setReportNote(e.target.value)}
              placeholder="Provide details for the moderation team..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-medium"
            />
            <button
              type="button"
              onClick={() => {
                onSubmitReport({ targetType: 'profile', targetId: profile.id, category: reportCat, details: reportNote });
                setReportOpen(false);
                setReportNote('');
              }}
              className="w-full bg-rose-600 text-white font-black py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Submit Report
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation & Profile URL */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <span className="text-[11px] font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          Profile URL: <strong className="text-emerald-700">/profile/{profile.username}</strong>
        </span>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-[0_4px_0_rgb(226,232,240)]">
        <BannerBackdrop banner={bannerData} className="h-36 sm:h-44 rounded-2xl p-4 flex items-start justify-between">
          <span className="relative z-10 bg-black/30 backdrop-blur-xs text-white text-[11px] font-black px-3 py-1 rounded-full">
            {profile.isPublic === false ? 'Private Profile' : 'Public Profile'}
          </span>
          <span className="relative z-10 bg-black/30 backdrop-blur-xs text-white text-[11px] font-black px-3 py-1 rounded-full">
            Joined {new Date(profile.createdAt || Date.now()).toLocaleDateString()}
          </span>
        </BannerBackdrop>

        <div className="px-2 sm:px-4 pb-2 -mt-12 sm:-mt-14 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <AvatarFrameBox frame={frameData}>
              <UserAvatarDisplay profile={profile} size={76} />
            </AvatarFrameBox>
            <div className="pb-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-800">{profile.displayName || profile.username}</h1>
                <span className="text-xs font-extrabold text-emerald-700">@{profile.username}</span>
                {profile.isTeamAdmin && (
                  <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Quizly Staff
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <TitlePill title={titleData} size="sm" />
                <span className="text-xs font-bold text-slate-400">&bull; {season.name}</span>
              </div>
              {profile.bio && (
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl pt-0.5">{profile.bio}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isOwnProfile ? (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={14} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            ) : (
              currentUser && (
                <>
                  <button
                    type="button"
                    onClick={() => onToggleFollow(profile.id)}
                    className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer ${
                      isFollowing
                        ? 'bg-slate-100 border-2 border-slate-300 text-slate-700'
                        : 'bg-emerald-600 text-white border-b-4 border-emerald-800'
                    }`}
                  >
                    {isFollowing ? <><UserMinus size={14} /> Unfollow</> : <><UserPlus size={14} /> Follow</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportOpen(true)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 cursor-pointer"
                    title="Report profile"
                  >
                    <Flag size={14} />
                  </button>
                </>
              )
            )}
            <button
              type="button"
              onClick={() => {
                const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${profile.username}`;
                if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
                showToast(`Copied profile link: /profile/${profile.username}`);
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              title="Share profile link"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>

        {/* Profile Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Quizzes Created</span>
            <span className="text-lg font-black text-slate-800">{visibleQuizzes.length}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Total Quiz Plays</span>
            <span className="text-lg font-black text-blue-600">{totalPlays.toLocaleString()}</span>
          </div>
          <button
            type="button"
            onClick={() => setListModal('followers')}
            className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 p-3 rounded-2xl text-center cursor-pointer"
          >
            <span className="text-[10px] font-black uppercase text-slate-400 block">Followers</span>
            <span className="text-lg font-black text-emerald-700">{followersList.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setListModal('following')}
            className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 p-3 rounded-2xl text-center cursor-pointer"
          >
            <span className="text-[10px] font-black uppercase text-slate-400 block">Following</span>
            <span className="text-lg font-black text-purple-600">{followingList.length}</span>
          </button>
        </div>

        {/* Private Owner-Only Wallet Summary */}
        {isOwnProfile && (
          <div className="mt-3 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs font-black text-amber-900">
            <span>Private Account Summary (Visible only to you):</span>
            <span>{coins.toLocaleString()} QuizCoins &bull; {ownedSkins.length}/{SKINS.length} Avatar Skins</span>
          </div>
        )}
      </div>

      {/* Edit Own Profile Form */}
      {isOwnProfile && isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 border-2 border-emerald-300 space-y-4">
          <h3 className="font-black text-base text-slate-800">Edit Your Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                Display Name {!currentUser?.isTeamAdmin && '(Quizly Team Only)'}
              </label>
              <input
                type="text"
                value={displayNameInput}
                disabled={!currentUser?.isTeamAdmin}
                onChange={e => setDisplayNameInput(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-bold ${
                  currentUser?.isTeamAdmin
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">Profile Picture (Supabase Storage)</label>
              <label className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-500 text-xs font-black text-slate-700 flex items-center justify-center gap-2 cursor-pointer">
                <Upload size={14} /> Upload Profile Picture
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarFile} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Biography</label>
            <textarea
              rows={3}
              maxLength={240}
              value={bioInput}
              onChange={e => setBioInput(e.target.value)}
              placeholder="Tell the community about your favorite subjects..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm font-medium text-slate-800"
            />
          </div>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
            <div>
              <span className="font-black text-xs text-slate-800 block">Public Profile Visibility</span>
              <span className="text-[11px] text-slate-500">Allow other learners to view your profile, bio, and published quizzes</span>
            </div>
            <input
              type="checkbox"
              checked={isPublicInput}
              onChange={e => setIsPublicInput(e.target.checked)}
              className="w-5 h-5 accent-emerald-600 cursor-pointer"
            />
          </label>

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800 font-black px-6 py-2.5 rounded-xl text-xs cursor-pointer"
          >
            Save Profile Changes
          </button>
        </form>
      )}

      {/* Achievements Section */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-4">
        <h3 className="text-base font-black text-slate-800">Achievements ({unlockedAchIds.length}/{ACHIEVEMENTS_CATALOG.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {ACHIEVEMENTS_CATALOG.map(ach => {
            const Icon = ach.icon;
            const unlocked = unlockedAchIds.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 ${
                  unlocked ? 'bg-white border-emerald-300' : 'bg-slate-50 border-slate-200 opacity-55'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ach.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-800">{ach.name}</h4>
                  <p className="text-[11px] text-slate-500">{ach.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Published Quizzes Section */}
      <div className="space-y-3">
        <h3 className="text-base font-black text-slate-800">
          {isOwnProfile ? `Your Quizzes (${visibleQuizzes.length})` : `Published Quizzes by @${profile.username} (${visibleQuizzes.length})`}
        </h3>
        {visibleQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 text-center text-xs font-bold text-slate-500">
            No quizzes published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleQuizzes.map(q => (
              <QuizCardItem
                key={q.id}
                quiz={q}
                currentUserId={currentUser?.id}
                likedQuizIds={likes}
                favoriteQuizIds={favorites}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                onOpenQuiz={onOpenQuiz}
                onOpenProfile={onOpenProfile}
                onDuplicateQuiz={onDuplicateQuiz}
                onEditQuiz={onEditQuiz}
                onDeleteQuiz={onDeleteQuiz}
                onTogglePublishQuiz={onTogglePublishQuiz}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- NOTIFICATIONS VIEW ---
const NotificationsView = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
  onOpenQuiz,
  onOpenProfile,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Notifications</h2>
          <p className="text-xs text-slate-500 font-medium">
            Stay updated on new followers, quiz likes, comments, achievements, and play milestones.
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border-2 border-slate-200 text-center space-y-2">
          <Bell size={32} className="text-slate-300 mx-auto" />
          <p className="font-black text-slate-700 text-sm">You're all caught up!</p>
          <p className="text-xs text-slate-500">New follower alerts, quiz likes, comments, and achievements appear here.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`rounded-2xl p-4 border-2 flex items-center justify-between gap-3 transition-all ${
                n.isRead ? 'bg-white border-slate-200' : 'bg-emerald-50/70 border-emerald-300'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                  <span className="text-[10px] font-black uppercase text-emerald-700">{n.type}</span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800">{n.message}</p>
                <div className="flex items-center gap-3 pt-0.5">
                  {n.actorUsername && (
                    <button
                      type="button"
                      onClick={() => onOpenProfile(n.actorUsername)}
                      className="text-[11px] font-black text-emerald-700 hover:underline cursor-pointer"
                    >
                      View @{n.actorUsername}
                    </button>
                  )}
                  {n.quizId && (
                    <button
                      type="button"
                      onClick={() => onOpenQuiz(n.quizId)}
                      className="text-[11px] font-black text-blue-600 hover:underline cursor-pointer"
                    >
                      Open Quiz
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(n.id)}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-black text-slate-700 cursor-pointer"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteNotification(n.id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer"
                  title="Delete notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- QUIZ CREATOR & EDITOR VIEW (SUPPORTS DRAFT, PUBLIC, PRIVATE, SUBJECT, DIFFICULTY, COMMENTS TOGGLE) ---
const CreateView = ({ currentUser, editingQuiz, onCancelEdit, onSaveQuiz, showToast }) => {
  const [title, setTitle] = useState(editingQuiz?.title || '');
  const [description, setDescription] = useState(editingQuiz?.description || '');
  const [category, setCategory] = useState(editingQuiz?.category || 'Science');
  const [subject, setSubject] = useState(editingQuiz?.subject || 'General');
  const [difficulty, setDifficulty] = useState(editingQuiz?.difficulty || 'Medium');
  const [visibility, setVisibility] = useState(editingQuiz?.visibility || 'public');
  const [commentsEnabled, setCommentsEnabled] = useState(editingQuiz?.commentsEnabled !== false);
  const [allowDuplicate, setAllowDuplicate] = useState(editingQuiz?.allowDuplicate !== false);
  const [coverImage, setCoverImage] = useState(editingQuiz?.coverImage || null);
  const [coverLabel, setCoverLabel] = useState(editingQuiz?.coverImage ? 'Saved Cover (500×500)' : '');

  const [questionsList, setQuestionsList] = useState(
    editingQuiz?.questions?.length
      ? editingQuiz.questions.map(q => ({
          id: q.id || `q_${Math.random()}`,
          q: q.q,
          image: q.image || null,
          imgLabel: q.image ? 'Question Image' : '',
          options: [...q.options],
          answer: q.answer,
        }))
      : [{ id: `q_${Date.now()}`, q: '', image: null, imgLabel: '', options: ['', '', '', ''], answer: 0 }]
  );

  useEffect(() => {
    if (editingQuiz) {
      setTitle(editingQuiz.title || '');
      setDescription(editingQuiz.description || '');
      setCategory(editingQuiz.category || 'Science');
      setSubject(editingQuiz.subject || 'General');
      setDifficulty(editingQuiz.difficulty || 'Medium');
      setVisibility(editingQuiz.visibility || 'public');
      setCommentsEnabled(editingQuiz.commentsEnabled !== false);
      setAllowDuplicate(editingQuiz.allowDuplicate !== false);
      setCoverImage(editingQuiz.coverImage || null);
      setCoverLabel(editingQuiz.coverImage ? 'Saved Cover (500×500)' : '');
      setQuestionsList(
        editingQuiz.questions.map(q => ({
          id: q.id || `q_${Math.random()}`,
          q: q.q,
          image: q.image || null,
          imgLabel: q.image ? 'Question Image' : '',
          options: [...q.options],
          answer: q.answer,
        }))
      );
    }
  }, [editingQuiz]);

  const [pickerTarget, setPickerTarget] = useState(null);
  const mathCoverUrl = GOOGLE_STATIC_GALLERY.find(g => g.id === 'g_math')?.url || null;

  const QUIZ_TEMPLATES = [
    {
      id: 'addition',
      label: 'Addition',
      symbol: '+',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-500',
      title: 'Addition Practice Challenge',
      category: 'Math',
      subject: 'Arithmetic',
      questions: [
        { q: 'What is 17 + 25?', image: null, imgLabel: '', options: ['32', '42', '44', '52'], answer: 1 },
        { q: 'What is 48 + 36?', image: null, imgLabel: '', options: ['74', '82', '84', '94'], answer: 2 },
        { q: 'What is 125 + 75?', image: null, imgLabel: '', options: ['190', '200', '210', '225'], answer: 1 },
      ],
    },
    {
      id: 'multiplication',
      label: 'Multiplication',
      symbol: '×',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200 hover:border-purple-500',
      title: 'Multiplication Tables Blitz',
      category: 'Math',
      subject: 'Multiplication',
      questions: [
        { q: 'What is 7 × 8?', image: null, imgLabel: '', options: ['54', '56', '64', '48'], answer: 1 },
        { q: 'What is 9 × 6?', image: null, imgLabel: '', options: ['54', '45', '63', '56'], answer: 0 },
        { q: 'What is 12 × 5?', image: null, imgLabel: '', options: ['50', '55', '60', '65'], answer: 2 },
      ],
    },
  ];

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setSubject(tpl.subject);
    if (mathCoverUrl) {
      setCoverImage(mathCoverUrl);
      setCoverLabel('Geometry & Algebra (500×500)');
    }
    setQuestionsList(tpl.questions.map((item, i) => ({ ...item, id: `tpl_${Date.now()}_${i}`, options: [...item.options] })));
    showToast(`Loaded "${tpl.label}" template!`);
  };

  const handleSubmitQuiz = (targetStatus) => {
    const validQuestions = questionsList.filter(item => item.q.trim().length > 0);
    if (!title.trim() || validQuestions.length === 0) {
      showToast('Please enter a quiz title and at least one question!');
      return;
    }

    const formattedQuestions = validQuestions.map((item, idx) => ({
      id: item.id || `q_${Date.now()}_${idx}`,
      q: item.q.trim(),
      image: item.image || null,
      options: item.options.map((opt, oIdx) => opt.trim() || `Choice ${oIdx + 1}`),
      answer: item.answer,
    }));

    const quizPayload = {
      id: editingQuiz?.id || `quiz-${Date.now().toString(36)}`,
      title: title.trim(),
      description: description.trim(),
      category,
      subject: subject.trim() || category,
      difficulty,
      visibility: targetStatus === 'draft' ? 'unpublished' : visibility,
      status: targetStatus, // 'published' | 'draft'
      commentsEnabled,
      allowDuplicate,
      creatorId: currentUser.id,
      creator: currentUser.username,
      plays: editingQuiz?.plays || 0,
      likes: editingQuiz?.likes || 0,
      color: editingQuiz?.color || 'from-emerald-500 to-teal-600',
      coverImage,
      createdAt: editingQuiz?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: formattedQuestions,
    };

    onSaveQuiz(quizPayload, Boolean(editingQuiz));
    if (!editingQuiz) {
      setTitle('');
      setDescription('');
      setCoverImage(null);
      setCoverLabel('');
      setQuestionsList([{ id: `q_${Date.now()}`, q: '', image: null, imgLabel: '', options: ['', '', '', ''], answer: 0 }]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <StaticImagePickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        showToast={showToast}
        onSelectImage={(imgUrl, label) => {
          if (pickerTarget === 'cover') {
            setCoverImage(imgUrl);
            setCoverLabel(label);
          } else if (pickerTarget && pickerTarget.type === 'question') {
            setQuestionsList(prev =>
              prev.map((item, idx) =>
                idx === pickerTarget.index ? { ...item, image: imgUrl, imgLabel: label } : item
              )
            );
          }
        }}
      />

      <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-slate-200 shadow-[0_4px_0_rgb(226,232,240)] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {editingQuiz ? `Edit Quiz: ${editingQuiz.title}` : 'Quiz Creator Studio'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Create, save as draft, or publish public &amp; private quizzes directly to Supabase.
            </p>
          </div>
          {editingQuiz && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-black text-slate-700 cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Quick Templates */}
        {!editingQuiz && (
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles size={14} className="text-orange-500" /> Quick Starter Templates
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {QUIZ_TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-2.5 text-left bg-white ${tpl.badgeColor}`}
                >
                  <span className="w-8 h-8 rounded-xl bg-white/90 font-black text-lg flex items-center justify-center shrink-0">
                    {tpl.symbol}
                  </span>
                  <span className="font-black text-xs">{tpl.label} Template</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title & Description */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Quiz Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., 6th Grade Solar System Challenge"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what learners will practice in this quiz..."
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category, Subject, Difficulty, Visibility */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-800"
            >
              <option>Science</option>
              <option>Math</option>
              <option>History</option>
              <option>Geography</option>
              <option>English</option>
              <option>Computer Science</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., Biology"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-800"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Visibility</label>
            <select
              value={visibility}
              onChange={e => setVisibility(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-800"
            >
              <option value="public">Public (Explore)</option>
              <option value="private">Private (Only Me)</option>
            </select>
          </div>
        </div>

        {/* Cover Image & Community Options */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border-2 border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {coverImage ? (
              <img src={coverImage} alt="Cover" className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-dashed border-emerald-300 flex items-center justify-center text-emerald-500">
                <Image size={22} />
              </div>
            )}
            <div>
              <span className="text-xs font-black text-slate-800 block">Quiz Cover Image (500×500)</span>
              <span className="text-[11px] text-slate-500">{coverLabel || 'Static PNG/JPG or Google Static'}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPickerTarget('cover')}
              className="bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-black px-3 py-2 rounded-xl text-xs cursor-pointer"
            >
              {coverImage ? 'Change Cover' : 'Choose Cover'}
            </button>
            <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={commentsEnabled}
                onChange={e => setCommentsEnabled(e.target.checked)}
                className="accent-emerald-600"
              />
              <span>Comments</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={allowDuplicate}
                onChange={e => setAllowDuplicate(e.target.checked)}
                className="accent-emerald-600"
              />
              <span>Allow Copy</span>
            </label>
          </div>
        </div>

        {/* Questions Builder */}
        <div className="space-y-4">
          {questionsList.map((item, qIdx) => (
            <div key={item.id || qIdx} className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-500">Question {qIdx + 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerTarget({ type: 'question', index: qIdx })}
                    className="bg-blue-50 text-blue-700 border border-blue-200 font-black px-2.5 py-1 rounded-xl text-xs cursor-pointer"
                  >
                    {item.image ? 'Change Image' : '+ Image'}
                  </button>
                  {questionsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setQuestionsList(prev => prev.filter((_, idx) => idx !== qIdx))}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {item.image && (
                <img src={item.image} alt="Question" className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
              )}

              <input
                type="text"
                value={item.q}
                onChange={e =>
                  setQuestionsList(prev =>
                    prev.map((qItem, idx) => (idx === qIdx ? { ...qItem, q: e.target.value } : qItem))
                  )
                }
                placeholder="Type your question..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-sm font-bold text-slate-800"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {item.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionsList(prev =>
                          prev.map((qItem, idx) => (idx === qIdx ? { ...qItem, answer: optIdx } : qItem))
                        )
                      }
                      className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 cursor-pointer ${
                        item.answer === optIdx ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                      title="Mark correct answer"
                    >
                      {item.answer === optIdx ? <Check size={14} /> : optIdx + 1}
                    </button>
                    <input
                      type="text"
                      value={opt}
                      onChange={e =>
                        setQuestionsList(prev =>
                          prev.map((qItem, idx) => {
                            if (idx !== qIdx) return qItem;
                            const nextOpts = [...qItem.options];
                            nextOpts[optIdx] = e.target.value;
                            return { ...qItem, options: nextOpts };
                          })
                        )
                      }
                      placeholder={`Choice ${optIdx + 1}`}
                      className="w-full px-3 py-2 rounded-xl bg-white border-2 border-slate-200 text-xs font-bold text-slate-800"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              setQuestionsList(prev => [
                ...prev,
                { id: `q_${Date.now()}`, q: '', image: null, imgLabel: '', options: ['', '', '', ''], answer: 0 },
              ])
            }
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 font-black px-4 py-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle size={15} /> Add Question
          </button>

          <button
            type="button"
            onClick={() => handleSubmitQuiz('draft')}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 font-black px-5 py-3 rounded-xl text-xs cursor-pointer"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmitQuiz('published')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800 font-black py-3 px-6 rounded-xl text-sm cursor-pointer"
          >
            {editingQuiz ? 'Save & Update Quiz' : 'Publish Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- STATIC 500x500 IMAGE PICKER MODAL ---
const StaticImagePickerModal = ({ isOpen, onClose, onSelectImage, showToast }) => {
  const [tab, setTab] = useState('google');
  const [googleSearch, setGoogleSearch] = useState('');
  const [uploadError, setUploadError] = useState('');

  if (!isOpen) return null;

  const filteredGoogle = GOOGLE_STATIC_GALLERY.filter(item =>
    item.title.toLowerCase().includes(googleSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(googleSearch.toLowerCase()) ||
    item.tags.toLowerCase().includes(googleSearch.toLowerCase())
  );

  const handleFileUpload = (e) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
      setUploadError('GIF files are not allowed! Upload a static PNG, JPG, or WEBP image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 500, 500);
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, 500, 500);
        onSelectImage(canvas.toDataURL('image/png'), `${file.name} (500×500)`);
        showToast('Formatted static 500×500 image!');
        onClose();
      };
      img.src = ev.target?.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl border-2 border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-black text-base text-slate-800">Add 500×500 Static Image</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-200 cursor-pointer"><X size={18} /></button>
        </div>
        <div className="px-6 pt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('google')}
            className={`flex-1 py-2 rounded-xl font-black text-xs cursor-pointer ${tab === 'google' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Static Gallery
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-2 rounded-xl font-black text-xs cursor-pointer ${tab === 'upload' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Upload Image
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          {tab === 'google' ? (
            <>
              <input
                type="text"
                value={googleSearch}
                onChange={e => setGoogleSearch(e.target.value)}
                placeholder="Search gallery..."
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredGoogle.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectImage(item.url, item.title);
                      onClose();
                    }}
                    className="p-2 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 text-left cursor-pointer"
                  >
                    <img src={item.url} alt={item.title} className="w-full aspect-square rounded-xl object-cover" />
                    <span className="font-black text-xs text-slate-800 block mt-1.5">{item.title}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer">
                <Upload size={26} className="text-orange-500 mb-2" />
                <span className="font-black text-xs text-slate-800">Choose PNG, JPG, or WEBP (No GIFs)</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileUpload} className="hidden" />
              </label>
              {uploadError && <p className="text-xs font-black text-rose-600">{uploadError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SEASON PASS VIEW ---
const SeasonView = ({ season, level, xp, setView, claimedMilestones, onClaimMilestone }) => {
  const theme = SEASON_THEMES[season.themeKey] || SEASON_THEMES.skyward;
  const isMaxLevel = level >= season.maxLevel;
  const seasonProgress = isMaxLevel ? 100 : xp % 100;
  const trackScrollRef = useRef(null);

  const fullLevelTrack = useMemo(() => {
    const milestoneMap = new Map(season.milestones.map(m => [m.level, m]));
    const shortTheme = season.name.split(':').pop().trim().split(' ')[0] || 'Sky';
    const items = [];
    for (let lvl = 1; lvl <= season.maxLevel; lvl++) {
      if (milestoneMap.has(lvl)) {
        items.push({ ...milestoneMap.get(lvl), isMajor: true });
      } else {
        items.push({
          level: lvl,
          label: `10 ${shortTheme} Coins`,
          reward: '+10 QuizCoins',
          type: 'Coins',
          isMajor: false,
        });
      }
    }
    return items;
  }, [season]);

  useEffect(() => {
    if (trackScrollRef.current) {
      const cardWidth = 144;
      const targetScroll = Math.max(0, (level - 1) * cardWidth - trackScrollRef.current.clientWidth / 2 + cardWidth / 2);
      trackScrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [level, season.number]);

  const totalLevels = fullLevelTrack.length;
  const exactLevelFloat = isMaxLevel ? totalLevels : Math.min(totalLevels, level + (xp % 100) / 100);
  const continuousFillPercent = totalLevels > 1
    ? Math.max(0, Math.min(100, ((exactLevelFloat - 1) / (totalLevels - 1)) * 100))
    : 100;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className={`bg-gradient-to-br ${theme.heroGradient} rounded-3xl p-6 md:p-8 text-white border-b-4 ${theme.heroBorder} shadow-md relative overflow-hidden space-y-5`}>
        <SeasonStickers themeKey={season.themeKey} variant="hero" />
        <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className={`${theme.badgeBg} text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5`}>
              <Sparkles size={13} /> Season {season.number} Pass &bull; {season.endsIn}
            </span>
            <h1 className="text-2xl md:text-4xl font-black">{season.name}</h1>
            <p className="text-white/90 text-sm font-medium">{season.tagline}</p>
          </div>
          <div className="bg-black/25 border border-white/20 rounded-2xl p-4 text-right">
            <span className="text-[11px] font-black uppercase text-white/80 block">Season Tier</span>
            <span className="text-3xl font-black block">Tier {level} / {season.maxLevel}</span>
            <span className="text-xs font-black text-amber-300">{xp.toLocaleString()} XP</span>
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          <div className="flex justify-between text-xs font-black">
            <span>{isMaxLevel ? 'Max Rank Achieved!' : `Progress to Tier ${level + 1}`}</span>
            <span>{seasonProgress} / 100 XP</span>
          </div>
          <div className="w-full h-4 bg-black/30 rounded-full overflow-hidden p-0.5">
            <div className={`h-full bg-gradient-to-r ${theme.progressGradient} rounded-full transition-all`} style={{ width: `${Math.min(100, (level / season.maxLevel) * 100)}%` }} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setView('explore')}
          className="relative z-10 bg-yellow-400 hover:bg-yellow-300 text-yellow-950 border-b-4 border-yellow-600 font-black px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <Play size={15} className="fill-current" /> Play Quizzes to Level Up
        </button>
      </div>

      <div className={`${theme.trackSurface} rounded-3xl p-6 border-2 space-y-4 relative overflow-hidden`}>
        <SeasonStickers themeKey={season.themeKey} variant="track" />
        <h2 className={`text-lg font-black ${theme.accentText} relative z-10`}>
          Season {season.number} Number Line (10 Coins Every Level Between Milestones)
        </h2>
        <div ref={trackScrollRef} className="overflow-x-auto pb-4 pt-2 quizly-content-scroll">
          <div className="inline-flex items-stretch min-w-max px-2 relative">
            <div className={`absolute top-8 h-3 rounded-full ${theme.trackBarBg} overflow-hidden pointer-events-none`} style={{ left: '80px', right: '80px' }}>
              <div className={`h-full bg-gradient-to-r ${theme.progressGradient} rounded-full transition-all`} style={{ width: `${continuousFillPercent}%` }} />
            </div>

            {fullLevelTrack.map((m) => {
              const unlocked = level >= m.level;
              const claimKey = `s${season.number}_lvl${m.level}`;
              const isClaimed = claimedMilestones.includes(claimKey);
              return (
                <div key={m.level} className="w-36 shrink-0 flex flex-col items-center">
                  <div className="w-full flex items-center justify-center relative h-14">
                    <div className={`${m.isMajor ? 'w-12 h-12 rounded-2xl border-4' : 'w-9 h-9 rounded-xl border-2'} flex flex-col items-center justify-center z-10 ${unlocked ? theme.unlockedBg : `bg-white border-slate-300 ${theme.accentText}`}`}>
                      <span className="text-xs font-black">{m.level}</span>
                    </div>
                  </div>
                  <div className={`w-1 h-3.5 rounded-full ${unlocked ? theme.stemActive : theme.stemInactive}`} />
                  <div className="w-full px-1 flex-1 flex">
                    <div className={`w-full rounded-2xl p-3 border-2 flex flex-col justify-between gap-2 text-center ${unlocked ? (m.isMajor ? theme.unlockedBg : theme.minorUnlockedBg) : theme.minorLockedBg}`}>
                      <div>
                        <h3 className="text-xs font-black">{m.label}</h3>
                        <p className="text-[10px] font-bold opacity-80">{m.reward}</p>
                      </div>
                      {unlocked ? (
                        <button
                          type="button"
                          disabled={isClaimed}
                          onClick={() => onClaimMilestone(m)}
                          className={`w-full py-1.5 rounded-xl font-black text-[11px] cursor-pointer ${isClaimed ? 'bg-black/20 opacity-75' : theme.badgeBg}`}
                        >
                          {isClaimed ? 'Claimed' : 'Claim'}
                        </button>
                      ) : (
                        <div className="w-full py-1.5 rounded-xl bg-white/80 text-slate-400 font-black text-[10px]">
                          Lvl {m.level}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SHOP VIEW ---
const ShopView = ({
  coins, setCoins,
  ownedSkins, setOwnedSkins, equippedSkin, setEquippedSkin,
  ownedBanners, setOwnedBanners, equippedBanner, setEquippedBanner,
  ownedFrames, setOwnedFrames, equippedFrame, setEquippedFrame,
  ownedTitles, setOwnedTitles, equippedTitle, setEquippedTitle,
  showToast
}) => {
  const [shopTab, setShopTab] = useState('bundles');
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const estInfo = getEstTimeInfo(nowMs);
  const displayedSkins = Array.from(
    new Map([
      ...pickRotatedItems(SKINS, ['red_cube'], 6, estInfo.daySeed).map(s => [s.id, s]),
      ...SKINS.filter(s => ownedSkins.includes(s.id)).map(s => [s.id, s]),
    ]).values()
  );

  const buyOrEquip = (item, ownedList, setOwnedList, equippedId, setEquippedId, label) => {
    if (ownedList.includes(item.id)) {
      setEquippedId(item.id);
      showToast(`Equipped ${item.name}!`);
      return;
    }
    if (coins < item.price) {
      showToast('Not enough QuizCoins!');
      return;
    }
    setCoins(c => c - item.price);
    setOwnedList([...ownedList, item.id]);
    setEquippedId(item.id);
    showToast(`Unlocked ${item.name} (${label})!`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-6 text-white border-b-4 border-orange-700 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Avatar Locker &amp; Shop</h2>
          <p className="text-xs font-bold text-amber-100 mt-1">
            Daily 12:00 PM EST Refresh: {formatCountdown(estInfo.msUntilDailyReset)} &bull; Weekly Bundles: {formatCountdown(estInfo.msUntilWeeklyReset, true)}
          </p>
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 font-black">
          <Coins size={18} /> <span>{coins.toLocaleString()} Coins</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['bundles', 'skins', 'banners', 'frames', 'titles'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setShopTab(t)}
            className={`px-4 py-2 rounded-2xl font-black text-xs capitalize cursor-pointer ${shopTab === t ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border-2 border-slate-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {shopTab === 'bundles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SHOP_BUNDLES.map(b => {
            const bSkin = SKINS.find(s => s.id === b.skinId) || SKINS[0];
            return (
              <div key={b.id} className="bg-white rounded-3xl overflow-hidden border-2 border-slate-200 flex flex-col justify-between">
                <div className={`bg-gradient-to-r ${b.accent} p-5 text-white text-center`}>
                  <h3 className="font-black text-base">{b.name}</h3>
                  <p className="text-xs text-white/90 mb-3">{b.tagline}</p>
                  <div className="flex justify-center"><SkinIcon {...bSkin} size={68} /></div>
                </div>
                <div className="p-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (coins < b.price) {
                        showToast(`Need ${b.price} Coins!`);
                        return;
                      }
                      setCoins(c => c - b.price);
                      setOwnedSkins(p => Array.from(new Set([...p, b.skinId])));
                      setOwnedBanners(p => Array.from(new Set([...p, b.bannerId])));
                      setOwnedFrames(p => Array.from(new Set([...p, b.frameId])));
                      setOwnedTitles(p => Array.from(new Set([...p, b.titleId])));
                      setEquippedSkin(b.skinId);
                      setEquippedBanner(b.bannerId);
                      setEquippedFrame(b.frameId);
                      setEquippedTitle(b.titleId);
                      showToast(`Equipped ${b.name}!`);
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs cursor-pointer"
                  >
                    Unlock Bundle ({b.price} Coins)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {shopTab === 'skins' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {displayedSkins.map(skin => (
            <div key={skin.id} className="bg-white rounded-3xl p-4 border-2 border-slate-200 flex flex-col items-center gap-3">
              <SkinIcon {...skin} size={70} />
              <h3 className="font-black text-sm">{skin.name}</h3>
              <button
                type="button"
                onClick={() => buyOrEquip(skin, ownedSkins, setOwnedSkins, equippedSkin, setEquippedSkin, 'Skin')}
                className="w-full py-2 rounded-xl bg-emerald-500 text-white font-black text-xs cursor-pointer"
              >
                {equippedSkin === skin.id ? 'Equipped' : ownedSkins.includes(skin.id) ? 'Equip' : `${skin.price} Coins`}
              </button>
            </div>
          ))}
        </div>
      )}

      {shopTab === 'banners' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BANNERS.map(banner => (
            <div key={banner.id} className="bg-white rounded-3xl overflow-hidden border-2 border-slate-200">
              <BannerBackdrop banner={banner} className="h-24" />
              <div className="p-4 flex items-center justify-between">
                <span className="font-black text-xs">{banner.name}</span>
                <button
                  type="button"
                  onClick={() => buyOrEquip(banner, ownedBanners, setOwnedBanners, equippedBanner, setEquippedBanner, 'Banner')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-black text-xs cursor-pointer"
                >
                  {equippedBanner === banner.id ? 'Equipped' : ownedBanners.includes(banner.id) ? 'Equip' : `${banner.price}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {shopTab === 'frames' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {FRAMES.map(frame => (
            <div key={frame.id} className="bg-white rounded-3xl p-4 border-2 border-slate-200 flex flex-col items-center gap-2">
              <AvatarFrameBox frame={frame} sizeClass="w-16 h-16" roundedClass="rounded-2xl">
                <User size={24} className="text-slate-400" />
              </AvatarFrameBox>
              <span className="font-black text-xs">{frame.name}</span>
              <button
                type="button"
                onClick={() => buyOrEquip(frame, ownedFrames, setOwnedFrames, equippedFrame, setEquippedFrame, 'Frame')}
                className="w-full py-1.5 rounded-xl bg-emerald-500 text-white font-black text-xs cursor-pointer"
              >
                {equippedFrame === frame.id ? 'Equipped' : ownedFrames.includes(frame.id) ? 'Equip' : `${frame.price}`}
              </button>
            </div>
          ))}
        </div>
      )}

      {shopTab === 'titles' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TITLES.map(title => (
            <div key={title.id} className="bg-white rounded-3xl p-4 border-2 border-slate-200 flex flex-col items-center gap-3">
              <TitlePill title={title} size="lg" />
              <button
                type="button"
                onClick={() => buyOrEquip(title, ownedTitles, setOwnedTitles, equippedTitle, setEquippedTitle, 'Title')}
                className="w-full py-1.5 rounded-xl bg-emerald-500 text-white font-black text-xs cursor-pointer"
              >
                {equippedTitle === title.id ? 'Equipped' : ownedTitles.includes(title.id) ? 'Equip' : `${title.price}`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- TEACHER HUB VIEW ---
const TeacherHubView = ({ isVerifiedTeacher, quizzes, teacherHub, setTeacherHub, onOpenQuiz, showToast }) => {
  const [newClassName, setNewClassName] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignQuizId, setAssignQuizId] = useState(quizzes[0]?.id || '');

  if (!isVerifiedTeacher) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border-2 border-slate-200 text-center space-y-3">
        <GraduationCap size={36} className="text-teal-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-800">Teacher Hub</h2>
        <p className="text-xs text-slate-500 font-medium">
          Verified Teacher accounts unlock Google Classroom sync, class join codes, and homework assignments.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-6 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Teacher Classroom Hub</h2>
          <p className="text-xs text-teal-100">Create classes, link Google Classroom, and assign quizzes.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setTeacherHub(p => ({ ...p, googleConnected: !p.googleConnected }));
            showToast(teacherHub.googleConnected ? 'Disconnected Google Classroom' : 'Connected Google Classroom!');
          }}
          className="bg-white text-teal-900 font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
        >
          {teacherHub.googleConnected ? 'Google Classroom Connected' : 'Connect Google Classroom'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newClassName.trim()) return;
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            setTeacherHub(p => ({
              ...p,
              classes: [{ id: `cls_${Date.now()}`, name: newClassName.trim(), joinCode: code }, ...p.classes],
            }));
            setNewClassName('');
            showToast(`Created class with Join Code ${code}!`);
          }}
          className="bg-white rounded-3xl p-5 border-2 border-slate-200 space-y-3"
        >
          <h3 className="font-black text-sm text-slate-800">Create Class</h3>
          <input
            type="text"
            value={newClassName}
            onChange={e => setNewClassName(e.target.value)}
            placeholder="e.g., Period 3 Biology"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold"
          />
          <button type="submit" className="w-full bg-teal-600 text-white font-black py-2.5 rounded-xl text-xs cursor-pointer">
            Create Class
          </button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const qObj = quizzes.find(q => q.id === assignQuizId) || quizzes[0];
            if (!qObj) return;
            setTeacherHub(p => ({
              ...p,
              assignments: [{ id: `asg_${Date.now()}`, title: assignTitle.trim() || qObj.title, quizId: qObj.id }, ...p.assignments],
            }));
            setAssignTitle('');
            showToast('Homework assigned!');
          }}
          className="bg-white rounded-3xl p-5 border-2 border-slate-200 space-y-3"
        >
          <h3 className="font-black text-sm text-slate-800">Assign Quiz Homework</h3>
          <input
            type="text"
            value={assignTitle}
            onChange={e => setAssignTitle(e.target.value)}
            placeholder="Assignment title..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold"
          />
          <select
            value={assignQuizId}
            onChange={e => setAssignQuizId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold"
          >
            {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
          <button type="submit" className="w-full bg-orange-500 text-white font-black py-2.5 rounded-xl text-xs cursor-pointer">
            Assign Work
          </button>
        </form>
      </div>

      {teacherHub.assignments.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 space-y-2">
          <h3 className="font-black text-sm text-slate-800">Active Assignments</h3>
          {teacherHub.assignments.map(a => (
            <div key={a.id} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="font-black text-xs">{a.title}</span>
              <button type="button" onClick={() => onOpenQuiz(a.quizId)} className="text-xs font-black text-emerald-700 cursor-pointer">
                Open Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- LANDING PAGE (GREEN-ISH THEME, SHOWN WHEN SIGNED OUT WITHOUT SIDE/TOP GUI) ---
const LandingAboutView = ({
  setView,
  isLoggedIn,
  onOpenAuth,
  holdingLogo,
  startLogoHold,
  cancelLogoHold,
  publicQuizzes = [],
  onOpenQuiz,
}) => {
  const [openFaq, setOpenFaq] = useState(0);
  const [demoChoice, setDemoChoice] = useState(null);

  const demoQuestion = {
    category: 'Interactive Preview • Science',
    q: 'Which planet in our Solar System has the fastest rotation (shortest day)?',
    options: ['Earth', 'Jupiter', 'Mars', 'Venus'],
    answer: 1,
    fact: 'Jupiter spins once every ~9 hours and 55 minutes—the fastest of any planet!',
  };

  const featuredPublicQuizzes = publicQuizzes.slice(0, 4);

  const faqs = [
    {
      q: 'What is Quizly and is it free to use?',
      a: 'Quizly is an interactive learning and community platform where students and educators create, share, and play quizzes, follow creators, unlock achievements, and climb the Season Pass completely free!',
    },
    {
      q: 'Can visitors play public quizzes before creating an account?',
      a: 'Yes! Anyone can preview and play public quizzes right from the landing page or via direct /quiz/quiz-id links. Creating a free account lets you save your scores, earn QuizCoins, unlock avatar skins, and publish your own quizzes.',
    },
    {
      q: 'How do Public Profiles (/profile/username) and Quiz Links (/quiz/quiz-id) work?',
      a: 'Every creator has a shareable profile URL (/profile/username) and every quiz has a direct link (/quiz/quiz-id). You can set your profile or individual quizzes to Public or Private at any time.',
    },
    {
      q: 'How does the Season Pass and QuizCoins system work?',
      a: 'Every completed quiz grants Season Pass XP and QuizCoins. Climb from Tier 1 to Tier 100 on the continuous number line to claim milestone rewards and unlock cosmetics in the Shop.',
    },
    {
      q: 'How is Quizly moderated for classroom safety?',
      a: 'Users can report inappropriate quizzes, profiles, or comments. Authorized Quizly moderators review reports, remove violating content, and maintain a safe learning environment.',
    },
  ];

  const scrollToSection = (id) => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {!isLoggedIn && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 px-5 py-3.5 rounded-3xl border-2 border-emerald-200 shadow-[0_4px_0_rgb(167,243,208)]">
          <div
            className={`flex items-center gap-2.5 cursor-pointer select-none transition-transform duration-300 ${holdingLogo ? 'scale-95 opacity-85' : ''}`}
            onMouseDown={startLogoHold}
            onMouseUp={cancelLogoHold}
            onMouseLeave={cancelLogoHold}
            onTouchStart={startLogoHold}
            onTouchEnd={cancelLogoHold}
            onTouchCancel={cancelLogoHold}
          >
            <QuizlyLogo size={40} />
            <span className="font-black text-2xl tracking-wide text-emerald-600">QUIZLY</span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-xs font-black text-slate-600">
            <button type="button" onClick={() => scrollToSection('landing-features')} className="hover:text-emerald-600 cursor-pointer">
              Features
            </button>
            <button type="button" onClick={() => scrollToSection('landing-how')} className="hover:text-emerald-600 cursor-pointer">
              How It Works
            </button>
            <button type="button" onClick={() => scrollToSection('landing-quizzes')} className="hover:text-emerald-600 cursor-pointer">
              Try Quizzes
            </button>
            <button type="button" onClick={() => scrollToSection('landing-faq')} className="hover:text-emerald-600 cursor-pointer">
              FAQ
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-200 font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800 font-black px-5 py-2 rounded-xl text-xs cursor-pointer"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      )}

      {/* Hero Section with Interactive Live Question Preview */}
      <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 rounded-3xl p-7 md:p-10 text-white border-b-4 border-emerald-900 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-2 bg-white/20 px-3.5 py-1.5 rounded-full text-xs font-black uppercase">
              <Sparkles size={14} className="text-yellow-300" /> Interactive Learning &amp; Community Platform
            </span>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">
              Create, Share &amp; Play Classroom Quizzes Together
            </h1>
            <p className="text-emerald-50 text-sm md:text-base font-medium leading-relaxed">
              Build public or private quizzes, follow your favorite creators, earn achievements, and level up your Season Pass across all your devices.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={() => setView('explore')}
                    className="bg-yellow-400 hover:bg-yellow-300 text-yellow-950 border-b-4 border-yellow-600 font-black px-6 py-3 rounded-2xl text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Compass size={16} /> Explore Quizzes
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('home')}
                    className="bg-white/15 hover:bg-white/25 text-white font-black px-5 py-3 rounded-2xl text-sm cursor-pointer"
                  >
                    Go to My Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('signup')}
                    className="bg-yellow-400 hover:bg-yellow-300 text-yellow-950 border-b-4 border-yellow-600 font-black px-6 py-3 rounded-2xl text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={16} /> Create Free Account
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('landing-quizzes')}
                    className="bg-white/15 hover:bg-white/25 text-white font-black px-5 py-3 rounded-2xl text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Play size={15} className="fill-current" /> Try a Quiz Now
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-extrabold text-emerald-100">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-yellow-300" /> 100% Free for Students &amp; Teachers</span>
              <span className="inline-flex items-center gap-1.5"><Shield size={14} className="text-yellow-300" /> Classroom-Safe Moderation</span>
            </div>
          </div>

          {/* Interactive Mini Quiz Card */}
          <div className="lg:col-span-5 bg-white text-slate-800 rounded-3xl p-5 border-2 border-emerald-200 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                {demoQuestion.category}
              </span>
              <span className="text-[11px] font-black text-amber-600 flex items-center gap-1">
                <Coins size={13} /> +25 Coins
              </span>
            </div>
            <p className="font-black text-sm text-slate-800 leading-snug">{demoQuestion.q}</p>
            <div className="grid grid-cols-2 gap-2">
              {demoQuestion.options.map((opt, idx) => {
                const picked = demoChoice !== null;
                const isCorrect = idx === demoQuestion.answer;
                const isSelected = demoChoice === idx;
                let style = 'bg-slate-50 hover:bg-emerald-50 border-slate-200 text-slate-700';
                if (picked) {
                  if (isCorrect) style = 'bg-emerald-500 border-emerald-700 text-white';
                  else if (isSelected) style = 'bg-rose-500 border-rose-700 text-white';
                  else style = 'bg-slate-100 border-slate-200 text-slate-400';
                }
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDemoChoice(idx)}
                    className={`p-2.5 rounded-xl border-b-4 border-2 font-black text-xs text-left transition-all cursor-pointer flex items-center justify-between ${style}`}
                  >
                    <span>{opt}</span>
                    {picked && isCorrect && <Check size={14} />}
                  </button>
                );
              })}
            </div>
            {demoChoice !== null ? (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900 space-y-1.5">
                <p>{demoChoice === demoQuestion.answer ? 'Spot on!' : 'Nice try!'} {demoQuestion.fact}</p>
                {!isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('signup')}
                    className="text-emerald-700 font-black underline cursor-pointer"
                  >
                    Sign up free to save your XP &amp; unlock avatar skins &rarr;
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[11px] font-bold text-slate-400 text-center">
                Tap an answer above to test Quizly gameplay!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Platform Key Pillars */}
      <div id="landing-features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: PlusCircle,
            color: 'bg-orange-100 text-orange-600',
            title: 'Quiz Creator Studio',
            desc: 'Build custom quizzes with starter templates, 500×500 images, drafts, and public or private controls.',
          },
          {
            icon: Trophy,
            color: 'bg-purple-100 text-purple-600',
            title: '100-Tier Season Pass',
            desc: 'Earn XP on every completed quiz to climb 100 tiers and claim coins, frames, banners, and titles.',
          },
          {
            icon: Users,
            color: 'bg-sky-100 text-sky-600',
            title: 'Creator Profiles',
            desc: 'Share your /profile/username page, follow top educators, bookmark favorites, and comment on quizzes.',
          },
          {
            icon: GraduationCap,
            color: 'bg-teal-100 text-teal-600',
            title: 'Teacher Classroom Hub',
            desc: 'Verified educators can organize classes, generate join codes, sync Google Classroom, and assign sets.',
          },
        ].map(feat => {
          const Icon = feat.icon;
          return (
            <div key={feat.title} className="bg-white rounded-3xl p-5 border-2 border-emerald-200/80 shadow-[0_4px_0_rgb(209,250,229)] space-y-2.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${feat.color}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-black text-base text-slate-800">{feat.title}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{feat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* How Quizly Works (3 Steps) */}
      <div id="landing-how" className="bg-white rounded-3xl p-6 md:p-8 border-2 border-emerald-200 space-y-5">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Simple &amp; Fast</span>
          <h2 className="text-2xl font-black text-slate-800">How Quizly Works</h2>
          <p className="text-xs text-slate-500 font-medium">Start learning or hosting study sets in under a minute.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: '1',
              title: 'Create Your Free Account',
              desc: 'Choose Student or Teacher, pick a unique @username, and customize your blocky avatar in the Locker.',
            },
            {
              step: '2',
              title: 'Explore or Build Quizzes',
              desc: 'Browse verified curriculum sets across Science, Math, History, and Geography—or create your own.',
            },
            {
              step: '3',
              title: 'Earn Rewards & Share',
              desc: 'Complete quizzes to earn QuizCoins, unlock achievements, and share direct links with classmates.',
            },
          ].map(item => (
            <div key={item.step} className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200/80 space-y-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm inline-flex items-center justify-center">
                {item.step}
              </span>
              <h3 className="font-black text-sm text-slate-800">{item.title}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Public Quizzes Visitors Can Play Immediately */}
      {featuredPublicQuizzes.length > 0 && (
        <div id="landing-quizzes" className="bg-white rounded-3xl p-6 md:p-8 border-2 border-emerald-200 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Featured Public Quizzes</h2>
              <p className="text-xs text-slate-500 font-medium">Jump right in and play a starter quiz—no sign-up required to try!</p>
            </div>
            {!isLoggedIn && (
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Sign Up to Track Progress
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredPublicQuizzes.map(q => (
              <div
                key={q.id}
                className="rounded-2xl border-2 border-slate-200 hover:border-emerald-400 p-4 flex flex-col justify-between gap-3 bg-slate-50/60 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      {q.category} {q.subject ? `• ${q.subject}` : ''}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-500">
                      {q.questions?.length || 0} Questions &bull; {q.difficulty || 'Medium'}
                    </span>
                  </div>
                  <h3 className="font-black text-base text-slate-800">{q.title}</h3>
                  {q.description && (
                    <p className="text-xs text-slate-600 font-medium line-clamp-2">{q.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-emerald-700">by @{q.creator}</span>
                  <button
                    type="button"
                    onClick={() => onOpenQuiz && onOpenQuiz(q.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play size={13} className="fill-current" /> Play Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About & Who It Is For */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 space-y-2.5">
          <h2 className="text-xl font-black text-slate-800">About Quizly &amp; Our Goal</h2>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Quizly empowers students, teachers, and lifelong learners to turn any subject into an interactive quiz experience—complete with public creator profiles, real-time likes, comments, and achievements.
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 border-2 border-teal-200 space-y-2.5">
          <h2 className="text-xl font-black text-slate-800">Who It Is For</h2>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Built for <strong>Students</strong> studying for exams, <strong>Teachers</strong> running classroom reviews with Google Classroom, and <strong>Quiz Creators</strong> sharing knowledge with the world.
          </p>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div id="landing-faq" className="bg-white rounded-3xl p-6 border-2 border-emerald-200 space-y-3">
        <h2 className="text-xl font-black text-slate-800">Frequently Asked Questions</h2>
        {faqs.map((item, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div key={idx} className="rounded-2xl border-2 border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer bg-slate-50"
              >
                <span className="font-black text-sm text-slate-800">{item.q}</span>
                <ChevronRight size={18} className={`transition-transform ${isOpen ? 'rotate-90 text-emerald-600' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 py-3.5 text-xs sm:text-sm text-slate-600 font-medium bg-white border-t border-slate-100">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Call-to-Action Banner & Footer */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-7 text-white border-b-4 border-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl font-black">Ready to Start Your Learning Streak?</h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              Join Quizly today to build quizzes, collect skins, and climb Season 1!
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="bg-yellow-400 hover:bg-yellow-300 text-yellow-950 border-b-4 border-yellow-600 font-black px-6 py-3 rounded-2xl text-xs cursor-pointer"
            >
              Sign Up Free
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="bg-white/20 hover:bg-white/30 text-white font-black px-5 py-3 rounded-2xl text-xs cursor-pointer"
            >
              Log In
            </button>
          </div>
        </div>
      )}

      <footer className="bg-white rounded-3xl px-6 py-5 border-2 border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <QuizlyLogo size={26} />
          <span className="font-black text-slate-800">Quizly Learning Platform</span>
          <span>&bull; Safe for Classrooms</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => scrollToSection('landing-features')} className="hover:text-emerald-700 cursor-pointer">
            Features
          </button>
          <button type="button" onClick={() => scrollToSection('landing-quizzes')} className="hover:text-emerald-700 cursor-pointer">
            Public Quizzes
          </button>
          <button type="button" onClick={() => scrollToSection('landing-faq')} className="hover:text-emerald-700 cursor-pointer">
            Help &amp; FAQ
          </button>
          {!isLoggedIn && (
            <button type="button" onClick={() => onOpenAuth('login')} className="text-emerald-700 font-black hover:underline cursor-pointer">
              Account Sign In
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

// --- ANNOUNCEMENTS VIEW ---
const AnnouncementsView = ({ announcements, setAnnouncements, isTeamAdmin, showToast }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white">
        <h2 className="text-2xl font-black">Quizly Team Announcements</h2>
        <p className="text-xs text-emerald-100">Official platform updates and community news.</p>
      </div>

      {isTeamAdmin && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !body.trim()) return;
            setAnnouncements([{ id: Date.now(), title: title.trim(), date: 'Just now', tag: 'Update', body: body.trim() }, ...announcements]);
            setTitle('');
            setBody('');
            showToast('Announcement published!');
          }}
          className="bg-white rounded-3xl p-5 border-2 border-emerald-300 space-y-3"
        >
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Headline..."
            className="w-full px-4 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold"
          />
          <textarea
            rows={2}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Message..."
            className="w-full px-4 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-medium"
          />
          <button type="submit" className="bg-emerald-600 text-white font-black px-4 py-2 rounded-xl text-xs cursor-pointer">
            Publish Update
          </button>
        </form>
      )}

      {announcements.map(post => (
        <div key={post.id} className="bg-white rounded-3xl p-5 border-2 border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-black text-sm text-slate-800">{post.title}</span>
            <span className="text-[11px] font-bold text-slate-400">{post.date}</span>
          </div>
          <p className="text-xs text-slate-600">{post.body}</p>
        </div>
      ))}
    </div>
  );
};

// --- SETTINGS & MODERATION / SUPABASE CONFIGURATION VIEW ---
const SettingsView = ({
  currentUser,
  isTeamAdmin,
  userSettings,
  setUserSettings,
  supabaseConfig,
  supabaseConnected,
  onSaveSupabaseConfig,
  notificationPrefs,
  setNotificationPrefs,
  reports,
  moderationActions,
  allProfiles,
  allQuizzes,
  quizComments,
  onResolveReport,
  onModRemoveQuiz,
  onModForceUnpublishQuiz,
  onModDeleteComment,
  onModSuspendUser,
  onModUnsuspendUser,
  onModWarnUser,
  onModResetUserProfile,
  onModToggleVerifiedTeacher,
  siteSafetyConfig,
  setSiteSafetyConfig,
  season,
  onStartNewSeason,
  onUpdateProfile,
  onExportUserData,
  onLogout,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState(isTeamAdmin ? 'moderation' : 'appearance');
  const [modSubTab, setModSubTab] = useState('reports');
  const [sbUrl, setSbUrl] = useState(supabaseConfig.url || '');
  const [sbKey, setSbKey] = useState(supabaseConfig.anonKey || '');
  const [newSeasonTitle, setNewSeasonTitle] = useState('');
  const [isLaunchingSeason, setIsLaunchingSeason] = useState(false);

  // Moderation Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  const [warningModalUser, setWarningModalUser] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [newBlockedWord, setNewBlockedWord] = useState('');

  // Quick Profile & Privacy Controls inside Settings
  const [bioDraft, setBioDraft] = useState(currentUser?.bio || '');

  const updateSetting = (key, value, label) => {
    setUserSettings(prev => ({ ...prev, [key]: value }));
    if (label) showToast(label);
  };

  const openReports = reports.filter(r => r.status === 'open');
  const suspendedUsers = allProfiles.filter(p => p.suspended);
  const filteredModUsers = allProfiles.filter(p =>
    !userSearch.trim() ||
    (p.username || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (p.displayName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredModQuizzes = allQuizzes.filter(q =>
    !contentSearch.trim() ||
    (q.title || '').toLowerCase().includes(contentSearch.toLowerCase()) ||
    (q.creator || '').toLowerCase().includes(contentSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Staff Warning Modal */}
      {warningModalUser && isTeamAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setWarningModalUser(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-amber-300 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" /> Send Official Warning to @{warningModalUser.username}
              </h3>
              <button type="button" onClick={() => setWarningModalUser(null)} className="p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <textarea
              rows={3}
              value={warningMessage}
              onChange={e => setWarningMessage(e.target.value)}
              placeholder="Enter official moderation notice regarding community guidelines..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-medium text-slate-800"
            />
            <button
              type="button"
              onClick={() => {
                if (!warningMessage.trim()) return;
                onModWarnUser(warningModalUser, warningMessage.trim());
                setWarningModalUser(null);
                setWarningMessage('');
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-amber-950 border-b-4 border-amber-700 font-black py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Send Official Staff Warning
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            {isTeamAdmin ? 'Settings & Staff Moderation Center' : 'Experience & Account Settings'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Customize themes, backgrounds, sound effects, quiz gameplay, accessibility, privacy, and notifications.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setUserSettings({
              accentTheme: 'emerald',
              bgPattern: 'dots',
              surfaceStyle: 'light',
              cardCorners: 'rounded',
              compactSidebar: false,
              showSeasonStickers: true,
              soundEffects: true,
              autoAdvanceDelay: 750,
              shuffleOptions: false,
              showAnswerExplanations: true,
              confirmExitQuiz: true,
              defaultQuizDifficulty: 'Medium',
              defaultQuizVisibility: 'public',
              fontSizeScale: 'normal',
              dyslexiaFriendlyFont: false,
              highContrastMode: false,
              reducedMotion: false,
              showOnlineStatus: true,
              allowProfileComments: true,
              hideStatsFromPublic: false,
              safeSearchFilter: true,
            });
            showToast('Reset all experience preferences to defaults!');
          }}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-600 cursor-pointer"
        >
          Reset Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-3 border-2 border-slate-200 space-y-1.5 self-start">
          {[
            ...(isTeamAdmin ? [{ id: 'moderation', label: `Moderation Hub (${openReports.length})`, icon: Shield }] : []),
            { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
            { id: 'gameplay', label: 'Gameplay & Audio', icon: Sliders },
            { id: 'accessibility', label: 'Accessibility & Text', icon: Sparkles },
            { id: 'privacy', label: 'Privacy & Safety', icon: Lock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'account', label: 'Account & Data', icon: UserCheck },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-black text-xs cursor-pointer transition-all ${
                  activeTab === t.id ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} />
                <span>{t.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-black text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-3 space-y-5">
          {/* TAB 1: APPEARANCE & VISUAL CUSTOMIZATION */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-800">Appearance, Themes &amp; Workspace Style</h3>
                <p className="text-xs text-slate-500">Personalize Quizly's colors, backdrop texture, surface contrast, and layout density.</p>
              </div>

              {/* Color Palette Picker */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase text-slate-500 block">Primary Color Palette</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'emerald', name: 'Quizly Emerald', swatch: 'from-emerald-400 to-teal-600', bg: '#f1f9f4' },
                    { id: 'ocean', name: 'Ocean Breeze', swatch: 'from-sky-400 to-blue-600', bg: '#f0f7ff' },
                    { id: 'royal', name: 'Royal Amethyst', swatch: 'from-purple-500 to-indigo-700', bg: '#f6f2ff' },
                    { id: 'sunset', name: 'Sunset Tangerine', swatch: 'from-orange-400 to-rose-600', bg: '#fff5f0' },
                    { id: 'berry', name: 'Berry Blossom', swatch: 'from-pink-400 to-fuchsia-600', bg: '#fdf2f8' },
                    { id: 'gold', name: 'Solar Gold', swatch: 'from-amber-400 to-yellow-600', bg: '#fefce8' },
                  ].map(pal => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => updateSetting('accentTheme', pal.id, `Switched palette to ${pal.name}!`)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 text-left cursor-pointer transition-all ${
                        userSettings.accentTheme === pal.id
                          ? 'border-slate-900 bg-slate-50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-xl bg-gradient-to-br ${pal.swatch} shrink-0`} />
                      <div>
                        <span className="font-black text-xs text-slate-800 block">{pal.name}</span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {userSettings.accentTheme === pal.id ? 'Active' : 'Select'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Canvas Pattern */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase text-slate-500 block">Background Canvas Pattern</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'dots', label: 'Polka Dots' },
                    { id: 'grid', label: 'Notebook Grid' },
                    { id: 'diagonal', label: 'Diagonal Stripes' },
                    { id: 'clean', label: 'Clean Solid' },
                  ].map(pat => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => updateSetting('bgPattern', pat.id, `Background pattern: ${pat.label}`)}
                      className={`py-2.5 px-3 rounded-xl border-2 font-black text-xs cursor-pointer ${
                        userSettings.bgPattern === pat.id
                          ? 'bg-emerald-600 text-white border-emerald-800'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {pat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface Theme (Light / Warm Paper / Midnight Dark) */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase text-slate-500 block">Surface &amp; Reading Mode</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'light', label: 'Bright Daylight' },
                    { id: 'sepia', label: 'Warm Study Paper' },
                    { id: 'midnight', label: 'Midnight Dark' },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => updateSetting('surfaceStyle', mode.id, `Surface mode: ${mode.label}`)}
                      className={`py-2.5 px-3 rounded-xl border-2 font-black text-xs cursor-pointer ${
                        userSettings.surfaceStyle === mode.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Toggles */}
              <div className="space-y-2.5">
                {[
                  {
                    key: 'compactSidebar',
                    label: 'Compact Navigation Sidebar',
                    desc: 'Reduce sidebar width on desktop screens to give quizzes and dashboards extra horizontal room.',
                  },
                  {
                    key: 'showSeasonStickers',
                    label: 'Show Decorative Season Stickers',
                    desc: 'Display floating theme stickers across the Season Pass and Dashboard hero cards.',
                  },
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-black text-xs text-slate-800 block">{item.label}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(userSettings[item.key])}
                      onChange={e => updateSetting(item.key, e.target.checked, `Updated ${item.label}`)}
                      className="w-5 h-5 accent-emerald-600 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: GAMEPLAY, AUDIO & CREATOR DEFAULTS */}
          {activeTab === 'gameplay' && (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-5">
              <div>
                <h3 className="text-lg font-black text-slate-800">Quiz Gameplay, Audio &amp; Creator Defaults</h3>
                <p className="text-xs text-slate-500">Control quiz pacing, sound feedback, answer shuffling, and default creation settings.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'soundEffects',
                    label: 'Interactive Sound Effects (Web Audio Chimes)',
                    desc: 'Play crisp synthesized chimes on correct answers, coin claims, and achievements.',
                  },
                  {
                    key: 'shuffleOptions',
                    label: 'Shuffle Multiple-Choice Answer Order',
                    desc: 'Randomize A/B/C/D answer positions each time you replay a quiz for deeper mastery.',
                  },
                  {
                    key: 'showAnswerExplanations',
                    label: 'Detailed Post-Quiz Solution Breakdown',
                    desc: 'Automatically highlight missed questions and correct solutions on the Results page.',
                  },
                  {
                    key: 'confirmExitQuiz',
                    label: 'Guard Against Accidental Quiz Exit',
                    desc: 'Require a second click on "Exit Quiz" while in the middle of an active attempt.',
                  },
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-black text-xs text-slate-800 block">{item.label}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(userSettings[item.key])}
                      onChange={e => updateSetting(item.key, e.target.checked, `Updated ${item.label}`)}
                      className="w-5 h-5 accent-emerald-600 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Next Question Delay</label>
                  <select
                    value={userSettings.autoAdvanceDelay}
                    onChange={e => updateSetting('autoAdvanceDelay', Number(e.target.value), 'Updated question pacing!')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-800"
                  >
                    <option value={350}>Fast (0.35s)</option>
                    <option value={750}>Balanced (0.75s)</option>
                    <option value={1400}>Relaxed (1.4s)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Default Quiz Difficulty</label>
                  <select
                    value={userSettings.defaultQuizDifficulty}
                    onChange={e => updateSetting('defaultQuizDifficulty', e.target.value, 'Updated default difficulty!')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-800"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Default Quiz Visibility</label>
                  <select
                    value={userSettings.defaultQuizVisibility}
                    onChange={e => updateSetting('defaultQuizVisibility', e.target.value, 'Updated default visibility!')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-black text-slate-800"
                  >
                    <option value="public">Public (Explore)</option>
                    <option value="private">Private (Only Me)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACCESSIBILITY & TYPOGRAPHY */}
          {activeTab === 'accessibility' && (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-5">
              <div>
                <h3 className="text-lg font-black text-slate-800">Accessibility, Typography &amp; Motion</h3>
                <p className="text-xs text-slate-500">Adjust text scaling, reading-friendly fonts, contrast, and UI animations.</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-slate-500 block">Interface Text Size</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'normal', label: 'Standard (100%)' },
                    { id: 'large', label: 'Large (112%)' },
                    { id: 'xlarge', label: 'Extra Large (125%)' },
                  ].map(sz => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => updateSetting('fontSizeScale', sz.id, `Text scale: ${sz.label}`)}
                      className={`py-2.5 px-3 rounded-xl border-2 font-black text-xs cursor-pointer ${
                        userSettings.fontSizeScale === sz.id
                          ? 'bg-emerald-600 text-white border-emerald-800'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'dyslexiaFriendlyFont',
                    label: 'Enhanced Readability & Letter Spacing',
                    desc: 'Increases letter spacing and line height across questions and answer cards for effortless reading.',
                  },
                  {
                    key: 'highContrastMode',
                    label: 'High-Contrast Borders & Outlines',
                    desc: 'Strengthens card borders and text contrast for clearer visual separation.',
                  },
                  {
                    key: 'reducedMotion',
                    label: 'Reduced Motion & Animations',
                    desc: 'Minimizes shimmer sweeps, bouncing icons, and smooth scroll transitions.',
                  },
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-black text-xs text-slate-800 block">{item.label}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(userSettings[item.key])}
                      onChange={e => updateSetting(item.key, e.target.checked, `Updated ${item.label}`)}
                      className="w-5 h-5 accent-emerald-600 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY & COMMUNITY SAFETY */}
          {activeTab === 'privacy' && (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-5">
              <div>
                <h3 className="text-lg font-black text-slate-800">Privacy, Profile Visibility &amp; Safety</h3>
                <p className="text-xs text-slate-500">Control who can view your profile, stats, and community interactions.</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <span className="font-black text-xs text-slate-800 block">Public Creator Profile (/profile/{currentUser?.username})</span>
                    <span className="text-[11px] text-slate-500">When off, your profile is hidden from Search and other learners.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentUser?.isPublic !== false}
                    onChange={e => onUpdateProfile({ isPublic: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 cursor-pointer"
                  />
                </label>

                {[
                  {
                    key: 'showOnlineStatus',
                    label: 'Show Active Learner Badge on Profile',
                    desc: 'Let followers see when you are actively studying or creating quizzes.',
                  },
                  {
                    key: 'allowProfileComments',
                    label: 'Allow Comments on My Public Quizzes by Default',
                    desc: 'Enable community feedback and discussions on newly published quizzes.',
                  },
                  {
                    key: 'safeSearchFilter',
                    label: 'Strict Classroom Safe-Filter',
                    desc: 'Automatically hide unverified or flagged community content while browsing Explore.',
                  },
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-black text-xs text-slate-800 block">{item.label}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(userSettings[item.key])}
                      onChange={e => updateSetting(item.key, e.target.checked, `Updated ${item.label}`)}
                      className="w-5 h-5 accent-emerald-600 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ACCOUNT & DATA MANAGEMENT */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-5">
              <div>
                <h3 className="text-lg font-black text-slate-800">Account Details &amp; Data Export</h3>
                <p className="text-xs text-slate-500">Update your bio or download a portable JSON archive of your quizzes and progress.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Username</span>
                  <span className="font-black text-sm text-slate-800">@{currentUser?.username}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Display Name</span>
                  <span className="font-black text-sm text-slate-800">
                    {currentUser?.displayName || currentUser?.username}
                    {!isTeamAdmin && <span className="text-[10px] font-bold text-slate-400 ml-1.5">(Staff-only edit)</span>}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase text-slate-500">Quick Biography Update</label>
                <textarea
                  rows={2}
                  maxLength={240}
                  value={bioDraft}
                  onChange={e => setBioDraft(e.target.value)}
                  placeholder="Write a short bio for your public profile..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-medium text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => onUpdateProfile({ bio: bioDraft.trim() })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Save Biography
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-black text-xs text-slate-800 block">Download My Quizly Archive (JSON)</span>
                  <span className="text-[11px] text-slate-500">Export all your created quizzes, attempt history, and unlocked achievements.</span>
                </div>
                <button
                  type="button"
                  onClick={onExportUserData}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-black px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Export My Data
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-3">
              <h3 className="text-lg font-black text-slate-800">Notification Preferences</h3>
              {[
                { key: 'follows', label: 'New Followers', desc: 'Notify when someone follows your profile' },
                { key: 'likes', label: 'Quiz Likes', desc: 'Notify when someone likes one of your quizzes' },
                { key: 'comments', label: 'Quiz Comments', desc: 'Notify when someone comments on your public quiz' },
                { key: 'achievements', label: 'Achievements & Milestones', desc: 'Notify when you unlock badges or hit play milestones' },
              ].map(pref => (
                <label key={pref.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <span className="font-black text-xs text-slate-800 block">{pref.label}</span>
                    <span className="text-[11px] text-slate-500">{pref.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs[pref.key] !== false}
                    onChange={e => {
                      setNotificationPrefs(prev => ({ ...prev, [pref.key]: e.target.checked }));
                      showToast('Updated notification preference!');
                    }}
                    className="w-5 h-5 accent-emerald-600 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          )}

          {activeTab === 'moderation' && isTeamAdmin && (
            <div className="space-y-5">
              {/* Live Moderation Command Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-2xl p-3.5 border-2 border-rose-200">
                  <span className="text-[10px] font-black uppercase text-rose-500 block">Open Reports</span>
                  <span className="text-2xl font-black text-slate-800">{openReports.length}</span>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border-2 border-amber-200">
                  <span className="text-[10px] font-black uppercase text-amber-600 block">Suspended Users</span>
                  <span className="text-2xl font-black text-slate-800">{suspendedUsers.length}</span>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border-2 border-blue-200">
                  <span className="text-[10px] font-black uppercase text-blue-600 block">Total Quizzes</span>
                  <span className="text-2xl font-black text-slate-800">{allQuizzes.length}</span>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border-2 border-emerald-200">
                  <span className="text-[10px] font-black uppercase text-emerald-600 block">Audit Actions</span>
                  <span className="text-2xl font-black text-slate-800">{moderationActions.length}</span>
                </div>
              </div>

              {/* Unified Moderation Sub-Navigation (Includes AI Season Manager & Supabase Database) */}
              <div className="flex flex-wrap gap-2 bg-white p-2.5 rounded-2xl border-2 border-slate-200">
                {[
                  { id: 'reports', label: `Reports Queue (${openReports.length})`, icon: Flag },
                  { id: 'users', label: `Users (${allProfiles.length})`, icon: Users },
                  { id: 'content', label: `Quizzes & Comments`, icon: BookOpen },
                  { id: 'safety', label: 'Site Safety & Auto-Mod', icon: Shield },
                  { id: 'season', label: 'AI Season Manager', icon: Trophy },
                  { id: 'database', label: 'Supabase Database', icon: Database },
                  { id: 'audit', label: `Audit Log (${moderationActions.length})`, icon: ClipboardList },
                ].map(st => {
                  const SubIcon = st.icon;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setModSubTab(st.id)}
                      className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                        modSubTab === st.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <SubIcon size={14} />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 1. REPORTS QUEUE */}
              {modSubTab === 'reports' && (
                <div className="bg-white rounded-3xl p-6 border-2 border-blue-300 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Flag size={20} className="text-rose-500" /> Community Reports Queue ({openReports.length} Open)
                    </h3>
                  </div>

                  {reports.length === 0 ? (
                    <p className="text-xs text-slate-500 font-medium">No community reports submitted yet. Everything looks clean!</p>
                  ) : (
                    <div className="space-y-3">
                      {reports.map(rep => (
                        <div key={rep.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-black text-rose-700 uppercase">
                              [{rep.targetType}] {rep.category}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400">
                                {new Date(rep.createdAt).toLocaleString()}
                              </span>
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                                {rep.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 font-medium">
                            Target ID: <strong className="font-mono">{rep.targetId}</strong> {rep.details ? `— "${rep.details}"` : ''}
                          </p>
                          {rep.status !== 'resolved' && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {rep.targetType === 'quiz' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onModForceUnpublishQuiz(rep.targetId, rep.id)}
                                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-amber-950 font-black text-xs cursor-pointer"
                                  >
                                    Unpublish Quiz
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onModRemoveQuiz(rep.targetId, rep.id)}
                                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs cursor-pointer"
                                  >
                                    Delete Quiz
                                  </button>
                                </>
                              )}
                              {rep.targetType === 'profile' && (
                                <button
                                  type="button"
                                  onClick={() => onModSuspendUser(rep.targetId, rep.id)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs cursor-pointer"
                                >
                                  Suspend Account
                                </button>
                              )}
                              {rep.targetType === 'comment' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onModDeleteComment(rep.targetId);
                                    onResolveReport(rep.id, 'Removed reported comment');
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs cursor-pointer"
                                >
                                  Delete Comment
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onResolveReport(rep.id, 'Dismissed / Resolved by Staff')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs cursor-pointer"
                              >
                                Mark Resolved
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. USER ACCOUNT DIRECTORY & ACTIONS */}
              {modSubTab === 'users' && (
                <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-slate-800">User Accounts Directory</h3>
                    <input
                      type="text"
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      placeholder="Filter by username, display name, or email..."
                      className="px-3.5 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold w-full sm:w-64"
                    />
                  </div>

                  <div className="space-y-3">
                    {filteredModUsers.map(u => (
                      <div key={u.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatarDisplay profile={u} size={42} />
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-black text-sm text-slate-800">{u.displayName || u.username}</span>
                              <span className="text-xs font-bold text-emerald-700">@{u.username}</span>
                              {u.isTeamAdmin && <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Staff</span>}
                              {u.role === 'Teacher' && <span className="bg-teal-100 text-teal-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Teacher</span>}
                              {u.suspended && <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Suspended</span>}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{u.bio || 'No bio set'}</p>
                          </div>
                        </div>

                        {!u.isTeamAdmin && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setWarningModalUser(u);
                                setWarningMessage('');
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-[11px] cursor-pointer"
                            >
                              Warn
                            </button>
                            <button
                              type="button"
                              onClick={() => onModResetUserProfile(u)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-[11px] cursor-pointer"
                            >
                              Reset Bio/Avatar
                            </button>
                            <button
                              type="button"
                              onClick={() => onModToggleVerifiedTeacher(u)}
                              className="px-2.5 py-1.5 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-900 font-black text-[11px] cursor-pointer"
                            >
                              {u.role === 'Teacher' ? 'Revoke Teacher' : 'Verify Teacher'}
                            </button>
                            {u.suspended ? (
                              <button
                                type="button"
                                onClick={() => onModUnsuspendUser(u.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-[11px] cursor-pointer"
                              >
                                Unsuspend
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onModSuspendUser(u.id, null)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white font-black text-[11px] cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. QUIZZES & COMMENTS CONTENT MODERATION */}
              {modSubTab === 'content' && (
                <div className="space-y-5">
                  <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-black text-slate-800">All Platform Quizzes ({allQuizzes.length})</h3>
                      <input
                        type="text"
                        value={contentSearch}
                        onChange={e => setContentSearch(e.target.value)}
                        placeholder="Search quiz title or @creator..."
                        className="px-3.5 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold w-full sm:w-64"
                      />
                    </div>
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 quizly-content-scroll">
                      {filteredModQuizzes.map(q => (
                        <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-black text-xs text-slate-800 block">{q.title}</span>
                            <span className="text-[11px] text-slate-500">
                              by @{q.creator} &bull; {q.visibility} / {q.status} &bull; {q.plays || 0} plays
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {q.status === 'published' && (
                              <button
                                type="button"
                                onClick={() => onModForceUnpublishQuiz(q.id, null)}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-black text-[11px] cursor-pointer"
                              >
                                Unpublish
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onModRemoveQuiz(q.id, null)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white font-black text-[11px] cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-3">
                    <h3 className="text-base font-black text-slate-800">Recent Community Comments ({quizComments.length})</h3>
                    {quizComments.length === 0 ? (
                      <p className="text-xs text-slate-500">No comments posted yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 quizly-content-scroll">
                        {quizComments.map(c => (
                          <div key={c.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <span className="font-black text-xs text-emerald-700">@{c.username}: </span>
                              <span className="text-xs text-slate-700">{c.content}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => onModDeleteComment(c.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-black text-[11px] shrink-0 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. SITE SAFETY CONTROLS & KEYWORD AUTO-MODERATOR */}
              {modSubTab === 'safety' && (
                <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-5">
                  <div>
                    <h3 className="text-lg font-black text-slate-800">Site-Wide Safety &amp; Auto-Moderation Controls</h3>
                    <p className="text-xs text-slate-500">Emergency platform locks and automated word filtering for classroom protection.</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        key: 'lockNewSignups',
                        label: 'Lock New Account Registrations',
                        desc: 'Temporarily pause new account creation while retaining existing logins.',
                      },
                      {
                        key: 'freezePublicPublishing',
                        label: 'Freeze New Public Quiz Publishing',
                        desc: 'Require quizzes to remain drafts/private during moderation maintenance.',
                      },
                      {
                        key: 'freezeAllComments',
                        label: 'Global Comment Freeze (Read-Only Mode)',
                        desc: 'Temporarily disable posting new comments across all public quizzes.',
                      },
                      {
                        key: 'autoFilterProfanity',
                        label: 'Automated Keyword & Spam Blocker',
                        desc: 'Automatically block comments or quiz titles containing restricted keywords.',
                      },
                    ].map(toggle => (
                      <label key={toggle.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <div>
                          <span className="font-black text-xs text-slate-800 block">{toggle.label}</span>
                          <span className="text-[11px] text-slate-500">{toggle.desc}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(siteSafetyConfig[toggle.key])}
                          onChange={e => {
                            setSiteSafetyConfig(prev => ({ ...prev, [toggle.key]: e.target.checked }));
                            showToast(`Updated ${toggle.label}`);
                          }}
                          className="w-5 h-5 accent-blue-600 cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="font-black text-xs text-slate-800 block">Blocked Keywords List</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newBlockedWord}
                        onChange={e => setNewBlockedWord(e.target.value)}
                        placeholder="Add restricted word or phrase..."
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const w = newBlockedWord.trim().toLowerCase();
                          if (!w) return;
                          setSiteSafetyConfig(prev => ({
                            ...prev,
                            blockedWords: Array.from(new Set([...(prev.blockedWords || []), w])),
                          }));
                          setNewBlockedWord('');
                          showToast(`Added "${w}" to auto-mod filter.`);
                        }}
                        className="bg-blue-600 text-white font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
                      >
                        Add Keyword
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(siteSafetyConfig.blockedWords || []).map(word => (
                        <span key={word} className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-[11px] font-black inline-flex items-center gap-1.5">
                          {word}
                          <button
                            type="button"
                            onClick={() =>
                              setSiteSafetyConfig(prev => ({
                                ...prev,
                                blockedWords: (prev.blockedWords || []).filter(w => w !== word),
                              }))
                            }
                            className="hover:text-rose-950 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. AI SEASON MANAGER (INSIDE MODERATION) */}
              {modSubTab === 'season' && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (isLaunchingSeason) return;
                    setIsLaunchingSeason(true);
                    try {
                      const nextNum = season.number + 1;
                      const title = newSeasonTitle.trim() || `Season ${nextNum}: Galactic Quest`;
                      await onStartNewSeason({
                        nextNumber: nextNum,
                        name: title.toLowerCase().startsWith('season') ? title : `Season ${nextNum}: ${title}`,
                        endsIn: '30 Days Left',
                        resetXp: true,
                      });
                      setNewSeasonTitle('');
                    } finally {
                      setIsLaunchingSeason(false);
                    }
                  }}
                  className="bg-white rounded-3xl p-6 border-2 border-purple-200 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-purple-900 flex items-center gap-2">
                      <Trophy size={20} className="text-purple-600" /> AI Season Pass Manager
                    </h3>
                    <span className="bg-purple-100 text-purple-800 text-xs font-black px-3 py-1 rounded-full">
                      Active: {season.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Launch Season {season.number + 1} across the entire platform and let Gemini AI automatically generate the matching theme palette, stickers, tagline, and 21 milestone rewards!
                  </p>
                  <input
                    type="text"
                    value={newSeasonTitle}
                    onChange={e => setNewSeasonTitle(e.target.value)}
                    placeholder={`Season ${season.number + 1} Theme (e.g., Galactic Quest, Emerald Jungle, Arctic Legends)`}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-purple-200 text-xs font-bold"
                  />
                  <button
                    type="submit"
                    disabled={isLaunchingSeason}
                    className="bg-purple-600 hover:bg-purple-700 text-white border-b-4 border-purple-800 font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    {isLaunchingSeason ? 'AI Building Season...' : `Launch Season ${season.number + 1}`}
                  </button>
                </form>
              )}

              {/* 6. SUPABASE DATABASE CONNECTION (INSIDE MODERATION) */}
              {modSubTab === 'database' && (
                <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Database size={20} className="text-emerald-600" /> Supabase Database Configuration
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${supabaseConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {supabaseConnected ? 'Connected & Syncing' : 'Connect Project URL & Anon Key'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Staff-only backend database configuration. Enter your Supabase Project URL and Public Anon Key to sync profiles, quizzes, likes, follows, attempts, comments, notifications, and moderation logs across all devices.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSaveSupabaseConfig({ url: sbUrl.trim(), anonKey: sbKey.trim() });
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-500 mb-1">Supabase Project URL</label>
                      <input
                        type="url"
                        value={sbUrl}
                        onChange={e => setSbUrl(e.target.value)}
                        placeholder="https://your-project-id.supabase.co"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-500 mb-1">Supabase Public Anon Key</label>
                      <input
                        type="password"
                        value={sbKey}
                        onChange={e => setSbKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800 font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer"
                    >
                      Save &amp; Sync Supabase Project
                    </button>
                  </form>
                </div>
              )}

              {/* 7. MODERATION AUDIT LOG */}
              {modSubTab === 'audit' && (
                <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 space-y-3">
                  <h3 className="text-lg font-black text-slate-800">Staff Moderation Audit Log ({moderationActions.length})</h3>
                  {moderationActions.length === 0 ? (
                    <p className="text-xs text-slate-500">No moderation actions recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {moderationActions.map(act => (
                        <div key={act.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-black uppercase text-blue-700 mr-2">[{act.actionType}]</span>
                            <span className="font-bold text-slate-800">Target: <code>{act.targetId}</code></span>
                            <span className="text-slate-600 block mt-0.5">{act.notes}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(act.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- LOGIN / SIGN UP MODAL (EMAIL + PASSWORD + UNIQUE USERNAME + HUMAN VERIFICATION) ---
const LoginScreen = ({ initialMode = 'login', existingUsernames = [], onLoginSuccess, onClose }) => {
  const [authMode, setAuthMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const [humanVerified, setHumanVerified] = useState(false);

  useEffect(() => {
    setAuthMode(initialMode);
    setError('');
    setHumanVerified(false);
  }, [initialMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanUser = username.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setError('Please enter a password (at least 4 characters).');
      return;
    }

    if (authMode === 'signup') {
      if (!cleanUser) {
        setError('Please choose a unique username.');
        return;
      }
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUser)) {
        setError('Username must be 3–20 characters using only letters, numbers, or underscores.');
        return;
      }
      if (cleanUser.toLowerCase() === 'quizly_team' || cleanUser.toLowerCase() === 'quizly team') {
        setError('That username is reserved for Quizly Staff.');
        return;
      }
      if (existingUsernames.some(u => u.toLowerCase() === cleanUser.toLowerCase())) {
        setError(`The username "@${cleanUser}" is already taken! Please pick another.`);
        return;
      }
      if (!humanVerified) {
        setError('Please check the "I\'m a human" verification box before creating your account.');
        return;
      }
    }

    onLoginSuccess({
      mode: authMode,
      email: cleanEmail,
      username: cleanUser || cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_'),
      password,
      role,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-3xl p-7 border-2 border-slate-200 shadow-2xl space-y-5 relative my-auto" onClick={e => e.stopPropagation()}>
        {onClose && (
          <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X size={18} />
          </button>
        )}

        <div className="text-center space-y-1.5">
          <div className="flex justify-center"><QuizlyLogo size={68} showWordmark={true} /></div>
          <h2 className="text-lg font-black text-slate-800 pt-1">
            {authMode === 'signup' ? 'Create Your Quizly Account' : 'Sign In to Quizly'}
          </h2>
        </div>

        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`py-2 rounded-xl text-xs font-black cursor-pointer ${authMode === 'login' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setError(''); }}
            className={`py-2 rounded-xl text-xs font-black cursor-pointer ${authMode === 'signup' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm font-bold text-slate-800"
            />
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">Unique Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g., sky_scholar"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm font-bold text-slate-800"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm font-bold text-slate-800"
            />
          </div>

          {authMode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {['Student', 'Teacher'].map(r => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-xl border-2 font-black text-xs cursor-pointer ${role === r ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={humanVerified}
                  onChange={e => setHumanVerified(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-black text-slate-800">I'm a human (Quizly Guard)</span>
              </label>
            </>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800 font-black py-3 rounded-xl text-sm cursor-pointer"
          >
            {authMode === 'signup' ? 'Create Account' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  // Navigation & View Routing State
  const [view, setView] = useState('landing');
  const [authModalMode, setAuthModalMode] = useState(null);
  const [activeProfileUsername, setActiveProfileUsername] = useState(null);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Supabase client & live connection state
  const [supabaseConfig, setSupabaseConfig] = useState(getInitialSupabaseConfig);
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Rich User Experience Customization Preferences
  const [userSettings, setUserSettings] = useState({
    accentTheme: 'emerald',
    bgPattern: 'dots',
    surfaceStyle: 'light',
    cardCorners: 'rounded',
    compactSidebar: false,
    showSeasonStickers: true,
    soundEffects: true,
    autoAdvanceDelay: 750,
    shuffleOptions: false,
    showAnswerExplanations: true,
    confirmExitQuiz: true,
    defaultQuizDifficulty: 'Medium',
    defaultQuizVisibility: 'public',
    fontSizeScale: 'normal',
    dyslexiaFriendlyFont: false,
    highContrastMode: false,
    reducedMotion: false,
    showOnlineStatus: true,
    allowProfileComments: true,
    hideStatsFromPublic: false,
    safeSearchFilter: true,
  });

  // Web Audio Synth Chime Helper for Interactive Feedback
  const playUiChime = (type = 'success') => {
    if (!userSettings.soundEffects || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'coin' ? 880 : 587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(type === 'coin' ? 1318.5 : 880, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.19);
    } catch (e) {}
  };

  // Economy, Season Pass & Cosmetics Locker State
  const [coins, setCoins] = useState(250);
  const [season, setSeason] = useState(INITIAL_SEASON);
  const [seasonXp, setSeasonXp] = useState(340);
  const [claimedMilestones, setClaimedMilestones] = useState([]);
  const [ownedSkins, setOwnedSkins] = useState(['red_cube']);
  const [ownedBanners, setOwnedBanners] = useState(['default_blue']);
  const [ownedFrames, setOwnedFrames] = useState(['none']);
  const [ownedTitles, setOwnedTitles] = useState(['apprentice']);

  // Notifications, Teacher Hub & Announcements State
  const [notificationPrefs, setNotificationPrefs] = useState({
    follows: true,
    likes: true,
    comments: true,
    achievements: true,
  });
  const [teacherHub, setTeacherHub] = useState({
    googleConnected: false,
    classes: [],
    assignments: [],
  });
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);

  // Auth & User Profile State
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);
  const [allProfiles, setAllProfiles] = useState([
    {
      id: 'quizly-official',
      username: 'quizly_official',
      displayName: 'Quizly Official',
      bio: 'Official classroom trivia and curriculum sets from the Quizly Team.',
      isPublic: true,
      equippedSkin: 'dino_rex',
      equippedBanner: 'emerald_matrix',
      equippedFrame: 'emerald_vine',
      equippedTitle: 'legend',
      createdAt: '2026-11-01T12:00:00Z',
    },
  ]);

  // Core Community & Learning Entities (Synced to Supabase when configured; zero localStorage fallback for user content)
  const [allQuizzes, setAllQuizzes] = useState(INITIAL_QUIZZES);
  const [follows, setFollows] = useState([]); // { followerId, followingId }
  const [quizLikes, setQuizLikes] = useState([]); // { userId, quizId }
  const [quizFavorites, setQuizFavorites] = useState([]); // { userId, quizId }
  const [quizAttempts, setQuizAttempts] = useState([]); // { id, userId, quizId, quizTitle, score, totalQuestions, percentage, completedAt }
  const [quizComments, setQuizComments] = useState([]); // { id, quizId, userId, username, content, createdAt }
  const [notifications, setNotifications] = useState([]); // { id, userId, type, message, actorUsername, quizId, isRead, createdAt }
  const [userAchievementsMap, setUserAchievementsMap] = useState({}); // { [userId]: ['first_quiz', ...] }
  const [reports, setReports] = useState([]); // { id, reporterId, targetType, targetId, category, details, status, createdAt }
  const [moderationActions, setModerationActions] = useState([]);
  const [siteSafetyConfig, setSiteSafetyConfig] = useState({
    lockNewSignups: false,
    freezePublicPublishing: false,
    freezeAllComments: false,
    autoFilterProfanity: true,
    blockedWords: ['spam', 'scam', 'http://', 'https://'],
  });

  // Secret Quizly Team 3-Second Logo Hold Unlock
  const [teamSecretOpen, setTeamSecretOpen] = useState(false);
  const [teamSecretPass, setTeamSecretPass] = useState('');
  const [teamSecretError, setTeamSecretError] = useState('');
  const [holdingLogo, setHoldingLogo] = useState(false);
  const logoHoldTimerRef = useRef(null);

  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  // Initialize Supabase Client when URL & Anon Key are provided
  useEffect(() => {
    let active = true;
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      setSupabaseClient(null);
      setSupabaseConnected(false);
      return;
    }
    loadSupabaseSdk().then(async (sdk) => {
      if (!active || !sdk) return;
      try {
        const client = sdk.createClient(supabaseConfig.url, supabaseConfig.anonKey);
        setSupabaseClient(client);
        setSupabaseConnected(true);

        // Fetch existing Supabase Auth session & database records
        const { data: sessionData } = await client.auth.getSession();
        if (sessionData?.session?.user) {
          const authUser = sessionData.session.user;
          setCurrentUserId(authUser.id);
          setView('home');
        }

        const [profRes, quizRes, followRes, likeRes, favRes, attRes, comRes, notifRes, repRes] = await Promise.all([
          client.from('profiles').select('*'),
          client.from('quizzes').select('*'),
          client.from('follows').select('*'),
          client.from('quiz_likes').select('*'),
          client.from('quiz_favorites').select('*'),
          client.from('quiz_attempts').select('*'),
          client.from('quiz_comments').select('*'),
          client.from('notifications').select('*'),
          client.from('reports').select('*'),
        ]);

        if (profRes?.data?.length) setAllProfiles(profRes.data);
        if (quizRes?.data?.length) setAllQuizzes(quizRes.data);
        if (followRes?.data) setFollows(followRes.data);
        if (likeRes?.data) setQuizLikes(likeRes.data);
        if (favRes?.data) setQuizFavorites(favRes.data);
        if (attRes?.data) setQuizAttempts(attRes.data);
        if (comRes?.data) setQuizComments(comRes.data);
        if (notifRes?.data) setNotifications(notifRes.data);
        if (repRes?.data) setReports(repRes.data);
      } catch (err) {
        setSupabaseConnected(false);
      }
    });
    return () => { active = false; };
  }, [supabaseConfig]);

  // URL Sync Helper (/profile/:username and /quiz/:quizId)
  const syncBrowserPath = (path) => {
    try {
      if (typeof window !== 'undefined' && window.history?.pushState) {
        window.history.pushState({}, '', path);
      }
    } catch (e) {
      // Ignore sandboxed iframe history restrictions
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname || '';
    if (path.startsWith('/profile/')) {
      const uname = decodeURIComponent(path.replace('/profile/', '')).trim();
      if (uname) {
        setActiveProfileUsername(uname);
        setView('public_profile');
      }
    } else if (path.startsWith('/quiz/')) {
      const qid = decodeURIComponent(path.replace('/quiz/', '')).trim();
      if (qid) {
        setActiveQuizId(qid);
        setView('quiz_detail');
      }
    }
  }, []);

  const currentUser = useMemo(
    () => allProfiles.find(p => p.id === currentUserId) || null,
    [allProfiles, currentUserId]
  );

  // Automatic Achievement Evaluation Engine
  const evaluateAchievementsForUser = (userId, nextQuizzes = allQuizzes, nextFollows = follows, nextAttempts = quizAttempts) => {
    if (!userId) return;
    const userQuizzes = nextQuizzes.filter(q => q.creatorId === userId);
    const publishedCount = userQuizzes.filter(q => q.status === 'published').length;
    const totalPlays = userQuizzes.reduce((acc, q) => acc + (Number(q.plays) || 0), 0);
    const followingCount = nextFollows.filter(f => f.followerId === userId).length;
    const completedAttempts = nextAttempts.filter(a => a.userId === userId).length;

    const metrics = {
      publishedQuizzes: publishedCount,
      totalPlaysReceived: totalPlays,
      followingCount,
      completedAttempts,
    };

    const existing = userAchievementsMap[userId] || [];
    const newlyUnlocked = [];

    ACHIEVEMENTS_CATALOG.forEach(ach => {
      if (!existing.includes(ach.id) && (metrics[ach.metric] || 0) >= ach.target) {
        newlyUnlocked.push(ach);
      }
    });

    if (newlyUnlocked.length > 0) {
      setUserAchievementsMap(prev => ({
        ...prev,
        [userId]: Array.from(new Set([...(prev[userId] || []), ...newlyUnlocked.map(a => a.id)])),
      }));

      newlyUnlocked.forEach(ach => {
        if (notificationPrefs.achievements) {
          pushNotification({
            userId,
            type: 'Achievement',
            message: `Achievement Unlocked: "${ach.name}" — ${ach.desc}`,
          });
        }
        if (userId === currentUserId) {
          showToast(`Achievement Unlocked: ${ach.name}!`);
        }
      });
    }
  };

  const pushNotification = async ({ userId, type, message, actorUsername = null, quizId = null }) => {
    if (!userId) return;
    const notif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      type,
      message,
      actorUsername,
      quizId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
    if (supabaseClient) {
      await supabaseClient.from('notifications').insert(notif).catch(() => {});
    }
  };

  // Logo 3-second hold handlers for Quizly Team Admin login
  const startLogoHold = () => {
    setHoldingLogo(true);
    if (logoHoldTimerRef.current) clearTimeout(logoHoldTimerRef.current);
    logoHoldTimerRef.current = setTimeout(() => {
      setHoldingLogo(false);
      setTeamSecretPass('');
      setTeamSecretError('');
      setTeamSecretOpen(true);
    }, 3000);
  };

  const cancelLogoHold = () => {
    setHoldingLogo(false);
    if (logoHoldTimerRef.current) {
      clearTimeout(logoHoldTimerRef.current);
      logoHoldTimerRef.current = null;
    }
  };

  const handleTeamSecretSubmit = (e) => {
    e.preventDefault();
    if (teamSecretPass !== 'rileyjohn2014') {
      setTeamSecretError('Incorrect Quizly Team password.');
      return;
    }
    const staffId = 'quizly-team-staff';
    setAllProfiles(prev => {
      if (prev.some(p => p.id === staffId)) return prev;
      return [
        {
          id: staffId,
          username: 'quizly_team',
          displayName: 'Quizly Team',
          bio: 'Official Quizly Staff & Moderation Team.',
          isPublic: true,
          isTeamAdmin: true,
          role: 'Staff',
          equippedSkin: 'golden_king',
          equippedBanner: 'champion_gold',
          equippedFrame: 'golden_laurel',
          equippedTitle: 'legend',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
    setCurrentUserId(staffId);
    setIsTeamAdmin(true);
    setTeamSecretOpen(false);
    setView('home');
    syncBrowserPath('/');
    showToast('Signed in as Quizly Team Staff!');
  };

  // Sign Up & Log In Handler (Supabase Auth + Profile Sync)
  const handleAuthSubmit = async ({ mode, email, username, password, role }) => {
    if (mode === 'signup' && siteSafetyConfig.lockNewSignups) {
      showToast('New account registrations are temporarily paused by Quizly Moderation.');
      return;
    }
    if (supabaseClient) {
      try {
        if (mode === 'signup') {
          const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { username, role } },
          });
          if (error) {
            showToast(error.message);
            return;
          }
          const uid = data?.user?.id || `user_${Date.now()}`;
          const newProfile = {
            id: uid,
            username,
            displayName: username,
            email,
            bio: 'Ready to learn and create quizzes on Quizly!',
            isPublic: true,
            role,
            equippedSkin: 'red_cube',
            equippedBanner: 'default_blue',
            equippedFrame: 'none',
            equippedTitle: 'apprentice',
            createdAt: new Date().toISOString(),
          };
          await supabaseClient.from('profiles').upsert(newProfile);
          setAllProfiles(prev => [newProfile, ...prev.filter(p => p.id !== uid)]);
          setCurrentUserId(uid);
          setIsTeamAdmin(false);
          setAuthModalMode(null);
          setView('home');
          showToast(`Welcome to Quizly, @${username}!`);
          return;
        } else {
          const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
          if (error) {
            showToast(error.message);
            return;
          }
          const uid = data.user.id;
          const existing = allProfiles.find(p => p.id === uid);
          if (!existing) {
            const fallbackUser = {
              id: uid,
              username: data.user.user_metadata?.username || email.split('@')[0],
              displayName: data.user.user_metadata?.username || email.split('@')[0],
              email,
              bio: '',
              isPublic: true,
              role: data.user.user_metadata?.role || 'Student',
              equippedSkin: 'red_cube',
              equippedBanner: 'default_blue',
              equippedFrame: 'none',
              equippedTitle: 'apprentice',
              createdAt: new Date().toISOString(),
            };
            await supabaseClient.from('profiles').upsert(fallbackUser);
            setAllProfiles(prev => [fallbackUser, ...prev]);
          }
          setCurrentUserId(uid);
          setIsTeamAdmin(false);
          setAuthModalMode(null);
          setView('home');
          showToast('Signed in to your Quizly account!');
          return;
        }
      } catch (err) {
        showToast('Authentication error. Check your Supabase configuration.');
        return;
      }
    }

    // Immediate session creation when Supabase endpoint is not yet connected
    if (mode === 'signup') {
      const uid = `user_${Date.now().toString(36)}`;
      const newProfile = {
        id: uid,
        username,
        displayName: username,
        email,
        bio: 'Ready to learn and create quizzes on Quizly!',
        isPublic: true,
        role,
        equippedSkin: 'red_cube',
        equippedBanner: 'default_blue',
        equippedFrame: 'none',
        equippedTitle: 'apprentice',
        createdAt: new Date().toISOString(),
      };
      setAllProfiles(prev => [newProfile, ...prev]);
      setCurrentUserId(uid);
      setIsTeamAdmin(false);
      setAuthModalMode(null);
      setView('home');
      showToast(`Account created for @${username}! Connect Supabase in Settings to persist across devices.`);
    } else {
      const matched = allProfiles.find(p => p.email?.toLowerCase() === email || p.username.toLowerCase() === email.split('@')[0].toLowerCase());
      if (matched) {
        if (matched.suspended) {
          showToast('This account has been suspended by moderation.');
          return;
        }
        setCurrentUserId(matched.id);
        setIsTeamAdmin(Boolean(matched.isTeamAdmin));
        setAuthModalMode(null);
        setView('home');
        showToast(`Welcome back, @${matched.username}!`);
      } else {
        const uid = `user_${Date.now().toString(36)}`;
        const uname = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
        const created = {
          id: uid,
          username: uname,
          displayName: uname,
          email,
          bio: '',
          isPublic: true,
          role: 'Student',
          equippedSkin: 'red_cube',
          equippedBanner: 'default_blue',
          equippedFrame: 'none',
          equippedTitle: 'apprentice',
          createdAt: new Date().toISOString(),
        };
        setAllProfiles(prev => [created, ...prev]);
        setCurrentUserId(uid);
        setAuthModalMode(null);
        setView('home');
        showToast(`Signed in as @${uname}!`);
      }
    }
  };

  const handleLogout = async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut().catch(() => {});
    }
    setCurrentUserId(null);
    setIsTeamAdmin(false);
    setView('landing');
    syncBrowserPath('/');
    showToast('Signed out!');
  };

  // Open Public User Profile (/profile/:username)
  const handleOpenProfile = (targetUsername) => {
    if (!targetUsername) return;
    setActiveProfileUsername(targetUsername);
    setView('public_profile');
    syncBrowserPath(`/profile/${encodeURIComponent(targetUsername)}`);
  };

  // Open Individual Quiz Detail & Play View (/quiz/:quizId)
  const handleOpenQuiz = (quizId) => {
    setActiveQuizId(quizId);
    setView('quiz_detail');
    syncBrowserPath(`/quiz/${encodeURIComponent(quizId)}`);
  };

  // Create, Update, Duplicate, Delete & Toggle Publish Quiz
  const handleSaveQuiz = async (quizPayload, isUpdate) => {
    const containsBlockedWord =
      siteSafetyConfig.autoFilterProfanity &&
      (siteSafetyConfig.blockedWords || []).some(w =>
        `${quizPayload.title} ${quizPayload.description}`.toLowerCase().includes(w)
      );
    if (containsBlockedWord && !isTeamAdmin) {
      showToast('Quiz title or description triggered the Quizly auto-moderation keyword filter.');
      return;
    }

    const effectivePayload =
      siteSafetyConfig.freezePublicPublishing && !isTeamAdmin && quizPayload.status === 'published'
        ? { ...quizPayload, status: 'draft', visibility: 'unpublished' }
        : quizPayload;

    const nextQuizzes = isUpdate
      ? allQuizzes.map(q => (q.id === effectivePayload.id ? effectivePayload : q))
      : [effectivePayload, ...allQuizzes];

    setAllQuizzes(nextQuizzes);
    setEditingQuiz(null);

    if (supabaseClient) {
      await supabaseClient.from('quizzes').upsert(effectivePayload).catch(() => {});
    }

    evaluateAchievementsForUser(currentUserId, nextQuizzes, follows, quizAttempts);
    showToast(
      effectivePayload.status === 'draft'
        ? `Saved "${effectivePayload.title}" as a draft!`
        : isUpdate
        ? `Updated "${effectivePayload.title}"!`
        : `Published "${effectivePayload.title}"!`
    );
    handleOpenQuiz(effectivePayload.id);
  };

  const handleDuplicateQuiz = async (sourceQuiz) => {
    if (!currentUser) {
      setAuthModalMode('login');
      return;
    }
    const copyQuiz = {
      ...sourceQuiz,
      id: `quiz-${Date.now().toString(36)}`,
      title: `${sourceQuiz.title} (Copy)`,
      creatorId: currentUser.id,
      creator: currentUser.username,
      plays: 0,
      likes: 0,
      status: 'draft',
      visibility: 'unpublished',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextQuizzes = [copyQuiz, ...allQuizzes];
    setAllQuizzes(nextQuizzes);
    if (supabaseClient) {
      await supabaseClient.from('quizzes').insert(copyQuiz).catch(() => {});
    }
    showToast(`Copied "${sourceQuiz.title}" to your Drafts!`);
    setView('home');
  };

  const handleDeleteQuiz = async (quizId) => {
    setAllQuizzes(prev => prev.filter(q => q.id !== quizId));
    if (supabaseClient) {
      await supabaseClient.from('quizzes').delete().eq('id', quizId).catch(() => {});
    }
    if (activeQuizId === quizId) {
      setView('home');
      syncBrowserPath('/');
    }
    showToast('Quiz deleted.');
  };

  const handleTogglePublishQuiz = async (quiz) => {
    const nextPublished = !(quiz.status === 'published' && quiz.visibility === 'public');
    const updated = {
      ...quiz,
      status: nextPublished ? 'published' : 'unpublished',
      visibility: nextPublished ? 'public' : 'unpublished',
      updatedAt: new Date().toISOString(),
    };
    const nextQuizzes = allQuizzes.map(q => (q.id === quiz.id ? updated : q));
    setAllQuizzes(nextQuizzes);
    if (supabaseClient) {
      await supabaseClient.from('quizzes').upsert(updated).catch(() => {});
    }
    evaluateAchievementsForUser(currentUserId, nextQuizzes, follows, quizAttempts);
    showToast(nextPublished ? 'Quiz is now Public!' : 'Quiz unpublished.');
  };

  // Toggle Like (Prevents duplicate likes from same user)
  const handleToggleLike = async (quizId) => {
    if (!currentUser) {
      setAuthModalMode('login');
      return;
    }
    const alreadyLiked = quizLikes.some(l => l.userId === currentUser.id && l.quizId === quizId);
    const targetQuiz = allQuizzes.find(q => q.id === quizId);
    if (!targetQuiz) return;

    if (alreadyLiked) {
      setQuizLikes(prev => prev.filter(l => !(l.userId === currentUser.id && l.quizId === quizId)));
      setAllQuizzes(prev =>
        prev.map(q => (q.id === quizId ? { ...q, likes: Math.max(0, (Number(q.likes) || 0) - 1) } : q))
      );
      if (supabaseClient) {
        await supabaseClient.from('quiz_likes').delete().match({ userId: currentUser.id, quizId }).catch(() => {});
      }
    } else {
      setQuizLikes(prev => [...prev, { userId: currentUser.id, quizId }]);
      setAllQuizzes(prev =>
        prev.map(q => (q.id === quizId ? { ...q, likes: (Number(q.likes) || 0) + 1 } : q))
      );
      if (supabaseClient) {
        await supabaseClient.from('quiz_likes').insert({ userId: currentUser.id, quizId }).catch(() => {});
      }
      if (targetQuiz.creatorId && targetQuiz.creatorId !== currentUser.id && notificationPrefs.likes) {
        pushNotification({
          userId: targetQuiz.creatorId,
          type: 'Like',
          message: `@${currentUser.username} liked your quiz "${targetQuiz.title}".`,
          actorUsername: currentUser.username,
          quizId: targetQuiz.id,
        });
      }
    }
  };

  // Toggle Save / Favorite Quiz
  const handleToggleFavorite = async (quizId) => {
    if (!currentUser) {
      setAuthModalMode('login');
      return;
    }
    const alreadySaved = quizFavorites.some(f => f.userId === currentUser.id && f.quizId === quizId);
    if (alreadySaved) {
      setQuizFavorites(prev => prev.filter(f => !(f.userId === currentUser.id && f.quizId === quizId)));
      if (supabaseClient) {
        await supabaseClient.from('quiz_favorites').delete().match({ userId: currentUser.id, quizId }).catch(() => {});
      }
      showToast('Removed from Saved Quizzes.');
    } else {
      setQuizFavorites(prev => [...prev, { userId: currentUser.id, quizId }]);
      if (supabaseClient) {
        await supabaseClient.from('quiz_favorites').insert({ userId: currentUser.id, quizId }).catch(() => {});
      }
      showToast('Saved to your private Saved Quizzes!');
    }
  };

  // Toggle Follow User (Prevents self-follow and duplicate follow)
  const handleToggleFollow = async (targetUserId) => {
    if (!currentUser) {
      setAuthModalMode('login');
      return;
    }
    if (currentUser.id === targetUserId) return;

    const alreadyFollowing = follows.some(
      f => f.followerId === currentUser.id && f.followingId === targetUserId
    );
    let nextFollows;
    if (alreadyFollowing) {
      nextFollows = follows.filter(
        f => !(f.followerId === currentUser.id && f.followingId === targetUserId)
      );
      setFollows(nextFollows);
      if (supabaseClient) {
        await supabaseClient.from('follows').delete().match({ followerId: currentUser.id, followingId: targetUserId }).catch(() => {});
      }
      showToast('Unfollowed creator.');
    } else {
      nextFollows = [...follows, { followerId: currentUser.id, followingId: targetUserId }];
      setFollows(nextFollows);
      if (supabaseClient) {
        await supabaseClient.from('follows').insert({ followerId: currentUser.id, followingId: targetUserId }).catch(() => {});
      }
      if (notificationPrefs.follows) {
        pushNotification({
          userId: targetUserId,
          type: 'Follower',
          message: `@${currentUser.username} started following you!`,
          actorUsername: currentUser.username,
        });
      }
      showToast('Following creator!');
    }
    evaluateAchievementsForUser(currentUser.id, allQuizzes, nextFollows, quizAttempts);
  };

  // Record Completed Quiz Attempt (Only when finished, never merely opened!)
  const handleCompleteQuizAttempt = async ({ quiz, selectedAnswers, score, totalQuestions, percentage, coinsEarned, xpEarned }) => {
    const newPlayCount = (Number(quiz.plays) || 0) + 1;
    const nextQuizzes = allQuizzes.map(q =>
      q.id === quiz.id ? { ...q, plays: newPlayCount } : q
    );
    setAllQuizzes(nextQuizzes);

    if (supabaseClient) {
      await supabaseClient.from('quizzes').update({ plays: newPlayCount }).eq('id', quiz.id).catch(() => {});
    }

    // Play Milestone Notification (e.g. 10, 50, 100 plays)
    if (quiz.creatorId && [10, 50, 100].includes(newPlayCount) && notificationPrefs.achievements) {
      pushNotification({
        userId: quiz.creatorId,
        type: 'Milestone',
        message: `Milestone reached! Your quiz "${quiz.title}" hit ${newPlayCount} plays!`,
        quizId: quiz.id,
      });
    }

    if (currentUser) {
      setCoins(c => c + coinsEarned);
      setSeasonXp(x => Math.min((season.maxLevel - 1) * 100, x + xpEarned));

      const attemptRecord = {
        id: `att_${Date.now()}`,
        userId: currentUser.id,
        quizId: quiz.id,
        quizTitle: quiz.title,
        selectedAnswers,
        score,
        totalQuestions,
        percentage,
        completedAt: new Date().toISOString(),
      };
      const nextAttempts = [attemptRecord, ...quizAttempts];
      setQuizAttempts(nextAttempts);

      if (supabaseClient) {
        await supabaseClient.from('quiz_attempts').insert(attemptRecord).catch(() => {});
      }

      evaluateAchievementsForUser(currentUser.id, nextQuizzes, follows, nextAttempts);
      evaluateAchievementsForUser(quiz.creatorId, nextQuizzes, follows, nextAttempts);
    }
  };

  // Comments Handlers
  const handleAddComment = (quizId, content) => {
    if (!currentUser) return false;
    if (siteSafetyConfig.freezeAllComments && !isTeamAdmin) {
      showToast('Comments are temporarily paused by Quizly Moderation.');
      return false;
    }
    if (
      siteSafetyConfig.autoFilterProfanity &&
      !isTeamAdmin &&
      (siteSafetyConfig.blockedWords || []).some(w => content.toLowerCase().includes(w))
    ) {
      showToast('Your comment contains a restricted word blocked by auto-moderation.');
      return false;
    }
    const targetQuiz = allQuizzes.find(q => q.id === quizId);
    const newComment = {
      id: `com_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      quizId,
      userId: currentUser.id,
      username: currentUser.username,
      content,
      createdAt: new Date().toISOString(),
    };
    setQuizComments(prev => [newComment, ...prev]);
    if (supabaseClient) {
      supabaseClient.from('quiz_comments').insert(newComment).catch(() => {});
    }
    if (targetQuiz && targetQuiz.creatorId !== currentUser.id && notificationPrefs.comments) {
      pushNotification({
        userId: targetQuiz.creatorId,
        type: 'Comment',
        message: `@${currentUser.username} commented on "${targetQuiz.title}": "${content}"`,
        actorUsername: currentUser.username,
        quizId: targetQuiz.id,
      });
    }
    showToast('Comment posted!');
    return true;
  };

  const logModAction = async (actionType, targetId, notes) => {
    const action = {
      id: `mod_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      moderatorId: currentUser?.id || 'quizly-team-staff',
      actionType,
      targetId,
      notes,
      createdAt: new Date().toISOString(),
    };
    setModerationActions(prev => [action, ...prev]);
    if (supabaseClient) {
      await supabaseClient.from('moderation_actions').insert(action).catch(() => {});
    }
  };

  const handleResolveReport = async (reportId, notes) => {
    setReports(prev => prev.map(r => (r.id === reportId ? { ...r, status: 'resolved' } : r)));
    await logModAction('resolve_report', reportId, notes);
    if (supabaseClient) {
      await supabaseClient.from('reports').update({ status: 'resolved' }).eq('id', reportId).catch(() => {});
    }
    showToast('Report marked resolved.');
  };

  const handleModRemoveQuiz = async (quizId, reportId) => {
    setAllQuizzes(prev => prev.filter(q => q.id !== quizId));
    await logModAction('delete_quiz', quizId, 'Deleted quiz via Moderation Hub');
    if (reportId) await handleResolveReport(reportId, 'Removed violating quiz');
    if (supabaseClient) {
      await supabaseClient.from('quizzes').delete().eq('id', quizId).catch(() => {});
    }
    showToast('Quiz removed by moderation.');
  };

  const handleModForceUnpublishQuiz = async (quizId, reportId) => {
    setAllQuizzes(prev =>
      prev.map(q => (q.id === quizId ? { ...q, status: 'unpublished', visibility: 'unpublished' } : q))
    );
    await logModAction('unpublish_quiz', quizId, 'Force-unpublished quiz via Moderation Hub');
    if (reportId) await handleResolveReport(reportId, 'Unpublished quiz pending review');
    if (supabaseClient) {
      await supabaseClient.from('quizzes').update({ status: 'unpublished', visibility: 'unpublished' }).eq('id', quizId).catch(() => {});
    }
    showToast('Quiz unpublished.');
  };

  const handleModDeleteComment = async (commentId) => {
    setQuizComments(prev => prev.filter(c => c.id !== commentId));
    await logModAction('delete_comment', commentId, 'Deleted community comment');
    if (supabaseClient) {
      await supabaseClient.from('quiz_comments').delete().eq('id', commentId).catch(() => {});
    }
    showToast('Comment removed by moderation.');
  };

  const handleModSuspendUser = async (userId, reportId) => {
    setAllProfiles(prev => prev.map(p => (p.id === userId ? { ...p, suspended: true, isPublic: false } : p)));
    await logModAction('suspend_user', userId, 'Suspended user account');
    if (reportId) await handleResolveReport(reportId, 'Suspended user profile');
    showToast('User account suspended.');
  };

  const handleModUnsuspendUser = async (userId) => {
    setAllProfiles(prev => prev.map(p => (p.id === userId ? { ...p, suspended: false, isPublic: true } : p)));
    await logModAction('unsuspend_user', userId, 'Restored suspended user account');
    showToast('User account restored.');
  };

  const handleModWarnUser = async (targetUser, message) => {
    await pushNotification({
      userId: targetUser.id,
      type: 'Staff Warning',
      message: `Official Quizly Moderation Notice: ${message}`,
    });
    await logModAction('warn_user', targetUser.id, `Sent warning to @${targetUser.username}: "${message}"`);
    showToast(`Official warning sent to @${targetUser.username}.`);
  };

  const handleModResetUserProfile = async (targetUser) => {
    setAllProfiles(prev =>
      prev.map(p => (p.id === targetUser.id ? { ...p, bio: '', avatarUrl: '' } : p))
    );
    await logModAction('reset_profile', targetUser.id, `Reset bio and avatar for @${targetUser.username}`);
    showToast(`Reset profile bio & avatar for @${targetUser.username}.`);
  };

  const handleModToggleVerifiedTeacher = async (targetUser) => {
    const nextRole = targetUser.role === 'Teacher' ? 'Student' : 'Teacher';
    setAllProfiles(prev =>
      prev.map(p => (p.id === targetUser.id ? { ...p, role: nextRole } : p))
    );
    await logModAction('set_role', targetUser.id, `Changed @${targetUser.username} role to ${nextRole}`);
    showToast(`Updated @${targetUser.username} role to ${nextRole}.`);
  };

  const handleEditComment = async (commentId, newContent) => {
    setQuizComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, content: newContent } : c))
    );
    if (supabaseClient) {
      await supabaseClient.from('quiz_comments').update({ content: newContent }).eq('id', commentId).catch(() => {});
    }
    showToast('Comment updated!');
  };

  const handleDeleteComment = async (commentId) => {
    setQuizComments(prev => prev.filter(c => c.id !== commentId));
    if (supabaseClient) {
      await supabaseClient.from('quiz_comments').delete().eq('id', commentId).catch(() => {});
    }
    showToast('Comment deleted.');
  };

  // Reporting & Moderation Handlers
  const handleSubmitReport = async ({ targetType, targetId, category, details }) => {
    const newRep = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser?.id || 'anonymous',
      targetType,
      targetId,
      category,
      details,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    setReports(prev => [newRep, ...prev]);
    if (supabaseClient) {
      await supabaseClient.from('reports').insert(newRep).catch(() => {});
    }
    showToast('Report submitted to Quizly Moderation.');
  };

  // Update Profile & Supabase Storage Avatar Upload
  const handleUpdateProfile = async (updates) => {
    if (!currentUser) return;
    const sanitizedUpdates = { ...updates };
    if (!currentUser.isTeamAdmin) {
      delete sanitizedUpdates.displayName;
    }
    const updatedProfile = { ...currentUser, ...sanitizedUpdates };
    setAllProfiles(prev => prev.map(p => (p.id === currentUser.id ? updatedProfile : p)));
    if (supabaseClient) {
      await supabaseClient.from('profiles').upsert(updatedProfile).catch(() => {});
    }
    showToast('Profile saved!');
  };

  const handleUploadAvatar = async (file) => {
    if (!currentUser) return;
    if (supabaseClient) {
      try {
        const ext = file.name.split('.').pop() || 'png';
        const filePath = `${currentUser.id}/avatar_${Date.now()}.${ext}`;
        const { error } = await supabaseClient.storage.from('avatars').upload(filePath, file, { upsert: true });
        if (!error) {
          const { data: pubUrl } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
          if (pubUrl?.publicUrl) {
            await handleUpdateProfile({ avatarUrl: pubUrl.publicUrl });
            return;
          }
        }
      } catch (e) {
        // Fallback to resized image data URL if storage bucket isn't provisioned yet
      }
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleUpdateProfile({ avatarUrl: ev.target?.result });
    };
    reader.readAsDataURL(file);
  };

  // Cosmetics Synchronization onto Current User Profile
  const syncUserCosmetic = (field, value) => {
    if (!currentUser) return;
    setAllProfiles(prev =>
      prev.map(p => (p.id === currentUser.id ? { ...p, [field]: value } : p))
    );
  };

  const seasonLevel = Math.min(season.maxLevel, Math.floor(seasonXp / 100) + 1);
  const myLikedQuizIds = currentUser ? quizLikes.filter(l => l.userId === currentUser.id).map(l => l.quizId) : [];
  const myFavoriteQuizIds = currentUser ? quizFavorites.filter(f => f.userId === currentUser.id).map(f => f.quizId) : [];
  const myNotifications = currentUser ? notifications.filter(n => n.userId === currentUser.id) : [];
  const unreadNotifCount = myNotifications.filter(n => !n.isRead).length;

  const viewedProfileObj = useMemo(
    () => allProfiles.find(p => p.username.toLowerCase() === (activeProfileUsername || '').toLowerCase()) || null,
    [allProfiles, activeProfileUsername]
  );
  const viewedQuizObj = useMemo(
    () => allQuizzes.find(q => String(q.id) === String(activeQuizId)) || null,
    [allQuizzes, activeQuizId]
  );

  const isLoggedIn = Boolean(currentUser);
  const isVerifiedTeacher = isTeamAdmin || currentUser?.role === 'Teacher';

  const THEME_BACKDROPS = {
    emerald: { base: '#f1f9f4', dot: '#6ee7b7', bar: '#10b981' },
    ocean: { base: '#f0f7ff', dot: '#7dd3fc', bar: '#0284c7' },
    royal: { base: '#f6f2ff', dot: '#c4b5fd', bar: '#7c3aed' },
    sunset: { base: '#fff5f0', dot: '#fdba74', bar: '#ea580c' },
    berry: { base: '#fdf2f8', dot: '#f9a8d4', bar: '#db2777' },
    gold: { base: '#fefce8', dot: '#fde047', bar: '#d97706' },
  };
  const activePalette = THEME_BACKDROPS[userSettings.accentTheme] || THEME_BACKDROPS.emerald;
  const surfaceBg =
    userSettings.surfaceStyle === 'midnight'
      ? '#0f172a'
      : userSettings.surfaceStyle === 'sepia'
      ? '#faf6ed'
      : activePalette.base;
  const dotTint = userSettings.surfaceStyle === 'midnight' ? '#1e293b' : activePalette.dot;
  const patternStyle =
    userSettings.bgPattern === 'grid'
      ? {
          backgroundImage: `linear-gradient(to right, ${dotTint} 1px, transparent 1px), linear-gradient(to bottom, ${dotTint} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }
      : userSettings.bgPattern === 'diagonal'
      ? {
          backgroundImage: `repeating-linear-gradient(45deg, ${dotTint} 0, ${dotTint} 2px, transparent 0, transparent 22px)`,
        }
      : userSettings.bgPattern === 'clean'
      ? {}
      : {
          backgroundImage: `radial-gradient(${dotTint} 2px, transparent 2px)`,
          backgroundSize: '26px 26px',
        };

  return (
    <div
      className={`h-screen overflow-hidden flex flex-col md:flex-row font-sans relative ${
        userSettings.surfaceStyle === 'midnight' ? 'text-slate-100' : 'text-slate-800'
      } ${userSettings.dyslexiaFriendlyFont ? 'tracking-wide leading-relaxed' : ''} ${
        userSettings.highContrastMode ? 'contrast-125' : ''
      }`}
      style={{
        backgroundColor: surfaceBg,
        fontSize:
          userSettings.fontSizeScale === 'xlarge'
            ? '116%'
            : userSettings.fontSizeScale === 'large'
            ? '108%'
            : '100%',
        ...patternStyle,
      }}
    >
      <style>{`
        @keyframes titleGradientFlow {
          0%, 100% { background-size: 200% 200%; background-position: 0% 50%; }
          50% { background-size: 200% 200%; background-position: 100% 50%; }
        }
        @keyframes titleShimmerSweep {
          0% { transform: translateX(-140%); }
          60%, 100% { transform: translateX(180%); }
        }
        .title-gradient-flow { background-size: 200% 200%; animation: titleGradientFlow 3.5s ease infinite; }
        .title-shimmer-sweep { animation: titleShimmerSweep 2.8s ease-in-out infinite; }
        .quizly-content-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .quizly-content-scroll::-webkit-scrollbar-thumb { background: ${activePalette.bar}; border-radius: 9999px; }
      `}</style>

      {authModalMode && (
        <LoginScreen
          initialMode={authModalMode}
          existingUsernames={allProfiles.map(p => p.username)}
          onLoginSuccess={handleAuthSubmit}
          onClose={() => setAuthModalMode(null)}
        />
      )}

      {/* Hidden 3-Second Hold Quizly Team Staff Login Modal */}
      {teamSecretOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setTeamSecretOpen(false)}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border-2 border-blue-300 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto">
                <KeyRound size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800">Quizly Team Staff Access</h3>
            </div>
            <form onSubmit={handleTeamSecretSubmit} className="space-y-3">
              <input
                type="password"
                autoFocus
                value={teamSecretPass}
                onChange={e => setTeamSecretPass(e.target.value)}
                placeholder="Enter staff password..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm font-bold"
              />
              {teamSecretError && <p className="text-xs font-bold text-rose-600 text-center">{teamSecretError}</p>}
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-2.5 rounded-xl text-xs cursor-pointer">
                Unlock Quizly Team
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl font-black text-xs flex items-center gap-2 border-b-4 border-emerald-500">
          <Sparkles size={15} className="text-yellow-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Left Sidebar Navigation (Shown when signed in) */}
      {isLoggedIn && (
        <nav className={`${userSettings.compactSidebar ? 'w-full md:w-52' : 'w-full md:w-64'} md:h-screen bg-white border-b-2 md:border-b-0 md:border-r-2 border-emerald-200/80 flex flex-col justify-between shrink-0 z-20 overflow-y-auto transition-all`}>
          <div>
            <div className="h-16 px-5 border-b-2 border-emerald-100 flex items-center justify-between">
              <div
                className={`flex items-center gap-2.5 cursor-pointer select-none ${holdingLogo ? 'scale-95 opacity-80' : ''}`}
                onClick={() => { setView('landing'); syncBrowserPath('/'); }}
                onMouseDown={startLogoHold}
                onMouseUp={cancelLogoHold}
                onMouseLeave={cancelLogoHold}
                onTouchStart={startLogoHold}
                onTouchEnd={cancelLogoHold}
              >
                <QuizlyLogo size={36} />
                <span className="font-black text-2xl tracking-wide text-emerald-600">QUIZLY</span>
              </div>
              {isTeamAdmin && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Staff
                </span>
              )}
            </div>

            <div className="p-3 space-y-4">
              {['Menu', 'Personal'].map(group => (
                <div key={group}>
                  <p className="px-3 mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{group}</p>
                  <div className="flex md:flex-col gap-1 overflow-x-auto">
                    {NAV_ITEMS.filter(item => item.group === group && (!item.teacherOnly || isVerifiedTeacher)).map(item => {
                      const Icon = item.icon;
                      const active =
                        (item.id === 'profile' && view === 'public_profile' && viewedProfileObj?.id === currentUser.id) ||
                        view === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (item.id === 'profile') {
                              handleOpenProfile(currentUser.username);
                            } else if (item.id === 'saved') {
                              setView('home');
                              syncBrowserPath('/');
                            } else {
                              setView(item.id);
                              syncBrowserPath('/');
                            }
                          }}
                          className={`flex items-center justify-between px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer shrink-0 ${
                            active
                              ? `${item.color} text-white border-b-4 shadow-xs`
                              : 'text-slate-600 hover:bg-slate-100 border-b-4 border-transparent'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </span>
                          {item.id === 'notifications' && unreadNotifCount > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                              {unreadNotifCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border-t-2 border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => setView('announcements')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-xs cursor-pointer"
            >
              <span className="flex items-center gap-2"><Megaphone size={15} /> Announcements</span>
              <span className="text-[10px] bg-emerald-200 px-1.5 rounded-full">Team</span>
            </button>

            <div
              onClick={() => handleOpenProfile(currentUser.username)}
              className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200 cursor-pointer"
            >
              <UserAvatarDisplay profile={currentUser} size={36} />
              <div className="min-w-0 flex-1">
                <p className="font-black text-xs text-slate-800 truncate">{currentUser.displayName || currentUser.username}</p>
                <p className="text-[11px] font-bold text-emerald-700 truncate">@{currentUser.username}</p>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        {isLoggedIn && (
          <header className="h-16 shrink-0 bg-white/95 backdrop-blur-md border-b-2 border-emerald-200/80 flex items-center justify-between px-4 md:px-8 z-10">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-slate-800 capitalize hidden sm:block">
                {view === 'home' ? 'My Dashboard' : view === 'public_profile' ? `@${activeProfileUsername}` : view === 'quiz_detail' ? 'Quiz Room' : view}
              </h2>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${supabaseConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {supabaseConnected ? 'Supabase Synced' : 'Connect Supabase in Settings'}
              </span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={() => setView('search')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 cursor-pointer"
                title="Global Search"
              >
                <Search size={17} />
              </button>

              <button
                type="button"
                onClick={() => setView('notifications')}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 cursor-pointer"
                title="Notifications"
              >
                <Bell size={17} />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <div
                onClick={() => setView('shop')}
                className="flex items-center gap-1.5 bg-yellow-400 px-3 py-1.5 rounded-xl border-b-2 border-yellow-600 cursor-pointer"
              >
                <Coins size={16} className="text-yellow-900 fill-current" />
                <span className="font-black text-yellow-900 text-xs">{coins.toLocaleString()}</span>
              </div>

              <div
                onClick={() => setView('season')}
                className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border-2 border-slate-200 cursor-pointer"
              >
                <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-1.5 py-0.5 rounded">S{season.number}</span>
                <span className="font-black text-slate-700 text-xs">Tier {seasonLevel}/{season.maxLevel}</span>
              </div>
            </div>
          </header>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto quizly-content-scroll p-4 md:p-8">
          {(view === 'landing' || (!isLoggedIn && view !== 'public_profile' && view !== 'quiz_detail')) && (
            <LandingAboutView
              setView={setView}
              isLoggedIn={isLoggedIn}
              onOpenAuth={(mode) => setAuthModalMode(mode)}
              holdingLogo={holdingLogo}
              startLogoHold={startLogoHold}
              cancelLogoHold={cancelLogoHold}
              publicQuizzes={allQuizzes.filter(q => q.visibility === 'public' && q.status === 'published')}
              onOpenQuiz={handleOpenQuiz}
            />
          )}

          {isLoggedIn && view === 'home' && (
            <UserDashboardView
              currentUser={currentUser}
              allQuizzes={allQuizzes}
              allProfiles={allProfiles}
              follows={follows}
              likes={myLikedQuizIds}
              favorites={myFavoriteQuizIds}
              attempts={quizAttempts}
              unlockedAchievementIds={userAchievementsMap[currentUser.id] || []}
              season={season}
              seasonLevel={seasonLevel}
              seasonXp={seasonXp}
              coins={coins}
              setView={setView}
              onOpenQuiz={handleOpenQuiz}
              onOpenProfile={handleOpenProfile}
              onToggleLike={handleToggleLike}
              onToggleFavorite={handleToggleFavorite}
              onDuplicateQuiz={handleDuplicateQuiz}
              onEditQuiz={(q) => { setEditingQuiz(q); setView('create'); }}
              onDeleteQuiz={handleDeleteQuiz}
              onTogglePublishQuiz={handleTogglePublishQuiz}
              onToggleFollow={handleToggleFollow}
              showToast={showToast}
            />
          )}

          {(view === 'explore' || view === 'play') && isLoggedIn && (
            <ExploreView
              allQuizzes={allQuizzes}
              allProfiles={allProfiles}
              currentUser={currentUser}
              likes={myLikedQuizIds}
              favorites={myFavoriteQuizIds}
              onToggleLike={handleToggleLike}
              onToggleFavorite={handleToggleFavorite}
              onOpenQuiz={handleOpenQuiz}
              onOpenProfile={handleOpenProfile}
              onDuplicateQuiz={handleDuplicateQuiz}
              onEditQuiz={(q) => { setEditingQuiz(q); setView('create'); }}
              onDeleteQuiz={handleDeleteQuiz}
              onTogglePublishQuiz={handleTogglePublishQuiz}
            />
          )}

          {isLoggedIn && view === 'search' && (
            <GlobalSearchView
              allQuizzes={allQuizzes}
              allProfiles={allProfiles}
              currentUser={currentUser}
              follows={follows}
              likes={myLikedQuizIds}
              favorites={myFavoriteQuizIds}
              onToggleFollow={handleToggleFollow}
              onToggleLike={handleToggleLike}
              onToggleFavorite={handleToggleFavorite}
              onOpenQuiz={handleOpenQuiz}
              onOpenProfile={handleOpenProfile}
              onDuplicateQuiz={handleDuplicateQuiz}
              onEditQuiz={(q) => { setEditingQuiz(q); setView('create'); }}
              onDeleteQuiz={handleDeleteQuiz}
              onTogglePublishQuiz={handleTogglePublishQuiz}
            />
          )}

          {view === 'quiz_detail' && (
            <QuizDetailAndPlayView
              quiz={viewedQuizObj}
              currentUser={currentUser}
              allProfiles={allProfiles}
              likes={myLikedQuizIds}
              favorites={myFavoriteQuizIds}
              attempts={quizAttempts}
              comments={quizComments}
              onBack={() => { setView(isLoggedIn ? 'explore' : 'landing'); syncBrowserPath('/'); }}
              onToggleLike={handleToggleLike}
              onToggleFavorite={handleToggleFavorite}
              onDuplicateQuiz={handleDuplicateQuiz}
              onEditQuiz={(q) => { setEditingQuiz(q); setView('create'); }}
              onDeleteQuiz={handleDeleteQuiz}
              onTogglePublishQuiz={handleTogglePublishQuiz}
              onOpenProfile={handleOpenProfile}
              onCompleteQuizAttempt={handleCompleteQuizAttempt}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onSubmitReport={handleSubmitReport}
              doubleCoins={false}
              doubleXp={false}
              showToast={showToast}
            />
          )}

          {view === 'public_profile' && (
            <PublicProfileView
              profile={viewedProfileObj}
              currentUser={currentUser}
              allQuizzes={allQuizzes}
              allProfiles={allProfiles}
              follows={follows}
              likes={myLikedQuizIds}
              favorites={myFavoriteQuizIds}
              userAchievementsMap={userAchievementsMap}
              season={season}
              coins={coins}
              ownedSkins={ownedSkins}
              onBack={() => { setView(isLoggedIn ? 'home' : 'landing'); syncBrowserPath('/'); }}
              onToggleFollow={handleToggleFollow}
              onUpdateProfile={handleUpdateProfile}
              onUploadAvatar={handleUploadAvatar}
              onOpenQuiz={handleOpenQuiz}
              onOpenProfile={handleOpenProfile}
              onToggleLike={handleToggleLike}
              onToggleFavorite={handleToggleFavorite}
              onDuplicateQuiz={handleDuplicateQuiz}
              onEditQuiz={(q) => { setEditingQuiz(q); setView('create'); }}
              onDeleteQuiz={handleDeleteQuiz}
              onTogglePublishQuiz={handleTogglePublishQuiz}
              onSubmitReport={handleSubmitReport}
              showToast={showToast}
            />
          )}

          {isLoggedIn && view === 'create' && (
            <CreateView
              currentUser={currentUser}
              editingQuiz={editingQuiz}
              onCancelEdit={() => { setEditingQuiz(null); setView('home'); }}
              onSaveQuiz={handleSaveQuiz}
              showToast={showToast}
            />
          )}

          {isLoggedIn && view === 'season' && (
            <SeasonView
              season={season}
              level={seasonLevel}
              xp={seasonXp}
              setView={setView}
              claimedMilestones={claimedMilestones}
              onClaimMilestone={(m) => {
                const key = `s${season.number}_lvl${m.level}`;
                if (claimedMilestones.includes(key)) return;
                setClaimedMilestones(prev => [...prev, key]);
                const match = m.reward.match(/\d+/);
                const bonus = match ? parseInt(match[0], 10) : 100;
                setCoins(c => c + bonus);
                showToast(`Claimed ${m.label}! +${bonus} QuizCoins!`);
              }}
            />
          )}

          {isLoggedIn && view === 'shop' && (
            <ShopView
              coins={coins}
              setCoins={setCoins}
              ownedSkins={ownedSkins}
              setOwnedSkins={setOwnedSkins}
              equippedSkin={currentUser.equippedSkin || 'red_cube'}
              setEquippedSkin={(id) => syncUserCosmetic('equippedSkin', id)}
              ownedBanners={ownedBanners}
              setOwnedBanners={setOwnedBanners}
              equippedBanner={currentUser.equippedBanner || 'default_blue'}
              setEquippedBanner={(id) => syncUserCosmetic('equippedBanner', id)}
              ownedFrames={ownedFrames}
              setOwnedFrames={setOwnedFrames}
              equippedFrame={currentUser.equippedFrame || 'none'}
              setEquippedFrame={(id) => syncUserCosmetic('equippedFrame', id)}
              ownedTitles={ownedTitles}
              setOwnedTitles={setOwnedTitles}
              equippedTitle={currentUser.equippedTitle || 'apprentice'}
              setEquippedTitle={(id) => syncUserCosmetic('equippedTitle', id)}
              showToast={showToast}
            />
          )}

          {isLoggedIn && view === 'classes' && (
            <TeacherHubView
              isVerifiedTeacher={isVerifiedTeacher}
              quizzes={allQuizzes}
              teacherHub={teacherHub}
              setTeacherHub={setTeacherHub}
              onOpenQuiz={handleOpenQuiz}
              showToast={showToast}
            />
          )}

          {isLoggedIn && view === 'notifications' && (
            <NotificationsView
              notifications={myNotifications}
              onMarkRead={(id) => setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)))}
              onMarkAllRead={() => setNotifications(prev => prev.map(n => (n.userId === currentUser.id ? { ...n, isRead: true } : n)))}
              onDeleteNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
              onOpenQuiz={handleOpenQuiz}
              onOpenProfile={handleOpenProfile}
            />
          )}

          {isLoggedIn && view === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              setAnnouncements={setAnnouncements}
              isTeamAdmin={isTeamAdmin}
              showToast={showToast}
            />
          )}

          {isLoggedIn && view === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              isTeamAdmin={isTeamAdmin}
              userSettings={userSettings}
              setUserSettings={setUserSettings}
              supabaseConfig={supabaseConfig}
              supabaseConnected={supabaseConnected}
              onSaveSupabaseConfig={(cfg) => {
                setSupabaseConfig(cfg);
                try {
                  sessionStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(cfg));
                } catch (e) {}
                showToast('Saved Supabase project credentials!');
              }}
              notificationPrefs={notificationPrefs}
              setNotificationPrefs={setNotificationPrefs}
              reports={reports}
              moderationActions={moderationActions}
              allProfiles={allProfiles}
              allQuizzes={allQuizzes}
              quizComments={quizComments}
              onResolveReport={handleResolveReport}
              onModRemoveQuiz={handleModRemoveQuiz}
              onModForceUnpublishQuiz={handleModForceUnpublishQuiz}
              onModDeleteComment={handleModDeleteComment}
              onModSuspendUser={handleModSuspendUser}
              onModUnsuspendUser={handleModUnsuspendUser}
              onModWarnUser={handleModWarnUser}
              onModResetUserProfile={handleModResetUserProfile}
              onModToggleVerifiedTeacher={handleModToggleVerifiedTeacher}
              siteSafetyConfig={siteSafetyConfig}
              setSiteSafetyConfig={setSiteSafetyConfig}
              season={season}
              onStartNewSeason={async ({ nextNumber, name, endsIn, resetXp }) => {
                const aiData = await generateSeasonWithAI({ nextNumber, seasonName: name, endsIn });
                setSeason({ ...season, number: nextNumber, name, tagline: aiData.tagline, themeKey: aiData.themeKey, endsIn, milestones: aiData.milestones });
                setClaimedMilestones([]);
                if (resetXp) setSeasonXp(0);
                setView('season');
                showToast(`Launched ${name}!`);
              }}
              onUpdateProfile={handleUpdateProfile}
              onExportUserData={() => {
                const archive = {
                  exportedAt: new Date().toISOString(),
                  profile: currentUser,
                  quizzes: allQuizzes.filter(q => q.creatorId === currentUser.id),
                  attempts: quizAttempts.filter(a => a.userId === currentUser.id),
                  achievements: userAchievementsMap[currentUser.id] || [],
                  settings: userSettings,
                };
                const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `quizly_${currentUser.username}_archive.json`;
                a.click();
                URL.revokeObjectURL(url);
                playUiChime('coin');
                showToast('Downloaded your Quizly JSON archive!');
              }}
              onLogout={handleLogout}
              showToast={showToast}
            />
          )}
        </div>
      </main>
    </div>
  );
}