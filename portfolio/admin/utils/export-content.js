/**
 * Export Content - Shared content source for the PDF and DOCX exporters.
 *
 * Single source of truth for:
 *  - getLabels(lang): localized label dictionary (union of both exporters)
 *  - getCoverSubtitle(lang, profile): cover-page role line
 *  - getCoverSummaryLines(lang, profile): cover-page executive summary lines
 *  - calculateDuration(period, lang): duration calculation with an explicit
 *    language argument (no window.currentLanguage swapping required)
 *
 * Cover-page content prefers values from the portfolio profile data when
 * present (profile.title, profile.coverSummary) and falls back to the
 * constants below.
 *
 * Classic script - exposes window.ExportContent.
 */

(function () {
  'use strict';

  const COVER_SUBTITLE = {
    ko: 'CTO · 연구소장 · 플랫폼 아키텍트',
    en: 'CTO · Research Director · Platform Architect'
  };

  const COVER_SUMMARY_LINES = {
    ko: [
      '안전 중요·ISO 인증 도메인에서 R&D 조직과 플랫폼을 20년 넘게 이끌어 왔습니다.',
      '2회 IPO 기여, 4개국 글로벌 인증 통과, 2~11명 다언어 R&D 팀 리딩 경험.',
      '규제·표준이 요구되는 도메인이라면 산업에 종속되지 않는 SDLC 운영 패턴으로 적응합니다.'
    ],
    en: [
      '20+ years leading R&D organizations and platforms in safety-critical, ISO-certified domains.',
      '2 IPOs delivered, 4 international approvals, 2-11 person multi-language R&D team leadership.',
      'A regulated-SDLC operating pattern that adapts across industries — not bound to a single domain.'
    ]
  };

  const LABELS = {
    ko: {
      expertise: '전문성',
      projects: '프로젝트',
      career: '경력',
      education: '학력',
      testimonials: '추천서',
      manager: '리더십 & 관리',
      compensation: '희망 보상 (비공개)',
      featuredProjects: '주요 프로젝트',
      medicalImaging: '의료 영상',
      orthodontic: '교정 시스템',
      equipmentControl: '장비 제어',
      enterprise: '엔터프라이즈 솔루션',
      openSource: '오픈 소스',
      coreCapabilities: '핵심 역량',
      certifications: '인증',
      keyResponsibilities: '주요 역할:',
      achievements: '성과:',
      challenges: '기술적 도전:',
      solutions: '해결 방법:',
      keyAchievements: '주요 성과',
      professionalPortfolio: '프로페셔널 포트폴리오',
      responsibilities: '담당 업무:',
      companyScale: '회사 규모:',
      teamScale: '팀 규모:',
      reasonForLeaving: '퇴사 사유:',
      pmCapabilities: 'PM 역량',
      leadershipStyle: '리더십 스타일',
      businessImpact: '비즈니스 임팩트',
      softSkills: '소프트 스킬',
      teamSize: '팀 규모:',
      duration: '기간:',
      outcomes: '성과:'
    },
    en: {
      expertise: 'EXPERTISE',
      projects: 'PROJECTS',
      career: 'CAREER',
      education: 'EDUCATION',
      testimonials: 'TESTIMONIALS',
      manager: 'LEADERSHIP & MANAGEMENT',
      compensation: 'COMPENSATION EXPECTATIONS (PRIVATE)',
      featuredProjects: 'Featured Projects',
      medicalImaging: 'Medical Imaging',
      orthodontic: 'Orthodontic Systems',
      equipmentControl: 'Equipment Control',
      enterprise: 'Enterprise Solutions',
      openSource: 'Open Source',
      coreCapabilities: 'Core Capabilities',
      certifications: 'Certifications',
      keyResponsibilities: 'Key Responsibilities:',
      achievements: 'Achievements:',
      challenges: 'Challenges:',
      solutions: 'Solutions:',
      keyAchievements: 'Key Achievements',
      professionalPortfolio: 'Professional Portfolio',
      responsibilities: 'Responsibilities:',
      companyScale: 'Company Size:',
      teamScale: 'Team Size:',
      reasonForLeaving: 'Reason for Leaving:',
      pmCapabilities: 'PM Capabilities',
      leadershipStyle: 'Leadership Style',
      businessImpact: 'Business Impact',
      softSkills: 'Soft Skills',
      teamSize: 'Team Size:',
      duration: 'Duration:',
      outcomes: 'Outcomes:'
    }
  };

  /**
   * Get text from a multilingual object with an explicit language
   * @param {*} obj - Multilingual object ({ ko, en }) or plain string
   * @param {string} lang - Language code ('ko' or 'en')
   * @returns {string} Text in the requested language
   */
  function getTextIn(obj, lang) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.ko || obj.en || '';
  }

  /**
   * Get array from a multilingual object with an explicit language
   * @param {*} obj - Multilingual array object ({ ko: [], en: [] }) or array
   * @param {string} lang - Language code ('ko' or 'en')
   * @returns {Array} Array in the requested language
   */
  function getArrayIn(obj, lang) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    return obj[lang] || obj.ko || obj.en || [];
  }

  /**
   * Get the localized label dictionary shared by both exporters
   * @param {string} lang - Language code ('ko' or 'en')
   * @returns {Object} Localized label strings
   */
  function getLabels(lang) {
    return LABELS[lang] || LABELS.en;
  }

  /**
   * Get the cover-page subtitle (role line).
   * Prefers profile.title from portfolio data; falls back to the constant.
   * @param {string} lang - Language code ('ko' or 'en')
   * @param {Object} [profile] - Profile data (data/profile.json)
   * @returns {string} Localized subtitle
   */
  function getCoverSubtitle(lang, profile) {
    const fromProfile = getTextIn(profile && profile.title, lang);
    if (fromProfile) return fromProfile;
    return COVER_SUBTITLE[lang] || COVER_SUBTITLE.en;
  }

  /**
   * Get the cover-page executive summary lines.
   * Prefers profile.coverSummary (localized array or string) from portfolio
   * data; falls back to the constants.
   * @param {string} lang - Language code ('ko' or 'en')
   * @param {Object} [profile] - Profile data (data/profile.json)
   * @returns {Array<string>} Localized summary lines
   */
  function getCoverSummaryLines(lang, profile) {
    if (profile && profile.coverSummary) {
      const lines = getArrayIn(profile.coverSummary, lang);
      if (Array.isArray(lines) && lines.length > 0) return lines;
      const single = getTextIn(profile.coverSummary, lang);
      if (single) return [single];
    }
    return COVER_SUMMARY_LINES[lang] || COVER_SUMMARY_LINES.en;
  }

  /**
   * Calculate duration from a period string with an explicit language.
   * Same parsing rules as utils/i18n.js calculateDuration, but without
   * reading window.currentLanguage (so exporters need no global swapping).
   * Supported formats: "YYYY.MM - YYYY.MM", "YYYY - YYYY", "YYYY.MM - Present"
   * @param {string|Object} period - Period string or multilingual object
   * @param {string} lang - Language code ('ko' or 'en')
   * @returns {string|null} Formatted duration (e.g. "1년 6개월" / "1 yr 6 mo")
   */
  function calculateDuration(period, lang) {
    const periodStr = getTextIn(period, lang);
    if (!periodStr) return null;

    const parts = periodStr.split(' - ');
    if (parts.length !== 2) return null;

    const parseDate = (str) => {
      str = str.trim();
      // Remove any existing duration info like "(8개월)" or "(8 months)"
      str = str.replace(/\s*\([^)]*\)\s*$/, '');
      if (str.toLowerCase() === 'present' || str === '현재') {
        return new Date();
      }
      const [year, month] = str.split('.');
      return new Date(parseInt(year), month ? parseInt(month) - 1 : 0);
    };

    try {
      const startDate = parseDate(parts[0]);
      const endDate = parseDate(parts[1]);

      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12
                   + (endDate.getMonth() - startDate.getMonth()) + 1;

      if (months <= 0) return null;

      if (months >= 12) {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (remainingMonths === 0) {
          return lang === 'ko' ? `${years}년` : `${years} yr${years > 1 ? 's' : ''}`;
        }
        return lang === 'ko'
          ? `${years}년 ${remainingMonths}개월`
          : `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mo`;
      }
      return lang === 'ko' ? `${months}개월` : `${months} mo`;
    } catch (e) {
      return null;
    }
  }

  // Export for browser global access
  window.ExportContent = {
    getLabels,
    getCoverSubtitle,
    getCoverSummaryLines,
    calculateDuration,
    getTextIn,
    getArrayIn
  };
})();
