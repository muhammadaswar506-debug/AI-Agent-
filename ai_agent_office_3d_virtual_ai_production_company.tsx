import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  LayoutDashboard,
  Building2,
  Users,
  Terminal,
  FolderKanban,
  Clapperboard,
  Film,
  UserCheck,
  Box,
  Video,
  PackageCheck,
  Calendar,
  BarChart3,
  Plug,
  Settings,
  Send,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Sparkles,
  Download,
  RefreshCw,
  Volume2,
  Mic,
  Eye,
  Sliders,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Cpu,
  Layers,
  Wand2,
  FileText,
  Image as ImageIcon,
  Maximize2,
  Camera,
  Compass,
  Info,
  X,
  Check,
  AlertCircle,
  Share2,
  Lock,
  Trash2,
  Copy,
  MessageSquare,
  Activity,
  Server,
  ListOrdered,
  Edit3,
  Save,
  ZoomIn,
  ZoomOut,
  Subtitles,
  Award,
} from 'lucide-react';

// ============================================================================
// 1. KONFIGURASI DATABASE (FIREBASE) & RUNTIME ENVIRONMENT
// ============================================================================
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ai-agent-office-3d';
const GEMINI_API_KEY = '';

let firebaseApp = null;
let auth = null;
let db = null;

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const parsedConfig =
      typeof __firebase_config === 'string'
        ? JSON.parse(__firebase_config)
        : __firebase_config;
    firebaseApp = initializeApp(parsedConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  }
} catch (err) {
  console.warn('Firebase tidak dikonfigurasi, menggunakan penyimpanan lokal sesi:', err);
}

// ============================================================================
// 2. DATA KARYAWAN AI (10 MULTI-AGENT SPECIALISTS) & PIPELINE 12 TAHAP
// ============================================================================
const INITIAL_EMPLOYEES = [
  {
    id: 'manager',
    name: 'Arya Pratama',
    role: 'AI Manager — Direktur Utama',
    shortRole: 'AI Manager',
    zone: 'Executive Suite',
    deskPos: [0, -5.2],
    color: '#06b6d4',
    shirtColor: 0x0891b2,
    hairColor: 0x1e293b,
    personality: 'Strategis, tegas, terstruktur, dan berorientasi kualitas.',
    skills: ['Perencanaan Produksi', 'Delegasi Multi-Agent', 'Manajemen Revisi', 'Persetujuan Pemilik'],
    responsibilities: [
      'Menerima instruksi pemilik dan menyusun rencana produksi.',
      'Membagi tugas kepada agen yang sesuai dan mengatur urutan kerja.',
      'Memantau progres, mendeteksi hambatan, dan meminta persetujuan keputusan penting.',
    ],
    status: 'Siap',
    currentTask: 'Menunggu perintah produksi dari Pemilik',
    speechBubble: 'Selamat datang di AI Agent Office 3D. Siap menerima brief proyek!',
    lastOutput: 'Sistem koordinasi 10 agen aktif dan terhubung ke pipeline.',
    systemPrompt:
      'Anda adalah Arya Pratama, AI Manager (Direktur Utama) studio animasi 3D. Jawab dengan tegas, terstruktur, dan profesional dalam bahasa Indonesia.',
  },
  {
    id: 'creative',
    name: 'Nadia Kusuma',
    role: 'AI Creative Director — Direktur Kreatif',
    shortRole: 'Creative Director',
    zone: 'Creative Hub',
    deskPos: [-5.2, -2.2],
    color: '#a855f7',
    shirtColor: 0x9333ea,
    hairColor: 0x3b0764,
    personality: 'Visioner, peka tren audiens, dan kaya imajinasi visual.',
    skills: ['Riset Audiens & Tren', 'Konsep Visual', 'Mood & Color Direction', 'Validasi Potensi Viral'],
    responsibilities: [
      'Mengembangkan ide konten dan menganalisis target audiens.',
      'Menentukan gaya visual, suasana, tema, dan pesan utama video.',
      'Menilai kelayakan kreatif sebelum produksi berjalan.',
    ],
    status: 'Siap',
    currentTask: 'Memantau tren konten animasi 3D global',
    speechBubble: 'Gaya sinematik sci-fi dengan kontras cyan-amber sedang tinggi retensinya!',
    lastOutput: 'Rekomendasi gaya: Stylized 3D Cinematic Render dengan pencahayaan volumetrik.',
    systemPrompt:
      'Anda adalah Nadia Kusuma, AI Creative Director. Fokus pada konsep kreatif, hook visual, target audiens, dan arah estetika dalam bahasa Indonesia.',
  },
  {
    id: 'scriptwriter',
    name: 'Raka Wijaya',
    role: 'AI Scriptwriter — Penulis Naskah',
    shortRole: 'Scriptwriter',
    zone: 'Creative Hub',
    deskPos: [-5.2, 2.2],
    color: '#8b5cf6',
    shirtColor: 0x6d28d9,
    hairColor: 0x0f172a,
    personality: 'Pencerita ulung, presisi pada durasi dan ritme emosi.',
    skills: ['Storytelling 3 Babak', 'Hook 3 Detik Pertama', 'Penulisan Narasi & Dialog', 'Sinkronisasi Durasi'],
    responsibilities: [
      'Menulis naskah lengkap dengan hook, konflik, klimaks, dan penutup.',
      'Menentukan durasi presisi tiap adegan dan teks subtitle.',
      'Menyesuaikan gaya bahasa dengan target audiens.',
    ],
    status: 'Siap',
    currentTask: 'Menyiapkan struktur naskah modular',
    speechBubble: 'Setiap adegan harus punya hook visual kuat agar penonton bertahan sampai akhir.',
    lastOutput: 'Template struktur naskah 60 detik (5-6 adegan padat) siap digunakan.',
    systemPrompt:
      'Anda adalah Raka Wijaya, AI Scriptwriter profesional. Tulis naskah, narasi, dan struktur adegan yang kuat dalam bahasa Indonesia.',
  },
  {
    id: 'storyboard',
    name: 'Kirana Putri',
    role: 'AI Storyboard Artist — Perancang Storyboard',
    shortRole: 'Storyboard Artist',
    zone: 'Creative Hub',
    deskPos: [-2.4, 4.8],
    color: '#ec4899',
    shirtColor: 0xdb2777,
    hairColor: 0x4c0519,
    personality: 'Detail pada komposisi kamera, sudut pandang, dan kontinuitas visual.',
    skills: ['Komposisi Sinematografi', 'Prompting Visual Konsisten', 'Pencahayaan Adegan', 'Visual Sequence'],
    responsibilities: [
      'Mengubah naskah menjadi urutan frame storyboard visual.',
      'Menentukan sudut kamera, gerak karakter, lokasi, dan pencahayaan.',
      'Menjaga konsistensi karakter dan warna antaradegan.',
    ],
    status: 'Siap',
    currentTask: 'Kalibrasi pipeline image generation',
    speechBubble: 'Framing rule-of-thirds dan depth-of-field siap diterapkan ke tiap adegan.',
    lastOutput: 'Adapter Gemini Image Generation terhubung untuk generasi frame storyboard.',
    systemPrompt:
      'Anda adalah Kirana Putri, AI Storyboard Artist. Jelaskan komposisi kamera, pencahayaan, dan kontinuitas visual dalam bahasa Indonesia.',
  },
  {
    id: 'character',
    name: 'Dimas Mahendra',
    role: 'AI 3D Character Designer — Desainer Karakter',
    shortRole: '3D Character Designer',
    zone: '3D Animation Studio',
    deskPos: [2.4, 4.8],
    color: '#3b82f6',
    shirtColor: 0x2563eb,
    hairColor: 0x172554,
    personality: 'Perfeksionis pada siluet karakter, material pakaian, dan ekspresi.',
    skills: ['Character Bible & Sheet', 'Desain Kostum & Properti', 'Konsistensi Identitas 3D', 'Rigging Specs'],
    responsibilities: [
      'Merancang konsep karakter 3D, bentuk tubuh, pakaian, dan ciri khas.',
      'Menjaga identitas visual karakter tetap identik di semua adegan.',
      'Menyiapkan spesifikasi aset karakter yang dapat dipakai ulang.',
    ],
    status: 'Siap',
    currentTask: 'Menyiapkan pustaka karakter 3D konsisten',
    speechBubble: 'Siluet dan palet warna karakter harus terkunci sebelum render adegan dimulai.',
    lastOutput: 'Standar Character Consistency Sheet siap diinjeksikan ke semua prompt.',
    systemPrompt:
      'Anda adalah Dimas Mahendra, AI 3D Character Designer. Fokus pada anatomi, kostum, ekspresi, dan konsistensi karakter 3D dalam bahasa Indonesia.',
  },
  {
    id: 'animator',
    name: 'Reza Saputra',
    role: 'AI 3D Animator — Animator',
    shortRole: '3D Animator',
    zone: '3D Animation Studio',
    deskPos: [5.2, 2.2],
    color: '#0ea5e9',
    shirtColor: 0x0284c7,
    hairColor: 0x0c4a6e,
    personality: 'Dinamis, paham prinsip gerak (squash, anticipation, camera motion).',
    skills: ['Keyframing & Camera Rig', 'Motion Continuity', 'Adapter Video AI & Blender', 'Lighting Animation'],
    responsibilities: [
      'Menyiapkan alur animasi 3D, gerakan kamera, dan transisi adegan.',
      'Menghubungkan scene ke mesin generasi video atau render worker.',
      'Memeriksa kesinambungan gerakan antaradegan.',
    ],
    status: 'Siap',
    currentTask: 'Mengatur camera rig & motion keyframe',
    speechBubble: 'Gerakan kamera dolly-in halus akan memperkuat emosi pada klimaks adegan.',
    lastOutput: 'Jalur animasi browser compositor siap; adapter Veo/Blender tersedia untuk konfigurasi.',
    systemPrompt:
      'Anda adalah Reza Saputra, AI 3D Animator. Jelaskan pergerakan kamera, timing animasi, dan pencahayaan 3D dalam bahasa Indonesia.',
  },
  {
    id: 'editor',
    name: 'Sinta Maharani',
    role: 'AI Video Editor — Editor Video',
    shortRole: 'Video Editor',
    zone: 'Post-Production & Sound',
    deskPos: [5.2, -2.2],
    color: '#10b981',
    shirtColor: 0x059669,
    hairColor: 0x064e3b,
    personality: 'Cepat, ritmis, teliti pada transisi, rasio aspek, dan sinkronisasi.',
    skills: ['Multi-Track Timeline', 'Aspect Ratio 9:16 / 16:9 / 1:1', 'Subtitle Burning & SRT', 'Final Video Rendering'],
    responsibilities: [
      'Menggabungkan seluruh klip adegan, narasi audio, dan subtitle.',
      'Menyesuaikan rasio resolusi sesuai platform tujuan (TikTok, YouTube, Reels).',
      'Merender file video final siap unduh.',
    ],
    status: 'Siap',
    currentTask: 'Menyiapkan timeline Video Studio',
    speechBubble: 'Timeline siap menggabungkan visual adegan, audio TTS, dan subtitle otomatis!',
    lastOutput: 'Mesin render Canvas + WebAudio MediaRecorder aktif tanpa memblokir UI.',
    systemPrompt:
      'Anda adalah Sinta Maharani, AI Video Editor. Fokus pada pacing, transisi, aspek rasio, dan kualitas ekspor video dalam bahasa Indonesia.',
  },
  {
    id: 'voice',
    name: 'Bagas Santoso',
    role: 'AI Voice Director — Pengarah Suara',
    shortRole: 'Voice Director',
    zone: 'Post-Production & Sound',
    deskPos: [2.8, -4.8],
    color: '#f59e0b',
    shirtColor: 0xd97706,
    hairColor: 0x451a03,
    personality: 'Peka terhadap intonasi, artikulasi, dan suasana emosional suara.',
    skills: ['Gemini Neural TTS', 'Casting Karakter Suara', 'Pacing & Intonasi', 'Audio Mastering WAV'],
    responsibilities: [
      'Memilih karakter suara yang sesuai dengan tema video.',
      'Menghasilkan audio narasi nyata melalui layanan Text-to-Speech.',
      'Menyelaraskan kecepatan bicara dengan durasi naskah.',
    ],
    status: 'Siap',
    currentTask: 'Kalibrasi profil suara Bahasa Indonesia',
    speechBubble: 'Voice model Kore, Puck, Zephyr, dan Fenrir siap merekam narasi jernih.',
    lastOutput: 'Generator audio PCM-to-WAV 24kHz terhubung ke Gemini TTS API.',
    systemPrompt:
      'Anda adalah Bagas Santoso, AI Voice Director. Fokus pada pemilihan karakter suara, intonasi, pacing narasi, dan tata suara dalam bahasa Indonesia.',
  },
  {
    id: 'qa',
    name: 'Clara Gunawan',
    role: 'AI Quality Assurance — Pengawas Kualitas',
    shortRole: 'Quality Assurance',
    zone: 'QA & Growth Lab',
    deskPos: [-2.8, -4.8],
    color: '#f43f5e',
    shirtColor: 0xe11d48,
    hairColor: 0x4c0519,
    personality: 'Kritis, objektif, teliti memeriksa setiap detail sebelum rilis.',
    skills: ['Audit Kesesuaian Brief', 'Cek Sinkronisasi Audio-Video', 'Validasi Durasi & Subtitle', 'Laporan Kelayakan'],
    responsibilities: [
      'Memeriksa kelengkapan naskah, gambar storyboard, audio, subtitle, dan video final.',
      'Memastikan hasil sesuai dengan brief awal pemilik.',
      'Menyusun laporan audit kualitas sebelum masuk tahap publikasi.',
    ],
    status: 'Siap',
    currentTask: 'Menyiapkan checklist audit produksi',
    speechBubble: 'Tidak ada video yang lolos ke publikasi sebelum lulus audit kesesuaian brief!',
    lastOutput: 'Standar QA 6 poin aktif untuk memvalidasi setiap hasil produksi.',
    systemPrompt:
      'Anda adalah Clara Gunawan, AI Quality Assurance. Lakukan evaluasi kritis dan objektif terhadap kualitas produksi dalam bahasa Indonesia.',
  },
  {
    id: 'social',
    name: 'Tari Lestari',
    role: 'AI Social Media Strategist — Spesialis Media Sosial',
    shortRole: 'Social Strategist',
    zone: 'QA & Growth Lab',
    deskPos: [0, 0.2],
    color: '#14b8a6',
    shirtColor: 0x0d9488,
    hairColor: 0x134e4a,
    personality: 'Analitis, paham algoritma distribusi, dan ahli copywriting.',
    skills: ['SEO Judul & Deskripsi', 'Strategi Hashtag', 'Kalender Publikasi', 'Optimasi Multi-Platform'],
    responsibilities: [
      'Menyusun judul menarik, caption, hashtag, dan deskripsi video.',
      'Memberikan rekomendasi thumbnail dan jadwal tayang optimal.',
      'Menyiapkan paket publikasi lengkap setelah mendapat izin pemilik.',
    ],
    status: 'Siap',
    currentTask: 'Menganalisis jam tayang optimal TikTok & Reels',
    speechBubble: 'Paket metadata, hashtag, dan jadwal unggah akan siap begitu video lulus QA.',
    lastOutput: 'Template paket publikasi TikTok, YouTube Shorts, dan Instagram Reels siap.',
    systemPrompt:
      'Anda adalah Tari Lestari, AI Social Media Strategist. Fokus pada copywriting, hashtag, waktu unggah, dan distribusi konten dalam bahasa Indonesia.',
  },
];

const PIPELINE_TEMPLATE = [
  { key: 'brief', name: '1. Project Brief', agentId: 'manager', desc: 'Analisis instruksi pemilik & rencana produksi' },
  { key: 'ideation', name: '2. Ide dan Riset', agentId: 'creative', desc: 'Riset tren, target audiens & arah gaya visual' },
  { key: 'script', name: '3. Penulisan Naskah', agentId: 'scriptwriter', desc: 'Penyusunan naskah lengkap, hook & durasi adegan' },
  { key: 'storyboard', name: '4. Storyboard', agentId: 'storyboard', desc: 'Pembuatan komposisi kamera & urutan frame visual' },
  { key: 'character', name: '5. Desain Karakter & Aset', agentId: 'character', desc: 'Kunci desain karakter 3D konsisten & visual referensi' },
  { key: 'scene_gen', name: '6. Generasi Adegan', agentId: 'animator', desc: 'Generasi visual adegan beresolusi tinggi tiap scene' },
  { key: 'animation', name: '7. Animasi / Gerak Kamera', agentId: 'animator', desc: 'Penentuan motion kamera, transisi & kesiapan render' },
  { key: 'voice', name: '8. Voice-over & Audio', agentId: 'voice', desc: 'Produksi narasi suara TTS nyata (.WAV)' },
  { key: 'editing', name: '9. Editing & Rendering', agentId: 'editor', desc: 'Penggabungan adegan, subtitle & render video nyata' },
  { key: 'qa', name: '10. Quality Assurance', agentId: 'qa', desc: 'Pemeriksaan kualitas teknis & kesesuaian brief' },
  { key: 'final_video', name: '11. Video Final', agentId: 'manager', desc: 'Validasi master video siap distribusi' },
  { key: 'social_pack', name: '12. Paket Publikasi', agentId: 'social', desc: 'Penyusunan judul, caption, hashtag & jadwal tayang' },
];

const INTEGRATION_ADAPTERS = [
  {
    id: 'gemini-text',
    category: 'AI Penalaran & Multi-Agent',
    name: 'Google Gemini 3 Flash API',
    status: 'Aktif & Terhubung',
    builtIn: true,
    details: 'Menjalankan perencanaan AI Manager, riset kreatif, penulisan naskah, QA audit, dan strategi media sosial.',
    setupGuide: 'Terhubung otomatis melalui runtime environment atau melalui Backend Proxy URL Anda.',
  },
  {
    id: 'gemini-image',
    category: 'Generasi Gambar & Storyboard',
    name: 'Google Gemini Image Generation',
    status: 'Aktif & Terhubung',
    builtIn: true,
    details: 'Menghasilkan gambar karakter 3D konsisten dan frame visual storyboard untuk setiap adegan.',
    setupGuide: 'Aktif secara bawaan untuk menghasilkan aset visual per adegan.',
  },
  {
    id: 'gemini-tts',
    category: 'Text-to-Speech & Voice-Over',
    name: 'Google Gemini 2.5 Flash TTS',
    status: 'Aktif & Terhubung',
    builtIn: true,
    details: 'Menghasilkan audio narasi nyata format WAV 24kHz dengan pilihan karakter suara (Kore, Puck, Zephyr, Fenrir).',
    setupGuide: 'Aktif secara bawaan dan otomatis terhubung ke timeline Video Studio.',
  },
  {
    id: 'browser-compositor',
    category: 'Mesin Rendering Video',
    name: 'Browser Canvas + WebAudio Compositor',
    status: 'Aktif & Terhubung',
    builtIn: true,
    details: 'Merender frame storyboard, gerak kamera Ken Burns, subtitle, dan track audio WAV menjadi file video nyata.',
    setupGuide: 'Berjalan langsung di browser tanpa memerlukan instalasi server tambahan.',
  },
  {
    id: 'ai-video-api',
    category: 'Jalur A — External AI Video API',
    name: 'Veo / Runway Gen-3 / Kling Video Adapter',
    status: 'Belum Dikonfigurasi',
    builtIn: false,
    details: 'Menghasilkan klip video 3D sinematik berbasis difusi video asinkron dari prompt adegan.',
    setupGuide: 'Memerlukan API Key berbayar penyedia video AI dan server Backend Proxy untuk polling status job asinkron.',
  },
  {
    id: 'blender-worker',
    category: 'Jalur B — 3D Render Farm',
    name: 'Blender Headless + FFmpeg Server Worker',
    status: 'Belum Dikonfigurasi',
    builtIn: false,
    details: 'Rendering scene .blend penuh dengan Cycles/EEVEE dan transcoding MP4 H.264 di server GPU.',
    setupGuide: 'Deploy container Docker Blender + FFmpeg pada server GPU, lalu masukkan URL worker di panel di atas.',
  },
  {
    id: 'social-oauth',
    category: 'Publikasi Media Sosial',
    name: 'YouTube Data API / TikTok Content Posting / Meta Graph',
    status: 'Belum Dikonfigurasi',
    builtIn: false,
    details: 'Unggah otomatis video final beserta metadata setelah mendapatkan persetujuan Pemilik.',
    setupGuide: 'Memerlukan pendaftaran aplikasi OAuth 2.0 resmi pada masing-masing platform. Gunakan Paket Unduhan Manual sementara waktu.',
  },
];

// ============================================================================
// 3. HELPER API GEMINI, AUDIO WAV, SRT & RENDERER VIDEO NYATA
// ============================================================================
async function fetchWithBackoff(url, options, retries = 3) {
  let delay = 1000;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        if ((response.status === 429 || response.status >= 500) && attempt < retries) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${errText.slice(0, 180) || response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

async function callGeminiText(userPrompt, systemInstruction = '', responseSchema = null, backendUrl = '') {
  if (backendUrl && backendUrl.trim()) {
    const proxyUrl = `${backendUrl.replace(/\/$/, '')}/api/ai/generate-text`;
    const proxyRes = await fetchWithBackoff(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPrompt, systemInstruction, responseSchema }),
    });
    if (proxyRes?.data !== undefined) return proxyRes.data;
    if (proxyRes?.text !== undefined) return responseSchema ? JSON.parse(proxyRes.text) : proxyRes.text;
    throw new Error('Format respon backend proxy tidak valid.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
  };
  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  if (responseSchema) {
    payload.generationConfig = {
      responseMimeType: 'application/json',
      responseSchema,
    };
  }

  const res = await fetchWithBackoff(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const rawText = res?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Model tidak mengembalikan teks respon.');
  }
  if (responseSchema) {
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  }
  return rawText;
}

async function callGeminiImage(prompt, aspectRatio = '9:16') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`;
  const fullPrompt = `${prompt} (Aspect ratio ${aspectRatio})`;
  const payload = {
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  };

  const res = await fetchWithBackoff(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const parts = res?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData && p.inlineData.data);
  if (imgPart) {
    const mime = imgPart.inlineData.mimeType || 'image/png';
    return `data:${mime};base64,${imgPart.inlineData.data}`;
  }

  // Fallback ke Imagen 3 apabila model multimodal tidak mengembalikan inlineData
  const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`;
  const imagenRes = await fetchWithBackoff(imagenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio },
    }),
  });
  const b64 = imagenRes?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) {
    throw new Error('Layanan generasi gambar tidak mengembalikan data gambar.');
  }
  return `data:image/png;base64,${b64}`;
}

function pcm16ToWavBlob(base64Pcm, sampleRate = 24000) {
  const binaryStr = atob(base64Pcm);
  const pcmLen = binaryStr.length;
  const buffer = new ArrayBuffer(44 + pcmLen);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + pcmLen, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeStr(36, 'data');
  view.setUint32(40, pcmLen, true);

  const bytes = new Uint8Array(buffer, 44);
  for (let i = 0; i < pcmLen; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

async function callGeminiTTS(text, voiceName = 'Kore') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName,
          },
        },
      },
    },
  };

  const res = await fetchWithBackoff(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const inline = res?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!inline?.data) {
    throw new Error('Layanan TTS tidak mengembalikan data audio.');
  }
  const rateMatch = (inline.mimeType || '').match(/rate=(\d+)/i);
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
  const wavBlob = pcm16ToWavBlob(inline.data, sampleRate);
  const audioUrl = URL.createObjectURL(wavBlob);
  return { wavBlob, audioUrl, sampleRate };
}

function formatSrtTimestamp(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
}

function generateSRT(scenes = []) {
  let cursor = 0;
  return scenes
    .map((sc, idx) => {
      const dur = Math.max(2, Number(sc.duration) || 5);
      const start = formatSrtTimestamp(cursor);
      const end = formatSrtTimestamp(cursor + dur);
      cursor += dur;
      return `${idx + 1}\n${start} --> ${end}\n${sc.narration || sc.title || ''}\n`;
    })
    .join('\n');
}

function wrapCanvasLines(ctx, text, maxWidth) {
  const words = (text || '').split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function renderRealVideoFile({
  scenes = [],
  aspectRatio = '9:16',
  fps = 24,
  showSubtitles = true,
  audioBlob = null,
  onProgress = () => {},
}) {
  const dims =
    aspectRatio === '16:9'
      ? { width: 1280, height: 720 }
      : aspectRatio === '1:1'
      ? { width: 720, height: 720 }
      : { width: 720, height: 1280 };

  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext('2d');

  // Preload semua gambar storyboard adegan
  const loadedImages = await Promise.all(
    scenes.map(
      (sc) =>
        new Promise((resolve) => {
          if (!sc.imageUrl) return resolve(null);
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = sc.imageUrl;
        })
    )
  );

  // Hitung timeline per adegan
  let cursor = 0;
  const timeline = scenes.map((sc, i) => {
    const dur = Math.max(2, Number(sc.duration) || 5);
    const entry = { ...sc, img: loadedImages[i], start: cursor, end: cursor + dur, dur };
    cursor += dur;
    return entry;
  });
  const totalDurationSec = Math.max(2, cursor);

  // Siapkan stream video + audio jika tersedia
  const videoStream = canvas.captureStream(fps);
  let audioCtx = null;
  let audioSource = null;
  const tracks = [...videoStream.getVideoTracks()];

  if (audioBlob) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      const arrayBuf = await audioBlob.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuf);
      const dest = audioCtx.createMediaStreamDestination();
      audioSource = audioCtx.createBufferSource();
      audioSource.buffer = decoded;
      audioSource.connect(dest);
      tracks.push(...dest.stream.getAudioTracks());
    } catch (err) {
      console.warn('Audio tidak dapat digabungkan ke stream video, melanjutkan render visual:', err);
    }
  }

  const combinedStream = new MediaStream(tracks);
  const mimeTypes = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';
  const isMp4 = selectedMime.includes('mp4');
  const fileExt = isMp4 ? 'mp4' : 'webm';
  const formatLabel = isMp4 ? 'MP4 (Native Browser Encoder)' : 'WebM (Browser Compositor)';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: selectedMime,
    videoBitsPerSecond: 3500000,
  });

  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onerror = (e) => reject(e.error || new Error('MediaRecorder gagal merekam video.'));
    recorder.onstop = () => {
      if (audioCtx) audioCtx.close().catch(() => {});
      const blob = new Blob(chunks, { type: selectedMime });
      const url = URL.createObjectURL(blob);
      resolve({
        blob,
        url,
        mimeType: selectedMime,
        fileExt,
        formatLabel,
        duration: totalDurationSec,
      });
    };

    recorder.start(200);
    if (audioSource) {
      try {
        audioSource.start(0);
      } catch (_) {}
    }

    const startTime = performance.now();
    const intervalMs = Math.round(1000 / fps);

    const drawFrame = () => {
      const elapsedSec = (performance.now() - startTime) / 1000;
      const pct = Math.min(100, Math.round((elapsedSec / totalDurationSec) * 100));
      onProgress(pct);

      const currentScene =
        timeline.find((t) => elapsedSec >= t.start && elapsedSec < t.end) ||
        timeline[timeline.length - 1];

      // Background dasar
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (currentScene) {
        const localProgress = Math.min(
          1,
          Math.max(0, (elapsedSec - currentScene.start) / currentScene.dur)
        );
        // Efek gerak kamera Ken Burns halus
        const zoom = 1.0 + localProgress * 0.08;
        const panX = (localProgress - 0.5) * 24;

        if (currentScene.img) {
          const img = currentScene.img;
          const scale = Math.max(canvas.width / img.width, canvas.height / img.height) * zoom;
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const drawX = (canvas.width - drawW) / 2 + panX;
          const drawY = (canvas.height - drawH) / 2;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
        } else {
          // Fallback render prosedur 3D grid apabila gambar belum tersedia
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 26px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(currentScene.title || 'Adegan 3D', canvas.width / 2, canvas.height / 2);
        }

        // Vignette sinematik
        const vig = ctx.createLinearGradient(0, canvas.height * 0.55, 0, canvas.height);
        vig.addColorStop(0, 'rgba(2, 6, 23, 0)');
        vig.addColorStop(1, 'rgba(2, 6, 23, 0.88)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, canvas.height * 0.55, canvas.width, canvas.height * 0.45);

        // Subtitle
        if (showSubtitles && currentScene.narration) {
          const fontSize = Math.round(canvas.width * 0.036);
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          const lines = wrapCanvasLines(ctx, currentScene.narration, canvas.width * 0.84);
          const lineHeight = fontSize * 1.35;
          const blockHeight = lines.length * lineHeight + 24;
          const boxY = canvas.height - blockHeight - canvas.height * 0.08;

          ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
          ctx.fillRect(canvas.width * 0.06, boxY, canvas.width * 0.88, blockHeight);

          ctx.fillStyle = '#f8fafc';
          lines.forEach((ln, idx) => {
            ctx.fillText(ln, canvas.width / 2, boxY + 20 + (idx + 0.7) * lineHeight);
          });
        }
      }

      // Progress bar tipis di bagian paling bawah
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(0, canvas.height - 6, canvas.width * (elapsedSec / totalDurationSec), 6);

      if (elapsedSec < totalDurationSec) {
        setTimeout(drawFrame, intervalMs);
      } else {
        onProgress(100);
        if (recorder.state !== 'inactive') recorder.stop();
      }
    };

    drawFrame();
  });
}

function downloadBlob(url, filename) {
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ============================================================================
// 4. KOMPONEN KANTOR VIRTUAL 3D INTERAKTIF (THREE.JS ENGINE)
// ============================================================================
function VirtualOffice3D({
  employees,
  selectedEmployeeId,
  onSelectEmployee,
  activeStageName,
  onNavigateView,
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const avatarsRef = useRef({});
  const labelsRef = useRef({});
  const employeesRef = useRef(employees);
  const selectedIdRef = useRef(selectedEmployeeId);

  const [cameraPreset, setCameraPreset] = useState('overview');

  // Spherical camera orbit state
  const camStateRef = useRef({
    theta: 0.68,
    phi: 1.02,
    radius: 17.5,
    target: new THREE.Vector3(0, 0.8, 0),
    isDragging: false,
    isPanning: false,
    prevX: 0,
    prevY: 0,
    dragDistance: 0,
  });

  useEffect(() => {
    employeesRef.current = employees;
  }, [employees]);

  useEffect(() => {
    selectedIdRef.current = selectedEmployeeId;
  }, [selectedEmployeeId]);

  const applyCameraPreset = useCallback(
    (preset) => {
      setCameraPreset(preset);
      const st = camStateRef.current;
      if (preset === 'overview') {
        st.theta = 0.68;
        st.phi = 1.02;
        st.radius = 17.5;
        st.target.set(0, 0.8, 0);
      } else if (preset === 'executive') {
        st.theta = 0.12;
        st.phi = 1.08;
        st.radius = 11.5;
        st.target.set(-2.5, 0.9, -3.5);
      } else if (preset === 'studio') {
        st.theta = 2.25;
        st.phi = 1.06;
        st.radius = 12.0;
        st.target.set(3.6, 0.9, 2.2);
      } else if (preset === 'focus' && selectedIdRef.current) {
        const emp = employeesRef.current.find((e) => e.id === selectedIdRef.current);
        if (emp) {
          st.radius = 7.2;
          st.phi = 1.15;
          st.target.set(emp.deskPos[0], 1.1, emp.deskPos[1]);
        }
      }
    },
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050914);
    scene.fog = new THREE.FogExp2(0x050914, 0.022);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.35);
    dirLight.position.set(10, 18, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 45;
    const d = 14;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    const cyanAccentLight = new THREE.PointLight(0x06b6d4, 1.4, 22);
    cyanAccentLight.position.set(0, 4.5, 0);
    scene.add(cyanAccentLight);

    const purpleAccentLight = new THREE.PointLight(0xa855f7, 1.1, 18);
    purpleAccentLight.position.set(-6, 4, 2);
    scene.add(purpleAccentLight);

    // Lantai Kantor Futuristik
    const floorGeo = new THREE.PlaneGeometry(22, 18);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0b1221,
      roughness: 0.35,
      metalness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(20, 20, 0x0e7490, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Dinding Kaca Perimeter
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      roughness: 0.1,
      metalness: 0.2,
    });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 3.4, 0.12), glassMat);
    backWall.position.set(0, 1.7, -8.2);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 16.4), glassMat);
    leftWall.position.set(-9.5, 1.7, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 16.4), glassMat);
    rightWall.position.set(9.5, 1.7, 0);
    scene.add(rightWall);

    // Meja Rapat Hologram Tengah
    const confBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.6, 0.72, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    confBase.position.set(0, 0.36, -1.6);
    confBase.castShadow = true;
    confBase.receiveShadow = true;
    scene.add(confBase);

    const holoRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.03, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    holoRing.rotation.x = Math.PI / 2;
    holoRing.position.set(0, 1.15, -1.6);
    scene.add(holoRing);

    const holoCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.32, 0),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true })
    );
    holoCore.position.set(0, 1.35, -1.6);
    scene.add(holoCore);

    // Tekstur Layar Monitor
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 256;
    screenCanvas.height = 128;
    const sctx = screenCanvas.getContext('2d');
    sctx.fillStyle = '#041224';
    sctx.fillRect(0, 0, 256, 128);
    sctx.fillStyle = '#06b6d4';
    sctx.fillRect(14, 16, 95, 10);
    sctx.fillStyle = '#a855f7';
    sctx.fillRect(14, 34, 160, 8);
    sctx.fillStyle = '#10b981';
    sctx.fillRect(14, 52, 130, 8);
    sctx.strokeStyle = '#22d3ee';
    sctx.strokeRect(14, 72, 228, 40);
    const monitorTex = new THREE.CanvasTexture(screenCanvas);

    // Bangun Workstation & Avatar 3D untuk setiap Karyawan AI
    const clickableMeshes = [];
    const createdAvatars = {};

    employeesRef.current.forEach((emp, index) => {
      const [dx, dz] = emp.deskPos;
      const group = new THREE.Group();
      group.position.set(dx, 0, dz);

      // Hadapkan ke arah tengah ruangan
      const angleToCenter = Math.atan2(-dx, -dz);
      group.rotation.y = angleToCenter;

      // Meja Kerja
      const deskTop = new THREE.Mesh(
        new THREE.BoxGeometry(1.75, 0.08, 0.85),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.65 })
      );
      deskTop.position.set(0, 0.74, 0.45);
      deskTop.castShadow = true;
      deskTop.receiveShadow = true;
      group.add(deskTop);

      const deskLegL = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.74, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      deskLegL.position.set(-0.78, 0.37, 0.45);
      group.add(deskLegL);

      const deskLegR = deskLegL.clone();
      deskLegR.position.set(0.78, 0.37, 0.45);
      group.add(deskLegR);

      // Monitor Studio
      const monitorStand = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.22, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      monitorStand.position.set(0, 0.88, 0.56);
      group.add(monitorStand);

      const monitorScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.48, 0.04),
        new THREE.MeshStandardMaterial({
          map: monitorTex,
          emissive: 0x0e7490,
          emissiveIntensity: 0.45,
        })
      );
      monitorScreen.position.set(0, 1.12, 0.55);
      monitorScreen.rotation.y = Math.PI;
      group.add(monitorScreen);

      // Avatar Karakter 3D
      const charGroup = new THREE.Group();
      charGroup.position.set(0, 0, -0.15);

      // Kursi
      const chairSeat = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.08, 0.52),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      chairSeat.position.set(0, 0.45, -0.02);
      charGroup.add(chairSeat);

      const chairBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.65, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      chairBack.position.set(0, 0.8, -0.25);
      charGroup.add(chairBack);

      // Torso
      const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.24, 0.58, 16),
        new THREE.MeshStandardMaterial({ color: emp.shirtColor, roughness: 0.45 })
      );
      torso.position.set(0, 0.82, 0);
      torso.castShadow = true;
      torso.userData = { employeeId: emp.id };
      clickableMeshes.push(torso);
      charGroup.add(torso);

      // Kepala
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.19, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.5 })
      );
      head.position.set(0, 1.32, 0);
      head.castShadow = true;
      head.userData = { employeeId: emp.id };
      clickableMeshes.push(head);
      charGroup.add(head);

      // Visor / Kacamata AI Futuristik
      const visor = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.06, 0.08),
        new THREE.MeshBasicMaterial({ color: emp.color })
      );
      visor.position.set(0, 1.34, 0.16);
      charGroup.add(visor);

      // Lengan Kiri & Kanan (animasi mengetik)
      const leftArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.42, 12),
        new THREE.MeshStandardMaterial({ color: emp.shirtColor })
      );
      leftArm.position.set(-0.27, 0.88, 0.16);
      leftArm.rotation.x = -0.85;
      charGroup.add(leftArm);

      const rightArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.42, 12),
        new THREE.MeshStandardMaterial({ color: emp.shirtColor })
      );
      rightArm.position.set(0.27, 0.88, 0.16);
      rightArm.rotation.x = -0.85;
      charGroup.add(rightArm);

      // Cincin Status di atas kepala
      const statusRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.022, 10, 32),
        new THREE.MeshBasicMaterial({ color: emp.color })
      );
      statusRing.rotation.x = Math.PI / 2;
      statusRing.position.set(0, 1.68, 0);
      charGroup.add(statusRing);

      // Hitbox tak terlihat agar mudah diklik
      const hitbox = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.9, 1.1),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitbox.position.set(0, 0.95, 0.1);
      hitbox.userData = { employeeId: emp.id };
      clickableMeshes.push(hitbox);
      group.add(hitbox);

      group.add(charGroup);
      scene.add(group);

      createdAvatars[emp.id] = {
        group,
        charGroup,
        head,
        leftArm,
        rightArm,
        statusRing,
        phase: index * 0.7,
      };
    });

    avatarsRef.current = createdAvatars;

    // Raycaster untuk klik karyawan AI
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerDown = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      camStateRef.current.isDragging = true;
      camStateRef.current.isPanning = e.button === 2 || e.shiftKey;
      camStateRef.current.prevX = clientX;
      camStateRef.current.prevY = clientY;
      camStateRef.current.dragDistance = 0;
    };

    const handlePointerMove = (e) => {
      if (!camStateRef.current.isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - camStateRef.current.prevX;
      const dy = clientY - camStateRef.current.prevY;
      camStateRef.current.prevX = clientX;
      camStateRef.current.prevY = clientY;
      camStateRef.current.dragDistance += Math.abs(dx) + Math.abs(dy);

      if (camStateRef.current.isPanning) {
        camStateRef.current.target.x = Math.max(
          -8,
          Math.min(8, camStateRef.current.target.x - dx * 0.015)
        );
        camStateRef.current.target.z = Math.max(
          -7,
          Math.min(7, camStateRef.current.target.z - dy * 0.015)
        );
      } else {
        camStateRef.current.theta -= dx * 0.007;
        camStateRef.current.phi = Math.max(
          0.35,
          Math.min(1.42, camStateRef.current.phi - dy * 0.006)
        );
      }
    };

    const handlePointerUp = (e) => {
      const wasClick = camStateRef.current.dragDistance < 6;
      camStateRef.current.isDragging = false;
      camStateRef.current.isPanning = false;

      if (wasClick && rendererRef.current) {
        const rect = rendererRef.current.domElement.getBoundingClientRect();
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(clickableMeshes, false);
        if (hits.length > 0 && hits[0].object.userData?.employeeId) {
          onSelectEmployee(hits[0].object.userData.employeeId);
        }
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      camStateRef.current.radius = Math.max(
        5.5,
        Math.min(24, camStateRef.current.radius + e.deltaY * 0.01)
      );
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    domElem.addEventListener('touchstart', handlePointerDown, { passive: true });
    domElem.addEventListener('touchmove', handlePointerMove, { passive: true });
    domElem.addEventListener('touchend', handlePointerUp);
    domElem.addEventListener('wheel', handleWheel, { passive: false });
    domElem.addEventListener('contextmenu', (e) => e.preventDefault());

    // ResizeObserver agar responsif di semua layar
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 540;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animFrameId = null;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Update posisi kamera spherical
      const st = camStateRef.current;
      camera.position.x = st.target.x + st.radius * Math.sin(st.phi) * Math.sin(st.theta);
      camera.position.y = st.target.y + st.radius * Math.cos(st.phi);
      camera.position.z = st.target.z + st.radius * Math.sin(st.phi) * Math.cos(st.theta);
      camera.lookAt(st.target);

      // Animasi hologram meja rapat
      holoRing.rotation.z = elapsed * 0.6;
      holoCore.rotation.y = elapsed * 1.1;
      holoCore.position.y = 1.35 + Math.sin(elapsed * 2) * 0.06;

      // Animasi tiap karyawan AI & proyeksi label HTML 2D
      const currentEmps = employeesRef.current;
      const selId = selectedIdRef.current;
      const cw = container.clientWidth || 800;
      const ch = container.clientHeight || 540;

      currentEmps.forEach((emp) => {
        const av = avatarsRef.current[emp.id];
        if (!av) return;

        const isWorking = emp.status === 'Bekerja';
        const isSelected = emp.id === selId;
        const speed = isWorking ? 11 : 2.2;

        // Gerak lengan mengetik & anggukan kepala
        av.leftArm.rotation.x = -0.85 + Math.sin(elapsed * speed + av.phase) * (isWorking ? 0.18 : 0.04);
        av.rightArm.rotation.x = -0.85 + Math.cos(elapsed * speed + av.phase) * (isWorking ? 0.18 : 0.04);
        av.head.rotation.y = Math.sin(elapsed * 1.4 + av.phase) * 0.14;
        av.head.rotation.x = isWorking ? 0.12 : 0;

        // Cincin status berdenyut
        const scalePulse = isSelected ? 1.32 + Math.sin(elapsed * 5) * 0.1 : 1.0;
        av.statusRing.scale.set(scalePulse, scalePulse, 1);
        av.statusRing.material.color.set(
          isWorking ? '#10b981' : isSelected ? '#ffffff' : emp.color
        );

        // Proyeksi posisi 3D kepala ke koordinat layar untuk gelembung percakapan
        const labelEl = labelsRef.current[emp.id];
        if (labelEl) {
          const worldPos = new THREE.Vector3(emp.deskPos[0], 2.05, emp.deskPos[1]);
          worldPos.project(camera);
          const x = (worldPos.x * 0.5 + 0.5) * cw;
          const y = (-worldPos.y * 0.5 + 0.5) * ch;
          if (worldPos.z < 1 && x > 20 && x < cw - 20 && y > 20 && y < ch - 20) {
            labelEl.style.display = 'flex';
            labelEl.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
          } else {
            labelEl.style.display = 'none';
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      domElem.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      domElem.removeEventListener('touchstart', handlePointerDown);
      domElem.removeEventListener('touchmove', handlePointerMove);
      domElem.removeEventListener('touchend', handlePointerUp);
      domElem.removeEventListener('wheel', handleWheel);
      renderer.dispose();
    };
  }, [onSelectEmployee]);

  return (
    <div className="relative w-full h-[540px] lg:h-[600px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* WebGL Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Projected 3D Floating Nameplates & Speech Bubbles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {employees.map((emp) => {
          const isSelected = emp.id === selectedEmployeeId;
          const isWorking = emp.status === 'Bekerja';
          return (
            <div
              key={emp.id}
              ref={(el) => {
                labelsRef.current[emp.id] = el;
              }}
              style={{ left: 0, top: 0 }}
              className="pointer-events-auto absolute flex-col items-center transition-opacity duration-150"
            >
              {(isSelected || isWorking) && (
                <div className="mb-1 max-w-[180px] rounded-xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 px-2.5 py-1.5 text-[10px] text-cyan-100 shadow-lg">
                  {emp.speechBubble}
                </div>
              )}
              <button
                onClick={() => onSelectEmployee(emp.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-md border transition ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-white scale-105'
                    : 'bg-slate-950/85 text-slate-100 border-slate-700 hover:border-cyan-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isWorking ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'
                  }`}
                />
                {emp.shortRole}
              </button>
            </div>
          );
        })}
      </div>

      {/* HUD Atas: Status Kantor & Preset Kamera */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">AI STUDIO 3D LIVE</span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-cyan-300 text-[11px] hidden sm:inline">
            {activeStageName ? `Aktif: ${activeStageName}` : '10 Agen Siaga'}
          </span>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-1 rounded-xl text-[11px]">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'executive', label: 'Executive & Creative' },
            { id: 'studio', label: '3D & Editing' },
            { id: 'focus', label: 'Fokus Agen' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => applyCameraPreset(p.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                cameraPreset === p.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* HUD Bawah: Kontrol Zoom & Navigasi Cepat */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-400">
          Klik agen untuk inspeksi • Drag kiri: Putar • Shift+Drag / Klik kanan: Geser • Scroll: Zoom
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={() => {
              camStateRef.current.radius = Math.max(5.5, camStateRef.current.radius - 2);
            }}
            className="p-2 rounded-xl bg-slate-950/85 border border-slate-800 text-slate-200 hover:border-cyan-500"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              camStateRef.current.radius = Math.min(24, camStateRef.current.radius + 2);
            }}
            className="p-2 rounded-xl bg-slate-950/85 border border-slate-800 text-slate-200 hover:border-cyan-500"
            title="Perkecil (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateView('studio')}
            className="px-3 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg"
          >
            <Video className="w-3.5 h-3.5" />
            Buka Video Studio
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. KOMPONEN UTAMA APLIKASI: AI AGENT OFFICE 3D
// ============================================================================
export default function App() {
  // Autentikasi & Status Database
  const [user, setUser] = useState(null);
  const [dbStatus, setDbStatus] = useState('Menghubungkan...');

  // Navigasi Menu & Mode Utama
  const [activeMenu, setActiveMenu] = useState('office3d');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State Karyawan AI
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('manager');

  // State Proyek & Pipeline
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [commandInput, setCommandInput] = useState('');
  const [revisionInput, setRevisionInput] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [activeStageKey, setActiveStageKey] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);

  // Pengaturan Video Studio & Media Runtime
  const [videoSettings, setVideoSettings] = useState({
    aspectRatio: '9:16',
    fps: 24,
    quality: 'High (3.5 Mbps)',
    showSubtitles: true,
  });
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [runtimeMedia, setRuntimeMedia] = useState({});
  const runtimeMediaRef = useRef({});
  const setProjectRuntimeMedia = useCallback((projId, patch) => {
    const nextForProj = { ...(runtimeMediaRef.current[projId] || {}), ...patch };
    runtimeMediaRef.current = { ...runtimeMediaRef.current, [projId]: nextForProj };
    setRuntimeMedia((prev) => ({ ...prev, [projId]: nextForProj }));
  }, []);

  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  // Percakapan Multi-Agen & Antrean Pekerjaan Persisten
  const [conversations, setConversations] = useState([]);
  const [jobQueue, setJobQueue] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatTargetAgentId, setChatTargetAgentId] = useState('manager');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Editor Adegan Storyboard Inline
  const [editingSceneIdx, setEditingSceneIdx] = useState(null);
  const [sceneDraft, setSceneDraft] = useState({
    title: '',
    narration: '',
    visualDescription: '',
    duration: 5,
  });
  const [regeneratingSceneIdx, setRegeneratingSceneIdx] = useState(null);

  // Konfigurasi Integrasi & Diagnostik API
  const [backendConfig, setBackendConfig] = useState({
    proxyUrl: '',
    videoAdapterMode: 'browser-compositor',
    blenderWorkerUrl: '',
  });
  const [backendHealth, setBackendHealth] = useState({
    status: 'Belum Diuji',
    checkedAt: null,
    message: '',
  });
  const [geminiDiag, setGeminiDiag] = useState({
    status: 'Belum Diuji',
    latencyMs: null,
    message: '',
  });

  // Modals & Toast Notifications (Pengganti alert/confirm)
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [deleteConfirmProjectId, setDeleteConfirmProjectId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev && Date.now() - prev.id >= 3800 ? null : prev));
    }, 4000);
  }, []);

  const addLog = useCallback((stage, message, level = 'info') => {
    setActivityLogs((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString(),
        stage,
        message,
        level,
      },
      ...prev.slice(0, 49),
    ]);
  }, []);

  const updateAgentState = useCallback(
    (agentId, status, currentTask, speechBubble = null, lastOutput = null) => {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === agentId
            ? {
                ...emp,
                status,
                currentTask: currentTask ?? emp.currentTask,
                speechBubble: speechBubble ?? emp.speechBubble,
                lastOutput: lastOutput ?? emp.lastOutput,
              }
            : emp
        )
      );
    },
    []
  );

  // ==========================================================================
  // AUTENTIKASI & SINKRONISASI FIRESTORE
  // ==========================================================================
  useEffect(() => {
    if (!auth) {
      setDbStatus('Penyimpanan Lokal Aktif');
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn('Auth error, fallback ke penyimpanan lokal:', err);
        setDbStatus('Mode Lokal (Offline DB)');
      }
    };
    initAuth();

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setDbStatus('Cloud Firestore Terhubung');
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db || !user) return;

    const projRef = collection(db, 'artifacts', appId, 'users', user.uid, 'projects');
    const unsubProj = onSnapshot(
      projRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setProjects(list);
        setActiveProjectId((curr) => curr || (list[0] ? list[0].id : null));
      },
      (err) => console.warn('Firestore projects snapshot error:', err)
    );

    const convRef = collection(db, 'artifacts', appId, 'users', user.uid, 'conversations');
    const unsubConv = onSnapshot(
      convRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        setConversations(list);
      },
      (err) => console.warn('Firestore conversations error:', err)
    );

    const queueRef = collection(db, 'artifacts', appId, 'users', user.uid, 'job_queue');
    const unsubQueue = onSnapshot(
      queueRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setJobQueue(list);
      },
      (err) => console.warn('Firestore job_queue error:', err)
    );

    return () => {
      unsubProj();
      unsubConv();
      unsubQueue();
    };
  }, [user]);

  const saveProjectToStore = useCallback(
    async (projObj) => {
      setProjects((prev) => {
        const exists = prev.some((p) => p.id === projObj.id);
        return exists ? prev.map((p) => (p.id === projObj.id ? projObj : p)) : [projObj, ...prev];
      });
      if (db && user) {
        try {
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'projects', projObj.id), projObj);
        } catch (err) {
          console.warn('Gagal simpan proyek ke Firestore:', err);
        }
      }
    },
    [user]
  );

  const saveConversationMessage = useCallback(
    async (msgObj) => {
      setConversations((prev) => [...prev, msgObj]);
      if (db && user) {
        try {
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'conversations', msgObj.id), msgObj);
        } catch (err) {
          console.warn('Gagal simpan percakapan ke Firestore:', err);
        }
      }
    },
    [user]
  );

  const upsertJobRecord = useCallback(
    async (jobObj) => {
      setJobQueue((prev) => {
        const exists = prev.some((j) => j.id === jobObj.id);
        return exists ? prev.map((j) => (j.id === jobObj.id ? jobObj : j)) : [jobObj, ...prev];
      });
      if (db && user) {
        try {
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'job_queue', jobObj.id), jobObj);
        } catch (err) {
          console.warn('Gagal simpan job queue ke Firestore:', err);
        }
      }
    },
    [user]
  );

  const handleDeleteProject = useCallback(
    async (projId) => {
      setProjects((prev) => prev.filter((p) => p.id !== projId));
      if (activeProjectId === projId) setActiveProjectId(null);
      if (db && user) {
        try {
          await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'projects', projId));
        } catch (err) {
          console.warn('Gagal hapus proyek di Firestore:', err);
        }
      }
      setDeleteConfirmProjectId(null);
      showToast('Proyek berhasil dihapus.', 'info');
    },
    [activeProjectId, user, showToast]
  );

  const copyToClipboard = useCallback(
    (text, label = 'Teks') => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(`${label} berhasil disalin ke clipboard!`, 'success');
      } catch (err) {
        showToast('Gagal menyalin teks.', 'error');
      }
    },
    [showToast]
  );

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || projects[0] || null,
    [projects, activeProjectId]
  );

  const activeMedia = activeProject ? runtimeMedia[activeProject.id] || {} : {};
  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId) || employees[0],
    [employees, selectedEmployeeId]
  );

  // ==========================================================================
  // PERINTAH PEMILIK -> PERENCANAAN AI MANAGER
  // ==========================================================================
  const handleCreateProjectFromCommand = async (customCmd = null) => {
    const promptText = (customCmd ?? commandInput).trim();
    if (!promptText || isPlanning) return;

    setIsPlanning(true);
    setCommandInput('');
    updateAgentState(
      'manager',
      'Bekerja',
      'Menganalisis instruksi Pemilik & menyusun rencana produksi...',
      'Sedang menganalisis brief dan menyusun rencana 12 tahap...'
    );
    addLog('Project Brief', `Menerima perintah pemilik: "${promptText}"`);

    try {
      const schema = {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          summary: { type: 'STRING' },
          aspectRatio: { type: 'STRING' },
          targetPlatform: { type: 'STRING' },
          targetDurationSec: { type: 'NUMBER' },
          visualStyle: { type: 'STRING' },
          targetAudience: { type: 'STRING' },
          productionPlanSteps: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
        },
        required: [
          'title',
          'summary',
          'aspectRatio',
          'targetPlatform',
          'targetDurationSec',
          'visualStyle',
          'targetAudience',
          'productionPlanSteps',
        ],
      };

      const plan = await callGeminiText(
        `Perintah Pemilik: "${promptText}".\nAnalisis perintah ini dan buat rencana produksi video animasi 3D. Untuk aspectRatio pilih salah satu dari "9:16", "16:9", atau "1:1".`,
        'Anda adalah AI Manager studio produksi animasi 3D. Jawab dalam bahasa Indonesia profesional.',
        schema,
        backendConfig.proxyUrl
      );

      const projId = `proj-${Date.now()}`;
      const normalizedRatio = ['9:16', '16:9', '1:1'].includes(plan.aspectRatio)
        ? plan.aspectRatio
        : '9:16';

      const initialStages = {};
      PIPELINE_TEMPLATE.forEach((st) => {
        initialStages[st.key] = {
          status: st.key === 'brief' ? 'Selesai' : 'Menunggu',
          startedAt: st.key === 'brief' ? new Date().toLocaleTimeString() : null,
          finishedAt: st.key === 'brief' ? new Date().toLocaleTimeString() : null,
          outputPreview:
            st.key === 'brief'
              ? `Rencana disusun: ${plan.title} (${normalizedRatio}, ${plan.targetPlatform})`
              : '',
          error: null,
        };
      });

      const newProject = {
        id: projId,
        title: plan.title || 'Proyek Video Animasi 3D',
        brief: promptText,
        summary: plan.summary,
        aspectRatio: normalizedRatio,
        targetPlatform: plan.targetPlatform || 'TikTok & Reels',
        targetDurationSec: plan.targetDurationSec || 30,
        visualStyle: plan.visualStyle || 'Cinematic 3D Animation',
        targetAudience: plan.targetAudience || 'Audiens Umum Digital',
        productionPlanSteps: plan.productionPlanSteps || [],
        status: 'Memerlukan Persetujuan',
        stages: initialStages,
        scenes: [],
        characterSheet: null,
        socialPackage: null,
        qaReport: null,
        versions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setVideoSettings((prev) => ({ ...prev, aspectRatio: newProject.aspectRatio }));
      await saveProjectToStore(newProject);
      setActiveProjectId(projId);

      await saveConversationMessage({
        id: `msg-${Date.now()}-u`,
        projectId: projId,
        sender: 'Pemilik',
        role: 'owner',
        text: promptText,
        createdAt: Date.now(),
        time: new Date().toLocaleTimeString(),
      });
      await saveConversationMessage({
        id: `msg-${Date.now() + 1}-m`,
        projectId: projId,
        sender: 'Arya Pratama (AI Manager)',
        role: 'manager',
        text: `Rencana produksi untuk "${newProject.title}" (${newProject.aspectRatio}, ${newProject.targetPlatform}) telah disusun dalam 12 tahap. Ringkasan: ${newProject.summary}. Silakan klik "Setujui & Jalankan Seluruh Pipeline" atau berikan instruksi tambahan.`,
        createdAt: Date.now() + 1,
        time: new Date().toLocaleTimeString(),
      });

      updateAgentState(
        'manager',
        'Siap',
        'Rencana produksi siap disetujui Pemilik',
        'Rencana produksi selesai! Menunggu persetujuan Anda.',
        `Rencana: ${newProject.title}`
      );
      addLog('Project Brief', `Rencana produksi "${newProject.title}" berhasil dibuat.`, 'success');
      showToast('Rencana produksi disusun! Silakan tinjau & setujui.', 'success');
      setActiveMenu('command');
    } catch (err) {
      updateAgentState('manager', 'Siap', 'Gagal menyusun rencana');
      addLog('Project Brief', `Error: ${err.message}`, 'error');
      showToast(`Gagal membuat rencana: ${err.message}`, 'error');
    } finally {
      setIsPlanning(false);
    }
  };

  // ==========================================================================
  // EKSEKUSI TAHAPAN PIPELINE PRODUKSI NYATA (12 TAHAP)
  // ==========================================================================
  const updateProjectStage = async (projectObj, stageKey, stagePatch, projectPatch = {}) => {
    const nextProj = {
      ...projectObj,
      ...projectPatch,
      updatedAt: Date.now(),
      stages: {
        ...projectObj.stages,
        [stageKey]: {
          ...(projectObj.stages?.[stageKey] || {}),
          ...stagePatch,
        },
      },
    };
    await saveProjectToStore(nextProj);
    return nextProj;
  };

  const runSingleStage = async (projectRef, stageKey) => {
    let proj = { ...projectRef };
    const stageMeta = PIPELINE_TEMPLATE.find((s) => s.key === stageKey);
    if (!stageMeta) return proj;

    const jobId = `job-${Date.now()}-${stageKey}`;
    const jobStartMs = Date.now();
    const agentObj = employees.find((e) => e.id === stageMeta.agentId);

    setActiveStageKey(stageKey);
    const startTime = new Date().toLocaleTimeString();

    await upsertJobRecord({
      id: jobId,
      projectId: proj.id,
      projectTitle: proj.title,
      stageKey,
      stageName: stageMeta.name,
      agentRole: agentObj?.role || stageMeta.agentId,
      status: 'Berjalan',
      createdAt: jobStartMs,
      startedAt: startTime,
      finishedAt: null,
      durationSec: null,
      error: null,
    });

    proj = await updateProjectStage(proj, stageKey, {
      status: 'Berjalan',
      startedAt: startTime,
      error: null,
    });
    updateAgentState(
      stageMeta.agentId,
      'Bekerja',
      `Mengerjakan tahap: ${stageMeta.name}`,
      `Sedang mengerjakan ${stageMeta.name}...`
    );
    addLog(stageMeta.name, `Memulai eksekusi oleh ${agentObj?.role}`);

    try {
      // TAHAP 1: BRIEF
      if (stageKey === 'brief') {
        proj = await updateProjectStage(proj, 'brief', {
          status: 'Selesai',
          finishedAt: new Date().toLocaleTimeString(),
          outputPreview: `Brief tervalidasi: ${proj.title}`,
        });
        updateAgentState('manager', 'Siap', 'Brief tervalidasi', 'Brief proyek valid!');
      }

      // TAHAP 2: IDE & RISET
      else if (stageKey === 'ideation') {
        const res = await callGeminiText(
          `Berdasarkan brief: "${proj.brief}" dengan gaya "${proj.visualStyle}" untuk audiens "${proj.targetAudience}", buat konsep kreatif video animasi 3D: hook utama, pesan emosional, palet warna, dan alasan daya tarik audiens.`,
          employees.find((e) => e.id === 'creative')?.systemPrompt,
          null,
          backendConfig.proxyUrl
        );
        proj = { ...proj, creativeConcept: res };
        proj = await updateProjectStage(proj, 'ideation', {
          status: 'Selesai',
          finishedAt: new Date().toLocaleTimeString(),
          outputPreview: res.slice(0, 220) + '...',
        });
        updateAgentState(
          'creative',
          'Siap',
          'Konsep kreatif selesai',
          'Konsep visual & hook selesai!',
          res.slice(0, 140)
        );
      }

      // TAHAP 3: PENULISAN NASKAH
      else if (stageKey === 'script') {
        const scriptSchema = {
          type: 'OBJECT',
          properties: {
            hookLine: { type: 'STRING' },
            scenes: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  sceneNumber: { type: 'NUMBER' },
                  title: { type: 'STRING' },
                  duration: { type: 'NUMBER' },
                  narration: { type: 'STRING' },
                  visualDescription: { type: 'STRING' },
                  cameraAngle: { type: 'STRING' },
                  lighting: { type: 'STRING' },
                },
                required: [
                  'sceneNumber',
                  'title',
                  'duration',
                  'narration',
                  'visualDescription',
                  'cameraAngle',
                  'lighting',
                ],
              },
            },
          },
          required: ['hookLine', 'scenes'],
        };

        const scriptData = await callGeminiText(
          `Tulis naskah video animasi 3D untuk proyek "${proj.title}". Brief: "${proj.brief}". Konsep kreatif: "${proj.creativeConcept || proj.summary}". Buat 4 sampai 5 adegan sinematik dengan narasi Bahasa Indonesia yang kuat, durasi tiap adegan 4-6 detik, deskripsi visual detail, sudut kamera, dan pencahayaan.`,
          employees.find((e) => e.id === 'scriptwriter')?.systemPrompt,
          scriptSchema,
          backendConfig.proxyUrl
        );

        const scenes = (scriptData.scenes || []).map((sc, i) => ({
          ...sc,
          sceneNumber: i + 1,
          duration: Math.max(3, Math.min(10, Number(sc.duration) || 5)),
          imageUrl: proj.scenes?.[i]?.imageUrl || null,
        }));

        proj = { ...proj, hookLine: scriptData.hookLine, scenes };
        proj = await updateProjectStage(proj, 'script', {
          status: 'Selesai',
          finishedAt: new Date().toLocaleTimeString(),
          outputPreview: `${scenes.length} adegan naskah selesai. Hook: "${scriptData.hookLine}"`,
        });
        updateAgentState(
          'scriptwriter',
          'Siap',
          'Naskah video selesai',
          `${scenes.length} adegan naskah siap!`,
          scriptData.hookLine
        );
      }

      // TAHAP 4: STORYBOARD
      else if (stageKey === 'storyboard') {
        if (!proj.scenes || proj.scenes.length === 0) {
          throw new Error('Naskah belum tersedia. Jalankan tahap Penulisan Naskah terlebih dahulu.');
        }
        const updatedScenes = [...proj.scenes];
        for (let i = 0; i < updatedScenes.length; i++) {
          const sc = updatedScenes[i];
          updateAgentState(
            'storyboard',
            'Bekerja',
            `Merender frame storyboard adegan ${i + 1}/${updatedScenes.length}...`,
            `Menggambar frame Scene ${i + 1}...`
          );
          const charHint = proj.characterSheet
            ? `Consistent character: ${proj.characterSheet.characterName}, ${proj.characterSheet.appearance}, outfit: ${proj.characterSheet.outfit}.`
            : '';
          const imgPrompt = `3D animated movie cinematic storyboard still, Unreal Engine 5 render, ${proj.visualStyle}. ${charHint} Scene: ${sc.visualDescription}. Camera: ${sc.cameraAngle}. Lighting: ${sc.lighting}. High detail, no text overlays.`;
          const imgUrl = await callGeminiImage(imgPrompt, proj.aspectRatio || '9:16');
          updatedScenes[i] = { ...sc, imageUrl: imgUrl };
        }
        proj = { ...proj, scenes: updatedScenes };
        proj = await updateProjectStage(proj, 'storyboard', {
          status: 'Selesai',
          finishedAt: new Date().toLocaleTimeString(),
          outputPreview: `${updatedScenes.length} frame visual storyboard berhasil dirender.`,
        });
        updateAgentState(
          'storyboard',
          'Siap',
          'Storyboard visual selesai',
          'Semua frame storyboard selesai!',
          `${updatedScenes.length} frame dirender.`
        );
      }

      // TAHAP 5: DESAIN KARAKTER & ASET 3D
      else if (stageKey === 'character') {
        const charSchema = {
          type: 'OBJECT',
          properties: {
            characterName: { type: 'STRING' },
            roleInStory: { type: 'STRING' },
            appearance: { type: 'STRING' },
            outfit: { type: 'STRING' },
            personalityTraits: { type: 'STRING' },
            signatureProps: { type: 'STRING' },
            consistencyRules: { type: 'STRING' },
          },
          required: [
            'characterName',
            'roleInStory',
            'appearance',
            'outfit',
            'personalityTraits',
            'signatureProps',
            'consistencyRules',
          ],
        };

        const charData = await callGeminiText(
          `Rancang spesifikasi karakter utama 3D untuk proyek "${proj.title}" (${proj.brief}). Gaya visual: ${proj.visualStyle}. Pastikan detail wajah, proporsi, kostum, dan ciri khas terkunci untuk konsistensi lintas adegan.`,
          employees.find((e) => e.id === 'character')?.systemPrompt,
          charSchema,
          backendConfig.proxyUrl
        );

        let turnAroundImg = null;
        try {
          turnAroundImg = await callGeminiImage(
            `3D character design sheet turnaround, full body neutral studio lighting, dark sci-fi studio backdrop, ${proj.visualStyle}. Character: ${charData.characterName}, ${charData.appearance}, wearing ${charData.outfit}. Clean 3D model render, no text.`,
            '1:1'
          );
        } catch (_) {}

        proj = {
          ...proj,
          characterSheet: { ...charData, referenceImageUrl: turnAroundImg },
        };
        proj = await updateProjectStage(proj, 'character', {
          status: 'Selesai',
          finishedAt: new Date().toLocaleTimeString(),
          outputPreview: `Karakter "${charData.characterName}" terkunci (${charData.outfit}).`,
        });
        updateAgentState(
          'character',
          'Siap',
          'Character Bible terkunci',
          `Karakter ${charData.characterName} siap!`,
          charData.outfit
        );
      }

      // TAHAP 6: GENERASI ADEGAN
      else if (stageKey === 'scene_gen') {
        if (!proj.scenes || proj.scenes.length === 0) {
          throw new Error('Adegan belum tersedia.');
        }
        const updatedScenes = [...proj.scenes];
        for (let i = 0; i < updatedScenes.length; i++) {
          if (!updatedScenes[i].imageUrl) {
            const sc = updatedScenes[i];
            const charHint = proj.characterSheet
              ? `Main character: ${proj.characterSheet.characterName}, ${proj.characterSheet.appearance}, ${proj.characterSheet.outfit}.`
              : '';
            const imgUrl = await callGeminiImage(
              `3D animated film frame, ${proj.visualStyle}. ${charHint} ${sc.visualDescription}. ${sc.cameraAngle}, ${sc.lighting}.`,
              proj.aspectRatio || '9:16'
            );
            updatedScenes[i] = { ...sc, imageUrl: imgUrl };
          }
        }
        proj = { ...proj, scenes: updatedScenes };
        proj = await updateProjectStage(proj, 'scene_gen', {
          status: 'Selesai',
          finishedAt: new Date().toLocaleTimeString(),
          outputPreview: `${updatedScenes.length} aset visual adegan terverifikasi & siap animasi.`,
        });
        updateAgentState('animator', 'Siap', 'Aset adegan lengkap', 'Semua aset adegan siap!');
      }

      // TAHAP 7: ANIMASI / GERAK KAMERA
      else if (stageKey === 'animation') {
        const motionPlan = (proj.scenes || []).map((s, idx) => ({
          scene: idx + 1,
          cameraMove: idx % 2 === 0 ? 'Smooth Dolly-In + Subtle Pan' : 'Cinematic Crane & Parallax Zoom',
          duration: s.duration,
        }));
        proj = { ...proj, animationRig: motionPlan };
        proj = await updateProjectStage(proj, 'animation', {
          status: 'Selesai',
          finishedAt: new Date().toLocaleTimeString(),
          outputPreview: `Keyframing kamera & kurva gerak dikonfigurasi untuk ${motionPlan.length} adegan.`,
        });
        updateAgentState('animator', 'Siap', 'Keyframing kamera selesai', 'Rig kamera & transisi siap!');
      }

      // TAHAP 8: VOICE-OVER & AUDIO (GEMINI TTS WAV NYATA)
      else if (stageKey === 'voice') {
        const fullNarration = (proj.scenes || [])
          .map((s) => s.narration)
          .filter(Boolean)
          .join('. ');
        if (!fullNarration) {
          throw new Error('Tidak ada teks narasi untuk diubah menjadi suara.');
        }
        updateAgentState(
          'voice',
          'Bekerja',
          `Menghasilkan audio TTS (${selectedVoice})...`,
          'Merekam voice-over AI...'
        );
        const { wavBlob, audioUrl, sampleRate } = await callGeminiTTS(
          `Bacakan dengan intonasi sinematik, jelas, dan profesional dalam bahasa Indonesia: ${fullNarration}`,
          selectedVoice
        );
        setProjectRuntimeMedia(proj.id, { audioBlob: wavBlob, audioUrl });
        proj = { ...proj, voiceUsed: selectedVoice, hasAudio: true };
        proj = await updateProjectStage(proj, 'voice', {
          status: 'Selesai',
          finishedAt: new Date().toLocaleTimeString(),
          outputPreview: `Audio WAV nyata dihasilkan (${selectedVoice}, ${sampleRate}Hz).`,
        });
        updateAgentState(
          'voice',
          'Siap',
          'Audio narasi selesai',
          'Voice-over WAV siap!',
          `Suara ${selectedVoice} (${sampleRate}Hz).`
        );
      }

      // TAHAP 9: EDITING & RENDERING VIDEO NYATA
      else if (stageKey === 'editing') {
        if (!proj.scenes || proj.scenes.length === 0) {
          throw new Error('Adegan kosong, tidak bisa merender video.');
        }
        setIsRenderingVideo(true);
        setRenderProgress(0);
        updateAgentState(
          'editor',
          'Bekerja',
          'Merender video final (Canvas + Audio)...',
          'Sedang merender file video...'
        );
        const currentMedia = runtimeMediaRef.current[proj.id] || {};
        const renderResult = await renderRealVideoFile({
          scenes: proj.scenes,
          aspectRatio: proj.aspectRatio || videoSettings.aspectRatio,
          fps: videoSettings.fps,
          showSubtitles: videoSettings.showSubtitles,
          audioBlob: currentMedia.audioBlob || null,
          onProgress: (p) => setRenderProgress(p),
        });
        const srtText = generateSRT(proj.scenes);
        setProjectRuntimeMedia(proj.id, {
          videoBlob: renderResult.blob,
          videoUrl: renderResult.url,
          videoMime: renderResult.mimeType,
          videoExt: renderResult.fileExt,
          videoFormatLabel: renderResult.formatLabel,
          srtText,
        });
        const ver = {
          version: `v${(proj.versions?.length || 0) + 1}.0`,
          createdAt: new Date().toLocaleTimeString(),
          aspectRatio: proj.aspectRatio,
          sizeMB: (renderResult.blob.size / (1024 * 1024)).toFixed(2),
          format: renderResult.formatLabel,
          ext: renderResult.fileExt,
        };
        proj = { ...proj, hasRenderedVideo: true, versions: [ver, ...(proj.versions || [])] };
        proj = await updateProjectStage(proj, 'editing', {
          status: 'Selesai',
          finishedAt: new Date().toLocaleTimeString(),
          outputPreview: `File video nyata berhasil dirender (${ver.sizeMB} MB, ${ver.format}).`,
        });
        setIsRenderingVideo(false);
        updateAgentState(
          'editor',
          'Siap',
          'Render video selesai',
          'Video selesai dirender!',
          `${ver.version} (${ver.sizeMB} MB)`
        );
      }

      // TAHAP 10: QUALITY ASSURANCE
      else if (stageKey === 'qa') {
        const qaRes = await callGeminiText(
          `Lakukan audit Quality Assurance untuk proyek video animasi 3D "${proj.title}". Brief awal: "${proj.brief}". Jumlah adegan: ${proj.scenes?.length || 0}. Rasio: ${proj.aspectRatio}. Audio tersedia: ${Boolean(proj.hasAudio)}. Video dirender: ${Boolean(proj.hasRenderedVideo)}. Berikan laporan evaluasi singkat, skor kelayakan (0-100), dan rekomendasi.`,
          employees.find((e) => e.id === 'qa')?.systemPrompt,
          null,
          backendConfig.proxyUrl
        );
        proj = { ...proj, qaReport: qaRes };
        proj = await updateProjectStage(proj, 'qa', {
          status: 'Selesai',
          finishedAt: new Date().toLocaleTimeString(),
          outputPreview: qaRes.slice(0, 220) + '...',
        });
        updateAgentState(
          'qa',
          'Siap',
          'Audit kualitas selesai',
          'Video lulus pemeriksaan QA!',
          qaRes.slice(0, 120)
        );
      }

      // TAHAP 11: VIDEO FINAL
      else if (stageKey === 'final_video') {
        proj = { ...proj, status: 'Selesai' };
        proj = await updateProjectStage(proj, 'final_video', {
          status: 'Selesai',
          finishedAt: new Date().toLocaleTimeString(),
          outputPreview: 'Master video final disetujui AI Manager dan siap diunduh.',
        });
        updateAgentState('manager', 'Siap', 'Video final siap', 'Master video final siap!');
      }

      // TAHAP 12: PAKET PUBLIKASI MEDIA SOSIAL
      else if (stageKey === 'social_pack') {
        const socialSchema = {
          type: 'OBJECT',
          properties: {
            videoTitle: { type: 'STRING' },
            caption: { type: 'STRING' },
            description: { type: 'STRING' },
            hashtags: { type: 'ARRAY', items: { type: 'STRING' } },
            recommendedPlatforms: { type: 'ARRAY', items: { type: 'STRING' } },
            bestPostingTime: { type: 'STRING' },
            thumbnailIdea: { type: 'STRING' },
          },
          required: [
            'videoTitle',
            'caption',
            'description',
            'hashtags',
            'recommendedPlatforms',
            'bestPostingTime',
            'thumbnailIdea',
          ],
        };

        const socialData = await callGeminiText(
          `Buat paket publikasi media sosial lengkap untuk video animasi 3D berjudul "${proj.title}" (${proj.targetPlatform}, rasio ${proj.aspectRatio}). Ringkasan: ${proj.summary}.`,
          employees.find((e) => e.id === 'social')?.systemPrompt,
          socialSchema,
          backendConfig.proxyUrl
        );
        proj = { ...proj, socialPackage: socialData, status: 'Selesai' };
        proj = await updateProjectStage(proj, 'social_pack', {
          status: 'Selesai',
          finishedAt: new Date().toLocaleTimeString(),
          outputPreview: `Judul: "${socialData.videoTitle}" • Jadwal: ${socialData.bestPostingTime}`,
        });
        updateAgentState(
          'social',
          'Siap',
          'Paket publikasi selesai',
          'Judul, caption & hashtag siap!',
          socialData.videoTitle
        );
      }

      await upsertJobRecord({
        id: jobId,
        projectId: proj.id,
        projectTitle: proj.title,
        stageKey,
        stageName: stageMeta.name,
        agentRole: agentObj?.role || stageMeta.agentId,
        status: 'Selesai',
        createdAt: jobStartMs,
        startedAt: startTime,
        finishedAt: new Date().toLocaleTimeString(),
        durationSec: Math.max(1, Math.round((Date.now() - jobStartMs) / 1000)),
        error: null,
      });

      addLog(stageMeta.name, `Tahap ${stageMeta.name} berhasil diselesaikan.`, 'success');
      return proj;
    } catch (err) {
      setIsRenderingVideo(false);
      await upsertJobRecord({
        id: jobId,
        projectId: proj.id,
        projectTitle: proj.title,
        stageKey,
        stageName: stageMeta.name,
        agentRole: agentObj?.role || stageMeta.agentId,
        status: 'Gagal',
        createdAt: jobStartMs,
        startedAt: startTime,
        finishedAt: new Date().toLocaleTimeString(),
        durationSec: Math.max(1, Math.round((Date.now() - jobStartMs) / 1000)),
        error: err.message,
      });
      proj = await updateProjectStage(proj, stageKey, {
        status: 'Gagal',
        finishedAt: new Date().toLocaleTimeString(),
        error: err.message,
      });
      updateAgentState(
        stageMeta.agentId,
        'Siap',
        `Gagal pada ${stageMeta.name}`,
        `Error: ${err.message.slice(0, 60)}`
      );
      addLog(stageMeta.name, `Gagal: ${err.message}`, 'error');
      showToast(`Tahap ${stageMeta.name} gagal: ${err.message}`, 'error');
      throw err;
    } finally {
      setActiveStageKey(null);
    }
  };

  const handleRunFullPipeline = async (projectToRun = activeProject) => {
    if (!projectToRun || isRunningPipeline) return;
    setIsRunningPipeline(true);
    let current = { ...projectToRun, status: 'Berjalan' };
    await saveProjectToStore(current);
    showToast('Pipeline produksi otomatis 12 tahap dimulai!', 'info');

    try {
      for (const st of PIPELINE_TEMPLATE) {
        if (current.stages?.[st.key]?.status === 'Selesai') continue;
        current = await runSingleStage(current, st.key);
      }
      showToast('Seluruh produksi video selesai & siap diunduh!', 'success');
    } catch (_) {
      // Error sudah ditangani di runSingleStage
    } finally {
      setIsRunningPipeline(false);
    }
  };

  // ==========================================================================
  // PERINTAH REVISI CERDAS KAPAN SAJA
  // ==========================================================================
  const handleRevisionSubmit = async () => {
    if (!activeProject || !revisionInput.trim() || isRunningPipeline) return;
    const revText = revisionInput.trim();
    setRevisionInput('');
    setIsRunningPipeline(true);
    updateAgentState(
      'manager',
      'Bekerja',
      'Menganalisis permintaan revisi Pemilik...',
      'Mengevaluasi dampak revisi...'
    );

    try {
      const revSchema = {
        type: 'OBJECT',
        properties: {
          explanation: { type: 'STRING' },
          newAspectRatio: { type: 'STRING' },
          newVoice: { type: 'STRING' },
          stagesToRerun: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
        },
        required: ['explanation', 'newAspectRatio', 'newVoice', 'stagesToRerun'],
      };

      const analysis = await callGeminiText(
        `Proyek saat ini: "${activeProject.title}" (Rasio: ${activeProject.aspectRatio}, Suara: ${selectedVoice}).\nPermintaan revisi Pemilik: "${revText}".\nTentukan tahapan pipeline yang perlu dijalankan ulang dari daftar key ini saja: ["ideation","script","storyboard","character","scene_gen","animation","voice","editing","qa","final_video","social_pack"]. Pertahankan tahap sebelumnya yang tidak terpengaruh. Jika rasio berubah isi newAspectRatio ("9:16", "16:9", atau "1:1"), jika tidak isi "". Jika suara berubah isi salah satu ("Kore","Puck","Zephyr","Fenrir"), jika tidak isi "".`,
        'Anda adalah AI Manager yang mengelola revisi secara efisien tanpa membuang pekerjaan tahap sebelumnya yang masih valid.',
        revSchema,
        backendConfig.proxyUrl
      );

      let updatedProj = {
        ...activeProject,
        brief: `${activeProject.brief} | Revisi: ${revText}`,
        aspectRatio: ['9:16', '16:9', '1:1'].includes(analysis.newAspectRatio)
          ? analysis.newAspectRatio
          : activeProject.aspectRatio,
      };
      if (['Kore', 'Puck', 'Zephyr', 'Fenrir'].includes(analysis.newVoice)) {
        setSelectedVoice(analysis.newVoice);
      }

      const validKeys = PIPELINE_TEMPLATE.map((s) => s.key);
      const toRerun = (analysis.stagesToRerun || []).filter((k) => validKeys.includes(k));
      const finalQueue = toRerun.length > 0 ? toRerun : ['editing', 'qa', 'final_video'];

      const nextStages = { ...updatedProj.stages };
      finalQueue.forEach((k) => {
        nextStages[k] = {
          ...(nextStages[k] || {}),
          status: 'Menunggu',
          error: null,
        };
      });
      updatedProj.stages = nextStages;
      await saveProjectToStore(updatedProj);

      addLog('Revisi Pemilik', `${analysis.explanation} (Menjalankan ulang: ${finalQueue.join(', ')})`, 'info');
      showToast(`Revisi diproses: ${analysis.explanation}`, 'info');

      for (const k of finalQueue) {
        updatedProj = await runSingleStage(updatedProj, k);
      }
      showToast('Revisi selesai diterapkan!', 'success');
    } catch (err) {
      showToast(`Gagal menerapkan revisi: ${err.message}`, 'error');
    } finally {
      setIsRunningPipeline(false);
      updateAgentState('manager', 'Siap', 'Siap menerima perintah');
    }
  };

  // ==========================================================================
  // CHAT MULTI-AGEN, EDIT ADEGAN STORYBOARD, & UJI INTEGRASI NYATA
  // ==========================================================================
  const handleSendAgentChat = async () => {
    if (!chatMessage.trim() || isSendingChat) return;
    const targetAgent = employees.find((e) => e.id === chatTargetAgentId) || employees[0];
    const userText = chatMessage.trim();
    setChatMessage('');
    setIsSendingChat(true);

    const projId = activeProject?.id || 'general';
    await saveConversationMessage({
      id: `msg-${Date.now()}-u`,
      projectId: projId,
      sender: 'Pemilik',
      role: 'owner',
      targetRole: targetAgent.role,
      text: userText,
      createdAt: Date.now(),
      time: new Date().toLocaleTimeString(),
    });

    updateAgentState(targetAgent.id, 'Bekerja', 'Menjawab pesan pemilik...', 'Menanggapi pesan Anda...');
    try {
      const projectCtx = activeProject
        ? `Konteks Proyek Aktif: "${activeProject.title}". Brief: "${activeProject.brief}". Rasio: ${activeProject.aspectRatio}. Status: ${activeProject.status}. Jumlah adegan: ${activeProject.scenes?.length || 0}.`
        : 'Belum ada proyek aktif.';
      const reply = await callGeminiText(
        `${projectCtx}\nPesan dari Pemilik kepada Anda (${targetAgent.role} - ${targetAgent.name}): "${userText}".\nBerikan jawaban profesional, konkret, dan langsung sesuai jabatan Anda dalam bahasa Indonesia.`,
        targetAgent.systemPrompt,
        null,
        backendConfig.proxyUrl
      );
      await saveConversationMessage({
        id: `msg-${Date.now() + 1}-a`,
        projectId: projId,
        sender: `${targetAgent.name} (${targetAgent.role})`,
        role: targetAgent.id,
        text: reply,
        createdAt: Date.now() + 1,
        time: new Date().toLocaleTimeString(),
      });
      updateAgentState(
        targetAgent.id,
        'Siap',
        'Selesai menjawab pemilik',
        'Jawaban dikirim!',
        reply.slice(0, 120)
      );
    } catch (err) {
      showToast(`Gagal menghubungi ${targetAgent.role}: ${err.message}`, 'error');
      updateAgentState(targetAgent.id, 'Siap', 'Gagal membalas pesan');
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleSaveSceneEdit = async (idx) => {
    if (!activeProject) return;
    const updatedScenes = activeProject.scenes.map((s, i) =>
      i === idx
        ? {
            ...s,
            title: sceneDraft.title,
            narration: sceneDraft.narration,
            visualDescription: sceneDraft.visualDescription,
            duration: Math.max(2, Number(sceneDraft.duration) || 4),
          }
        : s
    );
    await saveProjectToStore({ ...activeProject, scenes: updatedScenes, updatedAt: Date.now() });
    setEditingSceneIdx(null);
    showToast(`Adegan ${idx + 1} diperbarui! Anda dapat merender ulang gambar atau video.`, 'success');
  };

  const handleRegenerateSingleSceneImage = async (idx) => {
    if (!activeProject || regeneratingSceneIdx !== null) return;
    setRegeneratingSceneIdx(idx);
    const sc = activeProject.scenes[idx];
    updateAgentState(
      'storyboard',
      'Bekerja',
      `Merender ulang visual adegan ${idx + 1}...`,
      `Re-render Scene ${idx + 1}...`
    );
    try {
      const charConsistency = activeProject.characterSheet
        ? `Main character: ${activeProject.characterSheet.characterName}, ${activeProject.characterSheet.appearance}, wearing ${activeProject.characterSheet.outfit}.`
        : '';
      const prompt = `3D animated movie cinematic still, Unreal Engine 5 render, ${activeProject.visualStyle}. ${charConsistency} Scene: ${sc.visualDescription}. Camera: ${sc.cameraAngle}. Lighting: ${sc.lighting}. High detail, no text overlays.`;
      const imgUrl = await callGeminiImage(prompt, activeProject.aspectRatio || '9:16');
      const updatedScenes = activeProject.scenes.map((s, i) =>
        i === idx ? { ...s, imageUrl: imgUrl } : s
      );
      await saveProjectToStore({ ...activeProject, scenes: updatedScenes, updatedAt: Date.now() });
      showToast(`Gambar Adegan ${idx + 1} berhasil diperbarui!`, 'success');
    } catch (err) {
      showToast(`Gagal render ulang Adegan ${idx + 1}: ${err.message}`, 'error');
    } finally {
      setRegeneratingSceneIdx(null);
      updateAgentState('storyboard', 'Siap', 'Storyboard siap');
    }
  };

  const handleTestBackendProxy = async () => {
    if (!backendConfig.proxyUrl.trim()) {
      setBackendHealth({
        status: 'Belum Dikonfigurasi',
        checkedAt: new Date().toLocaleTimeString(),
        message: 'Masukkan URL server backend (mis. https://api.domainanda.com).',
      });
      return;
    }
    setBackendHealth({
      status: 'Menguji...',
      checkedAt: new Date().toLocaleTimeString(),
      message: 'Menghubungi endpoint /health...',
    });
    try {
      const url = `${backendConfig.proxyUrl.replace(/\/$/, '')}/health`;
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setBackendHealth({
        status: 'Terhubung',
        checkedAt: new Date().toLocaleTimeString(),
        message: 'Server backend merespons normal (200 OK).',
      });
      showToast('Koneksi Backend Proxy berhasil!', 'success');
    } catch (err) {
      setBackendHealth({
        status: 'Gagal Terhubung',
        checkedAt: new Date().toLocaleTimeString(),
        message: `Tidak dapat menjangkau server: ${err.message}`,
      });
      showToast(`Backend Proxy gagal: ${err.message}`, 'error');
    }
  };

  const handleRunGeminiDiagnostic = async () => {
    setGeminiDiag({
      status: 'Menguji...',
      latencyMs: null,
      message: 'Mengirim ping ke Gemini 3 Flash...',
    });
    const t0 = performance.now();
    try {
      const reply = await callGeminiText(
        'Jawab singkat: OK',
        'Jawab hanya OK',
        null,
        backendConfig.proxyUrl
      );
      const ms = Math.round(performance.now() - t0);
      setGeminiDiag({
        status: 'Aktif & Normal',
        latencyMs: ms,
        message: `Respon diterima (${ms} ms): "${reply.slice(0, 30)}"`,
      });
      showToast(`Diagnostik Gemini berhasil (${ms} ms).`, 'success');
    } catch (err) {
      setGeminiDiag({ status: 'Error', latencyMs: null, message: err.message });
      showToast(`Diagnostik Gemini gagal: ${err.message}`, 'error');
    }
  };

  // ==========================================================================
  // METRIK REAL DASHBOARD (BERASAL DARI STATE / DB NYATA)
  // ==========================================================================
  const dashboardMetrics = useMemo(() => {
    const activeAgents = employees.filter((e) => e.status === 'Bekerja').length;
    const inProgressProjects = projects.filter((p) => p.status === 'Berjalan').length;
    const completedVideos = projects.filter((p) => p.hasRenderedVideo || p.status === 'Selesai').length;
    let failedTasks = 0;
    projects.forEach((p) => {
      Object.values(p.stages || {}).forEach((st) => {
        if (st.status === 'Gagal') failedTasks++;
      });
    });
    const pendingApprovals = projects.filter((p) => p.status === 'Memerlukan Persetujuan');
    return {
      totalProjects: projects.length,
      activeAgents,
      inProgressProjects,
      completedVideos,
      failedTasks,
      pendingApprovals,
    };
  }, [employees, projects]);

  const activeProjectProgress = useMemo(() => {
    if (!activeProject?.stages) return 0;
    const vals = Object.values(activeProject.stages);
    if (!vals.length) return 0;
    const done = vals.filter((s) => s.status === 'Selesai').length;
    return Math.round((done / vals.length) * 100);
  }, [activeProject]);

  const getStatusBadge = (status) => {
    if (status === 'Selesai' || status === 'Siap') {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    }
    if (status === 'Berjalan' || status === 'Bekerja') {
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
    }
    if (status === 'Memerlukan Persetujuan') {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    }
    if (status === 'Gagal') {
      return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
    }
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  // ==========================================================================
  // SIDEBAR NAVIGATION ITEMS (15 MENU PROFESIONAL)
  // ==========================================================================
  const navItems = [
    { id: 'office3d', label: 'Virtual Office 3D', icon: Building2, badge: '3D' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'command', label: 'AI Command Center', icon: Terminal },
    { id: 'pipeline', label: 'Video Production', icon: Clapperboard },
    { id: 'employees', label: 'AI Employees', icon: Users, badge: '10' },
    { id: 'projects', label: 'Projects', icon: FolderKanban, badge: projects.length || null },
    { id: 'storyboard', label: 'Storyboard', icon: Film },
    { id: 'characters', label: 'Character Library', icon: UserCheck },
    { id: 'assets', label: 'Asset Library', icon: Box },
    { id: 'studio', label: 'Video Editor', icon: Video },
    { id: 'delivery', label: 'Final Deliveries', icon: PackageCheck },
    { id: 'social', label: 'Social Media Planner', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'integrations', label: 'Integrations & API', icon: Plug },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // ==========================================================================
  // RENDER HALAMAN KONTEN BERDASARKAN MENU AKTIF
  // ==========================================================================
  const renderMainContent = () => {
    switch (activeMenu) {
      // 1. VIRTUAL OFFICE 3D (HALAMAN UTAMA)
      case 'office3d': {
        const activeStageMeta = PIPELINE_TEMPLATE.find((s) => s.key === activeStageKey);
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              {/* Viewport 3D Utama */}
              <div className="xl:col-span-3">
                <VirtualOffice3D
                  employees={employees}
                  selectedEmployeeId={selectedEmployeeId}
                  onSelectEmployee={(id) => setSelectedEmployeeId(id)}
                  activeStageName={activeStageMeta?.name}
                  onNavigateView={(view) => setActiveMenu(view)}
                />
              </div>

              {/* Panel Inspektor Karyawan AI Terpilih */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
                        {selectedEmployee.zone}
                      </span>
                      <h3 className="text-base font-bold text-white">{selectedEmployee.name}</h3>
                      <p className="text-xs text-slate-400">{selectedEmployee.role}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        selectedEmployee.status
                      )}`}
                    >
                      {selectedEmployee.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Tugas Saat Ini
                    </div>
                    <p className="text-xs text-cyan-200">{selectedEmployee.currentTask}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Hasil Pekerjaan Terakhir
                    </div>
                    <p className="text-xs text-slate-300">{selectedEmployee.lastOutput}</p>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1.5">
                      Kemampuan Utama
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEmployee.skills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setChatTargetAgentId(selectedEmployee.id);
                      setActiveMenu('command');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Beri Arahan ke {selectedEmployee.shortRole}
                  </button>
                  <button
                    onClick={() => setActiveMenu('pipeline')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5"
                  >
                    <Clapperboard className="w-3.5 h-3.5" />
                    Lihat Pipeline Produksi ({activeProjectProgress}%)
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Owner Command Bar di Bawah Kantor 3D */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs shrink-0">
                <Sparkles className="w-4 h-4" />
                PERINTAH CEPAT PEMILIK:
              </div>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProjectFromCommand()}
                placeholder='Contoh: "Buat video animasi 3D 30 detik tentang robot ramah membantu petani masa depan, narasi Indonesia, rasio 9:16"'
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleCreateProjectFromCommand()}
                disabled={isPlanning || !commandInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-40 shrink-0"
              >
                {isPlanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Kirim ke AI Manager
              </button>
            </div>
          </div>
        );
      }

      // 2. DASHBOARD PROFESIONAL
      case 'dashboard':
        return (
          <div className="space-y-5">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              {[
                { label: 'Total Proyek', value: dashboardMetrics.totalProjects, color: 'text-cyan-400' },
                { label: 'Agen Sedang Bekerja', value: `${dashboardMetrics.activeAgents} / 10`, color: 'text-emerald-400' },
                { label: 'Proyek Diproses', value: dashboardMetrics.inProgressProjects, color: 'text-purple-400' },
                { label: 'Video Selesai', value: dashboardMetrics.completedVideos, color: 'text-blue-400' },
                { label: 'Tugas Gagal', value: dashboardMetrics.failedTasks, color: 'text-rose-400' },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 space-y-1"
                >
                  <div className="text-[11px] text-slate-400">{m.label}</div>
                  <div className={`text-2xl font-extrabold ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Progres Proyek Aktif & Persetujuan */}
              <div className="lg:col-span-2 bg-slate-900/85 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Progres Produksi Proyek Aktif</h3>
                  <button
                    onClick={() => setActiveMenu('command')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    + Instruksi Baru
                  </button>
                </div>

                {!activeProject ? (
                  <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-400">
                      Belum ada proyek produksi yang dibuat. Berikan instruksi pertama Anda di AI Command Center.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{activeProject.title}</h4>
                        <p className="text-xs text-slate-400">{activeProject.summary}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          activeProject.status
                        )}`}
                      >
                        {activeProject.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Kelengkapan Pipeline 12 Tahap</span>
                        <span className="text-cyan-400 font-bold">{activeProjectProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${activeProjectProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => handleRunFullPipeline(activeProject)}
                        disabled={isRunningPipeline}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <Play className="w-3.5 h-3.5" />
                        {activeProject.status === 'Memerlukan Persetujuan'
                          ? 'Setujui & Jalankan Semua'
                          : 'Lanjutkan Pipeline'}
                      </button>
                      <button
                        onClick={() => setActiveMenu('pipeline')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
                      >
                        Detail Tahapan
                      </button>
                    </div>
                  </div>
                )}

                {/* Daftar Persetujuan Pemilik */}
                {dashboardMetrics.pendingApprovals.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-amber-300 uppercase">
                      Memerlukan Persetujuan Pemilik ({dashboardMetrics.pendingApprovals.length})
                    </h4>
                    {dashboardMetrics.pendingApprovals.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/30 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{p.title}</div>
                          <div className="text-slate-400 text-[11px]">
                            Rasio {p.aspectRatio} • {p.targetPlatform}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveProjectId(p.id);
                            handleRunFullPipeline(p);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs"
                        >
                          Setujui & Produksi
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Log Aktivitas Real-Time */}
              <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-3">Aktivitas Studio Terakhir</h3>
                <div className="flex-1 max-h-80 overflow-y-auto space-y-2 pr-1">
                  {activityLogs.length === 0 ? (
                    <p className="text-xs text-slate-500">Belum ada aktivitas produksi tercatat.</p>
                  ) : (
                    activityLogs.map((lg) => (
                      <div
                        key={lg.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]"
                      >
                        <div className="flex justify-between text-slate-500 mb-0.5">
                          <span className="font-bold text-cyan-400">{lg.stage}</span>
                          <span>{lg.time}</span>
                        </div>
                        <p className="text-slate-300">{lg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      // 3. AI COMMAND CENTER
      case 'command':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Input Perintah Baru */}
              <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Command Center Pemilik — Instruksi Bahasa Alami
                </h2>
                <textarea
                  rows={3}
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Contoh: Buat video animasi 3D berdurasi 60 detik tentang robot yang membantu manusia di masa depan. Gunakan gaya sinematik, karakter konsisten, narasi bahasa Indonesia, dan format vertikal 9:16 untuk TikTok."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Video 3D 30 detik robot membantu manusia di kota futuristik, 9:16 TikTok, narasi Indonesia',
                      'Animasi 3D edukasi eksplorasi planet Mars untuk YouTube 16:9, gaya sinematik',
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCommandInput(preset)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                      >
                        Template #{idx + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCreateProjectFromCommand()}
                    disabled={isPlanning || !commandInput.trim()}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 disabled:opacity-40"
                  >
                    {isPlanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Analisis & Buat Rencana
                  </button>
                </div>
              </div>

              {/* Rencana Produksi AI Manager */}
              {activeProject && (
                <div className="bg-slate-900/85 border border-cyan-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-cyan-400">
                        Rencana Produksi AI Manager
                      </span>
                      <h3 className="text-base font-bold text-white">{activeProject.title}</h3>
                      <p className="text-xs text-slate-300 mt-1">{activeProject.summary}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                        activeProject.status
                      )}`}
                    >
                      {activeProject.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Rasio</span>
                      <strong className="text-white">{activeProject.aspectRatio}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Platform</span>
                      <strong className="text-white">{activeProject.targetPlatform}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Gaya Visual</span>
                      <strong className="text-white truncate block">{activeProject.visualStyle}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Progres</span>
                      <strong className="text-cyan-400">{activeProjectProgress}%</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleRunFullPipeline(activeProject)}
                      disabled={isRunningPipeline}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 disabled:opacity-40"
                    >
                      {isRunningPipeline ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Setujui & Jalankan Seluruh Pipeline (12 Tahap)
                    </button>
                    <button
                      onClick={() => setActiveMenu('pipeline')}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                    >
                      Buka Monitor Pipeline
                    </button>
                  </div>
                </div>
              )}

              {/* Kotak Perintah Revisi Cerdas */}
              {activeProject && (
                <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-purple-400" />
                    Perintah Revisi Cerdas (Kapan Saja)
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    AI Manager akan menentukan agen yang bertanggung jawab dan mempertahankan tahap sebelumnya yang tidak perlu diubah.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={revisionInput}
                      onChange={(e) => setRevisionInput(e.target.value)}
                      placeholder="Contoh: Ubah narasi menjadi suara laki-laki (Puck), atau ubah rasio menjadi 16:9..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleRevisionSubmit}
                      disabled={isRunningPipeline || !revisionInput.trim()}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs disabled:opacity-50"
                    >
                      Terapkan Revisi
                    </button>
                  </div>
                </div>
              )}

              {/* Ruang Diskusi Multi-Agen Persisten */}
              <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    Ruang Diskusi Multi-Agen (Tersimpan di Database)
                  </h3>
                  <select
                    value={chatTargetAgentId}
                    onChange={(e) => setChatTargetAgentId(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        Kirim ke: {e.role} ({e.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 max-h-60 overflow-y-auto space-y-2.5">
                  {conversations.filter(
                    (c) => !activeProject || c.projectId === activeProject.id || c.projectId === 'general'
                  ).length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">
                      Belum ada riwayat percakapan. Kirim pertanyaan atau arahan langsung ke AI Manager atau karyawan AI lainnya.
                    </p>
                  ) : (
                    conversations
                      .filter(
                        (c) =>
                          !activeProject || c.projectId === activeProject.id || c.projectId === 'general'
                      )
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2.5 rounded-xl text-xs ${
                            msg.role === 'owner'
                              ? 'bg-cyan-950/50 border border-cyan-500/30 ml-8 text-cyan-50'
                              : 'bg-slate-900 border border-slate-800 mr-8 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="font-bold text-cyan-400">{msg.sender}</span>
                            <span className="text-slate-500">{msg.time}</span>
                          </div>
                          <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                        </div>
                      ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAgentChat()}
                    placeholder="Tulis pesan untuk agen yang dipilih..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleSendAgentChat}
                    disabled={isSendingChat || !chatMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {isSendingChat ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Kirim
                  </button>
                </div>
              </div>
            </div>

            {/* Panel Samping: Status Koordinasi Agen */}
            <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Status 10 Karyawan AI
              </h3>
              <div className="space-y-2">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => {
                      setSelectedEmployeeId(emp.id);
                      setChatTargetAgentId(emp.id);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{emp.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{emp.shortRole}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${getStatusBadge(
                        emp.status
                      )}`}
                    >
                      {emp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // 4. VIDEO PRODUCTION PIPELINE (12 TAHAP + PERSISTENT JOB QUEUE)
      case 'pipeline':
        return (
          <div className="space-y-4">
            <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">
                  Pipeline Produksi Video Otomatis (12 Tahap)
                </h2>
                <p className="text-xs text-slate-400">
                  {activeProject
                    ? `Proyek Aktif: ${activeProject.title} (${activeProjectProgress}% Selesai)`
                    : 'Pilih atau buat proyek terlebih dahulu'}
                </p>
              </div>
              {activeProject && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRunFullPipeline(activeProject)}
                    disabled={isRunningPipeline}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {isRunningPipeline ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    Jalankan Semua Tahap Tersisa
                  </button>
                </div>
              )}
            </div>

            {/* Monitor Antrean Pekerjaan Persisten */}
            {jobQueue.length > 0 && (
              <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                    <ListOrdered className="w-4 h-4 text-cyan-400" />
                    Antrean Pekerjaan Persisten ({jobQueue.length} Job Tercatat)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Aktif: {jobQueue.filter((j) => j.status === 'Berjalan').length} • Selesai:{' '}
                    {jobQueue.filter((j) => j.status === 'Selesai').length} • Gagal:{' '}
                    {jobQueue.filter((j) => j.status === 'Gagal').length}
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {jobQueue.slice(0, 8).map((j) => (
                    <div
                      key={j.id}
                      className="min-w-[210px] p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] shrink-0"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white truncate max-w-[120px]">
                          {j.stageName}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] border ${getStatusBadge(
                            j.status
                          )}`}
                        >
                          {j.status}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[10px] truncate">
                        {j.agentRole} • {j.startedAt}
                      </div>
                      {j.durationSec && (
                        <div className="text-cyan-400 text-[10px]">Durasi: {j.durationSec} detik</div>
                      )}
                      {j.error && (
                        <div className="text-rose-400 text-[10px] truncate">Err: {j.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!activeProject ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                Belum ada proyek aktif. Silakan buat perintah baru di AI Command Center.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {PIPELINE_TEMPLATE.map((st) => {
                  const stData = activeProject.stages?.[st.key] || { status: 'Menunggu' };
                  const agent = employees.find((e) => e.id === st.agentId);
                  return (
                    <div
                      key={st.key}
                      className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-white">{st.name}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                              stData.status
                            )}`}
                          >
                            {stData.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{st.desc}</p>
                        <div className="text-[11px] text-cyan-300">
                          PIC: {agent?.name} ({agent?.shortRole})
                        </div>

                        {stData.outputPreview && (
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                            {stData.outputPreview}
                          </div>
                        )}
                        {stData.error && (
                          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-300">
                            Error: {stData.error}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                        <span>
                          {stData.startedAt ? `Mulai: ${stData.startedAt}` : 'Belum dimulai'}
                          {stData.finishedAt ? ` • Selesai: ${stData.finishedAt}` : ''}
                        </span>
                        <button
                          onClick={async () => {
                            try {
                              await runSingleStage(activeProject, st.key);
                            } catch (_) {}
                          }}
                          disabled={isRunningPipeline}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white font-semibold text-[11px] transition disabled:opacity-40"
                        >
                          {stData.status === 'Gagal'
                            ? 'Coba Ulang'
                            : stData.status === 'Selesai'
                            ? 'Jalankan Ulang'
                            : 'Jalankan Tahap'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      // 5. AI EMPLOYEES DIRECTORY
      case 'employees':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-cyan-400">{emp.zone}</span>
                      <h3 className="text-sm font-bold text-white">{emp.name}</h3>
                      <p className="text-xs text-slate-400">{emp.role}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        emp.status
                      )}`}
                    >
                      {emp.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 italic">"{emp.personality}"</p>
                  <ul className="space-y-1 text-[11px] text-slate-400 list-disc pl-4">
                    {emp.responsibilities.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedEmployeeId(emp.id);
                      setActiveMenu('office3d');
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium"
                  >
                    Lihat di Kantor 3D
                  </button>
                  <button
                    onClick={() => {
                      setChatTargetAgentId(emp.id);
                      setActiveMenu('command');
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-xs text-cyan-300 font-semibold"
                  >
                    Diskusi Langsung
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      // 6. STORYBOARD & INLINE SCENE EDITOR
      case 'storyboard':
        return (
          <div className="space-y-4">
            <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Storyboard & Naskah Adegan</h2>
                <p className="text-xs text-slate-400">
                  Edit dialog, durasi, deskripsi visual, atau render ulang gambar per adegan secara satuan.
                </p>
              </div>
              {activeProject && (
                <button
                  onClick={async () => {
                    try {
                      await runSingleStage(activeProject, 'storyboard');
                    } catch (_) {}
                  }}
                  disabled={isRunningPipeline || !activeProject.scenes?.length}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Generate Semua Frame Storyboard
                </button>
              )}
            </div>

            {!activeProject || !activeProject.scenes?.length ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                Belum ada adegan naskah. Jalankan tahap Penulisan Naskah terlebih dahulu.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProject.scenes.map((sc, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/85 border border-slate-800 rounded-2xl overflow-hidden flex flex-col"
                  >
                    <div className="relative h-56 bg-slate-950 flex items-center justify-center">
                      {sc.imageUrl ? (
                        <img
                          src={sc.imageUrl}
                          alt={sc.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-xs text-slate-500 p-4">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                          Frame visual belum dirender
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/85 text-cyan-400 text-[11px] font-bold border border-slate-700">
                        Adegan {sc.sceneNumber || idx + 1} • {sc.duration}s
                      </span>
                      <button
                        onClick={() => handleRegenerateSingleSceneImage(idx)}
                        disabled={regeneratingSceneIdx !== null}
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/85 hover:bg-pink-600 text-white text-[11px] font-semibold border border-slate-700 flex items-center gap-1 transition disabled:opacity-50"
                      >
                        {regeneratingSceneIdx === idx ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Render Ulang Visual
                      </button>
                    </div>

                    <div className="p-4 space-y-2 text-xs">
                      {editingSceneIdx === idx ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={sceneDraft.title}
                            onChange={(e) =>
                              setSceneDraft((d) => ({ ...d, title: e.target.value }))
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                            placeholder="Judul Adegan"
                          />
                          <textarea
                            rows={2}
                            value={sceneDraft.narration}
                            onChange={(e) =>
                              setSceneDraft((d) => ({ ...d, narration: e.target.value }))
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-200 text-xs"
                            placeholder="Narasi / Subtitle"
                          />
                          <textarea
                            rows={2}
                            value={sceneDraft.visualDescription}
                            onChange={(e) =>
                              setSceneDraft((d) => ({ ...d, visualDescription: e.target.value }))
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs"
                            placeholder="Deskripsi Visual 3D"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-slate-400 flex items-center gap-1.5">
                              Durasi (detik):
                              <input
                                type="number"
                                min={2}
                                max={20}
                                value={sceneDraft.duration}
                                onChange={(e) =>
                                  setSceneDraft((d) => ({ ...d, duration: e.target.value }))
                                }
                                className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
                              />
                            </label>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setEditingSceneIdx(null)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => handleSaveSceneEdit(idx)}
                                className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" /> Simpan
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-white text-sm">{sc.title}</h3>
                            <button
                              onClick={() => {
                                setEditingSceneIdx(idx);
                                setSceneDraft({
                                  title: sc.title || '',
                                  narration: sc.narration || '',
                                  visualDescription: sc.visualDescription || '',
                                  duration: sc.duration || 5,
                                });
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" /> Edit Adegan
                            </button>
                          </div>
                          <p className="text-cyan-200 bg-cyan-950/40 border border-cyan-500/20 p-2.5 rounded-xl">
                            "{sc.narration}"
                          </p>
                          <p className="text-slate-400">
                            <strong className="text-slate-300">Visual:</strong> {sc.visualDescription}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                            <span className="px-2 py-0.5 bg-slate-800 rounded-md">
                              Kamera: {sc.cameraAngle}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-800 rounded-md">
                              Pencahayaan: {sc.lighting}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // 7. CHARACTER LIBRARY
      case 'characters':
        return (
          <div className="space-y-4">
            <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Pustaka Karakter 3D Konsisten</h2>
                <p className="text-xs text-slate-400">
                  Spesifikasi karakter terkunci oleh AI 3D Character Designer agar konsisten di seluruh adegan.
                </p>
              </div>
              {activeProject && (
                <button
                  onClick={async () => {
                    try {
                      await runSingleStage(activeProject, 'character');
                    } catch (_) {}
                  }}
                  disabled={isRunningPipeline}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Generate / Perbarui Karakter
                </button>
              )}
            </div>

            {!activeProject?.characterSheet ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                Belum ada Character Sheet pada proyek aktif. Jalankan tahap Desain Karakter & Aset.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-900/85 border border-slate-800 rounded-2xl p-5">
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center min-h-[260px]">
                  {activeProject.characterSheet.referenceImageUrl ? (
                    <img
                      src={activeProject.characterSheet.referenceImageUrl}
                      alt={activeProject.characterSheet.characterName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCheck className="w-12 h-12 text-slate-600" />
                  )}
                </div>
                <div className="md:col-span-2 space-y-3 text-xs">
                  <h3 className="text-lg font-bold text-white">
                    {activeProject.characterSheet.characterName}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Peran Cerita</span>
                      <span className="text-slate-200">{activeProject.characterSheet.roleInStory}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Kostum & Material</span>
                      <span className="text-slate-200">{activeProject.characterSheet.outfit}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Penampilan Fisik</span>
                      <span className="text-slate-200">{activeProject.characterSheet.appearance}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Properti Khas</span>
                      <span className="text-slate-200">{activeProject.characterSheet.signatureProps}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200">
                    <strong>Aturan Konsistensi:</strong> {activeProject.characterSheet.consistencyRules}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      // 8. VIDEO STUDIO (EDITOR & RENDERER NYATA)
      case 'studio':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Preview Player & Multi-Track Timeline */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Video className="w-4 h-4 text-cyan-400" />
                    Video Studio — Preview & Master Render
                  </h3>
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700">
                    Engine: {activeMedia.videoFormatLabel || 'Browser Canvas + Audio Compositor (MP4/WebM Auto)'}
                  </span>
                </div>

                <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
                  {activeMedia.videoUrl ? (
                    <video
                      src={activeMedia.videoUrl}
                      controls
                      className="max-h-full max-w-full rounded-lg"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <Clapperboard className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">
                        Belum ada file video dirender. Klik tombol "Render Video Final" di panel kanan.
                      </p>
                    </div>
                  )}
                </div>

                {isRenderingVideo && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-cyan-300">Sedang merender frame & audio...</span>
                      <span className="font-bold text-white">{renderProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all"
                        style={{ width: `${renderProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Multi-Track Timeline Visual */}
                <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="font-bold text-slate-400 uppercase">Timeline Multi-Track</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex gap-1.5 overflow-x-auto">
                    {(activeProject?.scenes || []).map((sc, i) => (
                      <div
                        key={i}
                        className="min-w-[110px] p-2 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-200 shrink-0"
                      >
                        <div className="font-bold">Clip #{i + 1}</div>
                        <div className="text-[10px] text-slate-400">{sc.duration} detik</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-amber-300 font-semibold">
                      Track Audio Voice-Over ({selectedVoice}):
                    </span>
                    {activeMedia.audioUrl ? (
                      <audio src={activeMedia.audioUrl} controls className="h-7 max-w-[240px]" />
                    ) : (
                      <span className="text-slate-500">Belum digenerate</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Panel Pengaturan Ekspor & Aksi Render */}
            <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">Pengaturan Ekspor & Render</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 block mb-1">Rasio Aspek</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['9:16', '16:9', '1:1'].map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setVideoSettings((v) => ({ ...v, aspectRatio: r }));
                          if (activeProject) saveProjectToStore({ ...activeProject, aspectRatio: r });
                        }}
                        className={`py-1.5 rounded-lg font-bold border ${
                          (activeProject?.aspectRatio || videoSettings.aspectRatio) === r
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Frame Rate (FPS)</label>
                  <select
                    value={videoSettings.fps}
                    onChange={(e) =>
                      setVideoSettings((v) => ({ ...v, fps: Number(e.target.value) }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value={24}>24 FPS (Sinematik)</option>
                    <option value={30}>30 FPS (Standar Sosial Media)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Karakter Suara Narasi (TTS)</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Kore">Kore (Perempuan Jernih & Profesional)</option>
                    <option value="Puck">Puck (Laki-laki Enerjik)</option>
                    <option value="Zephyr">Zephyr (Perempuan Hangat)</option>
                    <option value="Fenrir">Fenrir (Laki-laki Berat & Sinematik)</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoSettings.showSubtitles}
                    onChange={(e) =>
                      setVideoSettings((v) => ({ ...v, showSubtitles: e.target.checked }))
                    }
                    className="rounded border-slate-700"
                  />
                  Tampilkan Subtitle Bahasa Indonesia di Video
                </label>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={async () => {
                    if (!activeProject)
                      return showToast('Pilih atau buat proyek terlebih dahulu.', 'error');
                    try {
                      await runSingleStage(activeProject, 'voice');
                    } catch (_) {}
                  }}
                  disabled={isRunningPipeline || !activeProject?.scenes?.length}
                  className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Generate / Ganti Suara TTS ({selectedVoice})
                </button>

                <button
                  onClick={async () => {
                    if (!activeProject)
                      return showToast('Pilih atau buat proyek terlebih dahulu.', 'error');
                    try {
                      await runSingleStage(activeProject, 'editing');
                    } catch (_) {}
                  }}
                  disabled={isRunningPipeline || isRenderingVideo || !activeProject?.scenes?.length}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isRenderingVideo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Clapperboard className="w-4 h-4" />
                  )}
                  Render Video Final Sekarang
                </button>

                <button
                  onClick={() =>
                    downloadBlob(
                      activeMedia.videoUrl,
                      `${activeProject?.title || 'video-3d'}.${activeMedia.videoExt || 'webm'}`
                    )
                  }
                  disabled={!activeMedia.videoUrl}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  Unduh Video (.{(activeMedia.videoExt || 'webm').toUpperCase()})
                </button>
              </div>
            </div>
          </div>
        );

      // 9. FINAL DELIVERIES & PAKET PUBLIKASI
      case 'delivery':
        return (
          <div className="space-y-5">
            {!activeProject ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                Belum ada proyek aktif.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Master Video & Unduhan Aset</h3>
                  <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                    {activeMedia.videoUrl ? (
                      <video
                        src={activeMedia.videoUrl}
                        controls
                        className="max-h-full max-w-full"
                      />
                    ) : (
                      <span className="text-xs text-slate-500">
                        Video belum dirender. Buka Video Studio untuk merender.
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() =>
                        downloadBlob(
                          activeMedia.videoUrl,
                          `${activeProject.title}.${activeMedia.videoExt || 'webm'}`
                        )
                      }
                      disabled={!activeMedia.videoUrl}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <Download className="w-4 h-4" />
                      Unduh Video (.{(activeMedia.videoExt || 'webm').toUpperCase()})
                    </button>

                    <button
                      onClick={() => {
                        const srt = activeMedia.srtText || generateSRT(activeProject.scenes || []);
                        const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
                        downloadBlob(URL.createObjectURL(blob), `${activeProject.title}.srt`);
                      }}
                      disabled={!activeProject.scenes?.length}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <Subtitles className="w-4 h-4" />
                      Unduh Subtitle (.SRT)
                    </button>
                  </div>

                  {activeProject.qaReport && (
                    <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Laporan Quality Assurance (Clara Gunawan)
                      </div>
                      <p className="text-slate-300 text-[11px] whitespace-pre-line">
                        {activeProject.qaReport}
                      </p>
                    </div>
                  )}
                </div>

                {/* Paket Publikasi Media Sosial */}
                <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Paket Publikasi Media Sosial</h3>
                    <button
                      onClick={async () => {
                        try {
                          await runSingleStage(activeProject, 'social_pack');
                        } catch (_) {}
                      }}
                      disabled={isRunningPipeline}
                      className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold text-[11px]"
                    >
                      Generate Metadata
                    </button>
                  </div>

                  {!activeProject.socialPackage ? (
                    <p className="text-slate-400">
                      Paket metadata belum dibuat. Klik "Generate Metadata" atau jalankan Tahap 12.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">Judul Video</span>
                        <strong className="text-white text-sm">
                          {activeProject.socialPackage.videoTitle}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">Caption</span>
                        <p className="text-slate-200">{activeProject.socialPackage.caption}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block mb-1">Hashtag</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(activeProject.socialPackage.hashtags || []).map((h, i) => (
                            <span key={i} className="text-cyan-400">
                              {h.startsWith('#') ? h : `#${h}`}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Rekomendasi Waktu Unggah:</span>
                        <strong className="text-amber-300">
                          {activeProject.socialPackage.bestPostingTime}
                        </strong>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col gap-2">
                    {activeProject.socialPackage && (
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${activeProject.socialPackage.videoTitle}\n\n${
                              activeProject.socialPackage.caption
                            }\n\n${(activeProject.socialPackage.hashtags || [])
                              .map((h) => (h.startsWith('#') ? h : `#${h}`))
                              .join(' ')}`,
                            'Judul, Caption & Hashtag'
                          )
                        }
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Salin Judul, Caption & Hashtag
                      </button>
                    )}
                    <button
                      onClick={() => setPublishModalOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Minta Persetujuan & Publikasikan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      // 10. INTEGRATIONS & API
      case 'integrations':
        return (
          <div className="space-y-5">
            <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    Konfigurasi Backend Aman & Diagnostik API
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    API Key rahasia tidak pernah disimpan di frontend. Anda dapat menggunakan Runtime Gemini bawaan atau menghubungkan server Node.js Backend Proxy milik Anda sendiri.
                  </p>
                </div>
                <button
                  onClick={handleRunGeminiDiagnostic}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  Uji Koneksi Gemini API
                </button>
              </div>

              {geminiDiag.status !== 'Belum Diuji' && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-300">
                    Diagnostik Gemini 3 Flash:{' '}
                    <strong className="text-cyan-300">{geminiDiag.message}</strong>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      geminiDiag.status === 'Error'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {geminiDiag.status}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="font-bold text-white block">
                    URL Backend Proxy Aman (Opsional)
                  </label>
                  <input
                    type="url"
                    value={backendConfig.proxyUrl}
                    onChange={(e) =>
                      setBackendConfig((c) => ({ ...c, proxyUrl: e.target.value }))
                    }
                    placeholder="https://api.studio-anda.com (kosongkan untuk Runtime Gemini)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      Status: <strong className="text-amber-300">{backendHealth.status}</strong>
                    </span>
                    <button
                      onClick={handleTestBackendProxy}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
                    >
                      Test /health
                    </button>
                  </div>
                  {backendHealth.message && (
                    <p className="text-[10px] text-slate-400">{backendHealth.message}</p>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="font-bold text-white block">
                    URL Blender / FFmpeg Render Worker (Jalur B)
                  </label>
                  <input
                    type="url"
                    value={backendConfig.blenderWorkerUrl}
                    onChange={(e) =>
                      setBackendConfig((c) => ({ ...c, blenderWorkerUrl: e.target.value }))
                    }
                    placeholder="Belum dikonfigurasi (contoh: https://render.studio-anda.com)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400">
                    Jika kosong, mesin rendering otomatis menggunakan{' '}
                    <strong>Browser Canvas + Audio Compositor</strong> yang aktif secara lokal.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTEGRATION_ADAPTERS.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-slate-900/85 border border-slate-800 rounded-2xl p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-cyan-400 uppercase font-bold">
                        {ad.category}
                      </span>
                      <h3 className="text-sm font-bold text-white">{ad.name}</h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        ad.builtIn
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {ad.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{ad.details}</p>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                    <strong className="text-slate-300">Panduan Setup:</strong> {ad.setupGuide}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // 11. PROJECTS
      case 'projects':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Daftar Proyek ({projects.length})</h2>
              <button
                onClick={() => setActiveMenu('command')}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                + Proyek Baru
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    setActiveMenu('pipeline');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    p.id === activeProjectId
                      ? 'bg-cyan-950/30 border-cyan-500/60'
                      : 'bg-slate-900/85 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <h3 className="text-sm font-bold text-white truncate">{p.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadge(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmProjectId(p.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50"
                        title="Hapus Proyek"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.brief}</p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>Rasio: {p.aspectRatio}</span>
                    <span>Platform: {p.targetPlatform}</span>
                    <span>Adegan: {p.scenes?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // 12. ASSET LIBRARY
      case 'assets':
        return (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Pustaka Aset Produksi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {(activeProject?.scenes || []).map((sc, i) => (
                <div
                  key={i}
                  className="bg-slate-900/85 border border-slate-800 rounded-2xl overflow-hidden"
                >
                  <div className="h-40 bg-slate-950 flex items-center justify-center">
                    {sc.imageUrl ? (
                      <img src={sc.imageUrl} alt={sc.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-600">Belum ada gambar</span>
                    )}
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-bold text-white truncate">Frame Adegan #{i + 1}</span>
                    {sc.imageUrl && (
                      <button
                        onClick={() => downloadBlob(sc.imageUrl, `scene-${i + 1}.png`)}
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> PNG
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // 13. SOCIAL MEDIA PLANNER
      case 'social':
        return (
          <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            <h2 className="text-base font-bold text-white">Kalender & Strategi Publikasi Media Sosial</h2>
            {activeProject?.socialPackage ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-cyan-400 font-bold">
                    {activeProject.socialPackage.videoTitle}
                  </div>
                  <p className="text-slate-300">{activeProject.socialPackage.description}</p>
                  <div className="text-amber-300 pt-1">
                    Waktu Tayang Optimal: {activeProject.socialPackage.bestPostingTime}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">
                Jalankan Tahap 12 (Paket Publikasi) untuk menyusun strategi jadwal tayang otomatis.
              </p>
            )}
          </div>
        );

      // 14. REPORTS
      case 'reports':
        return (
          <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            <h2 className="text-base font-bold text-white">Laporan Audit & Kinerja Produksi</h2>
            <p className="text-slate-400">
              Total Job Dieksekusi: <strong className="text-white">{jobQueue.length}</strong> •
              Berhasil:{' '}
              <strong className="text-emerald-400">
                {jobQueue.filter((j) => j.status === 'Selesai').length}
              </strong>{' '}
              • Gagal:{' '}
              <strong className="text-rose-400">
                {jobQueue.filter((j) => j.status === 'Gagal').length}
              </strong>
            </p>
            {activeProject?.qaReport && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 whitespace-pre-line text-slate-300">
                {activeProject.qaReport}
              </div>
            )}
          </div>
        );

      // 15. SETTINGS
      case 'settings':
      default:
        return (
          <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            <h2 className="text-base font-bold text-white">Pengaturan Sistem & Keamanan Studio</h2>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400">Status Penyimpanan Database</div>
              <div className="text-emerald-400 font-bold">{dbStatus}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400">Keamanan API & Persetujuan Pemilik</div>
              <div className="text-slate-200">
                Kunci API tidak pernah ditulis ke kode frontend. Setiap publikasi media sosial mewajibkan konfirmasi eksplisit Pemilik.
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Sidebar Navigasi Profesional */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-slate-950 font-black">
              3D
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white">
                AI AGENT OFFICE
              </div>
              <div className="text-[10px] text-cyan-400 font-semibold">
                Virtual Production Studio
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </span>
                {item.badge !== undefined && item.badge !== null && (
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-cyan-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {dbStatus}
          </div>
          <div>Role: Pemilik Studio (Owner)</div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header + Mode Switcher */}
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
            >
              <Layers className="w-4 h-4" />
            </button>
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {[
                { id: 'office3d', label: '1. Kantor 3D' },
                { id: 'dashboard', label: '2. Dashboard' },
                { id: 'studio', label: '3. Produksi Video' },
                { id: 'employees', label: '4. Karyawan AI' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMenu(m.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    activeMenu === m.id
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {activeProject && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 max-w-[240px] truncate">
                <FolderKanban className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                {activeProject.title}
              </span>
            )}
            <button
              onClick={() => setActiveMenu('command')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              Command Center
            </button>
          </div>
        </header>

        {/* Workspace Content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">{renderMainContent()}</main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm px-4 py-3 rounded-2xl bg-slate-900 border border-cyan-500/50 text-xs text-white shadow-2xl flex items-center gap-2.5">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Proyek */}
      {deleteConfirmProjectId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              Hapus Proyek?
            </h3>
            <p className="text-xs text-slate-300">
              Proyek yang dihapus akan hilang dari daftar dan database proyek Anda. Lanjutkan?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmProjectId(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteProject(deleteConfirmProjectId)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Persetujuan Publikasi Pemilik (Pengganti confirm/alert) */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Konfirmasi Persetujuan Publikasi Pemilik
            </h3>
            <p className="text-slate-300 leading-relaxed">
              API unggah langsung ke YouTube / TikTok / Instagram saat ini berstatus{' '}
              <strong className="text-amber-300">Belum Dikonfigurasi (OAuth 2.0 diperlukan)</strong>.
              Dengan menyetujui paket rilis ini, sistem akan mengunduh file video final dan menyalin metadata ke clipboard Anda untuk unggah manual yang aman.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPublishModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (activeMedia.videoUrl) {
                    downloadBlob(
                      activeMedia.videoUrl,
                      `${activeProject?.title || 'video'}.${activeMedia.videoExt || 'webm'}`
                    );
                  }
                  if (activeProject?.socialPackage) {
                    copyToClipboard(
                      `${activeProject.socialPackage.videoTitle}\n\n${activeProject.socialPackage.caption}`,
                      'Paket Publikasi'
                    );
                  }
                  setPublishModalOpen(false);
                  showToast('Paket publikasi final disetujui & diunduh!', 'success');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold"
              >
                Setujui & Unduh Paket Rilis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}